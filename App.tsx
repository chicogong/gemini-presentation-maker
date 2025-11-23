import React, { useState, useEffect } from 'react';
import { PresentationData, GenerationStep } from './types';
import { generateOutline, generatePresentationFromOutline } from './services/geminiService';
import { exportToPptx } from './services/pptService';
import Slide from './components/Slide';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Loader2, Sparkles, MonitorPlay, ListOrdered, Plus, Trash2, ArrowRight, Download } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('input');
  const [topic, setTopic] = useState('Gemini Pro, Antigravity 和 AI Studio');
  const [outline, setOutline] = useState<string[]>([]);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- Step 1: Generate Outline ---
  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;
    
    setCurrentStep('generating_outline');
    setError(null);
    
    try {
      const generatedOutline = await generateOutline(topic);
      setOutline(generatedOutline);
      setCurrentStep('outline_review');
    } catch (err: any) {
      console.error(err);
      setError("生成大纲失败，请重试。");
      setCurrentStep('input');
    }
  };

  // --- Step 2: Edit Outline ---
  const updateOutlineItem = (index: number, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = value;
    setOutline(newOutline);
  };

  const removeOutlineItem = (index: number) => {
    if (outline.length <= 1) return;
    const newOutline = outline.filter((_, i) => i !== index);
    setOutline(newOutline);
  };

  const addOutlineItem = () => {
    setOutline([...outline, "新幻灯片标题"]);
  };

  // --- Step 3: Generate Final Slides ---
  const handleGenerateSlides = async () => {
    setCurrentStep('generating_slides');
    setError(null);

    try {
      const data = await generatePresentationFromOutline(topic, outline);
      setPresentation(data);
      setCurrentSlideIndex(0);
      setCurrentStep('viewing');
    } catch (err: any) {
      console.error(err);
      setError("生成幻灯片内容失败，请重试。");
      setCurrentStep('outline_review');
    }
  };

  const handleExport = async () => {
    if (!presentation) return;
    setIsExporting(true);
    try {
      await exportToPptx(presentation);
    } catch (e) {
      console.error("Export failed", e);
      setError("导出 PPT 失败，请稍后重试。");
    } finally {
      setIsExporting(false);
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
        <div className="flex items-center gap-2" onClick={() => setCurrentStep('input')}>
          <Sparkles className="text-indigo-400 w-6 h-6" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 cursor-pointer">
            GenAI 演示文稿生成器
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {currentStep === 'viewing' && presentation && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? '导出中...' : '导出 PPT'}
            </button>
          )}
          {currentStep !== 'input' && (
             <button 
               onClick={() => {
                 setPresentation(null);
                 setOutline([]);
                 setCurrentStep('input');
               }}
               className="text-sm text-slate-400 hover:text-white transition-colors"
             >
               重新开始
             </button>
          )}
        </div>
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
                  首先，我们将为您生成大纲
                </p>
              </div>

              <div className="bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateOutline()}
                    className="w-full bg-slate-900/80 text-white px-6 py-4 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-lg placeholder:text-slate-600 transition-all"
                    placeholder="例如：人工智能的未来..."
                  />
                  <button
                    onClick={handleGenerateOutline}
                    disabled={!topic.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    下一步 <ArrowRight size={16} />
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
            </motion.div>
          )}

          {/* STEP 2: OUTLINE REVIEW */}
          {currentStep === 'outline_review' && (
            <motion.div 
              key="outline"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-2xl space-y-6 z-10"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">规划大纲</h2>
                <p className="text-slate-400">Gemini 为 “{topic}” 建议了以下结构。您可以随意修改。</p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-3">
                    {outline.map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-slate-400 text-sm font-mono border border-white/5">
                          {index + 1}
                        </div>
                        <input 
                          value={item}
                          onChange={(e) => updateOutlineItem(index, e.target.value)}
                          className="flex-grow bg-white/5 hover:bg-white/10 focus:bg-white/10 transition-colors rounded-lg px-4 py-3 text-white border border-transparent focus:border-indigo-500/50 outline-none"
                        />
                        <button 
                          onClick={() => removeOutlineItem(index)}
                          className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/5 rounded-lg"
                          title="删除幻灯片"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                 </div>
                 
                 <button 
                  onClick={addOutlineItem}
                  className="mt-6 w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
                 >
                   <Plus size={18} /> 添加新幻灯片
                 </button>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerateSlides}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                >
                  <Sparkles size={20} className="animate-pulse"/> 生成完整演示文稿
                </button>
              </div>
              
               {error && (
                <div className="text-red-400 text-center text-sm">{error}</div>
              )}
            </motion.div>
          )}

          {/* LOADING STATE (Generic for both steps) */}
          {(currentStep === 'generating_outline' || currentStep === 'generating_slides') && (
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
                <h3 className="text-2xl font-semibold text-white">
                  {currentStep === 'generating_outline' ? '正在构思结构...' : '正在设计精美的幻灯片...'}
                </h3>
                <p className="text-slate-400">
                  Gemini 2.5 Flash 正在努力工作中
                </p>
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