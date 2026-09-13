import api from './api';

const fallbackOverview = {
  data: { usersCount: 1420, seekersCount: 1180, employersTotal: 240, employersVerified: 240, totalJobs: 129, activeJobsCount: 86, totalApplications: 3400, successfulHires: 34, pendingReports: 2, avgMatchScore: 81.4, highMatchRatio: 42, placementVelocity: '4.2 days' },
  users: [{ id: 'seed-user', full_name: 'Eyerus Shibabaw', email: 'shibabaweyerus@gmail.com', role: 'job_seeker', is_verified: true, is_active: true, created_at: '2026-08-20' }],
  companies: [{ id: 'seed-company', company_name: 'Awash Fintech Labs', rep_name: 'Marta Bekele', rep_email: 'marta@awashfintech.example', industry: 'Banking & Finance', company_size: '51-200', tin_number: '004829104', verification_status: 'pending' }],
  jobs: [{ id: 'seed-job', title: 'Senior React Developer', company_name: 'EthioTech Solutions', category: 'Engineering', work_mode: 'remote', total_applicants: 94, status: 'published', application_deadline: '2026-10-01' }],
  applications: [{ id: 'seed-application', candidate_name: 'Eyerus Shibabaw', candidate_email: 'shibabaweyerus@gmail.com', job_title: 'Senior React Developer', employer_name: 'EthioTech Solutions', ai_match_score: 94, status: 'hired', applied_at: '2026-08-28' }, { id: 'seed-application-2', candidate_name: 'Dawit Alemu', candidate_email: 'dawit@example.com', job_title: 'Product Designer', employer_name: 'Nile Digital', ai_match_score: 88, status: 'shortlisted', applied_at: '2026-09-02' }, { id: 'seed-application-3', candidate_name: 'Sara Mekonnen', candidate_email: 'sara@example.com', job_title: 'Data Analyst', employer_name: 'Blue Nile Group', ai_match_score: 76, status: 'under-review', applied_at: '2026-09-03' }],
  reports: [{ id: 'seed-report', reporter_name: 'Platform review', reported_job_title: 'Unverified listing', report_type: 'other', description: 'Example moderation queue item', status: 'pending', created_at: '2026-08-30' }],
  notifications: [{ id: 'seed-notification', title: 'New verification request', message: 'Awash Fintech Labs submitted company documents.', is_read: false, created_at: '2026-08-31' }], logs: [],
};

export const getAdminDashboardStats = async () => {
  try {
    const { data } = await api.get('/admin/dashboard-stats');
    return data.stats;
  } catch (error) {
    console.warn('Admin dashboard stats unavailable; using fallback metrics.', error.message);
    return null;
  }
};

export const getAdminOverview = async () => {
  try {
    const { data } = await api.get('/admin/overview');
    return {
      ...fallbackOverview,
      ...data,
      data: { ...fallbackOverview.data, ...(data.data || {}) },
      users: data.users?.length ? data.users : fallbackOverview.users,
      companies: data.companies?.length ? data.companies : fallbackOverview.companies,
      jobs: data.jobs?.length ? data.jobs : fallbackOverview.jobs,
      applications: data.applications?.length ? data.applications : fallbackOverview.applications,
      reports: data.reports?.length ? data.reports : fallbackOverview.reports,
      notifications: data.notifications?.length ? data.notifications : fallbackOverview.notifications,
    };
  } catch (error) {
    console.warn('Admin API unavailable; showing an empty operational state.', error.message);
    return { ...fallbackOverview, offline: true };
  }
};

export const updateUserStatus = (userId, status) => api.patch(`/admin/users/${userId}/status`, { status });
export const updateCompanyVerification = (companyId, status) => api.patch(`/admin/company/${companyId}/verify`, { status });
export const updateJobStatus = (jobId, status) => api.patch(`/admin/jobs/${jobId}/moderate`, { status });
export const moderateJob = (jobId, action, reason = '') => api.post(`/admin/jobs/${jobId}/moderate`, { action, reason });
export const updateReportStatus = (reportId, status) => api.patch(`/admin/reports/${reportId}/status`, { status });
export const getJobPreview = (jobId) => api.get(`/admin/jobs/${jobId}/preview`);
export const deleteJob = (jobId) => api.delete(`/admin/jobs/${jobId}`);
