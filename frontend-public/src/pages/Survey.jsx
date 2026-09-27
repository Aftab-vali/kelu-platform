import React, { useState, useEffect } from 'react';
import { useLang } from '../i18n';
import { api } from '../lib/api';
import ProgressSteps from '../components/ProgressSteps';

const CHALLENGE_KEYS = [
  'Recruitment','Teacher vacancies','Transfers','Promotions','Salary/payment-related issues',
  'Pension/retirement-related concerns','Workload','Non-teaching duties','Administrative procedures',
  'Teacher shortage','Infrastructure','Digital resources','Training and professional development',
  'Student-related challenges','Examination-related responsibilities','Work-life balance',
  'Institutional issues','Other',
];

const TOTAL_STEPS = 5;

export default function Survey() {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    api.getDistricts().then(d => setDistricts(d.districts || [])).catch(() => {});
    api.getInstitutions().then(d => setInstitutions(d.institutions || [])).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    districtId: '', talukId: '', institutionId: '',
    experience: '', subject: '',
    challenges: [], challengesMore: '',
    priorities: [], urgent: '',
    qual1: '', qual2: '',
    suggestion: '',
    consent: false,
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onDistrictChange = (districtId) => {
    update('districtId', districtId);
    update('talukId', '');
    if (districtId) {
      api.getTaluks(districtId).then(d => setTaluks(d.taluks || [])).catch(() => setTaluks([]));
    } else {
      setTaluks([]);
    }
  };

  const toggleChallenge = (c) => {
    setForm(f => {
      const has = f.challenges.includes(c);
      return { ...f, challenges: has ? f.challenges.filter(x => x !== c) : [...f.challenges, c] };
    });
  };

  const togglePriority = (c) => {
    setForm(f => {
      const has = f.priorities.includes(c);
      if (has) return { ...f, priorities: f.priorities.filter(x => x !== c) };
      if (f.priorities.length >= 3) return f; // cap at 3
      return { ...f, priorities: [...f.priorities, c] };
    });
  };

  const canGoNext = () => {
    if (step === 3 && form.priorities.length === 0) return false;
    if (step === 5 && !form.consent) return false;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.submitSurvey({
        district_id: form.districtId || undefined,
        taluk_id: form.talukId || undefined,
        institution_id: form.institutionId || undefined,
        teaching_experience_years: form.experience ? parseInt(form.experience, 10) : undefined,
        subject_area: form.subject || undefined,
        language: 'en',
        answers: [
          { question_key: 'challenges_selected', answer_json: form.challenges },
          { question_key: 'challenges_more', answer_text: form.challengesMore },
          { question_key: 'priority_top3', answer_json: form.priorities },
          { question_key: 'priority_urgent', answer_text: form.urgent },
          { question_key: 'qual_hardest_issue', answer_text: form.qual1 },
          { question_key: 'qual_biggest_change', answer_text: form.qual2 },
          { question_key: 'suggestion', answer_text: form.suggestion },
        ],
      });
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong submitting your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-kelu-ink">{t('survey.thankYou')}</h1>
        <p className="text-gray-500 mt-3">You're welcome to also report a specific issue or share a suggestion.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink">{t('survey.title')}</h1>
      <p className="text-sm text-gray-400 mb-6">{t('survey.estimate')}</p>
      <ProgressSteps current={step} total={TOTAL_STEPS} label={`${t('survey.step')} ${step} ${t('survey.of')} ${TOTAL_STEPS}`} />

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('survey.s1title')}</h2>
          <Field label={t('survey.district')}>
            <select className="input" value={form.districtId} onChange={e => onDistrictChange(e.target.value)}>
              <option value="">—</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label={t('survey.taluk')}>
            <select className="input" value={form.talukId} disabled={!form.districtId} onChange={e => update('talukId', e.target.value)}>
              <option value="">—</option>
              {taluks.map(t2 => <option key={t2.id} value={t2.id}>{t2.name}</option>)}
            </select>
          </Field>
          <Field label={t('survey.institutionCategory')}>
            <select className="input" value={form.institutionId} onChange={e => update('institutionId', e.target.value)}>
              <option value="">—</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.category} — {i.level.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <Field label={t('survey.experience')}><input type="number" min="0" max="60" className="input" value={form.experience} onChange={e => update('experience', e.target.value)} /></Field>
          <Field label={t('survey.subject')}><input className="input" value={form.subject} onChange={e => update('subject', e.target.value)} /></Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('survey.s2title')}</h2>
          <p className="text-gray-600">{t('survey.challengesQ')}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {CHALLENGE_KEYS.map(c => (
              <label key={c} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${form.challenges.includes(c) ? 'border-kelu-teal bg-kelu-cream' : 'border-gray-200'}`}>
                <input type="checkbox" checked={form.challenges.includes(c)} onChange={() => toggleChallenge(c)} />
                <span className="text-sm">{c}</span>
              </label>
            ))}
          </div>
          <Field label={t('survey.challengesMore')}>
            <textarea className="input h-28" value={form.challengesMore} onChange={e => update('challengesMore', e.target.value)} />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('survey.s3title')}</h2>
          <p className="text-gray-600">{t('survey.priorityQ')}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {(form.challenges.length ? form.challenges : CHALLENGE_KEYS.slice(0, 6)).map(c => (
              <label key={c} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${form.priorities.includes(c) ? 'border-kelu-teal bg-kelu-cream' : 'border-gray-200'}`}>
                <input type="checkbox" checked={form.priorities.includes(c)} onChange={() => togglePriority(c)} />
                <span className="text-sm">{c}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-400">Selected {form.priorities.length}/3</p>
          {form.priorities.length > 0 && (
            <Field label={t('survey.urgentQ')}>
              <select className="input" value={form.urgent} onChange={e => update('urgent', e.target.value)}>
                <option value="">—</option>
                {form.priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('survey.s4title')}</h2>
          <Field label={t('survey.qual1')}><textarea className="input h-24" value={form.qual1} onChange={e => update('qual1', e.target.value)} /></Field>
          <Field label={t('survey.qual2')}><textarea className="input h-24" value={form.qual2} onChange={e => update('qual2', e.target.value)} /></Field>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('survey.s5title')}</h2>
          <Field label={t('survey.suggestionQ')}><textarea className="input h-32" value={form.suggestion} onChange={e => update('suggestion', e.target.value)} /></Field>
          <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <input type="checkbox" className="mt-1" checked={form.consent} onChange={e => update('consent', e.target.checked)} />
            <span>{t('survey.consent')} <em className="block text-xs text-gray-400 mt-1">(Final legal wording pending review — see Privacy page.)</em></span>
          </label>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="px-5 py-2 rounded-full border border-gray-300 disabled:opacity-30">
          {t('survey.back')}
        </button>
        {step < TOTAL_STEPS ? (
          <button disabled={!canGoNext()} onClick={() => setStep(s => s + 1)} className="px-6 py-2 rounded-full bg-kelu-teal text-white disabled:opacity-40">
            {t('survey.next')}
          </button>
        ) : (
          <button disabled={!form.consent || submitting} onClick={submit} className="px-6 py-2 rounded-full bg-kelu-gold text-white disabled:opacity-40">
            {submitting ? '…' : t('survey.submit')}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
