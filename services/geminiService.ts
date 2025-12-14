import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, AIResponse } from "../types";
import { getText } from "../constants";

// Helper to initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(prefs),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
      }
    });
    
    const data = parseResponse(response.text);
    return {
      markdown: data.answer || "No results found.",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
    console.error("Scripture search error:", error);
    const t = getText(prefs.language).common;
    return { markdown: t.errorGeneric || "Error searching scriptures." };
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt, // history would be included here in a real app
      config: {
        systemInstruction: getSystemInstruction(prefs),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 1024 },
      }
    });
    
    const data = parseResponse(response.text);
    return {
      markdown: data.answer || "I cannot answer right now.",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(prefs),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const data = parseResponse(response.text);
    return {
      markdown: data.answer || "Let us pray...",
      followUps: data.followUpQuestions || [],
      references: data.citedVerses || []
    };
  } catch (error) {
    console.error("Prayer error:", error);
    const t = getText(prefs.language).common;
    return { markdown: t.errorGeneric || "Error generating prayer." };
  }
};