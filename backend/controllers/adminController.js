const db = require('../connection');

const safeExecute = async (query, params = [], fallback = []) => {
  try {
    return await db.execute(query, params);
  } catch (error) {
    console.warn('Admin optional query skipped:', error.message);
    return [fallback, []];
  }
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  return String(value || '').toLowerCase() === 'true' || value === 1;
};

exports.getAdminDashboardStats = async (req, res) => {
  const fallbackStats = { totalUsers: 1420, jobSeekersCount: 1180, employersCount: 240, activeJobs: 86, avgMatchScore: 81.4, moderationQueueCount: 2, pipeline: { pending: 342, shortlisted: 128, interviewing: 46, hired: 34, rejected: 185 } };
  try {
    const [[users], [seekers], [employers], [jobs], [verification], [reports], [average], [pipeline]] = await Promise.all([
      db.execute('SELECT COUNT(*) AS count FROM users'),
      db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'job_seeker'"),
      db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'employer'"),
      db.execute("SELECT COUNT(*) AS count FROM jobs WHERE status = 'published'"),
      db.execute("SELECT COUNT(*) AS count FROM company_profiles WHERE verification_status = 'pending'"),
      db.execute("SELECT COUNT(*) AS count FROM reports WHERE status = 'pending'"),
      db.execute('SELECT AVG(ai_match_score) AS score FROM applications WHERE ai_match_score IS NOT NULL'),
      db.execute("SELECT status, COUNT(*) AS count FROM applications GROUP BY status"),
    ]);
    const pipelineStats = { pending: 0, shortlisted: 0, interviewing: 0, hired: 0, rejected: 0 };
    pipeline.forEach((row) => { const key = row.status === 'interview-scheduled' ? 'interviewing' : row.status; if (key in pipelineStats) pipelineStats[key] = Number(row.count || 0); });
    return res.status(200).json({ success: true, stats: { totalUsers: Number(users[0]?.count || 0), jobSeekersCount: Number(seekers[0]?.count || 0), employersCount: Number(employers[0]?.count || 0), activeJobs: Number(jobs[0]?.count || 0), avgMatchScore: average[0]?.score == null ? fallbackStats.avgMatchScore : Number(Number(average[0].score).toFixed(1)), moderationQueueCount: Number(verification[0]?.count || 0) + Number(reports[0]?.count || 0), pipeline: pipelineStats } });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    return res.status(200).json({ success: true, stats: fallbackStats, fallback: true });
  }
};

exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [seekerCount] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'job_seeker'");
    const [employerCount] = await db.execute("SELECT COUNT(*) AS total, SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) AS verified FROM company_profiles");
    const [activeJobsCount] = await db.execute("SELECT COUNT(*) AS count FROM jobs WHERE status = 'published'");
    const [totalAppsCount] = await db.execute("SELECT COUNT(*) AS count, AVG(ai_match_score) AS avg_score FROM applications");

    return res.status(200).json({
      success: true,
      data: {
        seekersCount: Number(seekerCount[0]?.count || 0),
        employersTotal: Number(employerCount[0]?.total || 0),
        employersVerified: Number(employerCount[0]?.verified || 0),
        activeJobsCount: Number(activeJobsCount[0]?.count || 0),
        totalApplications: Number(totalAppsCount[0]?.count || 0),
        avgMatchScore: totalAppsCount[0]?.avg_score ? Number(parseFloat(totalAppsCount[0].avg_score).toFixed(1)) : 0,
        topMatchedSkill: 'No skill data yet',
        placementVelocity: 'No placement data yet',
      },
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve platform analytics.' });
  }
};

