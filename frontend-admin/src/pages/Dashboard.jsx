import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.summary().then(setData).catch(() => {}); }, []);
  if (!data) return <p className="p-8 text-gray-400">Loading…</p>;

  const statusCounts = Object.fromEntries(data.issue_status_counts.map(r => [r.status, r.n]));
  const total = data.issue_status_counts.reduce((a, r) => a + r.n, 0);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-xl font-bold text-kelu-ink">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Issues" value={total} />
        <StatCard label="Received" value={statusCounts.received || 0} />
        <StatCard label="Under Review" value={statusCounts.under_review || 0} />
        <StatCard label="Follow-up" value={statusCounts.followup || 0} />
        <StatCard label="Closed" value={statusCounts.closed || 0} />
      </div>
      <StatCard label="Total Survey Responses" value={data.total_survey_responses} wide />

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Issues by District</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.issues_by_district}>
            <XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} /><Tooltip />
            <Bar dataKey="n" fill="#0F6E6E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Issues by Category</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.issues_by_category} layout="vertical">
            <XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={160} fontSize={12} /><Tooltip />
            <Bar dataKey="n" fill="#C9962C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ label, value, wide }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 ${wide ? 'col-span-full' : ''}`}>
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className="text-2xl font-bold text-kelu-ink mt-1">{value}</p>
    </div>
  );
}
