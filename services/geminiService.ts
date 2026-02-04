import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Lesson, StudyGuideContent } from '../types';

// Simple ID generator to avoid external dependency for this file
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateLessonPlan = async (courseTitle: string, numLessons: number = 5): Promise<Lesson[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Returning mock data.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Create a structured lesson plan for a course titled "${courseTitle}". Generate exactly ${numLessons} lessons. For each lesson, provide a title, a short description, and an estimated duration in minutes (between 15 and 90).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              durationMinutes: { type: Type.INTEGER },
            },
            required: ["title", "description", "durationMinutes"],
          },
        },
      },
    });

    const generatedData = JSON.parse(response.text || "[]");

    // Map to our internal Lesson format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return generatedData.map((item: any) => ({
      id: generateId(),
      title: item.title,
      description: item.description,
      isCompleted: false,
      durationMinutes: item.durationMinutes,
      resources: [],
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate lesson plan.");
  }
};

export const getStudyGuide = async (courseTitle: string, lessonTitle: string): Promise<StudyGuideContent | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are an expert tutor. For the lesson "${lessonTitle}" in the course "${courseTitle}", provide a structured study guide.
  1. A concise explanation of the topic (max 2 sentences).
  2. 3 crucial key takeaways or concepts (bullet points).
  3. A short practical exercise, code challenge, or thought experiment to reinforce learning.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            exercise: { type: Type.STRING }
          },
          required: ["summary", "keyPoints", "exercise"]
        }
      }
    });

    return JSON.parse(response.text || "null");
  } catch (error) {
    console.error("Gemini API Error (Study Guide):", error);
    return null;
  }
};

export const createChatSession = (): Chat | null => {
  if (!process.env.API_KEY) {
    return null;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful, encouraging, and knowledgeable study assistant integrated into a Course Tracker application. Your goal is to help the user learn, organize their studies, and stay motivated. Keep your responses concise and relevant."
    }
  });
};