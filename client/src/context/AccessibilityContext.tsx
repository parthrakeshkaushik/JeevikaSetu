import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  textSize: 'normal' | 'large' | 'xlarge';
  setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
  speakText: (text: string, lang?: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('jeevikasetu_contrast') === 'true';
  });

  const [textSize, setTextSizeState] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('jeevikasetu_text_size') as any) || 'normal';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast', 'dark');
    } else {
      document.documentElement.classList.remove('high-contrast', 'dark');
    }
    localStorage.setItem('jeevikasetu_contrast', highContrast.toString());
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const setTextSize = (size: 'normal' | 'large' | 'xlarge') => {
    setTextSizeState(size);
    localStorage.setItem('jeevikasetu_text_size', size);
  };

  const speakText = (text: string, lang: string = 'hi-IN') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.9; // Slightly slower, calm cadence for emergency assistance

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textSize,
        setTextSize,
        speakText,
        isSpeaking,
        stopSpeaking,
      }}
    >
      <div
        className={
          textSize === 'xlarge'
            ? 'text-lg md:text-xl'
            : textSize === 'large'
            ? 'text-base md:text-lg'
            : 'text-sm md:text-base'
        }
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
