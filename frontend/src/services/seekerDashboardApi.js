// Compatibility entry point for the Job Seeker Dashboard API.
// The implementation lives in the typed dashboard service so existing imports remain stable.
export {
  getDashboardSummary,
  getJobMatches,
  getRecentApplications,
  getUpcomingInterviews,
  getRecommendedJobs,
  getMatchedJobs,
} from './dashboardApi';
