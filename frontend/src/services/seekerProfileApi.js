const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCKS = import.meta.env.VITE_USE_PROFILE_MOCKS !== 'false';
import { notifyProfileUpdated } from '../utils/profileUpdateEvent';

const emptyProfile = {
  id: '',
  name: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  bio: '',
  avatarUrl: '',
  education: [],
  skills: { Technical: [], Frameworks: [], Tools: [], 'Soft Skills': [] },
  experience: [],
  certifications: [],
};

function getStoredProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem('userProfile') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      ...emptyProfile,
      ...stored,
      name: stored?.name || user?.full_name || user?.name || '',
      email: stored?.email || user?.email || '',
    };
  } catch {
    return emptyProfile;
  }
}

async function request(path, options, fallback) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers || {}) },
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.message || `Profile request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (USE_MOCKS) return typeof fallback === 'function' ? fallback() : fallback;
    throw error instanceof Error ? error : new Error('Profile request failed');
  }
}

export async function getProfile() {
  return request('/seeker/profile/full', undefined, getStoredProfile);
}

export async function updateProfile(data) {
  const payload = { ...data };
  localStorage.setItem('userProfile', JSON.stringify(payload));
  notifyProfileUpdated();
  return request('/seeker/profile', { method: 'PUT', body: JSON.stringify(payload) }, payload);
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  return request('/seeker/profile/avatar', { method: 'POST', body: formData }, () => ({ avatarUrl: URL.createObjectURL(file) }));
}

export async function addExperience(data) {
  return request('/seeker/profile/experience', { method: 'POST', body: JSON.stringify(data) }, () => persistCollection('experience', data));
}

export async function addEducation(data) {
  return request('/seeker/profile/education', { method: 'POST', body: JSON.stringify(data) }, () => persistCollection('education', data));
}

export async function addCertification(data) {
  return request('/seeker/profile/certifications', { method: 'POST', body: JSON.stringify(data) }, () => persistCollection('certifications', data));
}

function persistCollection(key, value) {
  const profile = getStoredProfile();
  const item = { id: value.id || `${key}-${Date.now()}`, ...value };
  const next = { ...profile, [key]: [...(profile[key] || []), item] };
  localStorage.setItem('userProfile', JSON.stringify(next));
  notifyProfileUpdated();
  return item;
}

function updateCollection(key, id, value) {
  const profile = getStoredProfile();
  const next = { ...profile, [key]: (profile[key] || []).map((item) => String(item.id) === String(id) ? { ...item, ...value, id: item.id } : item) };
  localStorage.setItem('userProfile', JSON.stringify(next));
  notifyProfileUpdated();
  return next[key].find((item) => String(item.id) === String(id));
}

function deleteCollection(key, id) {
  const profile = getStoredProfile();
  const next = { ...profile, [key]: (profile[key] || []).filter((item) => String(item.id) !== String(id)) };
  localStorage.setItem('userProfile', JSON.stringify(next));
  notifyProfileUpdated();
  return { id };
}

export async function updatePersonalInfo(data) { return request('/seeker/profile/personal', { method: 'PUT', body: JSON.stringify(data) }, () => { const next = { ...getStoredProfile(), ...data }; localStorage.setItem('userProfile', JSON.stringify(next)); notifyProfileUpdated(); return next; }); }
export async function updateSkills(skills) { return request('/seeker/profile/skills', { method: 'PUT', body: JSON.stringify({ skills }) }, () => { const next = { ...getStoredProfile(), skills }; localStorage.setItem('userProfile', JSON.stringify(next)); notifyProfileUpdated(); return next; }); }
export async function updateEducation(id, data) { return request(`/seeker/profile/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => updateCollection('education', id, data)); }
export async function deleteEducation(id) { return request(`/seeker/profile/education/${id}`, { method: 'DELETE' }, () => deleteCollection('education', id)); }
export async function updateExperience(id, data) { return request(`/seeker/profile/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => updateCollection('experience', id, data)); }
export async function deleteExperience(id) { return request(`/seeker/profile/experience/${id}`, { method: 'DELETE' }, () => deleteCollection('experience', id)); }
export async function updateCertification(id, data) { return request(`/seeker/profile/certifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }, () => updateCollection('certifications', id, data)); }
export async function deleteCertification(id) { return request(`/seeker/profile/certifications/${id}`, { method: 'DELETE' }, () => deleteCollection('certifications', id)); }
export async function updateFullProfile(data) { return updateProfile(data); }

export { emptyProfile };
