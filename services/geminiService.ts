import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserPreferences } from "../types";

// Helper to initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (prefs: UserPreferences): string => {
  return `
    You are BibleAI, a specialized spiritual assistant.
    
    USER CONTEXT:
    - Faith Status: ${prefs.faithStatus}
    - Denomination/Theological Background: ${prefs.denomination}
    - Preferred Bible Version: ${prefs.bibleVersion}
    - Language: ${prefs.language}

    CORE DIRECTIVES:
    1. STRICT SOURCE ADHERENCE: You must ONLY provide scripture content that exists in the ${prefs.bibleVersion}. Do not paraphrase unless asked.
    2. THEOLOGICAL ALIGNMENT: Your explanations should respect the traditions of ${prefs.denomination} while maintaining biblical accuracy. If a topic is controversial between denominations, objectively state the ${prefs.denomination} view while acknowledging others if necessary.
    3. NO HALLUCINATIONS: If a verse does not exist or the Bible does not address a topic, clearly state that.
    4. TONE: Gentle, pastoral, wise, and encouraging.
    5. FORMATTING: Use Markdown. Bold verse references. Blockquote scripture text.
    6. LANGUAGE: You must strictly respond in ${prefs.language}. If the user asks in a different language, reply in ${prefs.language} unless explicitly asked to translate.
  `;
};

export const searchScripture = async (query: string, prefs: UserPreferences): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Find relevant bible verses for the search query: "${query}".
    
    Requirements:
    1. List 3-5 most relevant passages from the ${prefs.bibleVersion}.
    2. For each passage, provide the Reference (e.g., John 3:16) and the Full Text in ${prefs.language}.
    3. Provide a brief 1-sentence context for why this applies to "${query}" (in ${prefs.language}).
    4. Output strictly in valid Markdown.
    5. Ensure all text is in ${prefs.language}.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(prefs),
        temperature: 0.3, // Low temperature for factual accuracy
      }
    });
    return response.text || "No scriptures found.";
  } catch (error) {
    console.error("Scripture search error:", error);
    return "I apologize, I am having trouble searching the scriptures right now. Please try again.";
  }
};

export const askPastor = async (question: string, history: string[], prefs: UserPreferences): Promise<string> => {
  const ai = getAI();
  
  // Construct a simple history string for context window
  const conversationContext = history.join("\n");

  const prompt = `
    The user asks: "${question}"
    
    Answer as a wise, empathetic pastor from a ${prefs.denomination} background.
    1. Start with a direct, compassionate answer in ${prefs.language}.
    2. Back up every claim with scripture from ${prefs.bibleVersion}.
    3. If the user is a ${prefs.faithStatus}, adjust the complexity accordingly (simpler for Seekers, deeper for Leaders).
    4. End with a short, encouraging thought or challenge.
    5. Ensure the entire response is in ${prefs.language}.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt, // In a real app, we'd pass full history object, simplified here
      config: {
        systemInstruction: getSystemInstruction(prefs),
        thinkingConfig: { thinkingBudget: 1024 }, // Allow some thinking for theological depth
      }
    });
    return response.text || "I am unable to provide counsel at this moment.";
  } catch (error) {
    console.error("Pastor chat error:", error);
    return "I am having trouble connecting to the service. Please try again.";
  }
};

export const generatePrayer = async (topic: string, prefs: UserPreferences): Promise<string> => {
  const ai = getAI();
  
  const prompt = `
    Write a personalized prayer regarding: "${topic}".
    
    Style:
    - Language: ${prefs.language}
    - Use language appropriate for a ${prefs.denomination} believer.
    - Incorporate 1-2 verses from ${prefs.bibleVersion} naturally into the prayer.
    - Structure: Invocation -> Petition -> Thanksgiving -> Closing.
    - Keep it under 200 words.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(prefs),
      }
    });
    return response.text || "Let us pray...";
  } catch (error) {
    console.error("Prayer generation error:", error);
    return "Unable to generate prayer at this time.";
  }
};