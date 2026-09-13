import api from './api';

const emptyOverview = {
  data: { usersCount: 0, seekersCount: 0, employersTotal: 0, employersVerified: 0, totalJobs: 0, activeJobsCount: 0, totalApplications: 0, successfulHires: 0, pendingReports: 0, avgMatchScore: 0 },
  users: [], companies: [], jobs: [], applications: [], reports: [], notifications: [], logs: [],
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
      ...emptyOverview,
      ...data,
      data: { ...emptyOverview.data, ...(data.data || {}) },
      users: Array.isArray(data.users) ? data.users : [],
      companies: Array.isArray(data.companies) ? data.companies : [],
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      applications: Array.isArray(data.applications) ? data.applications : [],
      reports: Array.isArray(data.reports) ? data.reports : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
    };
  } catch (error) {
    console.warn('Admin API unavailable; showing an empty operational state.', error.message);
    return { ...emptyOverview, offline: true };
  }
};

export const updateUserStatus = (userId, status) => api.patch(`/admin/users/${userId}/status`, { status });
export const updateCompanyVerification = (companyId, status) => api.patch(`/admin/company/${companyId}/verify`, { status });
export const updateJobStatus = (jobId, status) => api.patch(`/admin/jobs/${jobId}/moderate`, { status: status === 'active' ? 'published' : status });
export const moderateJob = (jobId, action, reason = '') => api.post(`/admin/jobs/${jobId}/moderate`, { action, reason });
export const updateReportStatus = (reportId, status) => api.patch(`/admin/reports/${reportId}/status`, { status });
export const getJobPreview = (jobId) => api.get(`/admin/jobs/${jobId}/preview`);
export const deleteJob = (jobId) => api.delete(`/admin/jobs/${jobId}`);
