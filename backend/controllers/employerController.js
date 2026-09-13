const db = require('../connection');

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
};

const normalizeJobPayload = (body = {}) => ({
  title: String(body.title || '').trim(),
  description: String(body.description || '').trim(),
  category: body.category || body.department || body.sector || 'General',
  job_type: body.job_type || body.jobType || 'full-time',
  experience_level: body.experience_level || 'mid-level',
  location: String(body.location || 'Addis Ababa').trim(),
  country: body.country || 'Ethiopia',
  city: body.city || null,
  work_mode: body.work_mode || body.workMode || 'hybrid',
  salary_min: body.salary_min === '' ? null : (body.salary_min ?? body.salaryMin ?? null),
  salary_max: body.salary_max === '' ? null : (body.salary_max ?? body.salaryMax ?? null),
  currency: body.currency || 'ETB',
  salary_period: body.salary_period || 'monthly',
  is_salary_negotiable: body.is_salary_negotiable !== false,
  benefits: body.benefits || null,
  required_education: body.required_education || 'bachelor',
  years_of_experience_min: body.years_of_experience_min ?? 0,
  years_of_experience_max: body.years_of_experience_max ?? 20,
  application_deadline: body.application_deadline || body.applicationDeadline || null,
  is_urgent: Boolean(body.is_urgent || body.isUrgent),
  required_skills: normalizeList(body.required_skills || body.requiredSkills).map((skill) => typeof skill === 'string' ? { skill_name: skill } : skill),
  required_languages: normalizeList(body.required_languages || body.requiredLanguages).map((language) => typeof language === 'string' ? { language_name: language } : language),
});

