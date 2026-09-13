const db = require('../config/db');

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const tokens = (value) => normalize(value).split(' ').filter((token) => token.length > 2);
const parseJson = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
};
const asArray = (value) => Array.isArray(value) ? value : [];
const skillName = (skill) => typeof skill === 'string' ? skill : skill?.skill_name || skill?.name || '';
const relatedSkill = (candidate, required) => candidate === required || candidate.split(' ').some((term) => term.length > 2 && required.includes(term));

function calculateMatch(job, profile) {
  const candidateSkills = new Set(profile.skills.map((skill) => normalize(skillName(skill))).filter(Boolean));
  const requiredSkills = job.requiredSkills.map((skill) => skill.name);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.has(normalize(skill)));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.has(normalize(skill)));
  const totalWeight = job.requiredSkills.reduce((sum, skill) => sum + Number(skill.weight || 1), 0);
  const matchedWeight = job.requiredSkills.filter((skill) => {
    const required = normalize(skill.name);
    return [...candidateSkills].some((candidate) => relatedSkill(candidate, required) || relatedSkill(required, candidate));
  }).reduce((sum, skill) => sum + Number(skill.weight || 1), 0);
  const skillScore = totalWeight ? matchedWeight / totalWeight : 0.45;

  const desiredTerms = new Set([
    ...tokens(profile.profile?.headline),
    ...tokens(profile.profile?.job_category),
    ...tokens(profile.profile?.education_level),
    ...tokens(profile.user?.bio),
    ...profile.experience.flatMap((item) => tokens(item.job_title)),
    ...tokens(profile.cv?.professional_title),
  ]);
  const titleTerms = tokens(job.title);
  const categoryTerms = tokens(job.category);
  const titleScore = titleTerms.length && [...desiredTerms].some((term) => titleTerms.includes(term) || categoryTerms.includes(term) || titleTerms.some((title) => title.includes(term))) ? 1 : 0.4;

  const preferredMode = normalize(profile.profile?.preferred_work_mode);
  const preferredCity = normalize(profile.profile?.city || profile.profile?.location);
  const modeMatches = preferredMode && normalize(job.work_mode) === preferredMode;
  const cityMatches = preferredCity && (normalize(job.city || job.location).includes(preferredCity) || normalize(job.location).includes(preferredCity));
  const locationScore = modeMatches ? (cityMatches ? 1 : 0.8) : (preferredMode === 'any' ? 0.75 : 0.3);
  const preferredJobType = normalize(profile.profile?.preferred_job_type || profile.profile?.job_type);
  const jobTypeScore = preferredJobType && normalize(job.job_type) === preferredJobType ? 1 : preferredJobType ? 0.3 : 0.6;
  const expectedMin = Number(profile.profile?.salary_expectation_min || profile.profile?.expected_salary || 0);
  const expectedMax = Number(profile.profile?.salary_expectation_max || profile.profile?.expectedSalaryMax || 0);
  const salaryMin = Number(job.salary_min || 0);
  const salaryMax = Number(job.salary_max || 0);
  const salaryScore = !expectedMin || (!salaryMin && !salaryMax) ? 0.6 : ((salaryMax >= expectedMin && (!expectedMax || !salaryMin || salaryMin <= expectedMax)) ? 1 : 0.15);
  const experienceTerms = tokens(profile.profile?.experience_level).concat(profile.experience.flatMap((item) => tokens(item.role || item.job_title)));
  const seniorityScore = experienceTerms.some((term) => tokens(job.experience_level).includes(term)) ? 1 : 0.55;
  const affinity = skillScore * 0.4 + titleScore * 0.2 + seniorityScore * 0.15 + locationScore * 0.15 + jobTypeScore * 0.05 + salaryScore * 0.05;
  const score = Math.round(68 + Math.max(0, Math.min(1, affinity)) * 27);

  return { matchScore: Math.max(0, Math.min(100, score)), matchedSkills, missingSkills, salaryScore, jobTypeScore };
}

async function getCandidateProfile(userId) {
  const [[user], [profile], [skills], [candidateProfiles], [cvRows]] = await Promise.all([
    db.execute('SELECT id, full_name, bio FROM users WHERE id = ? LIMIT 1', [userId]),
    db.execute('SELECT * FROM job_seeker_profiles WHERE user_id = ? LIMIT 1', [userId]),
    db.execute('SELECT skills FROM job_seeker_profiles WHERE user_id = ? LIMIT 1', [userId]),
    db.execute('SELECT parsed_json_payload FROM job_seeker_profiles WHERE user_id = ? LIMIT 1', [userId]),
    db.execute('SELECT ai_extracted_data FROM cvs WHERE user_id = ? AND is_active = TRUE ORDER BY is_primary DESC, upload_date DESC LIMIT 1', [userId]),
  ]);
  const cv = parseJson(cvRows[0]?.ai_extracted_data, {});
  const cvSkills = asArray(cv.skills || cv.extracted_skills).map(skillName).filter(Boolean);
  let experience = [];
  try {
    const payload = candidateProfiles[0]?.parsed_json_payload ? JSON.parse(candidateProfiles[0].parsed_json_payload) : {};
    experience = Array.isArray(payload.experience) ? payload.experience : [];
  } catch { experience = []; }
  let savedSkills = [];
  try { savedSkills = Array.isArray(skills[0]?.skills) ? skills[0].skills : JSON.parse(skills[0]?.skills || '[]'); } catch { savedSkills = []; }
  const normalizedSkills = savedSkills.map((skill) => typeof skill === 'string' ? { skill_name: skill } : skill);
  return { user: user || {}, profile: profile || {}, skills: [...normalizedSkills, ...cvSkills], experience, cv };
}

