import React, { useState, useEffect } from 'react';
import { PresentationData, GenerationStatus } from './types';
import { generatePresentation } from './services/geminiService';
import Slide from './components/Slide';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Loader2, Sparkles, MonitorPlay } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'viewing'>('input');
  const [topic, setTopic] = useState('Gemini Pro, Antigravity 和 AI Studio');
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setCurrentStep('generating');
    setError(null);
    
    try {
      const data = await generatePresentation(topic);
      setPresentation(data);
      setCurrentSlideIndex(0);
      setCurrentStep('viewing');
    } catch (err: any) {
      console.error(err);
      setError("生成演示文稿失败，请检查您的 API 密钥或重试。");
      setCurrentStep('input');
    }
  };

  const nextSlide = () => {
    if (presentation && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep !== 'viewing') return;
      
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, currentSlideIndex, presentation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-400 w-6 h-6" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
            GenAI 演示文稿生成器
          </h1>
        </div>
        {currentStep === 'viewing' && (
           <button 
             onClick={() => {
               setPresentation(null);
               setCurrentStep('input');
             }}
             className="text-sm text-slate-400 hover:text-white transition-colors"
           >
             新建
           </button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[128px] pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {/* STEP 1: INPUT FORM */}
          {currentStep === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl space-y-8 z-10"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold tracking-tight text-white">
                  您想演示什么主题？
                </h2>
                <p className="text-slate-400 text-lg">
                  由 Gemini 2.5 Flash 提供支持
                </p>
              </div>

              <div className="bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    className="w-full bg-slate-900/80 text-white px-6 py-4 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-lg placeholder:text-slate-600 transition-all"
                    placeholder="例如：人工智能的未来..."
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!topic.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    生成 <Play size={16} fill="currentColor" />
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}
              
              <div className="flex justify-center gap-4 text-sm text-slate-500">
                 <span className="flex items-center gap-1"><Sparkles size={12}/> AI 生成布局</span>
                 <span className="flex items-center gap-1"><MonitorPlay size={12}/> 即时预览</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOADING */}
          {currentStep === 'generating' && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-6 z-10"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-white animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold text-white">正在起草您的演示文稿...</h3>
                <p className="text-slate-400">正在撰写关于 “{topic}” 的内容</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: VIEWER */}
          {currentStep === 'viewing' && presentation && (
            <motion.div 
              key="viewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-6xl flex flex-col items-center gap-8 z-10"
            >
              {/* Slide Container */}
              <div className="w-full aspect-[16/9] relative">
                <AnimatePresence mode="wait">
                  <Slide 
                    key={currentSlideIndex} 
                    data={presentation.slides[currentSlideIndex]} 
                    index={currentSlideIndex} 
                    total={presentation.slides.length} 
                  />
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8 bg-slate-900/80 px-8 py-4 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center min-w-[120px]">
                  <span className="text-sm font-medium text-white">
                    {currentSlideIndex + 1} / {presentation.slides.length}
                  </span>
                  <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300" 
                      style={{ width: `${((currentSlideIndex + 1) / presentation.slides.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={nextSlide}
                  disabled={currentSlideIndex === presentation.slides.length - 1}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default App;