import { GoogleGenAI, Type } from "@google/genai";

const RESTAURANT_CONTEXT = `
Malbriz Fusion is a premier dining destination in Riyadh, Saudi Arabia. 
We specialize in "Fusion" cuisine, which means we blend traditional Saudi flavors with international culinary techniques (primarily Mediterranean and Asian influences).

Key Details:
- Location: Riyadh, Saudi Arabia (near Al Malaz district).
- Atmosphere: Elegant, modern, yet warm and welcoming.
- Signature Dishes: 
  - Saffron Infused Risotto with Lamb Kabsa spices.
  - Date and Pistachio Crusted Sea Bass.
  - Fusion Mezze Platter with truffle hummus.
- Experience: Fine dining with a relaxed, contemporary vibe.
- Opening Hours: 1:00 PM - 12:00 AM daily.
`;

export async function askConcierge(question: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction: `You are the digital concierge for Malbriz Fusion. 
      Answer questions about the restaurant, menu, and experience based on the following context:
      ${RESTAURANT_CONTEXT}
      Be elegant, professional, and welcoming. If you don't know something, suggest they visit us or call.`,
    },
  });

  return response.text;
}
