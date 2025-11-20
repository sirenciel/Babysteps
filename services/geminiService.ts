
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, DailyLog, FoodSafetyInfo } from "../types";

const getAiClient = () => {
  // In a real environment, ensure process.env.API_KEY is set.
  // Assuming the environment provides it.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const chatWithParentingCoach = async (history: string[], message: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const systemInstruction = `You are a compassionate, evidence-based parenting assistant named "BabySteps Coach". 
    You provide advice for parents of children aged 0-5 years.
    Tone: Empathetic, encouraging, clear, and scientific but accessible.
    If a medical question is asked, always provide a disclaimer to consult a pediatrician.
    Keep answers concise (under 150 words) unless asked for details.`;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Note: In a real app, we would hydrate the chat history properly using the SDK's history format.
    // For this stateless service call, we are just sending the new message in this simplified demo,
    // or we could reconstruct the history if needed. For now, we just send the prompt.
    
    const result = await chat.sendMessage({ message });
    return result.text || "I'm having a little trouble thinking right now. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm unable to connect to the parenting database right now.";
  }
};

export const generateDailyPlayIdea = async (ageMonths: number): Promise<{ title: string; description: string; benefit: string }> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    const prompt = `Suggest one simple, development-boosting play activity for a ${ageMonths}-month-old baby using common household items.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            benefit: { type: Type.STRING, description: "What developmental skill this helps" },
          },
          required: ["title", "description", "benefit"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Play Idea Error:", error);
    return {
      title: "Peek-a-boo",
      description: "Cover your face with your hands and uncover it saying 'Peek-a-boo!'",
      benefit: "Object permanence and social bonding"
    };
  }
};

export const generateMPASIRecipe = async (ageMonths: number, dietaryRestrictions: string = ""): Promise<Recipe> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    const prompt = `Create a healthy solid food (weaning) recipe for a ${ageMonths}-month-old baby. ${dietaryRestrictions ? `Restrictions: ${dietaryRestrictions}.` : ''} 
    Context: Global/International palate (simple, nutritious).
    Format: JSON with name, ageGroup, ingredients (array), and instructions.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            ageGroup: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.STRING },
          },
          required: ["name", "ageGroup", "ingredients", "instructions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return {
      name: "Sweet Potato & Spinach Mash",
      ageGroup: "6-8 months",
      ingredients: ["1 Sweet Potato", "Handful of Spinach", "Breast milk or Formula"],
      instructions: "Steam the sweet potato until soft. Steam spinach for 2 mins. Blend together with milk until smooth."
    };
  }
};

export const analyzeFoodSafety = async (foodName: string): Promise<FoodSafetyInfo> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    const prompt = `Provide safety and serving information for feeding "${foodName}" to a baby.
    Return JSON: {
      "name": "${foodName}",
      "minAgeMonths": number (e.g. 6),
      "allergenRisk": "high" | "medium" | "low",
      "chokingHazard": "high" | "medium" | "low",
      "howToServe": [{ "ageGroup": "6-9m", "description": "..." }, { "ageGroup": "9-12m", "description": "..." }],
      "nutritionalBenefits": "Short summary"
    }`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             name: { type: Type.STRING },
             minAgeMonths: { type: Type.INTEGER },
             allergenRisk: { type: Type.STRING, enum: ["high", "medium", "low"] },
             chokingHazard: { type: Type.STRING, enum: ["high", "medium", "low"] },
             howToServe: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   ageGroup: { type: Type.STRING },
                   description: { type: Type.STRING }
                 }
               }
             },
             nutritionalBenefits: { type: Type.STRING }
           }
        }
      }
    });
    
    const text = response.text;
    if(!text) throw new Error("No text");
    return JSON.parse(text);
  } catch (e) {
    return {
      name: foodName,
      minAgeMonths: 6,
      allergenRisk: 'low',
      chokingHazard: 'low',
      howToServe: [{ageGroup: "6m+", description: "Cook thoroughly and mash."}],
      nutritionalBenefits: "Contains vitamins."
    };
  }
}

export const getMilestoneTip = async (milestoneTitle: string, ageGroup: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    const prompt = `My baby hasn't reached the milestone: "${milestoneTitle}" yet (Age group: ${ageGroup}). 
    Give me 2 short, practical tips on how to stimulate this skill at home. 
    Format: Bullet points. Tone: Encouraging.`;

    const result = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return result.text || "Keep practicing gently every day!";
  } catch (error) {
    return "Try encouraging your baby with toys just out of reach.";
  }
};

export const generateJournalEntry = async (babyName: string, logs: DailyLog[]): Promise<{title: string, body: string}> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    // Summarize logs for the prompt
    const feedCount = logs.filter(l => l.type === 'feed').length;
    const sleepCount = logs.filter(l => l.type === 'sleep').length;
    
    const prompt = `Write a short, heartwarming, and sentimental daily diary entry (max 60 words) for baby ${babyName}.
    Data from today: Fed ${feedCount} times, Slept ${sleepCount} times.
    Tone: Sweet, loving, capturing the fleeting nature of childhood. Do not mention the exact numbers, just the feeling of the day.
    Format: JSON { "title": "Short Title", "body": "Diary content..." }`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
              title: { type: Type.STRING },
              body: { type: Type.STRING }
           }
        }
      }
    });

    const text = response.text;
    if(!text) throw new Error("Failed to gen journal");
    return JSON.parse(text);

  } catch(e) {
    return {
       title: "A Quiet Day",
       body: `Another beautiful day with ${babyName}. Watching you grow is the greatest adventure of my life. You slept peacefully today, and your smile makes everything worth it.`
    }
  }
}
