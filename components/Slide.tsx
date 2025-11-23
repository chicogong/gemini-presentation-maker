import React from 'react';
import { SlideData, SlideLayout } from '../types';
import { motion } from 'framer-motion';

interface SlideProps {
  data: SlideData;
  index: number;
  total: number;
}

// Helper to get a deterministic random image from picsum based on description length/char codes
const getImageUrl = (desc: string | undefined, width: number, height: number) => {
  const seed = desc ? desc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const Slide: React.FC<SlideProps> = ({ data, index, total }) => {
  const { title, subtitle, content, layout, imageDescription } = data;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }
  };

  // Render specific layout
  const renderLayout = () => {
    switch (layout) {
      case SlideLayout.TITLE:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-xl shadow-2xl">
            <motion.h1 
              className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.h2 
                className="text-2xl text-indigo-200 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.h2>
            )}
            <motion.div 
              className="mt-12 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
        );

      case SlideLayout.CENTERED_TEXT:
        return (
          <div className="flex flex-col items-center justify-center h-full p-12 bg-white rounded-xl shadow-xl border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <h2 className="text-4xl font-bold text-gray-800 mb-8">{title}</h2>
            <div className="space-y-4 max-w-3xl text-center">
              {content.map((point, i) => (
                <p key={i} className="text-xl text-gray-600 leading-relaxed">{point}</p>
              ))}
            </div>
          </div>
        );

      case SlideLayout.BULLET_POINTS_LEFT:
      case SlideLayout.BULLET_POINTS_RIGHT:
        const isRight = layout === SlideLayout.BULLET_POINTS_RIGHT;
        return (
          <div className={`flex flex-col ${isRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} h-full bg-white rounded-xl shadow-xl overflow-hidden`}>
            {/* Image Side */}
            <div className="lg:w-1/2 h-64 lg:h-full relative overflow-hidden bg-gray-100">
               <img 
                 src={getImageUrl(imageDescription, 800, 1000)} 
                 alt={imageDescription || "幻灯片配图"} 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
            </div>
            
            {/* Content Side */}
            <div className="lg:w-1/2 p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
              {subtitle && <h3 className="text-lg text-indigo-600 mb-6 font-semibold">{subtitle}</h3>}
              <ul className="space-y-4">
                {content.map((point, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: isRight ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                  >
                    <span className="inline-block w-2 h-2 mt-2 mr-3 bg-indigo-500 rounded-full flex-shrink-0" />
                    <span className="text-lg text-gray-700">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        );

      case SlideLayout.IMAGE_FEATURE:
        return (
          <div className="flex flex-col h-full bg-gray-900 rounded-xl shadow-xl overflow-hidden relative text-white">
            <img 
               src={getImageUrl(imageDescription, 1200, 800)} 
               alt={imageDescription} 
               className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            
            <div className="relative z-10 p-12 flex flex-col justify-end h-full">
              <h2 className="text-4xl font-bold mb-4">{title}</h2>
               {content.map((point, i) => (
                  <p key={i} className="text-xl text-gray-200 max-w-3xl mb-2">{point}</p>
                ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="w-full h-full aspect-[16/9] max-w-6xl mx-auto relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {renderLayout()}
      <div className="absolute bottom-4 right-6 text-xs text-gray-400 font-mono opacity-50">
        第 {index + 1} 页 / 共 {total} 页
      </div>
    </motion.div>
  );
};

export default Slide;