async function getMatchedJobs(req, res) {
  try {
    const profile = await getCandidateProfile(req.user.id);
    const [jobs] = await db.query(
      `SELECT j.*, COALESCE(cp.company_name, u.full_name, 'Company') AS company_name,
              sj.id AS saved_id, a.id AS application_id
       FROM jobs j
       JOIN users u ON u.id = j.employer_id
       LEFT JOIN company_profiles cp ON cp.employer_id = j.employer_id
       LEFT JOIN saved_jobs sj ON sj.job_id = j.id AND sj.user_id = ?
       LEFT JOIN applications a ON a.job_id = j.id AND a.job_seeker_id = ?
      WHERE LOWER(j.status) IN ('active', 'published')
       ORDER BY j.created_at DESC`,
      [req.user.id, req.user.id]
    );
    const jobIds = jobs.map((job) => job.id);
    const skillsByJob = new Map();
    if (jobIds.length) {
      const [requiredSkills] = await db.query('SELECT job_id, skill_name, skill_weight FROM job_required_skills WHERE job_id IN (?) ORDER BY id', [jobIds]);
      requiredSkills.forEach((skill) => {
        const skills = skillsByJob.get(skill.job_id) || [];
        skills.push({ name: skill.skill_name, weight: skill.skill_weight });
        skillsByJob.set(skill.job_id, skills);
      });
    }
    const matches = jobs.map((job) => {
      const enriched = { ...job, requiredSkills: skillsByJob.get(job.id) || [] };
      const result = calculateMatch(enriched, profile);
      return { ...job, ...result, requiredSkills: enriched.requiredSkills.map((skill) => skill.name), isSaved: Boolean(job.saved_id), isApplied: Boolean(job.application_id), workSetup: job.work_mode, salary: job.salary_min || job.salary_max ? `${job.currency || 'ETB'} ${job.salary_min || ''}${job.salary_min && job.salary_max ? ' - ' : ''}${job.salary_max || ''}` : 'Negotiable' };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    matches.forEach((job, index) => {
      job.rank = index + 1;
      job.rationale = index === 0
        ? "Why this is your top match: Out of all currently available roles, this opportunity exhibits the highest synergy with your core profile strengths and career trajectory."
        : index === 1
          ? 'Why it matches: High domain relevance with transferable qualifications matching your background.'
          : 'Why it matches: Promising career expansion role aligned with your baseline capabilities.';
    });
    return res.json({ success: true, jobs: matches });
  } catch (error) {
    console.error('Matched jobs query failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to calculate matched jobs.' });
  }
}

async function createApplication(req, res) {
  const { jobId, resumeSnapshot } = req.body || {};
  if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required.' });
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [[job]] = await connection.query("SELECT id FROM jobs WHERE id = ? AND LOWER(status) IN ('active', 'published') LIMIT 1", [jobId]);
    if (!job) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'This job is no longer available.' });
    }
    const [[existing]] = await connection.query('SELECT id FROM applications WHERE job_id = ? AND job_seeker_id = ? LIMIT 1', [jobId, req.user.id]);
    if (existing) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'You have already applied for this job.', applicationId: existing.id });
    }
    const [[cv]] = await connection.query('SELECT id, file_name, ai_extracted_data FROM cvs WHERE user_id = ? AND is_active = TRUE ORDER BY is_primary DESC, upload_date DESC LIMIT 1', [req.user.id]);
    const snapshot = resumeSnapshot || { cvId: cv?.id || null, fileName: cv?.file_name || null, extractedData: parseJson(cv?.ai_extracted_data, {}) };
    const [result] = await connection.query("INSERT INTO applications (job_id, job_seeker_id, cv_id, status, resume_snapshot, applied_at) VALUES (?, ?, ?, 'under-review', ?, NOW())", [jobId, req.user.id, cv?.id || null, JSON.stringify(snapshot)]);
    await connection.query('UPDATE jobs SET application_count = application_count + 1 WHERE id = ?', [jobId]);
    await connection.commit();
    return res.status(201).json({ success: true, application: { id: result.insertId, jobId: Number(jobId), candidateId: req.user.id, appliedAt: new Date().toISOString(), status: 'Under Review', resumeSnapshot: snapshot } });
  } catch (error) {
    await connection.rollback();
    console.error('Application creation failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to submit application.' });
  } finally { connection.release(); }
}

async function saveJob(req, res) {
  const { jobId } = req.body || {};
  if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required.' });
  try {
    const [result] = await db.query('INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [req.user.id, jobId]);
    return res.status(201).json({ success: true, saved: true, id: result.insertId || null });
  } catch (error) { return res.status(500).json({ success: false, message: 'Unable to save job.' }); }
}

async function unsaveJob(req, res) {
  try {
    await db.query('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [req.user.id, req.params.jobId]);
    return res.json({ success: true, saved: false });
  } catch (error) { return res.status(500).json({ success: false, message: 'Unable to remove saved job.' }); }
}

module.exports = { getMatchedJobs, createApplication, saveJob, unsaveJob };
