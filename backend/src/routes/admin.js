const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { pool } = require('../db');
const { signToken, verifyToken, checkPassword } = require('../auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // brute-force protection

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post('/login', loginLimiter, async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials format' });
  const { email, password } = parsed.data;
  const { rows } = await pool.query(`select * from admin_users where email = $1 and is_active = true`, [email]);
  const user = rows[0];
  // Constant-shape response whether or not user exists, to avoid user enumeration
  if (!user || !(await checkPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = signToken(user);
  await pool.query(
    `insert into audit_logs (admin_user_id, action) values ($1,'LOGIN')`, [user.id]
  );
  res.json({ token, role: user.role, full_name: user.full_name });
});

router.get('/me', verifyToken, (req, res) => res.json({ admin: req.admin }));

// Aggregate-only analytics — never returns row-level teacher identity/content
// alongside identifying info. Suitable for analytics_user role.
router.get('/analytics/summary', verifyToken,
  requireRole('super_admin', 'data_admin', 'analytics_user'), async (req, res) => {
  const [issueCounts, surveyCount, districtBreakdown, categoryBreakdown] = await Promise.all([
    pool.query(`select status, count(*)::int as n from issues group by status`),
    pool.query(`select count(*)::int as n from survey_responses`),
    pool.query(`select d.name, count(i.*)::int as n from issues i join districts d on d.id = i.district_id group by d.name order by n desc`),
    pool.query(`select c.name, count(i.*)::int as n from issues i join issue_categories c on c.id = i.category_id group by c.name order by n desc`),
  ]);
  res.json({
    issue_status_counts: issueCounts.rows,
    total_survey_responses: surveyCount.rows[0].n,
    issues_by_district: districtBreakdown.rows,
    issues_by_category: categoryBreakdown.rows,
  });
});

// Secure export — permissioned, audited, never publicly reachable.
router.get('/export/issues.csv', verifyToken, requireRole('super_admin', 'data_admin'), async (req, res) => {
  const { rows } = await pool.query(
    `select reference_code, seriousness, status, created_at from issues order by created_at desc`
  );
  await pool.query(
    `insert into audit_logs (admin_user_id, action, entity_type, details_json) values ($1,'DATA_EXPORT','issues',$2)`,
    [req.admin.sub, JSON.stringify({ row_count: rows.length })]
  );
  const header = 'reference_code,seriousness,status,created_at\n';
  const body = rows.map(r => `${r.reference_code},${r.seriousness || ''},${r.status},${r.created_at.toISOString()}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="issues_export.csv"');
  res.send(header + body);
});

module.exports = router;