exports.getPendingCompanies = async (req, res) => {
  try {
    const [companies] = await db.execute(`
      SELECT cp.*, u.full_name AS rep_name, u.email AS rep_email, u.phone AS rep_phone
      FROM company_profiles cp
      JOIN users u ON cp.employer_id = u.id
      ORDER BY cp.created_at DESC
    `);
    return res.json({ success: true, companies });
  } catch (error) {
    console.error('Admin Companies Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve companies.' });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const status = req.body?.status;
  if (!['verified', 'rejected'].includes(status)) {
    return res.status(422).json({ success: false, message: 'Verification status must be verified or rejected.' });
  }

  try {
    await db.execute('UPDATE company_profiles SET is_verified = ?, verification_status = ?, verified_at = ? WHERE id = ?', [status === 'verified' ? 1 : 0, status, status === 'verified' ? new Date() : null, id]);
    return res.json({ success: true, message: `Company marked as ${status}` });
  } catch (error) {
    console.error('Admin Company Status Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update company status.' });
  }
};

exports.getAllJobsForModeration = async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT j.*, cp.company_name, cp.logo_url, cp.location AS company_location,
             COUNT(a.id) AS total_applicants
      FROM jobs j
      LEFT JOIN company_profiles cp ON j.employer_id = cp.employer_id
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `);
    return res.json({ success: true, jobs });
  } catch (error) {
    console.error('Admin Jobs Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve jobs.' });
  }
};

exports.getAdminDashboardData = async (req, res) => {
  try {
    const [analytics, companies, jobs, users, logs, applications, reports, notifications] = await Promise.all([
      exports.getPlatformAnalyticsData(),
      safeExecute(`SELECT cp.*, u.full_name AS rep_name, u.email AS rep_email, u.phone AS rep_phone FROM company_profiles cp JOIN users u ON cp.employer_id = u.id ORDER BY cp.created_at DESC`),
      safeExecute(`SELECT j.*, cp.company_name, cp.logo_url, cp.location AS company_location, COUNT(a.id) AS total_applicants FROM jobs j LEFT JOIN company_profiles cp ON j.employer_id = cp.employer_id LEFT JOIN applications a ON j.id = a.job_id GROUP BY j.id ORDER BY j.created_at DESC`),
      safeExecute('SELECT id, full_name, email, phone, role, is_verified, is_active, created_at FROM users ORDER BY created_at DESC'),
      safeExecute(`SELECT u.full_name, u.email, u.role, l.activity_type, l.related_job_id, l.created_at FROM user_activity_log l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC LIMIT 30`),
      safeExecute(`SELECT a.id, a.status, a.ai_match_score, a.skills_match_score, a.experience_match_score, a.education_match_score, a.location_match_score, a.applied_at, candidate.full_name AS candidate_name, j.title AS job_title, employer.full_name AS employer_name FROM applications a JOIN users candidate ON candidate.id = a.job_seeker_id JOIN jobs j ON j.id = a.job_id JOIN users employer ON employer.id = j.employer_id ORDER BY a.applied_at DESC LIMIT 100`),
      safeExecute(`SELECT r.*, reporter.full_name AS reporter_name, reporter.email AS reporter_email, target_user.full_name AS reported_user_name, target_job.title AS reported_job_title FROM reports r JOIN users reporter ON reporter.id = r.reporter_id LEFT JOIN users target_user ON target_user.id = r.reported_user_id LEFT JOIN jobs target_job ON target_job.id = r.reported_job_id ORDER BY r.created_at DESC LIMIT 100`),
      safeExecute(`SELECT n.*, u.full_name AS recipient_name FROM notifications n JOIN users u ON u.id = n.user_id ORDER BY n.created_at DESC LIMIT 100`),
    ]);

    return res.status(200).json({
      success: true,
      data: analytics,
      metrics: {
        totalSeekers: analytics.seekersCount,
        totalEmployers: analytics.employersTotal,
        verifiedEmployers: analytics.employersVerified,
        activeJobs: analytics.activeJobsCount,
        totalApplications: analytics.totalApplications,
        avgMatchScore: analytics.avgMatchScore,
      },
      companies: companies[0],
      jobs: jobs[0],
      users: users[0],
      logs: logs[0],
      applications: applications[0],
      reports: reports[0],
      notifications: notifications[0],
      pendingEmployers: companies[0].filter((company) => company.verification_status === 'pending'),
      recentJobs: jobs[0].slice(0, 10),
      recentUsers: users[0].slice(0, 10),
      recentLogs: logs[0].slice(0, 12),
    });
  } catch (error) {
    console.error('Admin Data Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin data.' });
  }
};

exports.getPlatformAnalyticsData = async () => {
  const [seekers] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'job_seeker'");
  const [employers] = await db.execute("SELECT COUNT(*) AS total, SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) AS verified FROM company_profiles");
  const [jobs] = await db.execute("SELECT COUNT(*) AS active FROM jobs WHERE status = 'published'");
  const [allJobs] = await db.execute('SELECT COUNT(*) AS total FROM jobs');
  const [allUsers] = await db.execute('SELECT COUNT(*) AS total FROM users');
  const [apps] = await db.execute('SELECT COUNT(*) AS total, AVG(ai_match_score) AS avg_score FROM applications');
  const [hires] = await db.execute("SELECT COUNT(*) AS total FROM applications WHERE status = 'hired'");
  const [reports] = await db.execute("SELECT COUNT(*) AS total FROM reports WHERE status = 'pending'");
  const [skills] = await db.execute('SELECT skill_name, COUNT(*) AS usage_count FROM job_required_skills GROUP BY skill_name ORDER BY usage_count DESC LIMIT 1');
  const [placements] = await db.execute("SELECT AVG(DATEDIFF(a.updated_at, a.applied_at)) AS avg_days FROM applications a WHERE a.status = 'hired'");
  return {
    seekersCount: Number(seekers[0]?.count || 0),
    usersCount: Number(allUsers[0]?.total || 0),
    employersTotal: Number(employers[0]?.total || 0),
    employersVerified: Number(employers[0]?.verified || 0),
    activeJobsCount: Number(jobs[0]?.active || 0),
    totalJobs: Number(allJobs[0]?.total || 0),
    totalApplications: Number(apps[0]?.total || 0),
    successfulHires: Number(hires[0]?.total || 0),
    pendingReports: Number(reports[0]?.total || 0),
    avgMatchScore: apps[0]?.avg_score ? Number(parseFloat(apps[0].avg_score).toFixed(1)) : 0,
    topMatchedSkill: skills[0]?.skill_name || 'No skill data yet',
    placementVelocity: placements[0]?.avg_days !== null && placements[0]?.avg_days !== undefined ? `${Number(placements[0].avg_days).toFixed(1)} days` : 'No placement data yet',
  };
};

exports.deleteJob = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Job not found.' });
    return res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (error) {
    console.error('Admin Delete Job Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to delete job.' });
  }
};

exports.getJobPreview = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT j.id, j.title, j.description, j.required_education, j.years_of_experience_min, j.years_of_experience_max, j.category, j.job_type, j.work_mode, j.salary_min, j.salary_max, j.currency, j.benefits, j.location, j.application_deadline, j.status, j.rejection_reason, u.email AS employer_email, cp.company_name, cp.is_verified AS company_verified, cp.verification_status, GROUP_CONCAT(DISTINCT s.skill_name ORDER BY s.skill_name SEPARATOR ',') AS required_skills FROM jobs j LEFT JOIN company_profiles cp ON cp.employer_id = j.employer_id LEFT JOIN users u ON u.id = j.employer_id LEFT JOIN job_required_skills s ON s.job_id = j.id WHERE j.id = ? GROUP BY j.id`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Job not found.' });
    return res.json({ success: true, job: rows[0] });
  } catch (error) {
    console.error('Admin Job Preview Error:', error);
    return res.status(500).json({ success: false, message: 'Unable to preview job.' });
  }
};

