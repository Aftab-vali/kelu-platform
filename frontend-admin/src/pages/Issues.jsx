import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const STATUSES = ['received','under_review','documented','followup','response_received','closed'];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = () => api.issues().then(d => setIssues(d.issues)).catch(() => {});
  useEffect(() => { load(); }, []);

  const open = async (id) => {
    setSelected(id);
    const d = await api.issue(id);
    setDetail(d);
  };

  const changeStatus = async (status) => {
    await api.updateIssueStatus(selected, status);
    await open(selected);
    load();
  };

  return (
    <div className="p-8 grid md:grid-cols-2 gap-6">
      <div>
        <h1 className="text-xl font-bold text-kelu-ink mb-4">Issue Tracking</h1>
        <div className="bg-white border border-gray-100 rounded-xl divide-y">
          {issues.map(i => (
            <button key={i.id} onClick={() => open(i.id)} className={`w-full text-left p-4 hover:bg-gray-50 ${selected === i.id ? 'bg-kelu-cream' : ''}`}>
              <div className="flex justify-between text-sm">
                <span className="font-mono text-kelu-teal">{i.reference_code}</span>
                <span className="text-xs uppercase text-gray-400">{i.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{i.description}</p>
            </button>
          ))}
          {issues.length === 0 && <p className="p-4 text-gray-400 text-sm">No issues yet.</p>}
        </div>
      </div>

      <div>
        {detail ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <p className="font-mono text-kelu-teal">{detail.issue.reference_code}</p>
            <p className="text-gray-700 mt-3">{detail.issue.description}</p>
            <div className="mt-4">
              <label className="text-sm font-medium block mb-1">Status</label>
              <select className="input" value={detail.issue.status} onChange={e => changeStatus(e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">History</p>
              <ul className="text-sm text-gray-500 space-y-1">
                {detail.history.map(h => (
                  <li key={h.id}>{h.old_status || '—'} → {h.new_status} · {new Date(h.changed_at).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : <p className="text-gray-400">Select an issue to view details.</p>}
      </div>
    </div>
  );
}
