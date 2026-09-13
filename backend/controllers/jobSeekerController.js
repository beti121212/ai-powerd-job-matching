const seekerModel = require('../models/jobSeekerModel');
const db = require('../config/db');

const collections = {
  skills: { key: 'skills' },
  languages: { key: 'languages' }
};

async function getProfile(req, res) {
  try {
    const userId = await resolveAuthenticatedUserId(req);
    return res.json({ success: true, ...(await seekerModel.getProfile(userId)) });
  }
  catch (error) { return res.status(500).json({ success: false, message: 'Unable to load job seeker profile.' }); }
}

async function resolveAuthenticatedUserId(req) {
  const claimedId = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.sub || req.body?.userId || req.body?.user_id;
  if (claimedId) {
    const [rows] = await db.execute('SELECT id FROM users WHERE id = ? LIMIT 1', [claimedId]);
    if (rows[0]) return rows[0].id;
  }
  const emails = [req.user?.email, req.body?.email, req.body?.fullEmail]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
  for (const email of [...new Set(emails)]) {
    const [rows] = await db.execute('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [email]);
    if (rows[0]) return rows[0].id;
  }
  const error = new Error('Authenticated user was not found in the users table.');
  error.code = 'AUTH_USER_NOT_FOUND';
  throw error;
}

const textValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return '';
  return String(value).trim();
};

const firstText = (...values) => values.map(textValue).find(Boolean) || '';
const waitForDatabaseWrite = () => new Promise((resolve) => setTimeout(resolve, 400));
const calculateProfileCompletion = (profile) => {
  const fields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.city,
    profile.desiredPosition,
    profile.jobCategory,
    profile.experienceLevel,
    profile.workSetup,
    profile.jobType,
    profile.educationLevel,
    profile.expectedSalary && profile.expectedSalaryMax,
    profile.education.length > 0,
    profile.experience.length > 0,
    profile.skills.length > 0,
    profile.languages.length > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

function normalizeProfile(payload = {}) {
  const personal = payload.personal_info || {};
  const fullName = firstText(payload.fullName, payload.full_name, personal.fullName, personal.full_name);
  const location = firstText(payload.location, personal.location, payload.city, personal.city);
  const city = firstText(payload.city, personal.city, location.split(',')[0]);
  const rawSalary = firstText(payload.expectedSalary, payload.salaryExpectation, personal.expectedSalary);
  const rawMaximumSalary = firstText(payload.expectedSalaryMax, payload.salaryExpectationMax, personal.expectedSalaryMax);
  const numericSalary = Number(String(rawSalary).replace(/[^0-9.-]/g, ''));
  const numericMaximumSalary = Number(String(rawMaximumSalary).replace(/[^0-9.-]/g, ''));
  const skills = (Array.isArray(payload.skills) ? payload.skills : payload.skills ? [payload.skills] : [])
    .map((skill) => typeof skill === 'string' ? skill : skill?.skill_name || skill?.name)
    .map(textValue).filter(Boolean);
  const education = Array.isArray(payload.education) ? payload.education : textValue(payload.education) ? [{ school_name: 'Not specified', degree: textValue(payload.education), field_of_study: 'General', graduationYear: payload.graduationYear }] : [];
  const experience = Array.isArray(payload.experience) ? payload.experience : textValue(payload.experience) ? [{ company: 'Professional experience', role: textValue(payload.experience), description: textValue(payload.experienceDetail) }] : [];
  const languages = Array.isArray(payload.languages) ? payload.languages : payload.languages ? [payload.languages] : [];
  const experienceRole = firstText(payload.experienceRole, payload.experience_role);
  if (!experience.length && (experienceRole || payload.experienceDetail)) {
    experience.push({ role: experienceRole || 'Experience', description: textValue(payload.experienceDetail), company: 'Professional experience' });
  }
  const normalizedProfile = {
    fullName,
    email: firstText(payload.email, personal.email).toLowerCase(),
    phone: firstText(payload.phone, personal.phone).replace(/[\s()-]/g, ''),
    location,
    city,
    headline: firstText(payload.headline, personal.headline, payload.desiredPosition, payload.jobPreference),
    desiredPosition: firstText(payload.desiredPosition, payload.preferredJob, payload.jobPreference, payload.headline),
    jobPreference: firstText(payload.jobPreference, payload.preferredJob, payload.desiredPosition),
    jobCategory: firstText(payload.jobCategory, payload.jobPreference),
    experienceLevel: firstText(payload.experienceLevel),
    jobType: firstText(payload.jobType, payload.employmentType, personal.jobType, personal.employmentType),
    educationLevel: firstText(payload.educationLevel, payload.education_level, personal.educationLevel, personal.education_level),
    workSetup: firstText(payload.workSetup, payload.preferredWorkSetup, personal.workSetup),
    expectedSalary: Number.isFinite(numericSalary) && numericSalary > 0 ? Math.round(numericSalary) : null,
    expectedSalaryMax: Number.isFinite(numericMaximumSalary) && numericMaximumSalary > 0 ? Math.round(numericMaximumSalary) : null,
    bio: textValue(payload.bio || personal.bio).slice(0, 500),
    skills,
    education,
    experience,
    languages,
    graduationYear: firstText(payload.graduationYear),
  };
  normalizedProfile.completionPercentage = calculateProfileCompletion(normalizedProfile);
  return normalizedProfile;
}

function validateProfile(payload = {}) {
  return { errors: {}, value: normalizeProfile(payload) };
}

async function updateProfile(req, res) {
  const { errors, value } = validateProfile(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ success: false, errors });
  try {
    const userId = await resolveAuthenticatedUserId(req);
    const profile = await seekerModel.upsertProfile(userId, value);
    await waitForDatabaseWrite();
    return res.json({ success: true, message: 'Profile saved successfully!', data: profile, profile, profileCompleted: true });
  } catch (error) {
    console.error('❌ SQL EXECUTION FAILED:');
    console.error('SQL Code:', error.code);
    console.error('SQL Message:', error.sqlMessage || error.message);
    console.error('Executed SQL Query:', error.sql || '[mysql2 did not expose the query text]');
    return res.status(500).json({ success: false, message: 'Unable to update job seeker profile.', error: error.sqlMessage || error.message, code: error.code });
  }
}

