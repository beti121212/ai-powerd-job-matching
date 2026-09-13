const db = require('../config/db');

function calculateMatchScore(seekerSkills = [], requiredSkills = []) {
  const seeker = new Set(seekerSkills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean));
  const required = requiredSkills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean);
  if (required.length === 0) return 0;
  const matched = required.filter((skill) => seeker.has(skill)).length;
  return Math.round((matched / required.length) * 100);
}

async function createMatch({ jobId, jobSeekerId, score, coverLetter }) {
  const [result] = await db.execute(
    `INSERT INTO applications (job_id, job_seeker_id, ai_match_score, skills_match_score, seeker_cover_letter)
     VALUES (?, ?, ?, ?, ?)`,
    [jobId, jobSeekerId, score, score, coverLetter || null]
  );
  return result.insertId;
}

async function findMatchesForSeeker(jobSeekerId) {
  const [rows] = await db.execute(
    `SELECT a.id, a.job_id, a.ai_match_score, a.status, a.applied_at, j.title, j.location, j.work_mode
     FROM applications a JOIN jobs j ON j.id = a.job_id
     WHERE a.job_seeker_id = ? ORDER BY a.ai_match_score DESC, a.applied_at DESC`,
    [jobSeekerId]
  );
  return rows;
}

module.exports = { calculateMatchScore, createMatch, findMatchesForSeeker };
