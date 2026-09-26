const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');
const { verifyToken } = require('../auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

// PUBLIC — only published updates
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `select id, category, title, short_description, content, attachments_json, published_at
     from updates where is_published = true order by published_at desc limit 100`
  );
  res.json({ updates: rows });
});

const UpdateSchema = z.object({
  category: z.enum(['announcement','teacher_meeting','consultation','document','public_statement','event','portal_update']),
  title: z.string().min(2).max(300),
  short_description: z.string().max(500).optional(),
  content: z.string().max(20000).optional(),
  attachments_json: z.any().optional(),
});

router.post('/', verifyToken, requireRole('super_admin', 'content_admin'), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid', details: parsed.error.issues });
  const d = parsed.data;
  const { rows } = await pool.query(
    `insert into updates (category, title, short_description, content, attachments_json)
     values ($1,$2,$3,$4,$5) returning id`,
    [d.category, d.title, d.short_description || null, d.content || null,
     d.attachments_json ? JSON.stringify(d.attachments_json) : null]
  );
  res.status(201).json({ success: true, id: rows[0].id });
});

router.patch('/:id/publish', verifyToken, requireRole('super_admin', 'content_admin'), async (req, res) => {
  const { publish } = req.body; // true | false
  await pool.query(
    `update updates set is_published = $1, published_at = case when $1 then now() else published_at end where id = $2`,
    [!!publish, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', verifyToken, requireRole('super_admin', 'content_admin'), async (req, res) => {
  await pool.query(`delete from updates where id = $1`, [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
