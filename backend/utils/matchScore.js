const SCORE_WEIGHTS = {
  skills: 40,
  experience: 25,
  education: 15,
  location: 10,
  preferences: 10
};

function toList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
}

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

function containsMatch(candidate, requirement) {
  const candidateValue = normalized(candidate);
  const requirementValue = normalized(requirement);
  return Boolean(candidateValue && requirementValue && (candidateValue === requirementValue || candidateValue.includes(requirementValue) || requirementValue.includes(candidateValue)));
}

function educationMatches(candidateEducation, requiredEducation) {
  const candidate = normalized(candidateEducation);
  const required = normalized(requiredEducation);
  const aliases = {
    'high-school': ['high school', 'secondary', 'diploma'],
    associate: ['associate', 'diploma'],
    bachelor: ['bachelor', 'bsc', 'ba', 'computer science'],
    master: ['master', 'msc', 'ma'],
    phd: ['phd', 'doctorate']
  };
  return (aliases[required] || [required]).some((alias) => candidate.includes(alias));
}

function calculateMatchScore(seeker, job) {
  const requiredSkills = toList(job.requiredSkills);
  const seekerSkills = toList(seeker.skills);
  const matchedSkills = requiredSkills.filter((skill) => seekerSkills.some((candidateSkill) => containsMatch(candidateSkill, skill)));
  const skills = requiredSkills.length ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 50;
  const candidateExperience = Number(seeker.yearsOfExperience || 0);
  const minimumExperience = Number(job.minimumExperience || 0);
  const maximumExperience = Number(job.maximumExperience || Number.MAX_SAFE_INTEGER);
  const experience = candidateExperience >= minimumExperience && candidateExperience <= maximumExperience ? 100 : 0;
  const education = !job.requiredEducation || normalized(job.requiredEducation) === 'any' ? 100 : educationMatches(seeker.education, job.requiredEducation) ? 100 : 0;
  const location = !job.location || !seeker.location || containsMatch(seeker.location, job.location) ? 100 : 0;
  const preferences = !seeker.preferredJob || containsMatch(seeker.preferredJob, job.title) || containsMatch(job.title, seeker.preferredJob) ? 100 : 0;
  const breakdown = { skills, experience, education, location, preferences };
  const total = Math.round(Object.entries(SCORE_WEIGHTS).reduce((score, [key, weight]) => score + (breakdown[key] * weight / 100), 0));
  return { total, breakdown, matchedSkills, missingSkills: requiredSkills.filter((skill) => !matchedSkills.includes(skill)) };
}

module.exports = { calculateMatchScore };
