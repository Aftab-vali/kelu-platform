import React, { createContext, useContext, useState } from 'react';
import { dictionaries } from './dictionaries';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('kelu_lang') || 'en');

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('kelu_lang', l);
  };

  const t = (path) => {
    const parts = path.split('.');
    let node = dictionaries[lang];
    for (const p of parts) node = node?.[p];
    if (node === undefined) {
      // Fall back to English so the UI never breaks if a translation is missing.
      let fallback = dictionaries.en;
      for (const p of parts) fallback = fallback?.[p];
      return fallback ?? path;
    }
    return node;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
