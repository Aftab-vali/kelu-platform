import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Nav() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const links = [
    ['/', t('nav.home')], ['/survey', t('nav.survey')], ['/report-issue', t('nav.issue')],
    ['/suggestion', t('nav.suggestion')], ['/candidate', t('nav.candidate')], ['/updates', t('nav.updates')],
    ['/about', t('nav.about')], ['/privacy', t('nav.privacy')], ['/contact', t('nav.contact')],
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-kelu-teal">Kelu <span className="text-xs font-normal text-gray-400 align-middle">ಕೇಳು</span></Link>
        <nav className="hidden lg:flex items-center gap-5 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className={`hover:text-kelu-teal ${loc.pathname === href ? 'text-kelu-teal font-semibold' : 'text-kelu-ink'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <Link to="/survey" className="bg-kelu-gold text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90">
            {t('nav.cta')}
          </Link>
        </div>
        <button className="lg:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
      </div>
      {open && (
        <div className="lg:hidden px-4 pb-4 flex flex-col gap-3 border-t border-gray-100">
          {links.map(([href, label]) => (
            <Link key={href} to={href} onClick={() => setOpen(false)} className="text-kelu-ink">{label}</Link>
          ))}
          <LanguageSwitcher />
          <Link to="/survey" onClick={() => setOpen(false)} className="bg-kelu-gold text-white text-center px-4 py-3 rounded-full font-semibold">
            {t('nav.cta')}
          </Link>
        </div>
      )}
    </header>
  );
}
