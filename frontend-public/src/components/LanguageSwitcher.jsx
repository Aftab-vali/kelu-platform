import React from 'react';
import { useLang } from '../i18n';

const LANGS = [
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-1 text-sm" role="group" aria-label="Language selector">
      {LANGS.map((l, i) => (
        <React.Fragment key={l.code}>
          <button
            onClick={() => setLang(l.code)}
            aria-current={lang === l.code}
            className={`px-2 py-1 rounded ${lang === l.code ? 'bg-kelu-teal text-white' : 'text-kelu-ink hover:bg-kelu-cream'}`}
          >
            {l.label}
          </button>
          {i < LANGS.length - 1 && <span className="text-gray-300 self-center">|</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
