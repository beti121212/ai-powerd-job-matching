const fs = require('fs/promises');
const path = require('path');
const db = require('../config/db');
const { extractText, classifyAndExtract, calculateScores, calculateRealJobMatch, calculateJobMatches, validateCvContent, CV_CONTENT_ERROR } = require('../services/cvAnalysisService');

const INVALID_CV_MESSAGE = 'We could not identify enough CV content. Please upload a readable resume with your name or contact details and work history, projects, internships, or education.';
const SUCCESS_MESSAGE = 'Your CV was analyzed successfully.';

async function removeFile(file) {
  if (file?.path) await fs.unlink(file.path).catch(() => {});
}

async function uploadAndAnalyze(req, res) {
  if (!req.file) return res.status(400).json({ success: false, message: 'Please select a PDF, DOCX, or image CV file.' });
  try {
    const parsedText = await extractText(req.file);
    if (!parsedText || !parsedText.trim()) {
      await removeFile(req.file);
      return res.status(422).json({ success: false, is_cv: false, message: 'We could not read any text from this document. Please upload a text-based PDF or DOCX, not a blank or image-only file.' });
    }

    const contentValidation = validateCvContent(parsedText);
    let extracted;
    if (contentValidation.valid || contentValidation.needsAiReview) {
      extracted = await classifyAndExtract(contentValidation.normalizedText);
    }
    if (!contentValidation.valid && !contentValidation.needsAiReview) {
      await removeFile(req.file);
      return res.status(422).json({ success: false, is_cv: false, message: contentValidation.message || CV_CONTENT_ERROR, validation: contentValidation.sections });
    }
    if (!extracted.is_cv) {
      await removeFile(req.file);
      return res.status(422).json({ success: false, is_cv: false, message: contentValidation.message || INVALID_CV_MESSAGE, validation: contentValidation.sections });
    }

    const [activeJobs] = await db.execute(
      `SELECT j.id, GROUP_CONCAT(jrs.skill_name) AS required_skills
       FROM jobs j
       JOIN job_required_skills jrs ON jrs.job_id = j.id
       WHERE j.status = 'published'
       GROUP BY j.id`
    );
    const scores = calculateScores(extracted, parsedText);
    const matchScore = calculateRealJobMatch(extracted.skills, activeJobs.map((job) => ({
      ...job,
      required_skills: job.required_skills ? job.required_skills.split(',') : [],
    })));
    scores.matchScore = matchScore;
    scores.keywordMatch = matchScore;
    const fileUrl = `/uploads/cvs/${path.basename(req.file.filename)}`;
    const connection = await db.getConnection();
    let cvId;
    try {
      await connection.beginTransaction();
      await connection.execute('UPDATE cvs SET is_primary = FALSE WHERE user_id = ?', [req.user.id]);
      const [cvResult] = await connection.execute(
        `INSERT INTO cvs (user_id, file_name, file_url, file_size, mime_type, is_primary, is_active, parsed_text, ai_analysis_score, ai_extracted_data)
         VALUES (?, ?, ?, ?, ?, TRUE, TRUE, ?, ?, ?)`,
        [req.user.id, req.file.originalname, fileUrl, req.file.size, req.file.mimetype, parsedText, scores.cvScore, JSON.stringify({ ...extracted, ...scores })]
      );
      cvId = cvResult.insertId;
      await connection.execute(
          `INSERT INTO cv_analysis (cv_id, extracted_skills, extracted_experience, extracted_education, extracted_languages, extracted_certifications, cv_score, readability_score, keyword_match_score, recommendations, analysis_status, analyzed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
        [cvId, JSON.stringify(extracted.skills), JSON.stringify(extracted.experience), JSON.stringify(extracted.education), JSON.stringify(extracted.languages), JSON.stringify(extracted.certifications), scores.cvScore, scores.readability, scores.keywordMatch, JSON.stringify(extracted.recommendations)]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return res.status(201).json({ success: true, is_cv: true, reviewRequired: true, message: SUCCESS_MESSAGE, data: { id: cvId, file_name: req.file.originalname, file_url: fileUrl, ...extracted, ...scores } });
  } catch (error) {
    await removeFile(req.file);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: status === 500 ? 'Unable to analyze your CV.' : error.message });
  }
}

async function validateAndParse(req, res) {
  if (!req.file) return res.status(422).json({ isCv: false, error: 'Please upload a readable candidate CV or resume.' });
  try {
    let parsedText;
    try {
      parsedText = await extractText(req.file);
    } catch (error) {
      return res.status(422).json({ isCv: false, error: 'We could not read this document. Please upload a readable PDF or DOCX CV.' });
    }
    const validation = validateCvContent(parsedText);
    if (!validation.valid && !validation.needsAiReview) return res.status(422).json({ isCv: false, error: validation.message || CV_CONTENT_ERROR, validation: validation.sections });

    const extracted = await classifyAndExtract(validation.normalizedText);
    const education = extracted.education?.[0] || {};
    const experience = extracted.experience?.[0] || {};
    const fullName = extracted.fullName || extracted.full_name || '';
    return res.status(200).json({
      isCv: true,
      firstName: extracted.firstName || fullName.split(/\s+/)[0] || '',
      lastName: extracted.lastName || fullName.split(/\s+/).slice(1).join(' ') || '',
      fullName,
      email: extracted.email || '',
      phone: extracted.phone || '',
      location: extracted.location || '',
      headline: extracted.headline || extracted.professional_title || '',
      education: [education.degree, education.school_name || education.institution].filter(Boolean).join(' - '),
      graduationYear: education.graduationYear || '',
      experienceRole: experience.job_title || experience.role || '',
      experienceDetail: experience.description || (experience.responsibilities || []).join('\n') || '',
      skills: (extracted.skills || []).map((skill) => typeof skill === 'string' ? skill : skill.skill_name).filter(Boolean),
      languages: (extracted.languages || []).map((language) => typeof language === 'string' ? language : language.language_name).filter(Boolean),
      jobPreference: typeof (extracted.jobPreference || extracted.job_preferences) === 'string'
        ? (extracted.jobPreference || extracted.job_preferences)
        : extracted.jobPreferences?.workMode || extracted.jobPreferences?.employmentType || '',
    });
  } catch (error) {
    return res.status(422).json({ isCv: false, error: CV_CONTENT_ERROR });
  } finally {
    await removeFile(req.file);
  }
}

function parseJson(value, fallback = []) {
  if (Array.isArray(value)) return value;
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

async function getAnalysis(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT c.id, c.file_name, c.file_url, c.file_size, c.mime_type, c.parsed_text, c.ai_extracted_data,
              a.extracted_skills, a.extracted_experience, a.extracted_education, a.extracted_languages, a.extracted_certifications,
              a.cv_score, a.readability_score, a.keyword_match_score, a.recommendations, a.analysis_status, a.analyzed_at
       FROM cvs c LEFT JOIN cv_analysis a ON a.cv_id = c.id WHERE c.id = ? AND c.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'CV analysis not found.' });
    const row = rows[0];
    const extracted = parseJson(row.ai_extracted_data, {});
    return res.json({ success: true, is_cv: true, data: { ...row, parsed_text: undefined, ...extracted, cvScore: row.cv_score, readability: row.readability_score, keywordMatch: row.keyword_match_score, skills: parseJson(row.extracted_skills, extracted.skills || []), experience: parseJson(row.extracted_experience, extracted.experience || []), education: parseJson(row.extracted_education, extracted.education || []), languages: parseJson(row.extracted_languages, extracted.languages || []), certifications: parseJson(row.extracted_certifications, extracted.certifications || []), recommendations: parseJson(row.recommendations, extracted.recommendations || []) } });
  } catch (error) { return res.status(500).json({ success: false, message: 'Unable to load CV analysis.' }); }
}

async function syncProfile(req, res) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT c.ai_extracted_data, a.extracted_skills, a.extracted_experience, a.extracted_education, a.extracted_languages
       FROM cvs c LEFT JOIN cv_analysis a ON a.cv_id = c.id WHERE c.id = ? AND c.user_id = ? LIMIT 1`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'CV analysis not found.' });
    const data = req.body && (req.body.skills || req.body.experience || req.body.education || req.body.languages || req.body.fullName || req.body.firstName || req.body.lastName)
      ? { ...req.body, fullName: req.body.fullName || [req.body.firstName, req.body.lastName].filter(Boolean).join(' '), firstName: req.body.firstName || '', lastName: req.body.lastName || '', professional_title: req.body.headline || req.body.professional_title, full_name: req.body.fullName || [req.body.firstName, req.body.lastName].filter(Boolean).join(' ') || req.body.full_name }
      : {
        ...parseJson(rows[0].ai_extracted_data, {}),
        skills: parseJson(rows[0].extracted_skills),
        experience: parseJson(rows[0].extracted_experience),
        education: parseJson(rows[0].extracted_education),
        languages: parseJson(rows[0].extracted_languages),
      };
    await connection.beginTransaction();
      await connection.execute(
        `UPDATE cvs SET ai_extracted_data = ?, ai_analysis_score = ? WHERE id = ? AND user_id = ?`,
        [JSON.stringify(data), data.cvScore || 0, req.params.id, req.user.id]
      );
      const fullName = data.fullName || data.full_name || [data.firstName, data.lastName].filter(Boolean).join(' ') || null;
      await connection.execute(
        'UPDATE users SET full_name = COALESCE(NULLIF(?, \'\'), full_name), email = COALESCE(NULLIF(?, \'\'), email), phone = COALESCE(NULLIF(?, \'\'), phone) WHERE id = ?',
        [fullName, data.email || '', data.phone || '', req.user.id]
      );
      await connection.execute(
        `UPDATE cv_analysis SET extracted_skills = ?, extracted_experience = ?, extracted_education = ?, extracted_languages = ?, extracted_certifications = ?, cv_score = ?, readability_score = ?, keyword_match_score = ?, recommendations = ?, analysis_status = 'completed', analyzed_at = NOW() WHERE cv_id = ?`,
        [JSON.stringify(data.skills || []), JSON.stringify(data.experience || []), JSON.stringify(data.education || []), JSON.stringify(data.languages || []), JSON.stringify(data.certifications || []), data.cvScore || 0, data.readability || 0, data.matchScore || data.keywordMatch || 0, JSON.stringify(data.recommendations || []), req.params.id]
      );
    await connection.execute(
      'INSERT INTO job_seeker_profiles (user_id, headline, profile_completion_percentage) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE headline = VALUES(headline), profile_completion_percentage = VALUES(profile_completion_percentage)',
      [req.user.id, data.professional_title || null, data.profileCompletion || 0]
    );
    const [profileRows] = await connection.execute(
      'SELECT id FROM job_seeker_profiles WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    if (!profileRows[0]) throw new Error('Unable to create seeker profile.');

    await connection.execute('UPDATE job_seeker_profiles SET education = ?, skills = ?, languages = ?, parsed_json_payload = ?, updated_at = NOW() WHERE user_id = ?', [JSON.stringify(data.education || []), JSON.stringify(data.skills || []), JSON.stringify(data.languages || []), JSON.stringify(data), req.user.id]);
    await connection.commit();
    return res.json({ success: true, message: 'Your profile was updated from the analyzed CV.', profile_completion_percentage: data.profileCompletion || 0 });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Unable to sync CV data to your profile.' });
  } finally { connection.release(); }
}

module.exports = { uploadAndAnalyze, validateAndParse, getAnalysis, syncProfile };