const getOwnedJob = async (connection, jobId, employerId) => {
  const [rows] = await connection.execute('SELECT * FROM jobs WHERE id = ? AND employer_id = ?', [jobId, employerId]);
  return rows[0] || null;
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM company_profiles WHERE employer_id = ?', [req.user.id]);
    const [employmentRows] = await db.execute('SELECT * FROM employers WHERE userId = ?', [req.user.id]);
    const profile = rows[0] || employmentRows[0] || null;
    if (profile && employmentRows[0]) {
      profile.verificationStatus = profile.verificationStatus || employmentRows[0].verificationStatus || 'pending';
    }
    return res.json({ success: true, profile: profile || null });
  } catch (error) {
    console.error('Get Company Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch company profile.' });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  const phoneDigits = String(req.body.phoneNumber || req.body.phone || '').replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '');
  if (phoneDigits && !/^[97]\d{8}$/.test(phoneDigits)) return res.status(422).json({ success: false, message: 'Phone number must be 9 digits and start with 9 or 7.' });
  const normalizedPhone = phoneDigits ? `+251${phoneDigits}` : null;
  const socialUrls = (req.body.social_media_urls && typeof req.body.social_media_urls === 'object') ? req.body.social_media_urls : {};
  const fields = [
    'company_name', 'representative_name', 'representative_title', 'work_email', 'phone',
    'company_registration_number', 'industry', 'company_size', 'website', 'logo_url',
    'description', 'company_summary', 'location', 'country', 'city', 'employee_count',
    'founded_year', 'social_media_urls', 'hiring_volume', 'linkedin'
  ];
  const values = fields.map((field) => {
    switch (field) {
      case 'company_name':
        return String(req.body.company_name || req.body.companyName || '').trim();
      case 'description':
        return req.body.description ?? req.body.company_summary ?? null;
      case 'company_summary':
        return req.body.company_summary ?? req.body.description ?? null;
      case 'social_media_urls':
        return JSON.stringify({
          ...socialUrls,
          ...(req.body.linkedin ? { linkedin: req.body.linkedin } : {}),
          ...(req.body.hiring_volume ? { hiring_volume: req.body.hiring_volume } : {}),
          ...(socialUrls.hiring_volume ? { hiring_volume: socialUrls.hiring_volume } : {}),
        });
      case 'hiring_volume':
        return req.body.hiring_volume ?? socialUrls.hiring_volume ?? null;
      case 'linkedin':
        return req.body.linkedin ?? socialUrls.linkedin ?? null;
      case 'phone':
        return req.body.phone ?? null;
      case 'company_registration_number':
        return req.body.company_registration_number ?? req.body.companyRegistrationNumber ?? null;
      default:
        return req.body[field] ?? null;
    }
  });

  if (!String(values[0] || '').trim()) return res.status(400).json({ success: false, message: 'Company name is required.' });

  try {
    await db.execute(
      `INSERT INTO company_profiles (employer_id, ${fields.join(', ')}, is_verified, verification_status)
       VALUES (?, ${fields.map(() => '?').join(', ')}, FALSE, 'pending')
       ON DUPLICATE KEY UPDATE ${fields.map((field) => `${field} = VALUES(${field})`).join(', ')}`,
      [req.user.id, ...values]
    );

    await db.execute(
      `INSERT INTO employers (userId, companyName, legalBusinessName, tinNumber, licenseDocumentUrl, logoUrl, website, industry, companySize, location, phoneNumber, phoneOperator, verificationStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE companyName = VALUES(companyName), legalBusinessName = VALUES(legalBusinessName), tinNumber = VALUES(tinNumber), licenseDocumentUrl = VALUES(licenseDocumentUrl), logoUrl = VALUES(logoUrl), website = VALUES(website), industry = VALUES(industry), companySize = VALUES(companySize), location = VALUES(location), phoneNumber = VALUES(phoneNumber), phoneOperator = VALUES(phoneOperator)`,
      [
        req.user.id,
        req.body.company_name || req.body.companyName || '',
        req.body.legalBusinessName || req.body.company_name || req.body.companyName || '',
        req.body.tinNumber || null,
        req.body.licenseDocumentUrl || null,
        req.body.logo_url || req.body.logoUrl || null,
        req.body.website || null,
        req.body.industry || null,
        req.body.company_size || req.body.companySize || '11-50',
        req.body.location || null,
        normalizedPhone,
        req.body.phoneOperator || null,
      ]
    );

    await db.execute("INSERT INTO user_activity_log (user_id, activity_type) VALUES (?, 'profile-update')", [req.user.id]).catch(() => {});
    const [rows] = await db.execute('SELECT * FROM company_profiles WHERE employer_id = ?', [req.user.id]);
    const [employerRows] = await db.execute('SELECT * FROM employers WHERE userId = ?', [req.user.id]);
    const profile = rows[0] || employerRows[0] || {};
    return res.json({ success: true, profile: { ...profile, verification_status: profile.verification_status || employerRows[0]?.verificationStatus || 'pending' }, message: 'Company profile saved.' });
  } catch (error) {
    console.error('Update Company Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save company profile.' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [jobStats] = await db.execute(`SELECT COUNT(*) total_jobs, SUM(status = 'published') active_jobs, SUM(view_count) total_views, SUM(application_count) total_applications FROM jobs WHERE employer_id = ?`, [req.user.id]);
    const [appStats] = await db.execute(`SELECT COUNT(a.id) total_candidates, SUM(a.status = 'applied') new_applied, SUM(a.status = 'under-review') under_review, SUM(a.status = 'shortlisted') shortlisted, SUM(a.status = 'interview-scheduled') interview_scheduled, SUM(a.status = 'hired') hired, AVG(a.ai_match_score) avg_match_score FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.employer_id = ?`, [req.user.id]);
    return res.json({ success: true, stats: { ...jobStats[0], ...appStats[0] } });
  } catch (error) {
    console.error('Employer Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const [jobStats] = await db.execute(
      `SELECT COUNT(*) AS totalJobs, SUM(CASE WHEN status IN ('published', 'active') THEN 1 ELSE 0 END) AS activeJobs, SUM(view_count) AS totalViews FROM jobs WHERE employer_id = ?`,
      [req.user.id]
    );
    const [appStats] = await db.execute(
      `SELECT COUNT(*) AS totalApplicants, SUM(CASE WHEN status IN ('applied', 'new') THEN 1 ELSE 0 END) AS newApplicants, SUM(CASE WHEN status IN ('shortlisted', 'interview', 'interview-scheduled') THEN 1 ELSE 0 END) AS shortlistedOrInterviewing, AVG(COALESCE(ai_match_score, 0)) AS avgAiMatch FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.employer_id = ?`,
      [req.user.id]
    );
    const [recentApplications] = await db.execute(
      `SELECT a.id, a.status, a.ai_match_score AS aiMatchScore, a.applied_at AS appliedAt, u.full_name AS candidateName, u.email AS candidateEmail, j.title AS jobTitle FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.job_seeker_id WHERE j.employer_id = ? ORDER BY a.applied_at DESC LIMIT 8`,
      [req.user.id]
    );
    const [profileRows] = await db.execute('SELECT * FROM company_profiles WHERE employer_id = ?', [req.user.id]);
    const [settingsRows] = await db.execute('SELECT * FROM employer_settings WHERE userId = ?', [req.user.id]);

    const stats = {
      activeJobs: Number(jobStats[0]?.activeJobs || 0),
      totalJobs: Number(jobStats[0]?.totalJobs || 0),
      totalApplicants: Number(appStats[0]?.totalApplicants || 0),
      newApplicants: Number(appStats[0]?.newApplicants || 0),
      shortlistedOrInterviewing: Number(appStats[0]?.shortlistedOrInterviewing || 0),
      avgAiMatch: Number(appStats[0]?.avgAiMatch || 0),
    };

    return res.json({
      success: true,
      stats,
      profile: profileRows[0] || null,
      settings: settingsRows[0] || null,
      recentApplications,
    });
  } catch (error) {
    console.error('Employer Dashboard Overview Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard overview.' });
  }
};

