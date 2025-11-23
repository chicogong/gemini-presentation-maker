import { GoogleGenAI, Type } from "@google/genai";
import { PresentationData, SlideLayout } from "../types";

// Initialize the client
// API Key is strictly from process.env.API_KEY per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePresentation = async (topic: string): Promise<PresentationData> => {
  const modelId = "gemini-2.5-flash"; // Efficient for structured text generation

  const prompt = `
    Create a professional, engaging presentation slide deck about the following topic: "${topic}".
    The presentation should have 5-8 slides.
    Language: Chinese (Simplified).
    Structure the content to be educational and visually descriptive.
    
    For "Gemini Pro", "Antigravity", and "AI Studio", ensure accurate technical details:
    - Gemini Pro: Google's mid-size multimodal model.
    - Antigravity: Often refers to the Python SDK project name or the 'google-generativeai' library context.
    - AI Studio: The web-based prototyping environment.

    Ensure a mix of layouts.
    Output MUST be in Chinese.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class presentation designer and technical writer. Output strictly in Chinese (Simplified).",
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
                  description: "A short visual description of an image that would fit this slide (in English for better image generation results)."
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
  if (!text) {
    throw new Error("No response text generated");
  }

  try {
    const data = JSON.parse(text) as PresentationData;
    return data;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse presentation data");
  }
};