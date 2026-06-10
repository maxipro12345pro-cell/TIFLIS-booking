import { translations } from '../lib/translations.js';
import { useLanguage } from './useLanguage.js';

export function useTranslation() {
  const { language, setLanguage } = useLanguage();
  const copy = translations[language] ?? translations.ru;

  return {
    language,
    setLanguage,
    copy,
  };
}