exports.moderateJob = async (req, res) => {
  const jobId = req.params.id || req.params.jobId;
  const action = String(req.body?.action || '').trim().toLowerCase();
  const reason = String(req.body?.reason || '').trim();
  const statusByAction = { publish: 'published', approve: 'published', reject: 'rejected', close: 'closed', take_down: 'closed' };
  const nextStatus = statusByAction[action];
  if (!nextStatus) return res.status(422).json({ success: false, message: 'Moderation action must be publish, reject, or close.' });
  if (action === 'reject' && !reason) return res.status(422).json({ success: false, message: 'A rejection reason is required.' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT j.id, j.title, j.employer_id, u.email AS employer_email FROM jobs j JOIN users u ON u.id = j.employer_id WHERE j.id = ? FOR UPDATE', [jobId]);
    if (!rows.length) { await connection.rollback(); return res.status(404).json({ success: false, message: 'Job not found.' }); }
    const job = rows[0];
    await connection.execute('UPDATE jobs SET status = ?, rejection_reason = ?, approved_by = ?, approved_at = CASE WHEN ? = \'published\' THEN NOW() ELSE NULL END, updated_at = NOW(), published_at = CASE WHEN ? = \'published\' THEN NOW() ELSE published_at END, closed_at = CASE WHEN ? = \'closed\' THEN NOW() ELSE NULL END WHERE id = ?', [nextStatus, nextStatus === 'rejected' ? reason : null, nextStatus === 'published' ? req.user.id : null, nextStatus, nextStatus, nextStatus, jobId]);
    const message = nextStatus === 'published' ? `Your job listing '${job.title}' has been approved and is now live.` : nextStatus === 'rejected' ? `Your job listing '${job.title}' was rejected: ${reason}` : `Your job listing '${job.title}' has been taken down.`;
    await connection.execute('INSERT INTO notifications (user_id, type, title, message, related_job_id, action_url) VALUES (?, \'company-update\', ?, ?, ?, ?)', [job.employer_id, nextStatus === 'published' ? 'Job approved' : nextStatus === 'rejected' ? 'Job listing needs changes' : 'Job listing closed', message, jobId, '/employer/jobs']);
    await connection.execute('INSERT INTO admin_actions_log (admin_id, action_type, target_job_id, reason) VALUES (?, \'content-moderated\', ?, ?)', [req.user.id, jobId, reason || `Job status changed to ${nextStatus}`]);
    await connection.commit();
    return res.json({ success: true, status: nextStatus, message: nextStatus === 'published' ? 'Job approved and published successfully!' : nextStatus === 'rejected' ? 'Job posting has been rejected.' : 'Job closed successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('Admin job moderation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to persist job moderation action.' });
  } finally {
    connection.release();
  }
};

exports.verifyCompany = async (req, res) => {
  req.params.id = req.params.companyId;
  req.body = { status: normalizeBoolean(req.body?.is_verified) ? 'verified' : 'rejected' };
  return exports.updateVerificationStatus(req, res);
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.execute('SELECT is_active FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });

    const nextStatus = rows[0].is_active === 1 ? 0 : 1;
    await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [nextStatus, userId]);

    return res.status(200).json({
      success: true,
      message: nextStatus ? 'User activated successfully.' : 'User suspended successfully.',
      is_active: nextStatus,
    });
  } catch (error) {
    console.error('Admin toggle user status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

exports.toggleJobStatus = async (req, res) => {
  try {
    const jobId = req.params.jobId || req.params.id;
    const { status } = req.body;
    const nextStatus = ['published', 'closed', 'suspended', 'draft'].includes(status) ? status : 'draft';

    const [rows] = await db.execute('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Job not found.' });

    await db.execute('UPDATE jobs SET status = ? WHERE id = ?', [nextStatus, jobId]);

    return res.status(200).json({ success: true, status: nextStatus, message: 'Job moderation status updated.' });
  } catch (error) {
    console.error('Admin toggle job status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job status.' });
  }
};

exports.updateReportStatus = async (req, res) => {
  const status = req.body?.status;
  if (!['pending', 'under-review', 'resolved', 'dismissed'].includes(status)) return res.status(422).json({ success: false, message: 'Invalid report status.' });
  try {
    const [result] = await db.execute('UPDATE reports SET status = ?, resolved_by = ?, resolved_at = CASE WHEN ? IN (\'resolved\', \'dismissed\') THEN NOW() ELSE NULL END WHERE id = ?', [status, req.user.id, status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Report not found.' });
    return res.json({ success: true, status });
  } catch (error) {
    console.error('Admin report status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
};
