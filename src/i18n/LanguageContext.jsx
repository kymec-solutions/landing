import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();
const availableLanguages = ['en', 'es'];

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  try {
    const stored = window.localStorage.getItem('kymec-lang');
    if (stored && availableLanguages.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // Ignore storage access issues and fall back to browser settings.
  }

  return 'en';
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => {
      const currentIndex = availableLanguages.indexOf(prev);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availableLanguages.length;
      return availableLanguages[nextIndex];
    });
  };

  useEffect(() => {
    try {
      window.localStorage.setItem('kymec-lang', language);
    } catch (error) {
      // Ignore storage access issues.
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
