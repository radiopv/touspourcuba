import React, { createContext, useContext, useState, useEffect } from 'react';
import { frenchTranslations } from '../translations/fr';
import { spanishTranslations } from '../translations/es';

type Language = 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: frenchTranslations,
  es: spanishTranslations
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferredLanguage') as Language;
    const browserLang = navigator.language.toLowerCase();
    
    if (storedLanguage && (storedLanguage === 'fr' || storedLanguage === 'es')) {
      setLanguage(storedLanguage);
    } else if (browserLang.startsWith('es')) {
      setLanguage('es');
    } else if (browserLang.startsWith('fr')) {
      setLanguage('fr');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    const currentTranslations = translations[language];
    const translation = currentTranslations[key as keyof typeof currentTranslations];
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};