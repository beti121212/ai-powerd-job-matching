const db = require('../config/db');

async function listJobs() {
  const [rows] = await db.execute(
    `SELECT id, employer_id, title, description, category, job_type, experience_level,
            location, work_mode, salary_min, salary_max, currency, status, application_deadline
    FROM jobs WHERE LOWER(status) IN ('active', 'published') ORDER BY created_at DESC`
  );
  return rows;
}

async function findJobById(id) {
  const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function createJob(job) {
  const [result] = await db.execute(
    `INSERT INTO jobs (employer_id, title, description, job_type, experience_level, location, work_mode, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
    [job.employerId, job.title, job.description, job.jobType, job.experienceLevel || 'mid-level', job.location || null, job.workMode || 'hybrid']
  );
  return findJobById(result.insertId);
}

module.exports = { listJobs, findJobById, createJob };
