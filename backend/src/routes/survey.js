const express = require('express');
const { z } = require('zod');
const { pool } = require('../db');

const router = express.Router();

const AnswerSchema = z.object({
  question_key: z.string().min(1).max(100),
  answer_text: z.string().max(5000).optional(),
  answer_json: z.any().optional(),
});

const SurveySchema = z.object({
  district_id: z.string().uuid().optional(),
  taluk_id: z.string().uuid().optional(),
  institution_id: z.string().uuid().optional(),
  teaching_experience_years: z.number().int().min(0).max(60).optional(),
  subject_area: z.string().max(200).optional(),
  language: z.enum(['en', 'kn', 'hi']).default('en'),
  answers: z.array(AnswerSchema).max(50),
  contact: z.object({
    name: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().email().max(200).optional(),
  }).optional(),
});

// PUBLIC: no auth required, but strictly validated server-side.
// Never returns internal analytics or other teachers' data — only a
// success acknowledgement, matching the "collect, don't display" principle.
router.post('/', async (req, res) => {
  const parsed = SurveySchema.safeParse(req.body);
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

    const resp = await client.query(
      `insert into survey_responses
       (district_id, taluk_id, institution_id, teaching_experience_years, subject_area, contact_id, language, submitted_at)
       values ($1,$2,$3,$4,$5,$6,$7, now())
       returning id`,
      [data.district_id || null, data.taluk_id || null, data.institution_id || null,
       data.teaching_experience_years || null, data.subject_area || null, contactId, data.language]
    );
    const responseId = resp.rows[0].id;

    for (const a of data.answers) {
      await client.query(
        `insert into survey_answers (response_id, question_key, answer_text, answer_json)
         values ($1,$2,$3,$4)`,
        [responseId, a.question_key, a.answer_text || null, a.answer_json ? JSON.stringify(a.answer_json) : null]
      );
    }

    await client.query('COMMIT');
    // Deliberately do NOT return counts, IDs, or any analytics to the client.
    res.status(201).json({ success: true, message: 'Thank you — your response has been recorded securely.' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  } finally {
    client.release();
  }
});

module.exports = router;
