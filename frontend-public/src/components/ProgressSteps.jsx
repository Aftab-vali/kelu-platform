import React from 'react';

export default function ProgressSteps({ current, total, label }) {
  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i < current ? 'bg-kelu-teal' : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
