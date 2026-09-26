const express = require('express');
const { pool } = require('../db');
const { verifyToken } = require('../auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

// PUBLIC — returns placeholder unless is_published = true
router.get('/', async (req, res) => {
  const { rows } = await pool.query(`select * from candidate_profiles limit 1`);
  const profile = rows[0];
  if (!profile || !profile.is_published) {
    return res.json({ published: false, message: 'Candidate information will be published here soon.' });
  }
  const { id, is_published, ...publicFields } = profile;
  res.json({ published: true, profile: publicFields });
});

// ADMIN — content_admin or super_admin only, controls activation
router.put('/', verifyToken, requireRole('super_admin', 'content_admin'), async (req, res) => {
  const allowed = ['is_published','full_name','photo_url','professional_background',
    'educational_qualifications','teaching_experience','professional_experience',
    'public_service','professional_contributions','published_statements',
    'documents_json','public_contact'];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: 'No valid fields' });

  const { rows: existing } = await pool.query(`select id from candidate_profiles limit 1`);
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = fields.map(f => req.body[f]);

  if (existing[0]) {
    await pool.query(`update candidate_profiles set ${setClause}, updated_at = now() where id = $${fields.length + 1}`,
      [...values, existing[0].id]);
  } else {
    const cols = fields.join(', ');
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    await pool.query(`insert into candidate_profiles (${cols}) values (${placeholders})`, values);
  }
  await pool.query(
    `insert into audit_logs (admin_user_id, action, entity_type, details_json) values ($1,'CANDIDATE_UPDATE','candidate_profiles',$2)`,
    [req.admin.sub, JSON.stringify({ fields })]
  );
  res.json({ success: true });
});

module.exports = router;
