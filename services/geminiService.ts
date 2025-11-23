import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData, SlideLayout } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

/**
 * Step 1: Generate an outline (list of slide titles) based on the topic.
 */
export const generateOutline = async (topic: string): Promise<string[]> => {
  const prompt = `
    Create a logical, professional presentation outline for the topic: "${topic}".
    Target Audience: General tech audience.
    Language: Chinese (Simplified).
    
    Return a list of 6-9 slide titles. 
    The first slide should usually be an Introduction/Title concept.
    The last slide should be a Conclusion/Summary concept.
    
    For technical topics like "Gemini Pro", "Antigravity", "AI Studio", ensure the flow is logical (e.g., What is it -> Features -> Usage -> Summary).
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "You are a senior content strategist. Output strictly in Chinese (Simplified).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of slide titles representing the outline"
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No outline generated");

  try {
    return JSON.parse(text) as string[];
  } catch (e) {
    console.error("Failed to parse outline", e);
    throw new Error("Failed to parse outline data");
  }
};

/**
 * Step 2: Generate the full presentation based on the approved outline.
 */
export const generatePresentationFromOutline = async (topic: string, outline: string[]): Promise<PresentationData> => {
  
  const prompt = `
    Create a detailed presentation based STRICTLY on the following outline of slide titles:
    ${JSON.stringify(outline)}

    Topic: "${topic}"
    Language: Chinese (Simplified).
    
    Instructions:
    1. For each title in the outline, create one slide.
    2. Choose the most appropriate layout for the content (Use 'TITLE' only for the first slide usually).
    3. Generate rich, educational content (bullet points or paragraphs).
    4. Provide an English image description for finding a stock photo.
    
    Special Context:
    - Gemini Pro: Google's mid-size multimodal model.
    - Antigravity: Often refers to the Python SDK project name or the 'google-generativeai' library context.
    - AI Studio: The web-based prototyping environment.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class presentation designer. Output strictly in Chinese (Simplified).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                content: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of bullet points or paragraph segments"
                },
                layout: {
                  type: Type.STRING,
                  enum: [
                    SlideLayout.TITLE,
                    SlideLayout.BULLET_POINTS_LEFT,
                    SlideLayout.BULLET_POINTS_RIGHT,
                    SlideLayout.CENTERED_TEXT,
                    SlideLayout.IMAGE_FEATURE
                  ]
                },
                imageDescription: {
                  type: Type.STRING,
                  description: "A short visual description of an image (in English)."
                }
              },
              required: ["title", "content", "layout"]
            }
          }
        },
        required: ["topic", "slides"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response text generated");

  try {
    return JSON.parse(text) as PresentationData;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse presentation data");
  }
};