import { Globe2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';

const LANGUAGES = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'ro', label: 'RO' },
  { id: 'ka', label: 'KA' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Language selector">
      <Globe2 className="h-4 w-4 text-gold" aria-hidden="true" />
      {LANGUAGES.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setLanguage(item.id)}
          className={language === item.id ? 'active' : ''}
          aria-pressed={language === item.id}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
