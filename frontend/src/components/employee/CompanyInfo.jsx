import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import officeImage from '../../pages/images/images3.jpg';
import { useToast } from '../../hooks/useToast.js';
import { scrollToFeedback } from '../../utils/scrollHelper.js';

const ambientZoomStyles = `
  @keyframes ambientSlowZoom {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .animate-ambient-zoom { animation: ambientSlowZoom 24s ease-in-out infinite; }
`;

const hiringVolumeOptions = ['1-5 Hires', '6-20 Hires', '20+ Scaled Hiring', 'Continuous Talent Pool'];
const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '1000+'];
const industryOptions = [
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
const householdIndustryOptions = ['Domestic & Home Services (የቤት ሰራተኛ / ጽዳት)', 'Driver & Transportation (የግል ሹፌር)', 'Childcare & Nanny (ሞግዚት)', 'Home Security & Guard (የቤት ጥበቃ)', 'Private Tutor / Freelance'];
const householdSizeOptions = ['1-2 People', '3-5 People', '6+ People'];
const phoneOperatorOptions = [
  { value: 'Ethio Telecom', label: 'Ethio Telecom (+251)' },
  { value: 'Safaricom', label: 'Safaricom (+251)' },
];
const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-900 placeholder:italic placeholder:text-xs placeholder:text-slate-400 placeholder:font-normal outline-none transition-all hover:bg-slate-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm';
const labelClass = 'mb-2 block text-xs font-semibold text-slate-800 sm:text-sm';

const normalizePhoneNumber = (number = '') => {
  const digits = String(number || '').replace(/\D/g, '').slice(0, 9);
  return digits ? `+251${digits}` : '';
};

export default function CompanyInfo({ user, onComplete }) {
  const { showSuccess, showError } = useToast();
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const slides = [
    {
      badge: '✨ AI-POWERED RECRUITMENT INTELLIGENCE',
      heading: 'Build & Scale Your High-Performing Team.',
      description: 'Connect with verified top-tier professionals matched precisely to your company culture and technical needs.',
    },
    {
      badge: '⚡ 10X FASTER HIRING PIPELINE',
      heading: 'Hire Top 1% AI-Matched Talent Faster.',
      description: 'Eliminate manual CV screening with automated skill scoring and instant interview scheduling.',
    },
  ];
  const initialPhoneDigits = String(currentUser.phone || '').replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '').slice(0, 9);
  const [phoneOperator, setPhoneOperator] = useState('Ethio Telecom');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneDigits);
  const [employerType, setEmployerType] = useState('company');
  const [form, setForm] = useState({
    representative_name: currentUser.full_name || currentUser.name || '',
    employer_type: 'company',
    representative_title: '',
    work_email: currentUser.email || '',
    phone: normalizePhoneNumber(initialPhoneDigits),
    company_name: '',
    industry: industryOptions[0],
    company_size: '11-50',
    location: '',
    tin_number: '',
    trade_license_number: '',
    trade_license_url: '',
    tradeLicenseName: '',
    website: '',
    linkedin: '',
    description: '',
    hiring_volume: hiringVolumeOptions[0],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const validationTimerRef = useRef(null);
  const attachSuccessTimerRef = useRef(null);
  const [attachSuccess, setAttachSuccess] = useState(false);
  const [success, setSuccess] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (!error) return undefined;
    const timer = window.setTimeout(() => setError(''), 10000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => () => {
    if (validationTimerRef.current) window.clearTimeout(validationTimerRef.current);
    if (attachSuccessTimerRef.current) window.clearTimeout(attachSuccessTimerRef.current);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((previous) => (previous + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/employer/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.profile || cancelled) return;
        const profile = data.profile;
        setForm((current) => ({
          ...current,
          representative_name: profile.representative_name || current.representative_name,
          representative_title: profile.representative_title || current.representative_title,
          work_email: profile.work_email || current.work_email,
          phone: profile.phone || profile.phoneNumber || current.phone,
          company_name: profile.company_name || current.company_name,
          industry: profile.industry || current.industry,
          company_size: profile.company_size || current.company_size,
          location: profile.location || current.location,
          tin_number: profile.tin_number || profile.tinNumber || current.tin_number,
          trade_license_number: profile.trade_license_number || profile.tradeLicenseNumber || profile.company_registration_number || current.trade_license_number,
          trade_license_url: profile.trade_license_url || profile.tradeLicenseUrl || profile.licenseDocumentUrl || current.trade_license_url,
          tradeLicenseName: profile.trade_license_url || profile.tradeLicenseUrl || profile.licenseDocumentUrl || current.tradeLicenseName,
          website: profile.website || current.website,
          linkedin: profile.linkedin || current.linkedin,
          description: profile.description || profile.company_summary || current.description,
          hiring_volume: profile.hiring_volume || current.hiring_volume,
          employer_type: profile.employer_type || current.employer_type,
        }));
        if (profile.employer_type === 'individual') setEmployerType('individual');
        const storedPhone = String(profile.phone || '').replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '').slice(0, 9);
        if (storedPhone) setPhoneNumber(storedPhone);
        if (profile.phoneOperator || profile.phone_operator) setPhoneOperator(profile.phoneOperator || profile.phone_operator);
      } catch (loadError) {
        console.warn('Unable to hydrate company profile:', loadError);
      }
    };
    loadProfile();
    return () => { cancelled = true; };
  }, []);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    const errorKey = { representative_name: 'fullName', company_name: 'companyName', location: 'headquarters', tin_number: 'tinNumber', phone: 'phone' }[key] || key;
    setErrors((current) => {
      if (!current[errorKey]) return current;
      const next = { ...current };
      delete next[errorKey];
      return next;
    });
  };

  const changeEmployerType = (type) => {
    setEmployerType(type);
    setForm((current) => ({
      ...current,
      employer_type: type,
      industry: type === 'individual' ? householdIndustryOptions[0] : industryOptions[0],
      company_size: type === 'individual' ? householdSizeOptions[0] : '11-50',
      tin_number: type === 'individual' ? '' : current.tin_number,
      trade_license_url: type === 'individual' ? '' : current.trade_license_url,
      tradeLicenseName: type === 'individual' ? '' : current.tradeLicenseName,
    }));
    setErrors({});
  };

  const triggerValidationAlert = (message, newErrors) => {
    setErrors(newErrors);
    setToast({ show: true, message, type: 'error' });
    if (validationTimerRef.current) window.clearTimeout(validationTimerRef.current);
    validationTimerRef.current = window.setTimeout(() => {
      setErrors({});
      setToast((current) => ({ ...current, show: false }));
      validationTimerRef.current = null;
    }, 10000);
  };

  const attachTradeLicense = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setErrors((current) => ({ ...current, tradeLicense: 'Only PDF documents are accepted.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, tradeLicense: 'Trade License PDF must be 10MB or smaller.' }));
      return;
    }
    setForm((current) => ({ ...current, trade_license_url: file.name, tradeLicenseFile: file, tradeLicenseName: file.name }));
    setErrors((current) => ({ ...current, tradeLicense: '' }));
    setAttachSuccess(true);
    if (attachSuccessTimerRef.current) window.clearTimeout(attachSuccessTimerRef.current);
    attachSuccessTimerRef.current = window.setTimeout(() => {
      setAttachSuccess(false);
      attachSuccessTimerRef.current = null;
    }, 5000);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const newErrors = {};
    const tinNumber = String(form.tin_number || '').trim();
    const tradeLicenseDocument = String(form.trade_license_url || form.tradeLicenseName || '').trim();
    if (!String(form.representative_name || '').trim()) newErrors.fullName = 'Representative Full Name is required.';
    if (!String(form.phone || '').trim()) newErrors.phone = 'Phone number is required.';
    if (!String(form.company_name || '').trim()) newErrors.companyName = employerType === 'individual' ? 'Household / Family Name is required.' : 'Company Name is required.';
    if (employerType === 'company') {
      if (!tinNumber) newErrors.tinNumber = 'TIN number is required.';
      else if (!/^\d{10}$/.test(tinNumber)) newErrors.tinNumber = 'TIN must be exactly 10 numeric digits.';
      if (!tradeLicenseDocument) newErrors.tradeLicense = 'Trade License PDF document is required.';
    }
    if (!String(form.industry || '').trim()) newErrors.industry = 'Industry is required.';
    if (!String(form.location || '').trim()) newErrors.headquarters = 'Headquarters Location is required.';
    if (Object.keys(newErrors).length) {
      triggerValidationAlert('Please complete all highlighted required fields.', newErrors);
      document.getElementById(Object.keys(newErrors)[0])?.focus();
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/employer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          ...form,
          employer_type: employerType,
          employerType,
          fullName: form.representative_name,
          roleRelationship: form.representative_title,
          householdName: form.company_name,
          householdMembers: form.company_size,
          residenceLocation: form.location,
          aboutHousehold: form.description,
          phoneOperator,
          phoneNumber,
          tinNumber: employerType === 'individual' ? null : tinNumber,
          tradeLicenseNumber: employerType === 'individual' ? null : (form.trade_license_number || form.trade_license_url || form.tradeLicenseName),
          trade_license_number: employerType === 'individual' ? null : form.trade_license_number,
          trade_license_url: employerType === 'individual' ? null : (form.trade_license_url || form.tradeLicenseName),
          social_media_urls: { linkedin: form.linkedin },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) throw new Error(data.message || data.error || 'Unable to save company profile.');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        companyInfo: {
          ...form,
          employer_type: employerType,
          tin_number: employerType === 'individual' ? null : tinNumber,
          trade_license_url: employerType === 'individual' ? null : (form.trade_license_url || form.tradeLicenseName),
        },
        isOnboardingComplete: true,
      }));
      setSuccess('Company profile saved successfully!');
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (onComplete) onComplete(form);
      else window.location.assign('/employer/dashboard');
      showSuccess('Company profile saved successfully.');
      scrollToFeedback('top');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save company profile.');
      showError(saveError.message || 'Unable to save company profile.');
      scrollToFeedback('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-50/50 pt-2">
      <style>{ambientZoomStyles}</style>
      <div className="grid min-h-[calc(100vh-88px)] w-full min-w-0 grid-cols-1 lg:grid-cols-12 sm:min-h-[calc(100vh-104px)]">
        <aside className="relative hidden h-[calc(100vh-104px)] min-w-0 overflow-hidden bg-slate-100 lg:sticky lg:top-24 lg:col-span-5 lg:block">
          <img
            src={officeImage}
            alt="Collaborative Office Team"
            className="animate-ambient-zoom absolute inset-0 h-full w-full object-cover object-[30%_top] select-none pointer-events-none lg:object-[center_top]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900/10 to-slate-900/40 lg:to-transparent" />
          <div className="absolute inset-0 flex items-end p-8 lg:p-12">
            <div className="w-full max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    <span>{slides[currentSlideIndex].badge}</span>
                  </div>

                  <h1 className="text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md lg:text-4xl">
                    {slides[currentSlideIndex].heading}
                  </h1>

                  <div className="max-w-lg rounded-2xl border border-white/20 bg-white/10 p-4 text-xs leading-relaxed text-white/90 shadow-xl backdrop-blur-md sm:p-5 sm:text-sm">
                    <p>{slides[currentSlideIndex].description}</p>
                    <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3 text-[11px] font-bold text-emerald-400">
                      <span>98.4% AI Match Accuracy</span>
                      <span>•</span>
                      <span>Verified Profiles</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-center gap-2">
                {slides.map((_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlideIndex ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="h-[calc(100vh-88px)] min-w-0 max-w-full overflow-y-auto overflow-x-hidden bg-white p-6 text-left [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] sm:h-[calc(100vh-104px)] sm:p-10 lg:col-span-7 lg:p-12">
          <div className="w-full max-w-2xl pb-10 sm:pb-14">
            <header className="mb-8">
              <h1 className="mb-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Employer Profile Setup</h1>
              <p className="mb-8 text-xs font-bold text-slate-500 sm:text-sm">Add the essential information candidates need to understand your organization or household.</p>
            </header>

            <div className="mb-8">
              <label className="mb-2 block text-xs font-bold text-slate-700 sm:text-sm">
                I am hiring as: <span className="text-blue-600">*</span>
              </label>
              <div className="grid max-w-md grid-cols-2 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1.5 shadow-inner">
                <button type="button" onClick={() => changeEmployerType('company')} className={`rounded-xl px-5 py-3 text-xs font-bold tracking-tight transition-all duration-200 sm:text-sm ${employerType === 'company' ? 'bg-white text-blue-600 shadow-md shadow-slate-200/60 ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}>
                  Registered Company
                </button>
                <button type="button" onClick={() => changeEmployerType('individual')} className={`rounded-xl px-5 py-3 text-xs font-bold tracking-tight transition-all duration-200 sm:text-sm ${employerType === 'individual' ? 'bg-white text-blue-600 shadow-md shadow-slate-200/60 ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}>
                  Individual / Household
                </button>
              </div>
              <p className="mt-1.5 text-[11px] font-normal text-slate-500">
                {employerType === 'company'
                  ? 'For corporate organizations, enterprises, and registered businesses.'
                  : 'For private employers hiring housekeepers, drivers, nannies, or home security.'}
              </p>
            </div>

            {toast.show && (
              <div className="fixed right-6 top-6 z-[9999] min-w-[320px] max-w-md rounded-2xl border border-red-500 bg-red-600 p-4 text-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2"><p className="text-xs font-semibold sm:text-sm">{toast.message}</p></div>
                  <button type="button" onClick={() => setToast((current) => ({ ...current, show: false }))} className="text-xs font-bold text-white/80 hover:text-white" aria-label="Dismiss validation message">Close</button>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20"><div className="h-full bg-white" style={{ animation: 'toastCountdown 10000ms linear forwards', transformOrigin: 'left center' }} /></div>
              </div>
            )}

            {success && <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700" role="status">{success}</p>}

            <form noValidate onSubmit={handleSave} className="space-y-8">
              <section>
                <div className="mb-4 border-b border-slate-100 pb-1 text-sm font-black text-slate-900">
                  Representative Information
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="fullName" label="Full Name" value={form.representative_name} onChange={(value) => update('representative_name', value)} required error={errors.fullName} />
                  <Field label={employerType === 'individual' ? <><span>Role / Relationship</span> <span className="ml-1 text-xs font-normal italic text-slate-400">(Optional)</span></> : 'Job Title / Position'} value={form.representative_title} onChange={(value) => update('representative_title', value)} placeholder={employerType === 'individual' ? 'e.g. Homeowner, Parent, Consultant' : 'Enter your role at the company (e.g. HR Manager, CEO)'} />
                  <Field label="Work Email" type="email" value={form.work_email} readOnly />
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Phone Number</label>
                    <div className="mt-2 flex w-full items-center gap-3">
                      <select
                        value={phoneOperator}
                        onChange={(event) => {
                          const operator = event.target.value;
                          setPhoneOperator(operator);
                        }}
                        className="h-12 w-40 shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-500 sm:w-44"
                      >
                        {phoneOperatorOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="relative flex min-w-0 flex-1 items-center">
                        <span className="pointer-events-none absolute left-3.5 select-none text-sm font-medium text-slate-400">+251</span>
                        <input
                          id="phone"
                          required
                          type="tel"
                          inputMode="numeric"
                          value={phoneNumber}
                          onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                            setPhoneNumber(digits);
                            update('phone', normalizePhoneNumber(digits));
                          }}
                          maxLength={9}
                          placeholder="912345678"
                          className={`h-12 w-full min-w-0 rounded-xl border bg-white py-3 pl-14 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:italic placeholder:text-xs placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-rose-400 bg-rose-50/15 ring-1 ring-rose-400/20' : 'border-slate-200'}`}
                        />
                      </div>
                    </div>
                    {errors.phone && <InlineError message={errors.phone} />}
                  </div>
                </div>
              </section>

              <section>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="companyName" label={employerType === 'individual' ? 'Household / Family Name *' : 'Company Name'} value={form.company_name} onChange={(value) => update('company_name', value)} required error={errors.companyName} placeholder={employerType === 'individual' ? "e.g. Yabsira's Residence" : ''} />
                  {employerType === 'company' && <Field id="tinNumber" label="Tax Identification Number (TIN) *" value={form.tin_number} onChange={(value) => update('tin_number', value)} placeholder="e.g. 0012345678 (10 digits)" maxLength={10} error={errors.tinNumber} />}
                  {employerType === 'company' && <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-800 sm:text-sm">
                      Trade License / Registration Document (PDF) <span className="font-bold text-rose-500">*</span>
                    </label>
                    {(form.tradeLicenseName || form.trade_license_url) ? (
                      <div className="my-2 flex flex-col gap-3">
                        <div className="brand-soft brand-border relative flex items-center justify-between rounded-2xl border-2 p-6 shadow-sm transition-all">
                          <div className="flex min-w-0 items-center gap-4 pr-6">
                            <div className="brand-soft text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-xs">PDF</div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800 sm:text-base">{form.tradeLicenseName || form.trade_license_url}</p>
                              {attachSuccess && (
                                <p className="text-brand mt-0.5 flex items-center gap-1 text-xs font-bold animate-fade-in">
                                  <span>✓</span>
                                  <span>Your file attached successfully</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <label htmlFor="replace-license-file" className="absolute right-16 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-[0.98] sm:text-sm">
                            <span>↺</span>
                            <span>Replace File</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((current) => ({ ...current, trade_license_url: '', tradeLicenseFile: null, tradeLicenseName: '' }));
                              setAttachSuccess(false);
                              if (attachSuccessTimerRef.current) window.clearTimeout(attachSuccessTimerRef.current);
                            }}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Remove document"
                            aria-label="Remove trade license"
                          >
                            ✕
                          </button>
                          <input id="replace-license-file" type="file" accept=".pdf,application/pdf" className="hidden" style={{ display: 'none' }} onChange={(event) => attachTradeLicense(event.target.files?.[0])} />
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="upload-license-file" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); attachTradeLicense(event.dataTransfer.files?.[0]); }} className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50/70 p-6 transition-all hover:border-blue-400 hover:bg-slate-50 ${errors.tradeLicense ? 'border-rose-400 bg-rose-50/15' : 'border-slate-300'}`}>
                        <input
                          id="upload-license-file"
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(event) => attachTradeLicense(event.target.files?.[0])}
                        />
                        <p className="text-xs font-semibold text-slate-700 sm:text-sm">Click to upload or drag &amp; drop Trade License (PDF)</p>
                        <p className="mt-2 text-[11px] text-slate-400">Please select a valid PDF file (Max 10MB)</p>
                      </label>
                    )}
                    {errors.tradeLicense && <InlineError message={errors.tradeLicense} />}
                  </div>}
                  <Field id="industry" label="Industry" select options={employerType === 'individual' ? householdIndustryOptions : industryOptions} value={form.industry} onChange={(value) => update('industry', value)} required error={errors.industry} />
                  <Field label={employerType === 'individual' ? 'Household Members' : 'Company Size'} select options={employerType === 'individual' ? householdSizeOptions : companySizeOptions} value={form.company_size} onChange={(value) => update('company_size', value)} required />
                  <Field id="headquarters" label={employerType === 'individual' ? 'Residence Location / Neighborhood *' : 'Headquarters Location'} value={form.location} onChange={(value) => update('location', value)} required error={errors.headquarters} placeholder={employerType === 'individual' ? 'e.g. Addis Ababa, Bole' : 'e.g. Addis Ababa, Bole (Behind Edna Mall)'} />
                  {employerType === 'company' && <>
                    <Field label={<><span>Website</span> <span className="ml-1 text-xs font-normal italic text-slate-400">(Optional)</span></>} type="url" value={form.website} onChange={(value) => update('website', value)} placeholder="https://example.com" />
                    <Field label={<><span>Social Media</span> <span className="ml-1 text-xs font-normal italic text-slate-400">(Optional)</span></>} type="url" value={form.linkedin} onChange={(value) => update('linkedin', value)} placeholder="https://linkedin.com/company/..." />
                  </>}
                  <div className="sm:col-span-2">
                    <label className={labelClass}>{employerType === 'individual' ? <><span>About Household & Expectations</span> <span className="ml-1 text-xs font-normal italic text-slate-400">(Optional)</span></> : 'About Company (Optional)'}
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={(event) => update('description', event.target.value)}
                        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-900 placeholder:italic placeholder:text-xs placeholder:text-slate-400 placeholder:font-normal outline-none transition-all hover:bg-slate-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                        placeholder={employerType === 'individual' ? 'Briefly describe your household or specific requirements for candidates...' : 'Briefly describe what your organization does...'}
                      />
                    </label>
                  </div>
                </div>
              </section>

              <button type="submit" disabled={isSaving} className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.99]">
                <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span><span>→</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = 'text', select = false, options = [], required = false, placeholder, maxLength, error, readOnly = false }) {
  const errorClass = error ? 'border border-rose-300 bg-rose-50/10 ring-1 ring-rose-300/20' : '';
  return <label className={labelClass}>{label}{select ? <select id={id} required={required} value={value} onChange={(event) => onChange(event.target.value)} className={`mt-2 ${inputClass} ${errorClass}`}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={id} readOnly={readOnly} required={required} maxLength={maxLength} type={type} value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} className={`mt-2 ${inputClass} ${errorClass}`} />}{error && <InlineError message={error} />}</label>;
}

function InlineError({ message }) {
  return <p className="mt-1 flex animate-fade-in items-center gap-1 text-xs font-medium text-rose-500/85">{message}</p>;
}
