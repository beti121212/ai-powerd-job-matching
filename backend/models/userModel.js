const db = require('../config/db');

async function findByEmail(email) {
  const [rows] = await db.execute(
    `SELECT id, full_name, email, password, role, is_verified,
            EXISTS (
              SELECT 1 FROM cvs
              WHERE cvs.user_id = users.id AND cvs.is_active = TRUE
            ) AS has_cv
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  if (!rows[0]) return null;
  return {
    ...rows[0],
    has_cv: Boolean(rows[0].has_cv),
    onboarding_step: rows[0].role === 'job_seeker' && !rows[0].has_cv ? 'cv_upload' : null,
  };
}

async function createUser({ fullName, email, password, role = 'job_seeker' }) {
  const [result] = await db.execute(
    'INSERT INTO users (full_name, email, password, role, is_verified) VALUES (?, ?, ?, ?, TRUE)',
    [fullName, email, password, role]
  );
  return { id: result.insertId, fullName, email, role };
}

module.exports = { findByEmail, createUser };
