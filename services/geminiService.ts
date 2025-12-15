import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserPreferences, AIResponse, QuizResponse } from "../types";
import { getText } from "../constants";

// Helper to initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Relaxed safety settings for religious content (prevent blocking biblical war/sacrifice themes)
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// --- LOGGING HELPER ---
const auditLog = (action: string, status: 'SUCCESS' | 'ERROR', details: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        action,
        status,
        ...details
    };
    
    // 1. Console Output (for local debugging)
    if (status === 'ERROR') {
        console.error(`[BibleAI Audit] 🔴 ${action} FAILED`, logEntry);
    } else {
        console.log(`[BibleAI Audit] 🟢 ${action} SUCCESS`, logEntry);
    }

    // 2. Google Analytics Tracking (Acts as remote application log)
    // We check if gtag is available on the window object
    if (typeof window !== 'undefined' && (window as any).gtag) {
        try {
            const gtag = (window as any).gtag;
            
            if (action === 'SEARCH_SCRIPTURE') {
                // Send 'search' event (Standard GA event)
                gtag('event', 'search', {
                    search_term: details.user_query,
                    bible_version: details.user_prefs?.version,
                    success: status === 'SUCCESS'
                });
            } else if (action === 'ASK_PASTOR') {
                // Send custom 'ask_pastor' event
                gtag('event', 'ask_pastor', {
                    question_topic: details.user_question?.substring(0, 100), // Log first 100 chars of question
                    denomination: details.user_denomination,
                    success: status === 'SUCCESS'
                });
            } else if (action === 'GENERATE_PRAYER') {
                // Send custom 'generate_prayer' event
                gtag('event', 'generate_prayer', {
                    topic: details.topic,
                    success: status === 'SUCCESS'
                });
            } else if (action === 'GENERATE_QUIZ') {
                gtag('event', 'generate_quiz', {
                    success: status === 'SUCCESS'
                });
            } else {
                // Generic event for errors or other actions
                gtag('event', 'app_action', {
                    action_name: action,
                    status: status,
                    error_msg: details.error_message ? String(details.error_message).substring(0, 100) : undefined
                });
            }
        } catch (e) {
            // Fail silently if GA tracking fails, don't break the app
            console.warn("Analytics error", e);
        }
    }
};

const getSystemInstruction = (prefs: UserPreferences): string => {
  return `
    You are BibleAI, a specialized spiritual assistant.
    
    USER CONTEXT:
    - Faith Status: ${prefs.faithStatus}
    - Denomination: ${prefs.denomination}
    - Bible Version: ${prefs.bibleVersion}
    - Language: ${prefs.language}

    CORE DIRECTIVES:
    1. STRICT SOURCE ADHERENCE: Use ${prefs.bibleVersion}.
    2. THEOLOGICAL ALIGNMENT: Respect ${prefs.denomination} traditions.
    3. TONE: Gentle, pastoral, wise.
    4. LANGUAGE: Respond in ${prefs.language}.
  `;
};

// Shared Schema for Search and Pastor
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    answer: { 
      type: Type.STRING,
      description: "The main response in Markdown format. Do NOT include the list of references at the end of the text, as they will be shown in a side panel."
    },
    followUpQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 short, relevant follow-up questions for the user to ask next."
    },
    citedVerses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ref: { type: Type.STRING, description: "Book Chapter:Verse (e.g. John 3:16)" },
          text: { type: Type.STRING, description: "The full text of the verse." },
          chapter: { type: Type.STRING, description: "The Book and Chapter (e.g. John 3)" }
        }
      }
    }
  },
  required: ["answer", "followUpQuestions", "citedVerses"]
};

// Schema for Quiz
const quizSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
            explanation: { type: Type.STRING, description: "Brief explanation of the answer" },
            reference: { type: Type.STRING, description: "Bible reference (e.g. Genesis 1:1)" }
          },
          required: ["question", "options", "correctIndex", "explanation", "reference"]
        }
      }
    },
    required: ["questions"]
};

// Helper to parse JSON safely, handling markdown code blocks or plain text fallbacks
const parseResponse = (responseText: string | undefined): any => {
    if (!responseText) return {};
    
    // Attempt to strip markdown code blocks if present (e.g. ```json ... ```)
    const cleanText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
        return JSON.parse(cleanText);
    } catch (e) {
        // If parsing fails, treat the entire response as the answer text
        console.warn("Failed to parse JSON, falling back to raw text", e);
        return {
            answer: responseText,
            followUpQuestions: [],
            citedVerses: []
        };
    }
};

