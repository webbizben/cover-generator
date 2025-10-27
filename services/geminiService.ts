// 檔案路徑: /services/geminiService.ts (修改後)
export const generateCoverImage = async (prompt: string): Promise<string> => {
  // 呼叫我們自己的後端 API，而不是直接呼叫 Google
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }), // 將 prompt 傳送給後端
  });

  if (!response.ok) {
    const errorData = await response.json();
    // 顯示從後端傳來的錯誤訊息
    throw new Error(errorData.error || "發生未知錯誤");
  }

  const data = await response.json();
  return data.imageUrl; // 回傳從後端拿到的圖片 URL
};