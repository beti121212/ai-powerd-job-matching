import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast.js';
import { notifyProfileUpdated } from '../utils/profileUpdateEvent';
import { scrollToFeedback } from '../utils/scrollHelper.js';
import personalImage from '../pages/images/personal.png';

const fieldClass = 'h-14 w-full rounded-xl border-[1.5px] border-slate-300 bg-slate-50/60 px-4 py-3.5 text-base font-medium leading-relaxed text-slate-900 not-italic placeholder:italic placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:placeholder:opacity-50';
const labelClass = 'mb-3 block text-sm font-bold leading-relaxed text-slate-800';
const jobCategories = [
  'Agriculture',
  'Architecture & Urban Planning',
  'Beauty & Grooming',
  'Brokerage & Case Closing',
  'Chemical & Biomedical Engineering',
  'Construction & Civil Engineering',
  'Creative Art & Design',
  'Customer Service & Care',
  'Documentation & Writing',
  'Event Management & Organization',
  'Food & Drink Preparation / Service',
  'Healthcare',
  'Hospitality & Tourism',
  'Human Resource & Talent Management',
  'Information Technology',
  'Installation & Maintenance',
  'Janitorial & Office Services',
  'Labor & Masonry',
  'Logistics & Supply Chain',
  'Mechanical & Electrical Engineering',
  'Multimedia Content Production',
  'Pharmaceutical',
  'Psychiatry, Psychology & Social Work',
  'Sales & Promotion',
  'Secretarial & Office Management',
  'Security & Safety',
  'Retail & Office Support',
  'Software Design & Development',
  'Transportation & Delivery',
  'Veterinary',
  'Woodwork & Carpentry',
  'Fashion / Clothing & Textile',
  'Media & Entertainment',
  'Environmental, Mining & Energy Engineering',
  'Law & Legal Advocacy',
  'Marketing',
  'Journalism & Communication',
  'Business Administration & Operations',
  'Research Services',
  'Data Science & Analytics',
  'Teaching & Education',
  'Tutoring, Training & Mentorship',
  'Gardening & Landscaping',
  'Horticulture',
  'Livestock & Animal Husbandry',
  'Manufacturing & Production',
  'Purchasing & Procurement',
  'Translation & Transcription',
  'Accounting & Finance',
  'Advisory & Consultancy',
  'Aeronautics & Aerospace',
];
const experienceLevels = ['Entry level', 'Junior', 'Intermediate', 'Senior', 'Expert'];
const workSetups = ['On-site', 'Remote', 'Hybrid', 'Any / Flexible'];
const jobTypes = ['Full-time', 'Part-time', 'Freelance', 'Contractual', 'Volunteer', 'Intern (Paid)', 'Intern (Unpaid)'];
const educationLevels = ['Primary School', 'Middle School', 'High School', 'Certificate', 'Tvet', 'Diploma', 'Bachelor’s Degree', 'Postgraduate Diploma', 'Master’s Degree', 'Phd'];
const excludedProfileSkills = new Set(['javascript', 'python', 'java', 'sql', 'networking', 'communication']);
const invalidJobTitleMessage = 'Please enter a valid, recognizable job title (e.g., Software Developer, Agronomist, Accountant)';

const salaryRangePattern = /^([\d,]+)\s*-\s*([\d,]+)$/;
const formatSalaryRange = (minimum, maximum) => {
  if (minimum && maximum) return `${minimum} - ${maximum}`;
  return minimum || '';
};

const isRecognizableJobTitle = (value) => {
  const title = String(value || '').trim().toLowerCase();
  if (title.length < 3 || !/[a-z]/i.test(title)) return false;
  if (/(.)\1{4,}/.test(title) || /asdfghjkl|qwertyuiop|zxcvbnm/.test(title)) return false;
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(title)) return false;
  const knownTitle = /developer|engineer|nurse|accountant|agronomist|manager|officer|teacher|designer|developer|analyst|administrator|supervisor|architect|consultant|technician|specialist|director|assistant|coordinator|lawyer|doctor|chef|driver|sales|marketing|human resources|hr\b|qa\b|ceo\b|ux\b|ui\b/i.test(title);
  return knownTitle || /[aeiouy]/i.test(title) && title.split(/\s+/).some((word) => word.length >= 3 && /[aeiouy]/i.test(word));
};

