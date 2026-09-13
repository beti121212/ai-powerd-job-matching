const PENDING_KEY = 'pendingApplication';
const APPLICATIONS_KEY = 'mockApplications';

const readStoredObject = (key, fallback = null) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback;
  } catch {
    return fallback;
  }
};

export function getPendingApplication() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setPendingApplication(jobId, job = null, details = {}) {
  const sourcePage = details.sourcePage || `/job-details/${jobId}`;
  const pending = {
    jobId: String(jobId),
    selectedJobId: String(jobId),
    selectedJob: job || null,
    jobTitle: job?.title || '',
    companyName: job?.companyName || job?.company || '',
    action: 'apply',
    intendedAction: 'apply',
    sourcePage,
    returnPath: details.returnPath || sourcePage,
    currentStep: details.currentStep || 'START',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  if (job) localStorage.setItem('pendingApplicationJob', JSON.stringify(job));
  return pending;
}

export function clearPendingApplication() {
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem('pendingApplicationJob');
}

export function getApplicationJobId() {
  return getPendingApplication()?.jobId || '';
}

export function hasCompletedProfile() {
  const profile = readStoredObject('userProfile', {});
  const user = readStoredObject('user', {});
  const name = profile.name || profile.fullName || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.full_name || user.name;
  const email = profile.email || user.email;
  const phone = profile.phone || user.phone;
  const location = profile.location || profile.city || profile.preferredCity;

  return Boolean(
    profile.completionPercentage >= 80 ||
    profile.profileCompleted ||
    user.profileComplete ||
    (name && email && phone && location)
  );
}

export function hasCompletedCv() {
  const resume = readStoredObject('seekerResume', {});
  const user = readStoredObject('user', {});
  return Boolean(resume.fileName || user.cvFileName);
}

export function getApplicationRequirements(overrides = {}) {
  const pending = getPendingApplication();
  const user = readStoredObject('user', {});
  const role = String(user.role || user.userType || '').toLowerCase().replace(/[\s-]+/g, '_');
  const isAuthenticated = overrides.isAuthenticated ?? Boolean(localStorage.getItem('token'));
  const otpVerified = overrides.otpVerified ?? Boolean(user.is_verified || user.isVerified || user.otpVerified);
  const effectiveRole = String(overrides.role || role).toLowerCase().replace(/[\s-]+/g, '_');

  return {
    pending,
    isAuthenticated,
    otpVerified,
    role: effectiveRole,
    hasResume: hasCompletedCv(),
    profileCompleted: hasCompletedProfile(),
  };
}

export function getApplyButtonState(overrides = {}) {
  const requirements = getApplicationRequirements(overrides);
  const seekerRoles = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'];
  const employerRoles = ['employer', 'company', 'recruiter'];

  if (!requirements.isAuthenticated) return { key: 'login', label: 'Login to Apply' };
  if (!requirements.otpVerified) return { key: 'otp', label: 'Verify OTP to Apply' };
  if (!requirements.role) return { key: 'role', label: 'Select Role to Apply' };
  if (employerRoles.includes(requirements.role) || !seekerRoles.includes(requirements.role)) {
    return { key: 'role-blocked', label: 'Job Seeker Account Required' };
  }
  if (!requirements.profileCompleted) return { key: 'profile', label: 'Complete Profile to Apply' };
  return { key: 'apply', label: 'Apply Now' };
}

export function getApplicationState() {
  const requirements = getApplicationRequirements();
  return {
    pendingApplication: requirements.pending,
    isLoggedIn: requirements.isAuthenticated,
    isOtpVerified: requirements.otpVerified,
    role: requirements.role || null,
    cvUploaded: requirements.hasResume,
    profileComplete: requirements.profileCompleted,
    appliedJobs: getMockApplications(),
  };
}

export function getNextApplicationStep(jobId) {
  if (!hasCompletedProfile()) return `/profile-completion?jobId=${encodeURIComponent(jobId)}`;
  return getApplicationSubmitPath(jobId);
}

export function getApplicationSubmitPath(jobId) {
  return `/apply/${encodeURIComponent(jobId)}`;
}

export function getNextOnboardingStep() {
  const user = readStoredObject('user', {});
  const role = String(user.role || user.userType || '').toLowerCase().replace(/[\s-]+/g, '_');
  const seekerRoles = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'];

  if (!user.otpVerified && !user.is_verified && !user.isVerified) return '/verify-otp';
  if (!role || role === 'pending') return '/select-role';
  if (!seekerRoles.includes(role)) return '/';
  if (user.onboardingRoleSelected === false && (!user.role || user.role === 'pending')) return '/select-role';
  if (user.has_cv === false || user.onboarding_step === 'cv_upload' || user.onboardingCvUploaded === false || (!user.onboardingCvUploaded && !hasCompletedCv())) return '/seeker/upload-cv';
  if (user.onboardingProfileCompleted === false || (!user.onboardingProfileCompleted && !hasCompletedProfile())) return '/seeker/personal-info';
  if (!hasCompletedProfile()) return '/seeker/personal-info';
  return '/dashboard';
}

export function continueApplicationFlow(navigate, details = {}) {
  const requirements = getApplicationRequirements(details);
  const pendingJobId = requirements.pending?.jobId || details.jobId;

  if (!pendingJobId) return false;
  if (!requirements.isAuthenticated) {
    navigate('/login', { state: { intent: 'apply', jobId: String(pendingJobId), from: requirements.pending.sourcePage } });
    return 'AUTH_REQUIRED';
  }
  if (!requirements.otpVerified) {
    navigate(`/verify-otp?jobId=${encodeURIComponent(pendingJobId)}`, { state: { intent: 'apply', jobId: String(pendingJobId) } });
    return 'OTP_REQUIRED';
  }
  if (['employer', 'company', 'recruiter'].includes(requirements.role)) {
    navigate('/dashboard', { state: { message: 'Employer accounts cannot submit job seeker applications.' } });
    return 'ROLE_BLOCKED';
  }
  if (!['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'].includes(requirements.role)) {
    navigate(`/select-role?jobId=${encodeURIComponent(pendingJobId)}`);
    return 'ROLE_REQUIRED';
  }
  if (!requirements.hasResume) {
    navigate(`/cv-upload?jobId=${encodeURIComponent(pendingJobId)}`);
    return 'RESUME_REQUIRED';
  }
  if (!requirements.profileCompleted) {
    navigate(`/profile-completion?jobId=${encodeURIComponent(pendingJobId)}`);
    return 'PROFILE_REQUIRED';
  }

  const existing = getApplicationForJob(pendingJobId);
  if (existing) {
    navigate(`/applications/${encodeURIComponent(String(existing.id))}`, { state: { application: existing } });
    return 'ALREADY_APPLIED';
  }
  navigate(getApplicationSubmitPath(pendingJobId));
  return 'READY_TO_APPLY';
}

export function getMockApplications() {
  try {
    const applications = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    return Array.isArray(applications) ? applications : [];
  } catch {
    return [];
  }
}

export function getApplicationForJob(jobId) {
  return getMockApplications().find((application) => String(application.jobId) === String(jobId)) || null;
}

export function beginApplication(jobId, job, navigate, details = {}) {
  const existing = getApplicationForJob(jobId);
  if (existing) {
    navigate(`/applications/${encodeURIComponent(String(existing.id))}`, { state: { application: existing } });
    return 'ALREADY_APPLIED';
  }
  setPendingApplication(jobId, job, details);
  return continueApplicationFlow(navigate, { ...details, jobId });
}

export function saveMockApplication(application) {
  const applications = [application, ...getMockApplications().filter((item) => String(item.jobId) !== String(application.jobId))];
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  clearPendingApplication();
  return applications;
}

export function recordApplication(application) {
  const applications = saveMockApplication(application);
  return applications.find((item) => String(item.id) === String(application.id)) || application;
}