// Retry wrapper function
async function withRetry<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Operation failed, retrying... (${retries} attempts left)`, error);
      await new Promise(res => setTimeout(res, 1000)); // wait 1s before retry
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export const searchScripture = async (query: string, prefs: UserPreferences): Promise<AIResponse> => {
  const ai = getAI();
  const prompt = `
    Find relevant bible verses for: "${query}".
    Provide a helpful summary or explanation in the 'answer' field.
    Extract the specific verses used into the 'citedVerses' array.
    Suggest next steps in 'followUpQuestions'.
    Ensure all text is in ${prefs.language}.
  `;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(prefs),
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3,
          safetySettings: SAFETY_SETTINGS,
        }
      });
    });
    
    const data = parseResponse(response.text);

    // LOG SUCCESS
    auditLog('SEARCH_SCRIPTURE', 'SUCCESS', {
        user_query: query,
        user_prefs: { lang: prefs.language, version: prefs.bibleVersion },
        ai_response_summary: data.answer?.substring(0, 50) + '...', // Log first 50 chars only
        verses_found: data.citedVerses?.length || 0
    });

    return {
      markdown: data.answer || "No results found.",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
    // LOG ERROR
    auditLog('SEARCH_SCRIPTURE', 'ERROR', {
        user_query: query,
        error_message: error instanceof Error ? error.message : String(error)
    });

    console.error("Scripture search error:", error);
    const t = getText(prefs.language).common;
    return { markdown: t.errorGeneric || "An error occurred. Please try again." };
  }
};

export const askPastor = async (question: string, history: string[], prefs: UserPreferences): Promise<AIResponse> => {
  const ai = getAI();
  const prompt = `
    User question: "${question}"
    
    Provide a pastoral response.
    - Answer logically and empathetically in 'answer'.
    - If you quote scripture, put the reference and text in 'citedVerses'.
    - Suggest 3 follow-up questions in 'followUpQuestions'.
    - Ensure all text is in ${prefs.language}.
  `;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(prefs),
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          thinkingConfig: { thinkingBudget: 1024 },
          safetySettings: SAFETY_SETTINGS,
        }
      });
    });
    
    const data = parseResponse(response.text);

    // LOG SUCCESS
    auditLog('ASK_PASTOR', 'SUCCESS', {
        user_question: question,
        user_denomination: prefs.denomination,
        ai_response_summary: data.answer?.substring(0, 50) + '...'
    });

    return {
      markdown: data.answer || "I cannot answer right now.",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
    // LOG ERROR
    auditLog('ASK_PASTOR', 'ERROR', {
        user_question: question,
        error_message: error instanceof Error ? error.message : String(error)
    });

    console.error("Pastor chat error:", error);
    const t = getText(prefs.language).common;
    return { markdown: t.errorGeneric || "Service unavailable." };
  }
};

export const generatePrayer = async (topic: string, prefs: UserPreferences): Promise<AIResponse> => {
  const ai = getAI();
  const prompt = `
    Write a prayer about: "${topic}".
    Output the prayer text in 'answer'.
    If verses are used, add to 'citedVerses'.
    In 'followUpQuestions', suggest "Pray for..." related topics.
  `;

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(prefs),
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          safetySettings: SAFETY_SETTINGS,
        }
      });
    });
    
    const data = parseResponse(response.text);

    // LOG SUCCESS
    auditLog('GENERATE_PRAYER', 'SUCCESS', {
        topic: topic,
        ai_response_summary: data.answer?.substring(0, 50) + '...'
    });

    return {
      markdown: data.answer || "Let us pray...",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
    // LOG ERROR
    auditLog('GENERATE_PRAYER', 'ERROR', {
        topic: topic,
        error_message: error instanceof Error ? error.message : String(error)
    });

    console.error("Prayer error:", error);
    const t = getText(prefs.language).common;
    return { markdown: t.errorGeneric || "Error generating prayer." };
  }
};

export const generateDailyQuiz = async (prefs: UserPreferences): Promise<QuizResponse> => {
    const ai = getAI();
    const prompt = `
      Generate a Bible Trivia Quiz.
      - 10 Multiple choice questions.
      - 4 options per question.
      - Include the correct index (0-3).
      - Include a brief explanation and the bible reference.
      - Language: ${prefs.language}.
      - Bible Version: ${prefs.bibleVersion}.
      - Difficulty: Mixed (Easy, Medium, Hard).
    `;
  
    try {
      const response = await withRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: getSystemInstruction(prefs),
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            temperature: 0.5,
            safetySettings: SAFETY_SETTINGS,
          }
        });
      });
      
      const data = parseResponse(response.text);
  
      // LOG SUCCESS
      auditLog('GENERATE_QUIZ', 'SUCCESS', {
          language: prefs.language,
          questions_count: data.questions?.length || 0
      });
  
      return {
        questions: data.questions || []
      };
    } catch (error) {
      // LOG ERROR
      auditLog('GENERATE_QUIZ', 'ERROR', {
          error_message: error instanceof Error ? error.message : String(error)
      });
  
      console.error("Quiz error:", error);
      return { questions: [] };
    }
  };