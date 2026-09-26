const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const { verifyToken } = require('../auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

const SuggestionSchema = z.object({
  category: z.enum(['education_reform','technology','teacher_welfare','classroom','administration','infrastructure','other']),
  content: z.string().min(5).max(4000),
  contact: z.object({
    name: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional(),
  }).optional(),
});

// crude spam/PII heuristics — flag for a human, never auto-publish
function moderationFlags(text) {
  const flags = [];
  if (/https?:\/\//i.test(text)) flags.push('contains_link');
  if (/\b\d{10}\b/.test(text)) flags.push('possible_phone_number');
  if (text.length < 15) flags.push('too_short');
  return flags;
}

router.post('/', async (req, res) => {
  const parsed = SuggestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid submission', details: parsed.error.issues });
  const data = parsed.data;
  const flags = moderationFlags(data.content);
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
    await client.query(
      `insert into suggestions (category, content, contact_id, moderation_status)
       values ($1,$2,$3,$4)`,
      [data.category, data.content, contactId, flags.length ? 'flagged' : 'pending']
    );
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Thank you for your suggestion.' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  } finally {
    client.release();
  }
});

router.get('/', verifyToken, requireRole('super_admin','data_admin','moderator'), async (req, res) => {
  const { rows } = await pool.query(
    `select id, category, content, moderation_status, created_at from suggestions order by created_at desc limit 200`
  );
  res.json({ suggestions: rows });
});

router.patch('/:id/moderate', verifyToken, requireRole('super_admin','moderator'), async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
  await pool.query(`update suggestions set moderation_status = $1 where id = $2`, [decision, req.params.id]);
  await pool.query(
    `insert into audit_logs (admin_user_id, action, entity_type, entity_id, details_json)
     values ($1,'SUGGESTION_MODERATION','suggestion',$2,$3)`,
    [req.admin.sub, req.params.id, JSON.stringify({ decision })]
  );
  res.json({ success: true });
});

module.exports = router;
