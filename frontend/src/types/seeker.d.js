export const seekerRoles = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employer', 'admin'];

export const createDefaultUser = () => ({
  id: '',
  name: '',
  email: '',
  role: 'job_seeker',
  headline: '',
  avatarUrl: '',
  profileCompletion: 0,
  cvScore: 0,
});

export const createDefaultSeekerStats = () => ({
  matches: 0,
  applications: 0,
  interviews: 0,
  savedJobs: 0,
  applicationsList: [],
});

export const createDefaultSkillGaps = () => ({
  userSkills: [],
  missingSkills: [],
});
