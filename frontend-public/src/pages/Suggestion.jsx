import React, { useState } from 'react';
import { api } from '../lib/api';

const CATS = [
  ['education_reform', 'Education reforms'], ['technology', 'Technology'],
  ['teacher_welfare', 'Teacher welfare'], ['classroom', 'Classroom improvements'],
  ['administration', 'Administration'], ['infrastructure', 'Infrastructure'], ['other', 'Other'],
];

export default function Suggestion() {
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.submitSuggestion({ category, content, contact: name ? { name } : undefined });
      setDone(true);
    } catch { setError('Something went wrong. Please try again.'); }
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🙏</div>
      <h1 className="text-xl font-bold">Thank you for your suggestion.</h1>
      <p className="text-gray-500 mt-2">Every practical idea is read and considered.</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink">Share Your Suggestion</h1>
      <p className="text-gray-500 mt-2 mb-6">Sometimes the person closest to a problem is also the person most capable of identifying a practical solution.</p>
      <form onSubmit={submit} className="space-y-4">
        <select required className="input" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Category —</option>
          {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <textarea required minLength={5} className="input h-32" placeholder="What practical changes would you suggest?"
          value={content} onChange={e => setContent(e.target.value)} />
        <input className="input" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-kelu-teal text-white py-3 rounded-full font-semibold">Submit Suggestion</button>
      </form>
    </div>
  );
}
