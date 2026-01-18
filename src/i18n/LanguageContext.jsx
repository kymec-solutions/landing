import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();
const availableLanguages = ['en', 'es'];
const fallbackLanguage = 'en';
const languageCookie = 'kymec-lang';

const getCookieValue = name => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieString = document.cookie || '';
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

const getNavigatorLanguage = () => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith('es')) {
      return 'es';
    }
    if (normalized.startsWith('en')) {
      return 'en';
    }
  }

  return null;
};

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return fallbackLanguage;
  }

  try {
    const stored = window.localStorage.getItem(languageCookie);
    if (stored && availableLanguages.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // Ignore storage access issues and fall back to other signals.
  }

  const cookieLang = getCookieValue(languageCookie);
  if (cookieLang && availableLanguages.includes(cookieLang)) {
    return cookieLang;
  }

  const navigatorLang = getNavigatorLanguage();
  if (navigatorLang && availableLanguages.includes(navigatorLang)) {
    return navigatorLang;
  }

  return fallbackLanguage;
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
      window.localStorage.setItem(languageCookie, language);
    } catch (error) {
      // Ignore storage access issues.
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;

      const attributes = [
        `${languageCookie}=${encodeURIComponent(language)}`,
        'Path=/',
        'Max-Age=31536000',
        'SameSite=Lax'
      ];

      if (window.location?.protocol === 'https:') {
        attributes.push('Secure');
      }

      document.cookie = attributes.join('; ');
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