async function saveProfile(req, res) {
  try {
    const userId = await resolveAuthenticatedUserId(req);
    const profile = await seekerModel.upsertProfile(userId, normalizeProfile(req.body));
    await waitForDatabaseWrite();
    return res.json({ success: true, message: 'Profile saved successfully!', data: profile, profile, onboarding_completed: true, profileCompleted: true });
  } catch (error) {
    console.error('❌ SQL EXECUTION FAILED:');
    console.error('SQL Code:', error.code);
    console.error('SQL Message:', error.sqlMessage || error.message);
    console.error('Executed SQL Query:', error.sql || '[mysql2 did not expose the query text]');
    return res.status(500).json({ success: false, message: 'Unable to save your profile.', error: error.sqlMessage || error.message, code: error.code });
  }
}

async function updatePersonalInfo(req, res) {
  const personal = req.body || {};
  try {
    await db.execute(
      `UPDATE users SET full_name = COALESCE(NULLIF(?, ''), full_name),
       email = COALESCE(NULLIF(?, ''), email), phone = ? WHERE id = ?`,
      [String(personal.name || personal.full_name || '').trim(), String(personal.email || '').trim(), personal.phone || null, req.user.id]
    );
    await db.execute(
      `INSERT INTO job_seeker_profiles (user_id, headline, bio, location, city, country)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE headline = COALESCE(NULLIF(VALUES(headline), ''), headline),
       bio = COALESCE(VALUES(bio), bio), location = COALESCE(VALUES(location), location),
       city = COALESCE(VALUES(city), city), country = COALESCE(VALUES(country), country), updated_at = NOW()`,
      [req.user.id, personal.headline || '', personal.bio || null, personal.location || null, personal.city || null, personal.country || null]
    );
    return res.json({ success: true, message: 'Personal information updated successfully.' });
  } catch (error) {
    console.error('Update seeker personal information failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update job seeker profile.' });
  }
}

