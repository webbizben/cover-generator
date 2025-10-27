// 檔案路徑: /api/generate-image.ts
import { GoogleGenAI, Modality } from "@google/genai";

// 這個函式會在 Vercel 的伺服器上執行，而不是在用戶的瀏覽器裡
export default async function handler(req, res) {
  // 檢查請求的方法是否為 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // 從 Vercel 的安全環境變數中讀取 API Key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullPrompt = `Create a professional and visually appealing blog post cover background image suitable for an article about "${prompt}". The style should be modern, minimalist, and use a pleasing color palette. The image should have a clear area, perhaps with a subtle overlay or gradient, where text can be placed on top without being distracting. Do NOT include any text in the image itself.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        // 成功後，將圖片資料回傳給前端
        return res.status(200).json({ imageUrl });
      }
    }
    
    throw new Error("API did not return image data.");

  } catch (error) {
    console.error("Error in API route:", error);
    return res.status(500).json({ error: "Failed to generate image on the server." });
  }
}