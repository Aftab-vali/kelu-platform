import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-kelu-ink text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="text-white font-bold text-lg">Kelu <span className="opacity-60 font-normal">ಕೇಳು</span></div>
          <p className="mt-2 max-w-sm opacity-80">Every teacher has a story. Every concern deserves to be heard.</p>
        </div>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-white">{t('nav.privacy')}</Link>
          <Link to="/contact" className="hover:text-white">{t('nav.contact')}</Link>
          <Link to="/about" className="hover:text-white">{t('nav.about')}</Link>
        </div>
      </div>
    </footer>
  );
}
