import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { api } from '../lib/api';

export default function Home() {
  const { t } = useLang();
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    api.getUpdates().then(d => setUpdates(d.updates?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* 1. HERO */}
      <section className="bg-kelu-cream">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-kelu-ink leading-tight">{t('home.heroTitle')}</h1>
          <p className="mt-5 max-w-2xl mx-auto text-gray-600 text-lg">{t('home.heroSub')}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/survey" className="bg-kelu-teal text-white px-6 py-3 rounded-full font-semibold">{t('home.ctaSurvey')}</Link>
            <Link to="/report-issue" className="border border-kelu-teal text-kelu-teal px-6 py-3 rounded-full font-semibold">{t('home.ctaIssue')}</Link>
            <Link to="/suggestion" className="text-kelu-ink px-6 py-3 font-semibold underline">{t('home.ctaSuggestion')}</Link>
          </div>
        </div>
      </section>

      {/* 2 & 3. WHY / EMPATHY */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-kelu-ink">{t('home.empathyTitle')}</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">{t('home.empathyBody')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm font-semibold text-kelu-teal">
          {t('home.flow').map((step, i) => (
            <React.Fragment key={step}>
              <span className="bg-white border border-kelu-teal/30 rounded-full px-4 py-2">{step}</span>
              {i < t('home.flow').length - 1 && <span className="self-center text-gray-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 7. AREAS WE LISTEN TO */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center">
          {[
            { title: 'Teacher Welfare', items: ['Transfers', 'Promotions', 'Recruitment', 'Retirement'] },
            { title: 'Professional Development', items: ['Training', 'Skills', 'Technology'] },
            { title: 'Education Environment', items: ['Infrastructure', 'Digital Resources', 'Student Support'] },
          ].map(cat => (
            <div key={cat.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-kelu-teal mb-3">{cat.title}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {cat.items.map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CANDIDATE (placeholder link) */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-kelu-ink">{t('nav.candidate')}</h2>
        <p className="mt-2 text-gray-500">Candidate information will be published here soon.</p>
        <Link to="/candidate" className="inline-block mt-4 text-kelu-teal underline">Learn more →</Link>
      </section>

      {/* 9. LATEST UPDATES */}
      {updates.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-xl font-bold text-kelu-ink mb-6 text-center">{t('nav.updates')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {updates.map(u => (
                <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-xs text-kelu-gold font-semibold uppercase">{u.category}</p>
                  <h3 className="font-semibold mt-1">{u.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{u.short_description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10 & 11. PRIVACY & CONTACT */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-kelu-ink">Your privacy matters</h2>
        <p className="mt-2 text-gray-600">We never publish individual responses or identities. <Link to="/privacy" className="text-kelu-teal underline">Read our Privacy &amp; Data Use policy</Link>.</p>
      </section>
    </div>
  );
}