const validateProfile = (data) => {
  const errors = {};
  if (!/^[A-Za-z][A-Za-z ]{2,}$/.test(String(data.fullName || '').trim())) errors.fullName = 'Use at least 3 letters and spaces only.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || '').trim())) errors.email = 'Enter a valid email address.';
  if (!/^(?:\+251|0)9\d{8}$|^\+?[1-9]\d{7,14}$/.test(String(data.phone || '').replace(/[\s()-]/g, ''))) errors.phone = 'Enter a valid Ethiopian or international phone number.';
  if (!String(data.city || '').trim()) errors.city = 'City or location is required.';
  if (!isRecognizableJobTitle(data.preferredJob)) errors.desiredPosition = invalidJobTitleMessage;
  if (!jobCategories.includes(data.jobCategory)) errors.jobCategory = 'Select a primary job category.';
  if (!experienceLevels.includes(data.experienceLevel)) errors.experienceLevel = 'Select your experience level.';
  if (!workSetups.includes(data.preferredWorkSetup)) errors.workSetup = 'Select a work setup preference.';
  if (!jobTypes.includes(data.jobType)) errors.jobType = 'Select your job type.';
  const salaryRange = String(data.salaryExpectation || '').trim().match(salaryRangePattern);
  const minimumSalary = salaryRange ? Number(salaryRange[1].replace(/,/g, '')) : 0;
  const maximumSalary = salaryRange ? Number(salaryRange[2].replace(/,/g, '')) : 0;
  if (!salaryRange) errors.expectedSalary = 'Enter a salary range, for example 25,000 - 45,000 ETB per month.';
  else if (minimumSalary < 1000) errors.expectedSalary = 'Minimum salary must be at least 1,000 ETB per month.';
  else if (maximumSalary < minimumSalary) errors.expectedSalary = 'Maximum salary must be greater than or equal to minimum salary.';
  if (String(data.bio || '').length > 500) errors.bio = 'Bio must be 500 characters or fewer.';
  return errors;
};

const FieldError = ({ message }) => message ? <p className="animate-[fieldShake_0.35s_ease-in-out] mt-2 text-xs font-bold text-rose-600" role="alert">{message}</p> : null;

