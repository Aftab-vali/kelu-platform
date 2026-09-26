import React, { useState } from 'react';
import { useLang } from '../i18n';
import { api } from '../lib/api';

const CATEGORIES = ['Recruitment','Transfers','Salary/payment','Infrastructure','Workload','Administrative procedures','Other'];

export default function ReportIssue() {
  const { t } = useLang();
  const [form, setForm] = useState({
    category: '', district: '', taluk: '', institutionType: '', description: '',
    seriousness: '', wantsFollowup: false, name: '', phone: '', email: '',
  });
  const [reference, setReference] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await api.submitIssue({
        description: form.description,
        seriousness: form.seriousness || undefined,
        wants_followup: form.wantsFollowup,
        contact: (form.name || form.phone || form.email) ? { name: form.name, phone: form.phone, email: form.email } : undefined,
      });
      setReference(res.reference_code);
    } catch (e) {
      setError('Something went wrong. Please check your entries and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold">{t('issue.confirmTitle')}</h1>
        <p className="text-gray-500 mt-2">{t('issue.confirmBody')}</p>
        <div className="mt-6 inline-block bg-kelu-cream border border-kelu-teal/30 rounded-lg px-6 py-4">
          <p className="text-xs text-gray-500 uppercase">Reference number</p>
          <p className="text-2xl font-mono font-bold text-kelu-teal">{reference}</p>
        </div>
        <div>
          <button onClick={() => navigator.clipboard?.writeText(reference)} className="mt-4 text-sm underline text-kelu-teal">Copy reference number</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink mb-6">{t('issue.title')}</h1>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t('issue.category')}>
          <select required className="input" value={form.category} onChange={e => update('category', e.target.value)}>
            <option value="">—</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('survey.district')}><input className="input" value={form.district} onChange={e => update('district', e.target.value)} /></Field>
          <Field label={t('survey.taluk')}><input className="input" value={form.taluk} onChange={e => update('taluk', e.target.value)} /></Field>
        </div>
        <Field label={t('issue.description')}>
          <textarea required minLength={10} className="input h-32" value={form.description} onChange={e => update('description', e.target.value)} />
        </Field>
        <Field label={t('issue.seriousness')}>
          <select className="input" value={form.seriousness} onChange={e => update('seriousness', e.target.value)}>
            <option value="">—</option>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </Field>
        <Field label={t('issue.followup')}>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-1"><input type="radio" name="fu" checked={form.wantsFollowup} onChange={() => update('wantsFollowup', true)} /> {t('common.yes')}</label>
            <label className="flex items-center gap-1"><input type="radio" name="fu" checked={!form.wantsFollowup} onChange={() => update('wantsFollowup', false)} /> {t('common.no')}</label>
          </div>
        </Field>
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-medium px-1">{t('issue.contactOptional')}</legend>
          <div className="space-y-3 mt-2">
            <input placeholder="Name" className="input" value={form.name} onChange={e => update('name', e.target.value)} />
            <input placeholder="Phone" className="input" value={form.phone} onChange={e => update('phone', e.target.value)} />
            <input placeholder="Email" type="email" className="input" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
        </fieldset>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={submitting} className="w-full bg-kelu-teal text-white py-3 rounded-full font-semibold disabled:opacity-50">
          {submitting ? '…' : t('issue.submit')}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>{children}</label>;
}
