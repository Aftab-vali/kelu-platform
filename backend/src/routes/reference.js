const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// All public, read-only, non-sensitive lookup data — safe with no auth.
router.get('/districts', async (req, res) => {
  const { rows } = await pool.query(`select id, name from districts order by name`);
  res.json({ districts: rows });
});

router.get('/taluks', async (req, res) => {
  const { district_id } = req.query;
  const { rows } = await pool.query(
    district_id
      ? `select id, name, district_id from taluks where district_id = $1 order by name`
      : `select id, name, district_id from taluks order by name`,
    district_id ? [district_id] : []
  );
  res.json({ taluks: rows });
});

router.get('/institutions', async (req, res) => {
  const { rows } = await pool.query(`select id, category, level from institutions order by category, level`);
  res.json({ institutions: rows });
});

router.get('/issue-categories', async (req, res) => {
  const { rows } = await pool.query(`select id, name from issue_categories order by sort_order, name`);
  res.json({ categories: rows });
});

module.exports = router;
