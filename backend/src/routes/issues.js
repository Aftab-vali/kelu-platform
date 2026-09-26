const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const { nextIssueReference } = require('../utils/issueId');
const { verifyToken } = require('../auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

const IssueSchema = z.object({
  category_id: z.string().uuid().optional(),
  district_id: z.string().uuid().optional(),
  taluk_id: z.string().uuid().optional(),
  institution_id: z.string().uuid().optional(),
  description: z.string().min(10).max(4000),
  seriousness: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  wants_followup: z.boolean().default(false),
  contact: z.object({
    name: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional(),
  }).optional(),
});

// PUBLIC: submit an issue, get back a human-facing reference code only.
router.post('/', async (req, res) => {
  const parsed = IssueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid submission', details: parsed.error.issues });
  }
  const data = parsed.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let contactId = null;
    if (data.contact && (data.contact.name || data.contact.phone || data.contact.email)) {
      const c = await client.query(
        `insert into contacts (name, phone, email) values ($1,$2,$3) returning id`,
        [data.contact.name || null, data.contact.phone || null, data.contact.email || null]
      );
      contactId = c.rows[0].id;
    }
    const reference = await nextIssueReference();
    const ins = await client.query(
      `insert into issues
       (reference_code, category_id, district_id, taluk_id, institution_id, description, seriousness, wants_followup, contact_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       returning reference_code`,
      [reference, data.category_id || null, data.district_id || null, data.taluk_id || null,
       data.institution_id || null, data.description, data.seriousness || null, data.wants_followup, contactId]
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, reference_code: ins.rows[0].reference_code });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  } finally {
    client.release();
  }
});

// ===== ADMIN-ONLY BELOW (all require a valid session + role) =====

router.get('/', verifyToken, requireRole('super_admin', 'data_admin', 'analytics_user'), async (req, res) => {
  const { status, district_id } = req.query;
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
  if (district_id) { params.push(district_id); conditions.push(`district_id = $${params.length}`); }
  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const { rows } = await pool.query(
    `select id, reference_code, category_id, district_id, taluk_id, description, seriousness, status, created_at
     from issues ${where} order by created_at desc limit 200`, params
  );
  res.json({ issues: rows });
});

router.get('/:id', verifyToken, requireRole('super_admin', 'data_admin', 'analytics_user'), async (req, res) => {
  const { rows } = await pool.query(`select * from issues where id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  const history = await pool.query(
    `select * from issue_status_history where issue_id = $1 order by changed_at asc`, [req.params.id]
  );
  res.json({ issue: rows[0], history: history.rows });
});

const StatusSchema = z.object({
  status: z.enum(['received', 'under_review', 'documented', 'followup', 'response_received', 'closed']),
  note: z.string().max(2000).optional(),
});

router.patch('/:id/status', verifyToken, requireRole('super_admin', 'data_admin'), async (req, res) => {
  const parsed = StatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid status' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query(`select status from issues where id = $1`, [req.params.id]);
    if (!current.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }

    await client.query(`update issues set status = $1, updated_at = now() where id = $2`,
      [parsed.data.status, req.params.id]);
    await client.query(
      `insert into issue_status_history (issue_id, old_status, new_status, note, changed_by)
       values ($1,$2,$3,$4,$5)`,
      [req.params.id, current.rows[0].status, parsed.data.status, parsed.data.note || null, req.admin.sub]
    );
    await client.query(
      `insert into audit_logs (admin_user_id, action, entity_type, entity_id, details_json)
       values ($1,'ISSUE_STATUS_CHANGE','issue',$2,$3)`,
      [req.admin.sub, req.params.id, JSON.stringify({ from: current.rows[0].status, to: parsed.data.status })]
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  } finally {
    client.release();
  }
});

module.exports = router;
