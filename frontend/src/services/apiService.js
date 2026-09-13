import api from './api';
import seekerApi from './seekerApiService';

const KEYS = {
  jobs: 'sharedJobs',
  applications: 'sharedApplications',
  conversations: 'mockConversations',
  notifications: 'sharedNotifications',
};

function read(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('job-matching:updated', { detail: { key } }));
  return value;
}

async function request(fallback, callback) {
  try {
    return await callback();
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

function addNotification(notification) {
  const item = {
    id: notification.id || `notification-${Date.now()}`,
    type: notification.type || 'status_updated',
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  write(KEYS.notifications, [item, ...read(KEYS.notifications)]);
  return item;
}

export const jobsApi = {
  async getJobs(filters = {}) {
    return request(() => read(KEYS.jobs), async () => {
      const { data } = await api.get('/jobs', { params: filters });
      return data.jobs || data;
    });
  },
  async postJob(jobData) {
    const job = { ...jobData, id: jobData.id || `job-${Date.now()}`, status: jobData.status || 'published', createdAt: new Date().toISOString() };
    const jobs = write(KEYS.jobs, [job, ...read(KEYS.jobs).filter((item) => String(item.id) !== String(job.id))]);
    await request(null, async () => { const { data } = await api.post('/jobs', jobData); return data; });
    return { success: true, job, jobs };
  },
  async applyJob(jobId, seekerProfile = {}) {
    const existing = read(KEYS.applications).find((item) => String(item.jobId) === String(jobId) && String(item.seekerId || '') === String(seekerProfile.id || ''));
    if (existing) return { success: false, alreadyApplied: true, application: existing };
    const application = { id: `application-${Date.now()}`, jobId: String(jobId), seekerId: seekerProfile.id || 'seeker-demo', seeker: seekerProfile, status: 'Applied', matchScore: seekerProfile.matchScore || 96, createdAt: new Date().toISOString() };
    write(KEYS.applications, [application, ...read(KEYS.applications)]);
    addNotification({ type: 'application_submitted', title: 'New application received', detail: `${seekerProfile.name || 'A seeker'} applied for your job.`, jobId, applicationId: application.id });
    return { success: true, application };
  },
};

export const candidatesApi = {
  async getCandidates(jobId) {
    return request(() => read(KEYS.applications).filter((item) => !jobId || String(item.jobId) === String(jobId)), async () => {
      const { data } = await api.get('/employer/candidates', { params: { jobId } });
      return data.candidates || data;
    });
  },
  async updateCandidateStatus(candidateId, status) {
    const applications = read(KEYS.applications);
    const application = applications.find((item) => String(item.id) === String(candidateId));
    const updated = application ? { ...application, status } : { id: candidateId, status };
    write(KEYS.applications, applications.map((item) => String(item.id) === String(candidateId) ? updated : item));
    addNotification({ type: 'status_updated', title: 'Application status updated', detail: `Your application moved to ${status}.`, applicationId: candidateId, recipientRole: 'seeker' });
    await request(null, () => api.patch(`/applications/${candidateId}/status`, { status }));
    return updated;
  },
};

export const messagesApi = {
  async getConversations(role = 'employer') {
    return request(() => read(KEYS.conversations), async () => {
      const { data } = await api.get('/conversations', { params: { role } });
      return data.conversations || data;
    });
  },
  async getMessages(conversationId) {
    const conversation = read(KEYS.conversations).find((item) => String(item.id) === String(conversationId));
    return request(() => conversation?.messages || [], async () => {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      return data.messages || data;
    });
  },
  async sendMessage({ conversationId, senderRole, recipientRole, text, attachments = [] }) {
    const message = { id: `message-${Date.now()}`, sender: senderRole, recipientRole, text, attachments, time: new Date().toISOString() };
    const conversations = read(KEYS.conversations);
    const next = conversations.map((item) => String(item.id) === String(conversationId) ? { ...item, lastMessage: text, lastMessageTime: message.time, unreadCount: senderRole === 'employer' ? (item.unreadCount || 0) + 1 : item.unreadCount, messages: [...(item.messages || []), message] } : item);
    write(KEYS.conversations, next);
    addNotification({ type: 'new_message', title: 'New message', detail: text, conversationId, recipientRole });
    await request(null, () => api.post(`/conversations/${conversationId}/messages`, { senderRole, recipientRole, text, attachments }));
    return message;
  },
};

export const notificationsApi = {
  async getNotifications(role) {
    const items = read(KEYS.notifications);
    return role ? items.filter((item) => !item.recipientRole || item.recipientRole === role) : items;
  },
  async markAsRead(id) {
    const notifications = write(KEYS.notifications, read(KEYS.notifications).map((item) => String(item.id) === String(id) ? { ...item, read: true } : item));
    await request(null, () => api.patch(`/notifications/${id}/read`));
    return notifications.find((item) => String(item.id) === String(id));
  },
};

export const platformApi = {
  getSeekerProfile: seekerApi.getProfile,
  updateSeekerProfile: seekerApi.updateProfile,
  updateSeekerStatus: (userId, status) => seekerApi.updateStatus(userId, status),
  getExperience: seekerApi.getExperience,
  updateSkills: seekerApi.updateSkills,
  getProjects: seekerApi.getProjects,
  addProject: seekerApi.addProject,
  getRecommendedJobs: seekerApi.getRecommendedJobs,
  getRecentApplications: seekerApi.getApplications,
  applyToJob: seekerApi.applyForJob,
  runPromptTest: seekerApi.runPromptTest,
  sendContactMessage: seekerApi.sendMessage,
};

const apiService = {
  ...jobsApi,
  ...platformApi,
  createJob: jobsApi.postJob,
  getCandidates: candidatesApi.getCandidates,
  updateCandidateStatus: candidatesApi.updateCandidateStatus,
  getConversations: messagesApi.getConversations,
  getMessages: messagesApi.getMessages,
  sendMessage: (conversationId, payload) => messagesApi.sendMessage({ conversationId, ...payload }),
  getNotifications: notificationsApi.getNotifications,
  markAsRead: notificationsApi.markAsRead,
};

export default apiService;
