import React, { useState } from 'react';
import { useFontSize } from '../contexts/FontSizeContext';
import { Type, Minus, Plus, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FontSizeController: React.FC = () => {
  const { fontSize, setFontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();
  const [isExpanded, setIsExpanded] = useState(false);

  const fontSizeLabels = {
    sm: '小',
    base: '標準',
    lg: '大',
    xl: '特大',
    '2xl': '超大',
  };

  const isMinSize = fontSize === 'sm';
  const isMaxSize = fontSize === '2xl';

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
      {/* 主按鈕 */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative w-14 h-14 bg-[#111] border-2 border-white/10 hover:border-[#FF5722] rounded-full flex items-center justify-center transition-all shadow-2xl hover:shadow-[0_0_30px_rgba(255,87,34,0.3)] active:scale-95"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Type size={24} className="text-white group-hover:text-[#FF5722] transition-colors" />

        {/* 當前大小指示器 */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5722] rounded-full flex items-center justify-center">
          <span className="text-[8px] font-black text-black">
            {fontSize === 'base' ? 'A' : fontSize === 'sm' ? 'A-' : fontSize === 'lg' ? 'A+' : fontSize === 'xl' ? 'A++' : 'A+++'}
          </span>
        </div>
      </motion.button>

      {/* 展開的控制面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#111] border-2 border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="space-y-3">
              {/* 標題 */}
              <div className="text-center pb-2 border-b border-white/10">
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
                  字體大小
                </p>
                <p className="text-xs text-[#FF5722] font-bold mt-1">
                  {fontSizeLabels[fontSize]}
                </p>
              </div>

              {/* 控制按鈕 */}
              <div className="flex gap-2">
                {/* 縮小 */}
                <button
                  onClick={decreaseFontSize}
                  disabled={isMinSize}
                  className="flex-1 aspect-square bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                  title="縮小字體"
                >
                  <Minus size={16} className="text-white mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">
                    A-
                  </span>
                </button>

                {/* 重置 */}
                <button
                  onClick={resetFontSize}
                  className="flex-1 aspect-square bg-[#FF5722]/10 hover:bg-[#FF5722]/20 border border-[#FF5722]/30 rounded-xl flex flex-col items-center justify-center transition-all group"
                  title="重置為標準大小"
                >
                  <RotateCcw size={16} className="text-[#FF5722] mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#FF5722]">
                    預設
                  </span>
                </button>

                {/* 放大 */}
                <button
                  onClick={increaseFontSize}
                  disabled={isMaxSize}
                  className="flex-1 aspect-square bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                  title="放大字體"
                >
                  <Plus size={16} className="text-white mb-1" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">
                    A+
                  </span>
                </button>
              </div>

              {/* 快速選擇 */}
              <div className="pt-2 border-t border-white/10">
                <div className="grid grid-cols-5 gap-1">
                  {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`aspect-square rounded-lg text-[10px] font-black uppercase transition-all ${
                        fontSize === size
                          ? 'bg-[#FF5722] text-black'
                          : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {size === 'base' ? 'A' : size === 'sm' ? 'A-' : size === 'lg' ? 'A+' : size === 'xl' ? 'A++' : 'A+++'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 提示 */}
              <p className="text-[8px] text-gray-600 text-center uppercase tracking-wider pt-2">
                Font Size Controller
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FontSizeController;
