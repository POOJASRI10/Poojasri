import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CourseDocument, ChatMessage, QuizQuestion, Flashcard } from "../types";

// Initialize Gemini API lazily to ensure environment variables are ready
// and to prevent app crash on load if key is missing (it will fail on request instead).
let aiInstance: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiInstance) {
    // Fallback to empty string to prevent constructor error, request will fail gracefully later
    const apiKey = process.env.API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const MODEL_FAST = 'gemini-2.5-flash';

// Helper to construct context from documents
const getContextFromDocs = (docs: CourseDocument[]): string => {
  if (docs.length === 0) return "";
  
  return docs.map(doc => `
--- DOCUMENT START: ${doc.name} ---
${doc.content}
--- DOCUMENT END ---
`).join("\n");
};

export const generateChatResponse = async (
  docs: CourseDocument[],
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const context = getContextFromDocs(docs);
    
    const systemInstruction = `You are "StudyMate AI", an intelligent study companion for college students.
Your goal is to help students learn from their uploaded course materials.

RULES:
1. Answer the student's question strictly based on the provided "Course Materials".
2. If the answer is found in the materials, provide a clear, concise, and accurate explanation.
3. If the answer is NOT found in the materials, explicitly state: "I couldn't find information about that in your uploaded documents," but you may offer general knowledge if helpful (marking it as general knowledge).
4. Be encouraging and academic in tone.
5. Format your response with Markdown (bolding key terms, using lists).

COURSE MATERIALS:
${context || "No documents uploaded yet."}
`;

    const chat = ai.chats.create({
      model: MODEL_FAST,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I encountered an error processing your request. Please ensure you have a valid API key configured.";
  }
};

export const generateSummary = async (docs: CourseDocument[]): Promise<string> => {
  try {
    const ai = getAiClient();
    const context = getContextFromDocs(docs);
    if (!context) return "Please upload documents to summarize.";

    const prompt = `Please generate a comprehensive summary of the following course materials. 
Structure the summary with:
1. **Key Concepts**: High-level topics covered.
2. **Detailed Notes**: Bullet points of the most important details.
3. **Actionable Takeaways**: Things the student needs to remember for exams.

COURSE MATERIALS:
${context}`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary. Please check your connection or API key.";
  }
};

export const generateQuiz = async (docs: CourseDocument[]): Promise<QuizQuestion[]> => {
  try {
    const ai = getAiClient();
    const context = getContextFromDocs(docs);
    if (!context) return [];

    const prompt = `Generate a practice quiz with 5 multiple-choice questions based on these course materials.
Return the result strictly as a JSON array of objects.`;

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          correctAnswerIndex: { 
            type: Type.INTEGER, 
            description: "The zero-based index of the correct option" 
          }
        },
        required: ["question", "options", "correctAnswerIndex"]
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [
        { text: prompt },
        { text: `CONTEXT:\n${context}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};

export const generateFlashcards = async (docs: CourseDocument[]): Promise<Flashcard[]> => {
  try {
    const ai = getAiClient();
    const context = getContextFromDocs(docs);
    if (!context) return [];

    const prompt = `Generate 10 study flashcards based on the provided course materials. 
    Focus on key definitions, important dates, formulas, or core concepts.
    'front' should be the term or question. 'back' should be the definition or answer.`;

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          front: { type: Type.STRING, description: "The term, question, or concept on the front of the card" },
          back: { type: Type.STRING, description: "The definition, answer, or explanation on the back of the card" }
        },
        required: ["front", "back"]
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [
        { text: prompt },
        { text: `CONTEXT:\n${context}` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Flashcard[];
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    return [];
  }
};