exports.getEmployerApplications = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.job_id AS jobId, a.status, a.ai_match_score AS aiMatchScore, a.applied_at AS appliedAt, u.full_name AS candidateName, u.email AS candidateEmail, j.title AS jobTitle FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.job_seeker_id WHERE j.employer_id = ? ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, applications: rows });
  } catch (error) {
    console.error('Employer Applications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
  }
};

exports.createJob = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const job = normalizeJobPayload(req.body);
    if (!job.title || !job.description || !job.application_deadline) return res.status(400).json({ success: false, message: 'Title, description, and application deadline are required.' });
    await connection.beginTransaction();
    const slug = `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    const [result] = await connection.execute(`INSERT INTO jobs (employer_id, title, slug, description, category, job_type, experience_level, location, country, city, work_mode, salary_min, salary_max, currency, salary_period, is_salary_negotiable, benefits, required_education, years_of_experience_min, years_of_experience_max, application_deadline, is_urgent, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL)`, [req.user.id, job.title, slug, job.description, job.category, job.job_type, job.experience_level, job.location, job.country, job.city, job.work_mode, job.salary_min, job.salary_max, job.currency, job.salary_period, job.is_salary_negotiable, job.benefits, job.required_education, job.years_of_experience_min, job.years_of_experience_max, job.application_deadline, job.is_urgent]);
    const jobId = result.insertId;
    for (const skill of job.required_skills) if (skill.skill_name) await connection.execute('INSERT INTO job_required_skills (job_id, skill_name, proficiency_level, is_must_have) VALUES (?, ?, ?, ?)', [jobId, String(skill.skill_name).trim(), skill.proficiency_level || 'intermediate', Boolean(skill.is_must_have)]);
    for (const language of job.required_languages) if (language.language_name) await connection.execute('INSERT INTO job_required_languages (job_id, language_name, proficiency, is_must_have) VALUES (?, ?, ?, ?)', [jobId, String(language.language_name).trim(), language.proficiency || 'professional-working', Boolean(language.is_must_have)]);
    await connection.execute('INSERT INTO job_analytics (job_id) VALUES (?)', [jobId]);
    await connection.commit();
    const [rows] = await connection.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    return res.status(201).json({ success: true, ...rows[0], jobId, id: jobId, slug });
  } catch (error) {
    await connection.rollback();
    console.error('Create Employer Job Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save job.' });
  } finally { connection.release(); }
};

exports.getEmployerJobs = async (req, res) => {
  try {
    const [jobs] = await db.execute(`SELECT j.*, COUNT(a.id) applicantsCount, SUM(a.status = 'shortlisted') shortlisted FROM jobs j LEFT JOIN applications a ON a.job_id = j.id WHERE j.employer_id = ? GROUP BY j.id ORDER BY j.created_at DESC`, [req.user.id]);
    return res.json({ success: true, jobs });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve jobs.' }); }
};

exports.updateJob = async (req, res) => {
  const job = normalizeJobPayload(req.body);
  try {
    const [result] = await db.execute(`UPDATE jobs SET title = ?, description = ?, category = ?, job_type = ?, experience_level = ?, location = ?, work_mode = ?, salary_min = ?, salary_max = ?, currency = ?, application_deadline = ? WHERE id = ? AND employer_id = ?`, [job.title, job.description, job.category, job.job_type, job.experience_level, job.location, job.work_mode, job.salary_min, job.salary_max, job.currency, job.application_deadline, req.params.jobId, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Job not found.' });
    const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [req.params.jobId]);
    return res.json({ success: true, ...rows[0] });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to update job.' }); }
};

exports.setJobStatus = async (req, res) => {
  const status = req.body.status === 'paused' ? 'closed' : (req.body.status || 'published');
  try {
    const [result] = await db.execute("UPDATE jobs SET status = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END, closed_at = CASE WHEN ? = 'closed' THEN NOW() ELSE closed_at END WHERE id = ? AND employer_id = ?", [status, status, status, req.params.jobId, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Job not found.' });
    return res.json({ success: true, status });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to update job status.' }); }
};

exports.deleteJob = async (req, res) => {
  try { const [result] = await db.execute('DELETE FROM jobs WHERE id = ? AND employer_id = ?', [req.params.jobId, req.user.id]); return result.affectedRows ? res.json({ success: true }) : res.status(404).json({ success: false, message: 'Job not found.' }); }
  catch (error) { return res.status(500).json({ success: false, message: 'Failed to delete job.' }); }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const [job] = await db.execute('SELECT id, title, status FROM jobs WHERE id = ? AND employer_id = ?', [req.params.jobId, req.user.id]);
    if (!job.length) return res.status(404).json({ success: false, message: 'Job not found.' });
    const [applicants] = await db.execute(`SELECT a.id application_id, a.job_id, a.job_seeker_id, a.status, a.ai_match_score, a.skills_match_score, a.experience_match_score, a.seeker_cover_letter, a.applied_at, u.full_name, u.email, u.avatar_url, jsp.headline, c.id cv_id, c.file_name, c.file_url, i.id interview_id, i.scheduled_at interview_scheduled_at, i.interview_status, i.interview_type, i.interview_url FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.job_seeker_id LEFT JOIN job_seeker_profiles jsp ON jsp.user_id = u.id LEFT JOIN cvs c ON c.id = a.cv_id LEFT JOIN interviews i ON i.application_id = a.id WHERE a.job_id = ? ORDER BY a.ai_match_score DESC, a.applied_at DESC`, [req.params.jobId]);
    return res.json({ success: true, job: job[0], applicants });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve applicants.' }); }
};

exports.getTopCandidates = async (req, res) => {
  try {
    const [candidates] = await db.execute(`SELECT a.id applicationId, a.job_seeker_id candidateId, u.full_name name, u.email, COALESCE(a.ai_match_score, 0) matchScore, jsp.headline currentTitle, c.file_name cvFileName, a.status FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.job_seeker_id LEFT JOIN job_seeker_profiles jsp ON jsp.user_id = u.id LEFT JOIN cvs c ON c.id = a.cv_id AND c.is_primary = TRUE WHERE a.job_id = ? AND j.employer_id = ? ORDER BY a.ai_match_score DESC, a.applied_at DESC LIMIT ?`, [req.params.jobId, req.user.id, Math.min(Number(req.query.limit) || 5, 50)]);
    return res.json({ success: true, candidates });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve matched candidates.' }); }
};

exports.getTalentPool = async (req, res) => {
  try {
    const [savedCandidates] = await db.execute(
      `SELECT tp.id, tp.candidateId AS id, u.full_name AS fullName, u.email, u.phone, jsp.headline AS preferredDepartment, jsp.preferred_job_type AS preferredJobType, tp.aiMatchScore, tp.skills, tp.notes, tp.savedAt, c.file_name AS cvFileName FROM talent_pool tp JOIN users u ON u.id = tp.candidateId LEFT JOIN job_seeker_profiles jsp ON jsp.user_id = u.id LEFT JOIN cvs c ON c.user_id = u.id AND c.is_primary = TRUE WHERE tp.employerId = ? ORDER BY tp.savedAt DESC`,
      [req.user.id]
    );

    if (savedCandidates.length) {
      return res.json({ success: true, candidates: savedCandidates.map((candidate) => ({
        ...candidate,
        keySkills: candidate.skills ? JSON.parse(candidate.skills) : [],
        experience: 'Experience TBD',
        aiMatchScore: Number(candidate.aiMatchScore || 0),
      })) });
    }

    const [candidates] = await db.execute(`SELECT DISTINCT u.id, u.full_name fullName, u.email, u.phone, jsp.headline preferredDepartment, jsp.preferred_job_type preferredJobType, c.file_name cvFileName, jsp.profile_completion_percentage FROM users u JOIN job_seeker_profiles jsp ON jsp.user_id = u.id LEFT JOIN cvs c ON c.user_id = u.id AND c.is_primary = TRUE WHERE u.role = 'job_seeker' ORDER BY jsp.profile_completion_percentage DESC, u.created_at DESC`);
    return res.json({ success: true, candidates: candidates.map((candidate) => ({ ...candidate, keySkills: [], experience: 'Experience TBD', aiMatchScore: 0 })) });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve talent pool.' }); }
};

exports.saveTalentPoolCandidate = async (req, res) => {
  try {
    const candidate = req.body || {};
    const candidateId = Number(candidate.candidateId || candidate.id);
    const candidateName = candidate.candidateName || candidate.fullName || candidate.name || 'Candidate';
    const skills = Array.isArray(candidate.skills) ? candidate.skills : normalizeList(candidate.keySkills || candidate.skills || '');
    const payload = {
      employerId: req.user.id,
      candidateId,
      candidateName,
      primaryRole: candidate.primaryRole || candidate.preferredDepartment || 'General',
      skills: JSON.stringify(skills),
      aiMatchScore: Number(candidate.aiMatchScore ?? candidate.matchScore ?? 0),
      notes: candidate.notes || '',
    };

    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate is required.' });
    }

    await db.execute(
      `INSERT INTO talent_pool (employerId, candidateId, candidateName, primaryRole, skills, aiMatchScore, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE candidateName = VALUES(candidateName), primaryRole = VALUES(primaryRole), skills = VALUES(skills), aiMatchScore = VALUES(aiMatchScore), notes = VALUES(notes)`,
      [payload.employerId, payload.candidateId, payload.candidateName, payload.primaryRole, payload.skills, payload.aiMatchScore, payload.notes]
    );

    return res.json({ success: true, message: 'Candidate saved to talent pool.' });
  } catch (error) {
    console.error('Save Talent Pool Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save talent pool candidate.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const valid = ['applied', 'under-review', 'shortlisted', 'rejected', 'interview-scheduled', 'offered', 'hired', 'withdrawn'];
  if (!valid.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid status.' });
  try {
    const [result] = await db.execute('UPDATE applications a JOIN jobs j ON j.id = a.job_id SET a.status = ?, a.employer_notes = COALESCE(?, a.employer_notes) WHERE a.id = ? AND j.employer_id = ?', [req.body.status, req.body.employer_notes || null, req.params.applicationId, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Application not found.' });
    return res.json({ success: true, status: req.body.status });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to update application.' }); }
};

exports.getEmployerPipeline = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT a.id, a.job_id AS jobId, a.job_seeker_id AS candidateId, a.status, a.ai_match_score AS aiScore, a.applied_at AS appliedAt,
              u.full_name AS name, u.email, u.phone,
              j.title AS jobTitle,
              c.file_url AS resumeUrl,
              a.seeker_cover_letter AS coverLetter
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = a.job_seeker_id
       LEFT JOIN cvs c ON c.user_id = u.id AND c.is_primary = TRUE
       WHERE j.employer_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    const pipeline = await Promise.all(rows.map(async (row) => {
      const [matchedSkillsRaw] = await db.execute('SELECT skills FROM job_seeker_profiles WHERE user_id = ? LIMIT 1', [row.candidateId]);
      const [requiredSkillsRaw] = await db.execute('SELECT skill_name FROM job_required_skills WHERE job_id = ? ORDER BY skill_name ASC', [row.jobId]);
      let savedSkills = [];
      try { savedSkills = Array.isArray(matchedSkillsRaw[0]?.skills) ? matchedSkillsRaw[0].skills : JSON.parse(matchedSkillsRaw[0]?.skills || '[]'); } catch { savedSkills = []; }
      const matched = [...new Set(savedSkills.map((item) => typeof item === 'string' ? item : item?.skill_name || item?.name).filter(Boolean))].filter((skill) => requiredSkillsRaw.some((required) => required.skill_name === skill));
      const missing = [...new Set(requiredSkillsRaw.map((item) => item.skill_name))].filter((skill) => !matched.includes(skill));
      return {
        ...row,
        aiMatchScore: Number(row.aiScore || 0),
        matchScore: Number(row.aiScore || 0),
        appliedAt: row.appliedAt || new Date().toISOString(),
        matchedSkills: matched,
        missingSkills: missing,
        status: row.status || 'applied',
      };
    }));

    return res.json({ success: true, applications: pipeline });
  } catch (error) {
    console.error('Employer Pipeline Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pipeline data.' });
  }
};

exports.getJobInvitations = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ji.*, u.full_name AS candidateName, j.title AS jobTitle
       FROM job_invitations ji
       JOIN users u ON u.id = ji.candidateId
       JOIN jobs j ON j.id = ji.jobId
       WHERE ji.employerId = ?
       ORDER BY ji.sentAt DESC`,
      [req.user.id]
    );
    return res.json({ success: true, invitations: rows });
  } catch (error) {
    console.error('Get Job Invitations Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch job invitations.' });
  }
};

