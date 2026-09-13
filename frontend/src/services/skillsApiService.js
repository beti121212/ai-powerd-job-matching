import api from './api';

const STORAGE_KEY = 'seekerSkills';

const defaultSkills = [
  { id: 'javascript', name: 'JavaScript', level: 'EXPERT', percentage: 95, category: 'frontend', years: '5+ yrs', repos: '8 repos', stack: 'ES2024, TypeScript, testing' },
  { id: 'react', name: 'React', level: 'EXPERT', percentage: 95, category: 'frontend', years: '4+ yrs', repos: '7 repos', stack: 'React 19, Next.js, Hooks, Server Components' },
  { id: 'node', name: 'Node.js', level: 'ADVANCED', percentage: 90, category: 'backend', years: '4+ yrs', repos: '6 repos', stack: 'Express, Fastify, Microservices, REST & WebSockets' },
  { id: 'mysql', name: 'MySQL', level: 'ADVANCED', percentage: 88, category: 'databases', years: '4+ yrs', repos: '5 repos', stack: 'Schema design, query optimization, indexing' },
  { id: 'python', name: 'Python', level: 'INTERMEDIATE', percentage: 78, category: 'ai', years: '3+ yrs', repos: '4 repos', stack: 'FastAPI, data analysis, PyTorch & LLM tooling' },
  { id: 'communication', name: 'Communication', level: 'ADVANCED', percentage: 90, category: 'soft', years: '5+ yrs', repos: '24 endorsements', stack: 'Collaboration, Agile leadership, async docs' },
];

function readSkills() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : defaultSkills;
  } catch {
    return defaultSkills;
  }
}

function writeSkills(skills) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
  window.dispatchEvent(new CustomEvent('job-matching:skills-updated'));
  return skills;
}

async function request(path, options, fallback) {
  try {
    const response = await api({ url: path, ...options });
    return response.data?.data ?? response.data;
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

export const skillsApi = {
  async getSkills(candidateId) {
    return request(`/v1/candidates/${candidateId}/skills`, undefined, readSkills);
  },
  async addSkill(candidateId, skillData) {
    const skill = { id: `skill-${Date.now()}`, level: 'INTERMEDIATE', percentage: 70, category: 'frontend', ...skillData };
    writeSkills([...readSkills(), skill]);
    return request(`/v1/candidates/${candidateId}/skills`, { method: 'POST', data: skillData }, skill);
  },
  async updateSkill(candidateId, skillId, updateData) {
    const updated = readSkills().map((skill) => String(skill.id) === String(skillId) ? { ...skill, ...updateData } : skill);
    writeSkills(updated);
    return request(`/v1/candidates/${candidateId}/skills/${skillId}`, { method: 'PUT', data: updateData }, updated.find((skill) => String(skill.id) === String(skillId)));
  },
  async deleteSkill(candidateId, skillId) {
    writeSkills(readSkills().filter((skill) => String(skill.id) !== String(skillId)));
    return request(`/v1/candidates/${candidateId}/skills/${skillId}`, { method: 'DELETE' }, { success: true, id: skillId });
  },
  async requestAiVerification(candidateId, skillId) {
    const result = await request('/v1/ai/skills/verify', { method: 'POST', data: { candidateId, skillId } }, { verified: true, badge: 'AI Verified' });
    const updated = readSkills().map((skill) => String(skill.id) === String(skillId) ? { ...skill, verified: true } : skill);
    writeSkills(updated);
    return result;
  },
};

export { defaultSkills };
export default skillsApi;
