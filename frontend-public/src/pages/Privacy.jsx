import React from 'react';
export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-kelu-ink mb-6">Privacy &amp; Data Use</h1>
      <div className="space-y-5 text-gray-600">
        <p><strong className="text-kelu-ink">Why we collect information: </strong>to understand the real challenges
        teachers face across North-East Karnataka and document them systematically for follow-up.</p>
        <p><strong className="text-kelu-ink">What we collect: </strong>survey responses, reported issues,
        suggestions, and — only if you choose to provide it — contact information.</p>
        <p><strong className="text-kelu-ink">Who can access it: </strong>only authorized administrators, under
        role-based permissions, for the purpose of understanding and following up on concerns. Individual responses
        are never published publicly.</p>
        <p><strong className="text-kelu-ink">Anonymity: </strong>contact information is stored separately from your
        survey answers and issue descriptions wherever practical, and is optional.</p>
        <p><strong className="text-kelu-ink">Security: </strong>data is stored in an access-controlled database,
        transmitted over HTTPS, and every administrative action is logged for accountability.</p>
        <p><strong className="text-kelu-ink">Retention &amp; requests: </strong>contact us via the Contact page for
        any privacy-related request, including access or deletion.</p>
        <p className="text-sm italic text-gray-400">This page reflects the platform's data-handling design. Final
        legal wording should be reviewed by a qualified legal advisor before production launch.</p>
      </div>
    </div>
  );
}