exports.createJobInvitation = async (req, res) => {
  try {
    const payload = req.body || {};
    const candidateId = Number(payload.candidateId || payload.candidate_id || payload.userId);
    const jobId = Number(payload.jobId || payload.job_id);
    const message = String(payload.message || '').trim();

    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate and job are required.' });
    }

    const [job] = await db.execute('SELECT id FROM jobs WHERE id = ? AND employer_id = ?', [jobId, req.user.id]);
    if (!job.length) {
      return res.status(404).json({ success: false, message: 'Published job not found.' });
    }

    const [result] = await db.execute(
      `INSERT INTO job_invitations (employerId, candidateId, jobId, message, status, sentAt)
       VALUES (?, ?, ?, ?, 'invited', NOW())
       ON DUPLICATE KEY UPDATE message = VALUES(message), status = 'invited', sentAt = NOW()`,
      [req.user.id, candidateId, jobId, message || 'You have been invited to apply for a new role.']
    );

    return res.status(201).json({ success: true, id: result.insertId || jobId, message: 'Invitation sent successfully.' });
  } catch (error) {
    console.error('Create Job Invitation Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send invitation.' });
  }
};

exports.getEmployerOffers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT o.*, a.id AS applicationId, u.full_name AS candidateName, j.title AS jobTitle
       FROM offers o
       JOIN applications a ON a.id = o.applicationId
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = a.job_seeker_id
       WHERE o.employerId = ?
       ORDER BY o.sentAt DESC`,
      [req.user.id]
    );
    return res.json({ success: true, offers: rows });
  } catch (error) {
    console.error('Employer Offers Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load offers.' });
  }
};

exports.createEmployerOffer = async (req, res) => {
  try {
    const payload = req.body || {};
    const applicationId = Number(payload.applicationId || payload.id);
    if (!applicationId) return res.status(400).json({ success: false, message: 'Application is required.' });

    const [owned] = await db.execute(
      'SELECT a.id FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ? AND j.employer_id = ?',
      [applicationId, req.user.id]
    );
    if (!owned.length) return res.status(404).json({ success: false, message: 'Application not found.' });

    const [result] = await db.execute(
      `INSERT INTO offers (applicationId, employerId, candidateId, offeredSalary, startDate, offerLetterUrl, status, sentAt)
       VALUES (?, ?, ?, ?, ?, ?, 'sent', NOW())
       ON DUPLICATE KEY UPDATE offeredSalary = VALUES(offeredSalary), startDate = VALUES(startDate), offerLetterUrl = VALUES(offerLetterUrl), status = VALUES(status), sentAt = NOW()`,
      [
        applicationId,
        req.user.id,
        payload.candidateId || payload.candidate_id || null,
        payload.offeredSalary || payload.salary || null,
        payload.startDate || payload.start_date || null,
        payload.offerLetterUrl || payload.offerLetter || null,
      ]
    );

    await db.execute("UPDATE applications SET status = 'offered' WHERE id = ?", [applicationId]);
    return res.status(201).json({ success: true, id: result.insertId || applicationId, offer: payload });
  } catch (error) {
    console.error('Create Employer Offer Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create offer.' });
  }
};

exports.getEmployerOnboarding = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ot.*, u.full_name AS candidateName, j.title AS jobTitle,
              (SELECT COUNT(*) FROM onboarding_tasks ot2 WHERE ot2.candidateId = ot.candidateId AND ot2.employerId = ? AND ot2.isCompleted = TRUE) AS completedCount
       FROM onboarding_tasks ot
       JOIN users u ON u.id = ot.candidateId
       JOIN applications a ON a.job_seeker_id = ot.candidateId
       JOIN jobs j ON j.id = a.job_id
       WHERE ot.employerId = ?
       GROUP BY ot.id
       ORDER BY ot.updatedAt DESC`,
      [req.user.id, req.user.id]
    );
    return res.json({ success: true, onboarding: rows });
  } catch (error) {
    console.error('Employer Onboarding Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load onboarding tasks.' });
  }
};

