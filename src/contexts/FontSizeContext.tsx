import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const fontSizeMap: Record<FontSize, string> = {
  sm: '93.75%',   // 15px (if base is 16px)
  base: '100%',   // 16px
  lg: '112.5%',   // 18px
  xl: '125%',     // 20px
  '2xl': '150%',  // 24px
};

const fontSizeOrder: FontSize[] = ['sm', 'base', 'lg', 'xl', '2xl'];

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('base');

  // 從 localStorage 加載保存的字體大小
  useEffect(() => {
    const savedSize = localStorage.getItem('fontSize') as FontSize;
    if (savedSize && fontSizeOrder.includes(savedSize)) {
      setFontSizeState(savedSize);
    }
  }, []);

  // 應用字體大小到 HTML 根元素
  useEffect(() => {
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);
  };

  const increaseFontSize = () => {
    const currentIndex = fontSizeOrder.indexOf(fontSize);
    if (currentIndex < fontSizeOrder.length - 1) {
      setFontSize(fontSizeOrder[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizeOrder.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(fontSizeOrder[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontSize('base');
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
};
