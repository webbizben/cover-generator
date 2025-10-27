import React, { useState, useCallback, useRef } from 'react';
import { generateCoverImage } from './services/geminiService';
import html2canvas from 'html2canvas';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    <p className="text-indigo-300">正在為您生成封面，請稍候...</p>
  </div>
);

const ImagePlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p>您生成的圖片將會顯示在這裡</p>
  </div>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [displayedPrompt, setDisplayedPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setDisplayedPrompt(prompt);

    try {
      const url = await generateCoverImage(prompt);
      setImageUrl(url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('發生未知錯誤');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleDownload = useCallback(() => {
    if (imageContainerRef.current) {
      html2canvas(imageContainerRef.current, { 
        useCORS: true,
        backgroundColor: null // Make background transparent
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = `${displayedPrompt.substring(0, 20)}-cover.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, [displayedPrompt]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            AI 部落格文章封面產生器
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            輸入您的文章標題或主題，讓 AI 為您創造獨一無二的封面！
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Input Section */}
          <div className="lg:w-1/2 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col">
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
              <div className="mb-4 flex-grow">
                <label htmlFor="prompt" className="block text-lg font-medium text-slate-300 mb-2">
                  文章標題或主題
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：SEO關鍵字研究系列 – Ep.6 – 進階策略與小撇步"
                  className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none placeholder-slate-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-transform transform hover:scale-105 duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
              >
                {isLoading ? '生成中...' : '生成封面'}
              </button>
            </form>
             {imageUrl && (
              <button
                onClick={handleDownload}
                className="w-full mt-4 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-transform transform hover:scale-105 duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500"
              >
                下載封面
              </button>
            )}
          </div>

          {/* Output Section */}
          <div className="lg:w-1/2 aspect-square bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex items-center justify-center p-2 transition-all duration-300">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center text-red-400 p-4">
                <p><strong>錯誤：</strong>{error}</p>
              </div>
            ) : imageUrl ? (
              <div ref={imageContainerRef} className="relative w-full h-full">
                <img 
                  src={imageUrl} 
                  alt="Generated blog cover background" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 rounded-lg">
                  <h2 
                    className="text-white text-2xl md:text-3xl font-bold text-center"
                    style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.8)' }}
                  >
                    {displayedPrompt}
                  </h2>
                </div>
              </div>
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
