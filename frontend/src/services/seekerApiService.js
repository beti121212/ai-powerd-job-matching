import api from './api';

const PROFILE_KEY = 'userProfile';
const SHARED_JOBS_KEY = 'sharedJobs';
const SHARED_APPLICATIONS_KEY = 'sharedApplications';
const SHARED_NOTIFICATIONS_KEY = 'sharedNotifications';

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('job-matching:updated', { detail: { key } }));
  return value;
}

async function request(path, options, fallback) {
  try {
    const response = await api({ url: path, ...options });
    return response.data?.data ?? response.data;
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

const getProfile = async (userId) => request(`/v1/seekers/${userId}`, undefined, () => read(PROFILE_KEY, { id: userId }));
const updateProfile = async (userId, data) => {
  const profile = write(PROFILE_KEY, { ...read(PROFILE_KEY, {}), ...data, id: userId });
  return request(`/v1/seekers/${userId}`, { method: 'PUT', data }, profile);
};
const updateStatus = async (userId, status) => updateProfile(userId, { availabilityStatus: status });
const getExperience = async (userId) => request(`/v1/seekers/${userId}/experience`, undefined, () => read(PROFILE_KEY, {}).experience || []);
const updateSkills = async (userId, skills) => updateProfile(userId, { skills });
const getProjects = async (userId) => request(`/v1/seekers/${userId}/projects`, undefined, () => read(PROFILE_KEY, {}).projects || []);
const addProject = async (userId, projectData) => {
  const project = { id: `project-${Date.now()}`, ...projectData };
  const profile = read(PROFILE_KEY, {});
  write(PROFILE_KEY, { ...profile, projects: [...(profile.projects || []), project] });
  return request(`/v1/seekers/${userId}/projects`, { method: 'POST', data: projectData }, project);
};
const getRecommendedJobs = async (userId) => request(`/v1/seekers/${userId}/recommendations`, undefined, () => read(SHARED_JOBS_KEY, []));
const getApplications = async (userId) => request(`/v1/seekers/${userId}/applications`, undefined, () => read(SHARED_APPLICATIONS_KEY, []).filter((item) => !item.seekerId || String(item.seekerId) === String(userId)));
const applyForJob = async (jobId, applicationPayload = {}) => {
  const applications = read(SHARED_APPLICATIONS_KEY, []);
  const existing = applications.find((item) => String(item.jobId) === String(jobId) && String(item.seekerId) === String(applicationPayload.seekerId));
  if (existing) return { success: false, alreadyApplied: true, application: existing };
  const application = { id: `application-${Date.now()}`, jobId: String(jobId), status: 'Applied', matchScore: applicationPayload.matchScore || 96, ...applicationPayload, createdAt: new Date().toISOString() };
  write(SHARED_APPLICATIONS_KEY, [application, ...applications]);
  const notifications = read(SHARED_NOTIFICATIONS_KEY, []);
  write(SHARED_NOTIFICATIONS_KEY, [{ id: `notification-${application.id}`, type: 'application_submitted', title: 'New application received', detail: `${applicationPayload.name || 'A seeker'} applied for your job.`, jobId: String(jobId), applicationId: application.id, recipientRole: 'employer', read: false, createdAt: application.createdAt }, ...notifications]);
  return request(`/v1/jobs/${jobId}/apply`, { method: 'POST', data: applicationPayload }, { success: true, application });
};
const runPromptTest = async (promptPayload) => request('/v1/ai/prompt-studio/test', { method: 'POST', data: promptPayload }, { output: `Prompt processed successfully.\n\n${promptPayload.prompt || ''}` });
const sendMessage = async (contactPayload) => request('/v1/messages/send', { method: 'POST', data: contactPayload }, { success: true, message: contactPayload });

export const seekerApi = {
  getProfile,
  updateProfile,
  updateStatus,
  getExperience,
  updateSkills,
  getProjects,
  addProject,
  getRecommendedJobs,
  getApplications,
  applyForJob,
  runPromptTest,
  sendMessage,
};

export default seekerApi;
