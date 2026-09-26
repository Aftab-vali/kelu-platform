import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  useEffect(() => { api.getUpdates().then(d => setUpdates(d.updates || [])).catch(() => {}); }, []);
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink mb-6">Updates</h1>
      <div className="space-y-6">
        {updates.map(u => (
          <div key={u.id} className="border-b border-gray-100 pb-6">
            <p className="text-xs text-kelu-gold font-semibold uppercase">{u.category}</p>
            <h2 className="font-semibold text-lg mt-1">{u.title}</h2>
            <p className="text-gray-600 mt-1">{u.short_description}</p>
          </div>
        ))}
        {updates.length === 0 && <p className="text-gray-400">No updates published yet.</p>}
      </div>
    </div>
  );
}
