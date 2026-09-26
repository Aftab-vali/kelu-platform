// Generates a human-facing reference like NEK-2026-00482.
// The actual database primary key is a UUID (see migrations) — this code
// is purely cosmetic/communicative and is looked up via a unique index,
// never used as the row's real identifier.
const { pool } = require('../db');

async function nextIssueReference() {
  const year = new Date().getFullYear();
  const { rows } = await pool.query(
    `select count(*)::int as n from issues where reference_code like $1`,
    [`NEK-${year}-%`]
  );
  const seq = (rows[0].n + 1).toString().padStart(5, '0');
  return `NEK-${year}-${seq}`;
}

module.exports = { nextIssueReference };