exports.updateEmployerOnboardingTask = async (req, res) => {
  try {
    const payload = req.body || {};
    const taskId = Number(req.params.taskId);
    if (!taskId) return res.status(400).json({ success: false, message: 'Task is required.' });

    await db.execute(
      `UPDATE onboarding_tasks SET isCompleted = ?, documentUrl = ?, updatedAt = NOW() WHERE id = ? AND employerId = ?`,
      [payload.isCompleted !== undefined ? Boolean(payload.isCompleted) : true, payload.documentUrl || null, taskId, req.user.id]
    );

    return res.json({ success: true, message: 'Task updated.' });
  } catch (error) {
    console.error('Update Employer Onboarding Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update onboarding task.' });
  }
};

exports.finalizeEmployerEmployee = async (req, res) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const [application] = await db.execute(
      'SELECT a.id, a.job_seeker_id AS candidateId FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ? AND j.employer_id = ?',
      [applicationId, req.user.id]
    );
    if (!application.length) return res.status(404).json({ success: false, message: 'Application not found.' });

    await db.execute('UPDATE applications SET status = ' + "'hired'" + ' WHERE id = ?', [applicationId]);
    await db.execute(
      `INSERT INTO onboarding_tasks (candidateId, employerId, taskTitle, isCompleted, documentUrl, updatedAt)
       VALUES (?, ?, 'Onboarding Finalized', TRUE, NULL, NOW())
       ON DUPLICATE KEY UPDATE isCompleted = TRUE, updatedAt = NOW()`,
      [application[0].candidateId, req.user.id]
    );

    return res.json({ success: true, message: 'Candidate finalized as active employee.' });
  } catch (error) {
    console.error('Finalize Employer Employee Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to finalize candidate.' });
  }
};

