import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Candidate() {
  const [data, setData] = useState(null);

  useEffect(() => { api.getCandidate().then(setData).catch(() => {}); }, []);

  if (!data || !data.published) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-kelu-ink">CANDIDATE PROFILE</h1>
        <p className="text-gray-500 mt-3">Candidate information will be published here soon.</p>
      </div>
    );
  }

  const p = data.profile;
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink mb-6">{p.full_name}</h1>
      {[
        ['Professional Background', p.professional_background],
        ['Educational Qualifications', p.educational_qualifications],
        ['Teaching Experience', p.teaching_experience],
        ['Professional Experience', p.professional_experience],
        ['Public Service', p.public_service],
        ['Professional Contributions', p.professional_contributions],
        ['Published Statements', p.published_statements],
      ].filter(([, v]) => v).map(([label, value]) => (
        <div key={label} className="mb-5">
          <h2 className="font-semibold text-kelu-teal">{label}</h2>
          <p className="text-gray-600 mt-1 whitespace-pre-line">{value}</p>
        </div>
      ))}
      {p.public_contact && <p className="text-sm text-gray-400 mt-8">Contact: {p.public_contact}</p>}
    </div>
  );
}
