import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, Loader2, User } from 'lucide-react';
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
const industryOptions = ['Technology & Cloud Infrastructure', 'Fintech & Banking', 'AI & Machine Learning', 'E-Commerce & Retail', 'Healthcare & BioTech', 'Telecom & Networks'];
const phoneOperatorOptions = [
  { value: 'Ethio Telecom', label: 'Ethio Telecom (+251)' },
  { value: 'Safaricom', label: 'Safaricom (+251)' },
];
const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all hover:bg-slate-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10';
const labelClass = 'mb-1.5 block text-xs sm:text-sm font-bold text-slate-800';

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
  const [form, setForm] = useState({
    representative_name: currentUser.full_name || currentUser.name || '',
    representative_title: '',
    work_email: currentUser.email || '',
    phone: normalizePhoneNumber(initialPhoneDigits),
    company_name: '',
    industry: industryOptions[0],
    company_size: '11-50',
    location: '',
    website: '',
    linkedin: '',
    description: '',
    hiring_volume: hiringVolumeOptions[0],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

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
          website: profile.website || current.website,
          linkedin: profile.linkedin || current.linkedin,
          description: profile.description || profile.company_summary || current.description,
          hiring_volume: profile.hiring_volume || current.hiring_volume,
        }));
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

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    const requiredFields = {
      representative_name: 'Representative name',
      representative_title: 'Job title',
      work_email: 'Work email',
      phone: 'Phone number',
      company_name: 'Company name',
      industry: 'Industry',
      location: 'HQ location',
    };
    const missingField = Object.entries(requiredFields).find(([field]) => !String(form[field] || '').trim());
    if (missingField) {
      setError(`${missingField[1]} is required.`);
      return;
    }
    if (!/^[97]\d{8}$/.test(phoneNumber)) {
      setError('Phone number must be 9 digits and start with 9 or 7.');
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
        body: JSON.stringify({ ...form, phoneOperator, phoneNumber, social_media_urls: { linkedin: form.linkedin } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to save company profile.');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, companyInfo: form, isOnboardingComplete: true }));
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
                      <span>✓ 98.4% AI Match Accuracy</span>
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
              <h1 className="mb-1.5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Company Profile Setup</h1>
              <p className="mb-8 text-xs font-bold text-slate-500 sm:text-sm">Add the essential information candidates need to understand your organization.</p>
            </header>

            {error && <p className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{error}</p>}
            {success && <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700" role="status"><CheckCircle2 className="h-4 w-4" />{success}</p>}

            <form onSubmit={handleSave} className="space-y-6">
              <section>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-900">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Representative Information</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" value={form.representative_name} onChange={(value) => update('representative_name', value)} required />
                  <Field label="Job Title / Position" value={form.representative_title} onChange={(value) => update('representative_title', value)} required />
                  <Field label="Work Email" type="email" value={form.work_email} onChange={(value) => update('work_email', value)} required />
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
                          className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white pl-14 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-black text-slate-900">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span>Company Identity</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company Name" value={form.company_name} onChange={(value) => update('company_name', value)} required />
                  <Field label="Industry" select options={industryOptions} value={form.industry} onChange={(value) => update('industry', value)} required />
                  <Field label="Company Size" select options={companySizeOptions} value={form.company_size} onChange={(value) => update('company_size', value)} required />
                  <Field label="Headquarters Location" value={form.location} onChange={(value) => update('location', value)} required />
                  <Field label="Target Candidates / Hiring Volume" select options={hiringVolumeOptions} value={form.hiring_volume} onChange={(value) => update('hiring_volume', value)} required />
                  <Field label="Website (Optional)" type="url" value={form.website} onChange={(value) => update('website', value)} placeholder="https://example.com" />
                  <Field label="Social Media Link (Optional)" type="url" value={form.linkedin} onChange={(value) => update('linkedin', value)} placeholder="https://linkedin.com/company/..." />
                  <div className="sm:col-span-2">
                    <label className={labelClass}>About Company <span className="font-medium text-slate-400">(Optional)</span>
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={(event) => update('description', event.target.value)}
                        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all hover:bg-slate-50 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:text-sm"
                        placeholder="Briefly describe what your organization does..."
                      />
                    </label>
                  </div>
                </div>
              </section>

              <button type="submit" disabled={isSaving} className="mt-6 flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.99] sm:text-sm">
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving profile...</> : <><ArrowRight className="h-4 w-4" />Save & Continue</>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', select = false, options = [], required = false, placeholder }) {
  return <label className={labelClass}>{label}{select ? <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className={`mt-2 ${inputClass}`}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`mt-2 ${inputClass}`} />}</label>;
}