exports.scheduleInterview = async (req, res) => {
  const { applicationId, application_id, scheduledDate, scheduledTime, scheduled_at, interviewType, interview_type, meetingLink, interview_url, duration_minutes, notes } = req.body;
  const targetApplication = applicationId || application_id;
  const scheduledAt = scheduled_at || `${scheduledDate}T${scheduledTime}`;
  if (!targetApplication || !scheduledAt) return res.status(400).json({ success: false, message: 'Application and schedule are required.' });
  try {
    const [owned] = await db.execute('SELECT a.id FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = ? AND j.employer_id = ?', [targetApplication, req.user.id]);
    if (!owned.length) return res.status(404).json({ success: false, message: 'Application not found.' });
    await db.execute(`INSERT INTO interviews (application_id, interview_type, scheduled_at, duration_minutes, interview_url, interview_status, interviewer_id, notes) VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?) ON DUPLICATE KEY UPDATE interview_type = VALUES(interview_type), scheduled_at = VALUES(scheduled_at), duration_minutes = VALUES(duration_minutes), interview_url = VALUES(interview_url), interview_status = 'scheduled', notes = VALUES(notes)`, [targetApplication, interview_type || interviewType || 'video', scheduledAt, duration_minutes || 60, interview_url || meetingLink || null, req.user.id, notes || null]);
    await db.execute("UPDATE applications SET status = 'interview-scheduled' WHERE id = ?", [targetApplication]);
    return res.json({ success: true, message: 'Interview scheduled.' });
  } catch (error) { return res.status(500).json({ success: false, message: 'Failed to schedule interview.' }); }
};