async function updateSkills(req, res) {
  const submittedSkills = req.body?.skills;
  const skills = Array.isArray(submittedSkills)
    ? submittedSkills
    : Object.values(submittedSkills || {}).flat();
  try {
    const normalizedSkills = skills.flatMap((group) => Array.isArray(group) ? group : [group])
      .map((skill) => typeof skill === 'string' ? { skill_name: skill.trim() } : skill)
      .filter((skill) => skill?.skill_name || skill?.name);
    await db.query('UPDATE job_seeker_profiles SET skills = ?, updated_at = NOW() WHERE user_id = ?', [JSON.stringify(normalizedSkills), req.user.id]);
    return res.json({ success: true, message: 'Skills updated successfully.' });
  } catch (error) {
    console.error('Update seeker skills failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update job seeker profile.' });
  }
}

async function uploadCv(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please select a CV file.' });

  try {
    const fileUrl = `/uploads/cvs/${req.file.filename}`;
    const [result] = await db.execute(
      `INSERT INTO cvs (user_id, file_name, file_url, file_size, mime_type, is_primary, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE, TRUE)`,
      [req.user.id, req.file.originalname, fileUrl, req.file.size, req.file.mimetype]
    );

    return res.status(201).json({
      success: true,
      cv: { id: result.insertId, fileName: req.file.originalname, fileUrl, fileSize: req.file.size },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to save your CV.' });
  }
}

async function listCollection(req, res) {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ success: false, message: 'Unknown profile collection.' });
  try {
    const profile = await seekerModel.getProfile(req.user.id);
    return res.json({ success: true, [req.params.collection]: profile[collection.key] || [] });
  }
  catch (error) { return res.status(500).json({ success: false, message: 'Unable to load profile data.' }); }
}

async function addCollectionItem(req, res) {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ success: false, message: 'Unknown profile collection.' });
  try {
    const profile = await seekerModel.getProfile(req.user.id);
    const items = [...(profile[collection.key] || []), req.body];
    await db.query(`UPDATE job_seeker_profiles SET ${collection.key} = ?, updated_at = NOW() WHERE user_id = ?`, [JSON.stringify(items), req.user.id]);
    return res.status(201).json({ success: true, item: req.body });
  } catch (error) { return res.status(500).json({ success: false, message: 'Unable to save profile data.' }); }
}

async function deleteCollectionItem(req, res) {
  const collection = collections[req.params.collection];
  if (!collection) return res.status(404).json({ success: false, message: 'Unknown profile collection.' });
  try {
    const profile = await seekerModel.getProfile(req.user.id);
    const items = (profile[collection.key] || []).filter((item, index) => String(item.id || index) !== String(req.params.id));
    await db.query(`UPDATE job_seeker_profiles SET ${collection.key} = ?, updated_at = NOW() WHERE user_id = ?`, [JSON.stringify(items), req.user.id]);
    return res.json({ success: true });
  } catch (error) { return res.status(500).json({ success: false, message: 'Unable to delete profile data.' }); }
}

async function getApplications(req, res) {
  try { return res.json({ success: true, applications: await seekerModel.getApplications(req.user.id) }); }
  catch (error) { return res.status(500).json({ success: false, message: 'Unable to load applications.' }); }
}

module.exports = { getProfile, updateProfile, saveProfile, updatePersonalInfo, updateSkills, uploadCv, listCollection, addCollectionItem, deleteCollectionItem, getApplications };
