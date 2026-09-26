// Server-side only. This file must NEVER be bundled into any frontend build.
// Connection string / service-role credentials come from environment variables,
// never hard-coded, never committed to git (.env is in .gitignore).
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

module.exports = { pool };
