import { useMemo, useState } from 'react';
import { LanguageContext } from './LanguageContextValue.js';

const STORAGE_KEY = 'tiflis.language';
const DEFAULT_LANGUAGE = 'ru';
const SUPPORTED_LANGUAGES = ['ru', 'en', 'ro', 'ka'];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
  });

  const setLanguage = (nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;

    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