const Profile = ({ userData = {}, onContinue }) => {
  const navigate = useNavigate();
  const { user, setSession } = useAuth();
  const { showSuccess, showError } = useToast();

  // Helper to retrieve persisted profile or user state
  const getInitialState = () => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const pendingCv = JSON.parse(localStorage.getItem('pending_cv_data') || 'null');

      return { savedProfile, savedUser, pendingCv };
    } catch {
      return { savedProfile: null, savedUser: {}, pendingCv: null };
    }
  };

  const { savedProfile, savedUser, pendingCv } = getInitialState();
  const cvName = pendingCv?.fullName || pendingCv?.full_name || pendingCv?.name || [pendingCv?.firstName, pendingCv?.lastName].filter(Boolean).join(' ') || '';
  const cvNameParts = cvName.trim().split(/\s+/).filter(Boolean);
  const cvLocation = String(pendingCv?.location || '').split(',').map((part) => part.trim()).filter(Boolean);
  const cvSkills = Array.isArray(pendingCv?.skills) ? pendingCv.skills.map((skill) => typeof skill === 'string' ? skill : skill?.skill_name).filter(Boolean).filter((skill) => !excludedProfileSkills.has(skill.trim().toLowerCase())) : [];
  const cvEducation = Array.isArray(pendingCv?.education) ? pendingCv.education.map((item, index) => ({ id: item.id || `cv-education-${index}`, university: item.school_name || item.institution || '', degree: item.degree || '', department: item.field_of_study || '', graduationYear: item.graduationYear || (item.end_date ? String(item.end_date).slice(0, 4) : '') })) : [];
  const cvExperience = Array.isArray(pendingCv?.experience) ? pendingCv.experience.map((item, index) => ({ id: item.id || `cv-experience-${index}`, company: item.company_name || item.company || '', position: item.job_title || item.role || '', startDate: item.start_date ? String(item.start_date).slice(0, 7) : '', endDate: item.end_date ? String(item.end_date).slice(0, 7) : (item.duration || ''), responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities.join('\n') : item.description || '' })) : [];

  // Dynamic Lists State
  const [educationList, setEducationList] = useState(
    (pendingCv ? cvEducation : savedProfile?.education) || []
  );

  const [experienceList, setExperienceList] = useState(
    (pendingCv ? cvExperience : savedProfile?.experience) || []
  );

  const [skills, setSkills] = useState(pendingCv ? cvSkills : (savedProfile?.skills || []).filter((skill) => !excludedProfileSkills.has(String(skill).trim().toLowerCase())));
  const [newSkill, setNewSkill] = useState('');

  const [languages, setLanguages] = useState(savedProfile?.languages || []);
  const [newLang, setNewLang] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');

  // Personal Profile Data State
  const [profileData, setProfileData] = useState({
    fullName: pendingCv ? cvName : (savedProfile?.fullName || userData?.fullName || savedUser?.full_name || ''),
    firstName: pendingCv ? pendingCv.firstName || pendingCv.first_name || cvNameParts[0] || '' : (savedProfile?.firstName || userData?.firstName || savedUser?.full_name?.split(' ')[0] || ''),
    lastName: pendingCv ? pendingCv.lastName || pendingCv.last_name || cvNameParts.slice(1).join(' ') : (savedProfile?.lastName || userData?.lastName || savedUser?.full_name?.split(' ').slice(1).join(' ') || ''),
    email: pendingCv?.email || savedProfile?.email || userData?.email || savedUser?.email || '',
    phone: pendingCv?.phone || savedProfile?.phone || savedUser?.phone || '',
    dob: savedProfile?.dob || '',
    gender: savedProfile?.gender || '',
    country: pendingCv ? cvLocation[1] || '' : (savedProfile?.country || 'Ethiopia'),
    city: pendingCv ? cvLocation[0] || '' : (savedProfile?.city || ''),
    github: savedProfile?.github || '',
    linkedin: savedProfile?.linkedin || '',
    portfolio: savedProfile?.portfolio || '',
    jobCategory: savedProfile?.jobCategory || '',
    preferredJob: savedProfile?.preferredJob || userData?.preferredJob || '',
    employmentType: savedProfile?.employmentType || '',
    jobType: savedProfile?.jobType || savedProfile?.preferred_job_type || savedProfile?.employmentType || '',
    salaryExpectation: formatSalaryRange(savedProfile?.salaryExpectation || userData?.salaryExpectation || '', savedProfile?.salaryExpectationMax || savedProfile?.expected_salary_max || userData?.salaryExpectationMax || ''),
    salaryExpectationMax: savedProfile?.salaryExpectationMax || savedProfile?.expected_salary_max || userData?.salaryExpectationMax || '',
    preferredCity: savedProfile?.preferredCity || '',
    preferredWorkSetup: savedProfile?.preferredWorkSetup || ''
    ,experienceLevel: savedProfile?.experienceLevel || '',
    educationLevel: savedProfile?.educationLevel || '',
    bio: savedProfile?.bio || ''
  });

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    fetch('/api/seeker/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!active || !result?.profile) return;
        const saved = result.profile;
        const parseJson = (value, fallback) => {
          if (Array.isArray(value)) return value;
          try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
        };
        setProfileData((current) => ({
          ...current,
          fullName: saved.full_name || current.fullName,
          email: saved.email || current.email,
          phone: saved.phone || current.phone,
          preferredJob: saved.headline || current.preferredJob,
          jobCategory: saved.job_category || current.jobCategory,
          experienceLevel: saved.experience_level || current.experienceLevel,
          educationLevel: saved.education_level || current.educationLevel,
          jobType: saved.job_type || current.jobType,
          salaryExpectation: formatSalaryRange(saved.expected_salary ?? saved.salary_expectation_min ?? current.salaryExpectation, saved.expected_salary_max ?? current.salaryExpectationMax),
          salaryExpectationMax: saved.expected_salary_max ?? current.salaryExpectationMax,
          preferredWorkSetup: saved.work_setup || saved.preferred_work_mode || current.preferredWorkSetup,
          city: saved.location || saved.city || current.city,
          bio: saved.bio || current.bio,
        }));
        const savedEducation = parseJson(saved.education, result.education);
        const savedExperience = parseJson(saved.experience, result.experience);
        const savedSkills = parseJson(saved.skills, result.skills);
        const savedLanguages = parseJson(saved.languages, result.languages);
        if (Array.isArray(savedEducation)) setEducationList(savedEducation);
        if (Array.isArray(savedExperience)) setExperienceList(savedExperience);
        if (Array.isArray(savedSkills)) setSkills(savedSkills);
        if (Array.isArray(savedLanguages)) setLanguages(savedLanguages);
        localStorage.setItem('userProfile', JSON.stringify({ ...JSON.parse(localStorage.getItem('userProfile') || '{}'), ...saved }));
      })
      .catch(() => {})
      .finally(() => {});
    return () => { active = false; };
  }, []);

  const updateProfileField = (field, value) => {
    setProfileData((current) => ({ ...current, [field]: value }));
    const errorFields = {
      preferredJob: 'desiredPosition',
      preferredWorkSetup: 'workSetup',
      salaryExpectation: 'expectedSalary',
      salaryExpectationMax: 'expectedSalaryMax',
      jobType: 'jobType',
    };
    const errorField = errorFields[field] || field;
    setErrors((current) => ({ ...current, [field]: undefined, [errorField]: undefined }));
  };

  const validateField = (field) => {
    const nextErrors = validateProfile(profileData);
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  };
  const inputClass = (field) => `${fieldClass} ${errors[field] ? 'has-error animate-[fieldShake_0.35s_ease-in-out] border-rose-500 bg-rose-50/40 ring-4 ring-rose-400/60 focus:border-rose-600 focus:ring-rose-500/40' : ''}`;
  const focusFirstInvalid = (validationErrors) => {
    const firstField = Object.keys(validationErrors)[0];
    if (!firstField) return;
    window.requestAnimationFrame(() => {
      const element = document.querySelector('#error-banner, [role="alert"], .text-red-500, .border-red-500') || document.querySelector(`[data-profile-field="${firstField}"]`) || document.querySelector('.has-error, [aria-invalid="true"]') || document.querySelector('[data-profile-field="fullName"]');
      if (!element) return;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof element.focus === 'function') element.focus({ preventScroll: true });
    });
  };
  const scrollToSuccess = () => {
    window.setTimeout(() => {
      const scrollContainer = document.querySelector('main, .overflow-y-auto, #dashboard-content') || document.documentElement || document.body;
      if (typeof scrollContainer.scrollTo === 'function') scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const successBanner = document.getElementById('success-banner') || document.querySelector('[role="status"]');
      if (successBanner) successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!Object.keys(errors).some((key) => errors[key])) return undefined;
    const timer = window.setTimeout(() => setErrors({}), 5000);
    return () => window.clearTimeout(timer);
  }, [errors]);

  // Calculate profile completion dynamically
  const completionPercentage = useMemo(() => {
    const fields = [
      profileData.fullName,
      profileData.email,
      profileData.phone,
      profileData.city,
      profileData.preferredJob,
      profileData.jobCategory,
      profileData.experienceLevel,
      profileData.preferredWorkSetup,
      profileData.jobType,
      profileData.educationLevel,
      profileData.salaryExpectation,
      profileData.salaryExpectationMax,
      educationList.length > 0,
      experienceList.length > 0,
      skills.length > 0,
      languages.length > 0
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profileData, educationList, experienceList, languages]);

  // Handlers for Experience
  const handleAddExperience = () => {
    setExperienceList([
      ...experienceList,
      { id: Date.now(), company: '', position: '', startDate: '', endDate: '', responsibilities: '' }
    ]);
  };

  const handleExperienceChange = (id, field, value) => {
    setExperienceList(experienceList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveExperience = (id) => {
    setExperienceList(experienceList.filter((item) => item.id !== id));
  };

  // Handlers for Skills & Languages
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    setLanguages(languages.filter((lang) => lang !== langToRemove));
  };

  // Profile Save Handler
  const handleSaveProfile = async (redirect = false) => {
    const validationErrors = validateProfile(profileData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setToast(validationErrors.desiredPosition || 'Please complete the required profile fields.');
      focusFirstInvalid(validationErrors);
      showError('⚠️ Please correct the highlighted errors before saving.');
      scrollToFeedback('error');
      return { success: false, errors: validationErrors };
    }
    if (isSaving || isNavigating) return;
    setIsSaving(true);
    setIsNavigating(redirect);
    setErrors({});
    setToast('');
    const fullProfile = {
      ...profileData,
      userId: user?.id || user?.userId || user?.user_id || JSON.parse(localStorage.getItem('user') || '{}')?.id || JSON.parse(localStorage.getItem('user') || '{}')?.userId,
      fullName: String(profileData.fullName || '').trim(),
      expectedSalary: Number(String(profileData.salaryExpectation || '').match(salaryRangePattern)?.[1]?.replace(/,/g, '')) || null,
      expectedSalaryMax: Number(String(profileData.salaryExpectation || '').match(salaryRangePattern)?.[2]?.replace(/,/g, '')) || null,
      desiredPosition: String(profileData.preferredJob || '').trim(),
      workSetup: profileData.preferredWorkSetup || '',
      jobType: profileData.jobType || '',
      employmentType: profileData.jobType || '',
      education: educationList,
      experience: experienceList,
      skills,
      languages,
      completionPercentage
    };
    
    const persistLocally = () => {
      localStorage.setItem('userProfile', JSON.stringify(fullProfile));
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...user, full_name: fullProfile.fullName, email: fullProfile.email, phone: fullProfile.phone, onboardingProfileCompleted: true, profileComplete: true, profileCompleted: true, onboardingCvUploaded: true, cvSkipped: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      const token = localStorage.getItem('token');
      if (user || token) setSession({ token, user: updatedUser });
      notifyProfileUpdated();
    };

    const saveStartedAt = Date.now();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/seeker/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(fullProfile),
      });
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, 600 - (Date.now() - saveStartedAt))));
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        const apiError = new Error(result.error || result.message || 'Profile API unavailable');
        apiError.code = result.code;
        throw apiError;
      }
      persistLocally();
      setIsSaved(true);
      showSuccess('✓ Your profile has been saved successfully!');
      scrollToFeedback('top');
      scrollToSuccess();
    } catch (error) {
      persistLocally();
      const errorMessage = error?.message || 'Unable to save your profile to the database. Please try again.';
      const saveError = { form: errorMessage };
      setErrors(saveError);
      setToast(errorMessage);
      focusFirstInvalid(saveError);
      setIsSaved(false);
      setIsNavigating(false);
      showError('⚠️ Please correct the highlighted errors before saving.');
      scrollToFeedback('error');
      return { success: false, localOnly: true, data: fullProfile };
    } finally {
      setIsSaving(false);
    }

    if (!redirect) {
      setIsNavigating(false);
      window.setTimeout(() => setIsSaved(false), 3000);
    }
    if (redirect) {
      window.setTimeout(() => {
        if (onContinue) {
          onContinue(fullProfile);
        } else {
          navigate('/ai-career-matches', { replace: true, state: { profile: fullProfile, openMatch: true } });
        }
      }, 0);
    }
    return { success: true, data: fullProfile };
  };

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-100/80 text-slate-900 dark:bg-slate-950 lg:flex lg:h-screen lg:overflow-hidden">
      {isSaved && <div id="floating-success-toast" className="fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-2xl animate-bounce"><CheckCircle2 className="h-5 w-5 text-white" /><span>Your profile has been saved successfully!</span></div>}
      <section className="relative flex min-h-[26rem] w-full items-center overflow-hidden bg-slate-100 px-5 py-10 dark:bg-slate-950 sm:px-10 lg:h-screen lg:min-h-0 lg:w-[45%] lg:px-12 lg:py-16">
        <div className="relative mx-auto flex w-full max-w-lg flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-8 max-w-md">
            <span className="mb-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
              Your next opportunity
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Build a profile that works for you.
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600 sm:text-base dark:text-slate-300">
              Add your experience and preferences so we can find roles that fit your strengths.
            </p>
          </div>
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200/50 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30 sm:p-8 lg:min-h-[25rem]">
            <img src={personalImage} alt="Personal profile setup" className="h-auto max-h-[20rem] w-full max-w-md object-contain drop-shadow-lg sm:max-h-[24rem]" />
          </div>
        </div>
      </section>

      <section className="h-auto min-w-0 w-full overflow-x-hidden overflow-y-auto bg-[#f8fbfd] lg:h-screen lg:w-[55%]">
      <div className="information-page profile-readable mx-auto min-w-0 max-w-3xl space-y-7 overflow-x-hidden px-5 py-8 pb-12 leading-relaxed sm:px-8 lg:px-10">
      <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Personal Profile Setup</h1>
      {toast && <div role="alert" className="animate-[alertPulse_0.45s_ease-out] sticky top-3 z-10 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-sm"><span>{toast}</span><button type="button" onClick={() => setToast('')} className="min-h-0 rounded-md p-1 text-amber-700 hover:bg-amber-100" aria-label="Dismiss alert"><X className="h-4 w-4" /></button></div>}
      {isSaved && <div id="success-banner" role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" />your profile saved succussfuly</div>}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-800"><span>Profile Completion</span><span className="text-blue-700">{completionPercentage}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${completionPercentage}%` }} /></div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-3 border-slate-200">Personal Information</h3>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input data-profile-field="fullName" aria-invalid={Boolean(errors.fullName)} type="text" placeholder="Your full name" value={profileData.fullName} onChange={(e) => updateProfileField('fullName', e.target.value)} onBlur={() => validateField('fullName')} className={inputClass('fullName')} />
            <FieldError message={errors.fullName} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input data-profile-field="email"
              type="email" aria-invalid={Boolean(errors.email)}
              placeholder="you@example.com"
              value={profileData.email} 
              onChange={(e) => updateProfileField('email', e.target.value)}
              className={inputClass('email')}
              onBlur={() => validateField('email')}
            />
            <FieldError message={errors.email} />
          </div>

          <div>
            <label className={labelClass}>Phone Number</label>
            <div>
              <input data-profile-field="phone"
                type="text" aria-invalid={Boolean(errors.phone)}
                placeholder="+251 9XX XXX XXX"
                value={profileData.phone} 
                onChange={(e) => updateProfileField('phone', e.target.value)}
                className={inputClass('phone')}
                onBlur={() => validateField('phone')}
              />
            </div>
            <FieldError message={errors.phone} />
          </div>

          <div className="hidden">
            <label className={labelClass}>Date of Birth <span className="italic font-normal text-slate-500">(Optional)</span></label>
            <input 
              type="date" 
              value={profileData.dob} 
              onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div className="hidden">
            <label className={labelClass}>Gender <span className="italic font-normal text-slate-500">(Optional)</span></label>
            <select 
              value={profileData.gender} 
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              className={`${fieldClass} !bg-white ${!profileData.gender ? 'italic text-slate-400' : ''}`}
            >
              <option value="" disabled className="italic">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>City / Location</label>
            <input data-profile-field="city" aria-invalid={Boolean(errors.city)} type="text" placeholder="Addis Ababa, Dire Dawa, Hawassa, or Remote" value={profileData.city} onChange={(e) => updateProfileField('city', e.target.value)} onBlur={() => validateField('city')} className={inputClass('city')} />
            <FieldError message={errors.city} />
          </div>
        </div>

      </div>

      <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-lg font-bold text-slate-800">Job Preferences</h3>
          <p className="mt-1 text-sm text-slate-500">These details help us calculate accurate job matches.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className={labelClass}>Target Role / Desired Position</label>
            <input data-profile-field="desiredPosition" aria-invalid={Boolean(errors.desiredPosition)} type="text" placeholder="e.g. Agronomist, Nurse, Accountant, Teacher, or Developer" value={profileData.preferredJob} onChange={(e) => updateProfileField('preferredJob', e.target.value)} onBlur={() => validateField('desiredPosition')} className={inputClass('desiredPosition')} />
            <FieldError message={errors.desiredPosition} />
          </div>
          <div>
            <label className={labelClass}>Primary Job Category</label>
            <select data-profile-field="jobCategory" aria-invalid={Boolean(errors.jobCategory)} value={profileData.jobCategory} onChange={(e) => updateProfileField('jobCategory', e.target.value)} onBlur={() => validateField('jobCategory')} className={`${inputClass('jobCategory')} profile-job-preference-select !text-sm !font-normal ${!profileData.jobCategory ? '!italic !text-slate-400' : ''}`}>
              <option value="" disabled hidden>Select a primary job category</option>
              {jobCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <FieldError message={errors.jobCategory} />
          </div>
          <div>
            <label className={labelClass}>Experience Level</label>
            <select data-profile-field="experienceLevel" aria-invalid={Boolean(errors.experienceLevel)} value={profileData.experienceLevel} onChange={(e) => updateProfileField('experienceLevel', e.target.value)} onBlur={() => validateField('experienceLevel')} className={`${inputClass('experienceLevel')} profile-job-preference-select !text-sm !font-normal ${!profileData.experienceLevel ? '!italic !text-slate-400' : ''}`}>
              <option value="" disabled hidden>Select experience level</option>
              {experienceLevels.map((level) => <option key={level} value={level}>{level === 'Entry level' ? 'Entry level (0-1 yrs)' : level === 'Junior' ? 'Junior (1-3 yrs)' : level === 'Intermediate' ? 'Intermediate (3-5 yrs)' : level === 'Senior' ? 'Senior (5+ yrs)' : 'Expert (8+ yrs)'}</option>)}
            </select>
            <FieldError message={errors.experienceLevel} />
          </div>
          <div>
            <label className={labelClass}>Work Setup Preference</label>
            <select data-profile-field="workSetup" aria-invalid={Boolean(errors.workSetup)} value={profileData.preferredWorkSetup} onChange={(e) => updateProfileField('preferredWorkSetup', e.target.value)} onBlur={() => validateField('workSetup')} className={`${inputClass('workSetup')} profile-job-preference-select !text-sm !font-normal ${!profileData.preferredWorkSetup ? '!italic !text-slate-400' : ''}`}>
              <option value="" disabled hidden>Select work setup</option>
              {workSetups.map((setup) => <option key={setup} value={setup}>{setup}</option>)}
            </select>
            <FieldError message={errors.workSetup} />
          </div>
          <div>
            <label className={labelClass}>Expected Salary (ETB/month)</label>
            <input data-profile-field="expectedSalary" aria-invalid={Boolean(errors.expectedSalary)} type="text" inputMode="numeric" placeholder="Enter a range, e.g. 25,000 - 45,000 ETB/month" value={profileData.salaryExpectation} onChange={(e) => updateProfileField('salaryExpectation', e.target.value)} onBlur={() => validateField('expectedSalary')} className={inputClass('expectedSalary')} />
            <FieldError message={errors.expectedSalary} />
          </div>
          <div>
            <label className={labelClass}>Education Level</label>
            <select value={profileData.educationLevel} onChange={(e) => updateProfileField('educationLevel', e.target.value)} className={`${fieldClass} profile-job-preference-select !text-sm !font-normal ${!profileData.educationLevel ? '!italic !text-slate-400' : ''}`}>
              <option value="" disabled hidden>Select education level</option>
              {educationLevels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 pt-5">
            <label className={labelClass}>Skills <span className="italic font-normal text-slate-500">(Optional)</span></label>
            <div className="mb-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <input type="text" placeholder="Add a skill (e.g. React, Accounting)" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} className={`${fieldClass} flex-1`} />
            </div>
          </div>

          <div className="md:col-span-2 pt-5">
            <label className={labelClass}>Languages <span className="italic font-normal text-slate-500">(Optional)</span></label>
            <div className="mb-3 flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span key={lang} className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  {lang}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              <input type="text" placeholder="Add a language (e.g. Amharic, English)" value={newLang} onChange={(e) => setNewLang(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())} className={`${fieldClass} flex-1`} />
            </div>
          </div>

          <div className="md:col-span-2 pt-5">
            <label className={labelClass}>Job Type / Employment Type * :</label>
            <select
              data-profile-field="jobType"
              aria-invalid={Boolean(errors.jobType)}
              value={profileData.jobType}
              onChange={(e) => updateProfileField('jobType', e.target.value)}
              onBlur={() => validateField('jobType')}
              className={`${inputClass('jobType')} ${!profileData.jobType ? '!italic !text-slate-400' : ''}`}
            >
              <option value="" disabled hidden>Select job type</option>
              {jobTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <FieldError message={errors.jobType} />
          </div>

          <div className="md:col-span-2 pt-5">
            <label className={labelClass}>Professional Bio <span className="italic font-normal text-slate-500">(Optional, max 500 characters)</span></label>
            <textarea rows={4} maxLength={500} placeholder="Briefly describe your professional strengths..." value={profileData.bio} onChange={(e) => updateProfileField('bio', e.target.value)} onBlur={() => validateField('bio')} className={`${inputClass('bio')} h-auto`} />
            <div className="mt-1 flex justify-between"><FieldError message={errors.bio} /><span className="text-xs text-slate-400">{profileData.bio.length}/500</span></div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end border-t border-slate-200/80 pt-8">
          <button
            type="button"
            disabled={isSaving || isNavigating}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleSaveProfile(true);
            }}
            className="primary-button flex items-center gap-2 rounded-xl px-7 py-4 text-base shadow-lg shadow-[#56a2d8]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f0f7fc] hover:text-[#2b73a4] hover:shadow-2xl hover:shadow-[#56a2d8]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
            <span>{isNavigating ? 'Analyzing & Matching Jobs...' : isSaving ? 'Saving Profile...' : 'Save & Continue'}</span>
          </button>
        </div>
      </div>


      {/* Portfolio Links */}
      <div className="hidden bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 border-slate-200">Portfolio &amp; Links <span className="italic font-normal text-slate-500">(Optional)</span></h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <input 
              type="url" 
              placeholder="GitHub Profile" 
              value={profileData.github} 
              onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <input 
              type="url" 
              placeholder="LinkedIn Profile" 
              value={profileData.linkedin} 
              onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <input 
              type="url" 
              placeholder="Portfolio Website" 
              value={profileData.portfolio} 
              onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="hidden space-y-6 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-8 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 border-slate-200">Job Preferences <span className="italic font-normal text-slate-500">(Optional)</span></h3>

        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
          <div>
            <label className={labelClass}>Desired Position</label>
            <input 
              type="text" 
              placeholder="e.g. Frontend Developer"
              value={profileData.preferredJob} 
              onChange={(e) => setProfileData({ ...profileData, preferredJob: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Job Category</label>
            <input 
              type="text" 
              placeholder="e.g. Software Engineering"
              value={profileData.jobCategory} 
              onChange={(e) => setProfileData({ ...profileData, jobCategory: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Employment Type</label>
            <select 
              value={profileData.employmentType} 
              onChange={(e) => setProfileData({ ...profileData, employmentType: e.target.value })}
              className={`${fieldClass} !bg-white ${!profileData.employmentType ? 'italic text-slate-400' : ''}`}
            >
              <option value="" disabled className="italic">Select employment type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Salary Expectation</label>
            <input 
              type="text" 
              placeholder="e.g. 25,000 ETB / month"
              value={profileData.salaryExpectation} 
              onChange={(e) => setProfileData({ ...profileData, salaryExpectation: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Preferred Location (City)</label>
            <input 
              type="text" 
              placeholder="e.g. Addis Ababa or Remote"
              value={profileData.preferredCity} 
              onChange={(e) => setProfileData({ ...profileData, preferredCity: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div>
            <label className={labelClass}>Work Setup</label>
            <select 
              value={profileData.preferredWorkSetup} 
              onChange={(e) => setProfileData({ ...profileData, preferredWorkSetup: e.target.value })}
              className={`${fieldClass} !bg-white ${!profileData.preferredWorkSetup ? '!italic !text-slate-400' : ''}`}
            >
              <option value="" disabled hidden className="italic">Select work setup</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>
      </div>
      </section>
    </div>
  );
};

export default Profile;