exports.getUpcomingInterviews = async (req, res) => {
  try { const [interviews] = await db.execute(`SELECT i.*, u.full_name candidate_name, u.email candidate_email, j.title job_title FROM interviews i JOIN applications a ON a.id = i.application_id JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.job_seeker_id WHERE j.employer_id = ? ORDER BY i.scheduled_at ASC`, [req.user.id]); return res.json({ success: true, interviews }); }
  catch (error) { return res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' }); }
};

exports.getEmployerMessages = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT em.id, em.subject, em.body, em.isRead, em.createdAt, u.full_name AS fromName, u.email AS fromEmail FROM employer_messages em JOIN users u ON u.id = em.candidateId WHERE em.employerId = ? ORDER BY em.createdAt DESC`,
      [req.user.id]
    );
    return res.json({ success: true, messages: rows });
  } catch (error) {
    console.error('Employer Messages Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
};

exports.sendEmployerMessage = async (req, res) => {
  try {
    const payload = req.body || {};
    const candidateId = Number(payload.candidateId || payload.recipientId || payload.id);
    const body = String(payload.body || payload.message || '').trim();
    const subject = String(payload.subject || 'Message from employer').trim();
    if (!candidateId || !body) {
      return res.status(400).json({ success: false, message: 'Candidate and message content are required.' });
    }
    const [result] = await db.execute('INSERT INTO employer_messages (employerId, candidateId, subject, body, isRead) VALUES (?, ?, ?, ?, FALSE)', [req.user.id, candidateId, subject, body]);
    await db.execute('INSERT INTO employer_notifications (employerId, title, body, related_application_id) VALUES (?, ?, ?, NULL)', ['New message', 'You sent a message to a candidate', null]);
    return res.status(201).json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Send Employer Message Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

exports.getEmployerNotifications = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM employer_notifications WHERE employerId = ? ORDER BY createdAt DESC', [req.user.id]);
    return res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Employer Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load notifications.' });
  }
};

exports.markEmployerNotificationRead = async (req, res) => {
  try {
    const [result] = await db.execute('UPDATE employer_notifications SET isRead = TRUE WHERE id = ? AND employerId = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Notification not found.' });
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark Employer Notification Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

exports.getEmployerSettings = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM employer_settings WHERE userId = ?', [req.user.id]);
    return res.json({ success: true, settings: rows[0] || { userId: req.user.id, emailAlerts: true, matchingAlerts: true, weeklyDigest: false } });
  } catch (error) {
    console.error('Employer Settings Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

exports.updateEmployerSettings = async (req, res) => {
  try {
    const settings = req.body || {};
    await db.execute(
      `INSERT INTO employer_settings (userId, emailAlerts, matchingAlerts, weeklyDigest, notificationEmail, teamPermissions)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE emailAlerts = VALUES(emailAlerts), matchingAlerts = VALUES(matchingAlerts), weeklyDigest = VALUES(weeklyDigest), notificationEmail = VALUES(notificationEmail), teamPermissions = VALUES(teamPermissions)`,
      [
        req.user.id,
        settings.emailAlerts !== undefined ? Boolean(settings.emailAlerts) : true,
        settings.matchingAlerts !== undefined ? Boolean(settings.matchingAlerts) : true,
        settings.weeklyDigest !== undefined ? Boolean(settings.weeklyDigest) : false,
        settings.notificationEmail || null,
        settings.teamPermissions ? JSON.stringify(settings.teamPermissions) : JSON.stringify({ canManageJobs: true, canReviewApplications: true, canMessageCandidates: true })
      ]
    );
    return res.json({ success: true, settings: { ...settings, userId: req.user.id } });
  } catch (error) {
    console.error('Employer Settings Update Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
};
