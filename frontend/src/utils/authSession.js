const ACTIVE_USER_KEY = 'user';
const ACTIVE_TOKEN_KEY = 'token';
const ACCOUNTS_KEY = 'frontendAuthAccounts';

const ADMIN_EMAILS = new Set(['tekebaaweke32@gmail.com']);

export const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (value === 'admin') return 'admin';
  return value;
};

export const resolveUserRole = (user) => {
  const email = String(user?.email || '').trim().toLowerCase();
  if (ADMIN_EMAILS.has(email)) return 'admin';
  return normalizeRole(user?.role || user?.userType);
};

export const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const getStoredAccounts = () => {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
};

export const saveAccount = (user) => {
  if (!user?.email) return;
  const accounts = [user, ...getStoredAccounts().filter((account) => account.email !== user.email)];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const removeStoredAccount = (email) => {
  const accounts = getStoredAccounts().filter((account) => account.email !== email);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const clearUserWorkspace = () => {
  [
    'userProfile',
    'seekerResume',
    'pending_cv_data',
    'candidateProfile',
    'cvUploaded',
    'lastAnalyzedCvId',
    'savedJobs',
    'mockApplications',
    'pendingApplication',
    'pendingApplicationJob',
  ].forEach((key) => localStorage.removeItem(key));
};

export const getUserDestination = (user) => {
  const role = resolveUserRole(user);
  if (user?.isEmailVerified !== true && user?.is_verified !== true && user?.isVerified !== true) return '/verify-otp';
  if (['admin', 'super_admin'].includes(role)) return '/admin/dashboard';
  if (['employer', 'company', 'recruiter'].includes(role)) return '/employer/dashboard';
  if (['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'].includes(role)) {
    if (!user?.is_verified && !user?.isVerified && !user?.otpVerified) return '/verify-otp';
    if (!user?.role && !user?.userType) return '/select-role';

    const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null') || {};
    const hasResume = Boolean(user?.cvFileName || user?.resumeName || localStorage.getItem('seekerResume') || userProfile?.resumeUploaded);
    const hasProfile = Boolean(
      user?.onboardingProfileCompleted ||
      user?.profileComplete ||
      userProfile?.name ||
      userProfile?.fullName ||
      localStorage.getItem('userProfile')
    );

    if (!role || role === 'pending') return '/select-role';
    if (user?.has_cv === false || user?.onboarding_step === 'cv_upload' || user?.onboardingCvUploaded === false || (!user?.onboardingCvUploaded && !hasResume)) return '/seeker/cv-upload';
    if (user?.onboardingProfileCompleted === false || (!user?.onboardingProfileCompleted && !hasProfile)) return '/seeker/personal-info';

    return '/dashboard';
  }
  if (!role) return '/select-role';
  return '/';
};

export const persistSession = ({ token, user }) => {
  if (token) localStorage.setItem(ACTIVE_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    localStorage.setItem('currentUser', JSON.stringify(user));
    saveAccount(user);
  }
};

export const clearActiveSession = () => {
  [ACTIVE_TOKEN_KEY, ACTIVE_USER_KEY, 'currentUser', 'job_matching_auth_user'].forEach((key) => localStorage.removeItem(key));
  ['token', 'user'].forEach((key) => sessionStorage.removeItem(key));
};
