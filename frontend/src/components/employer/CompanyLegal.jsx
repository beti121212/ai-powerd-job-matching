import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CheckCircle2, FileText, Globe2, MapPin, ShieldCheck, Sparkles, UploadCloud, UserRound } from 'lucide-react';
import officeImage from '../../pages/images/images (4).jpg';
import api from '../../services/api';

const hiringVolumeOptions = ['1-5 Hires', '6-20 Hires', '20+ Scaled Hiring', 'Continuous Talent Pool'];
const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const initialData = {
  repFullName: '',
  repPosition: '',
  workEmail: '',
  phone: '',
  companyName: '',
  industry: '',
  companySize: '11-50',
  hqLocation: '',
  website: '',
  linkedin: '',
  companySummary: '',
  hiringVolume: '1-5 Hires',
  tinNumber: '',
  companyRegistrationNumber: '',
  licenseDocumentUrl: '',
  logoUrl: '',
  isVerified: false,
};

const normalizePhoneNumber = (number = '') => {
  const digits = String(number || '').replace(/\D/g, '').slice(0, 9);
  if (!digits) return '';
  return `+251${digits}`;
};

function buildFieldState(company = {}) {
  const socialUrls = company?.social_media_urls && typeof company.social_media_urls === 'object' ? company.social_media_urls : {};

  return {
    ...initialData,
    repFullName: company?.representative_name || '',
    repPosition: company?.representative_title || '',
    workEmail: company?.work_email || '',
    phone: company?.phone || '',
    companyName: company?.company_name || company?.companyName || '',
    industry: company?.industry || '',
    companySize: company?.company_size || company?.companySize || '11-50',
    hqLocation: company?.location || '',
    website: company?.website || '',
    companySummary: company?.company_summary || company?.description || '',
    hiringVolume: company?.hiring_volume || socialUrls?.hiring_volume || '1-5 Hires',
    linkedin: company?.linkedin || socialUrls?.linkedin || '',
    tinNumber: company?.tinNumber || company?.tin_number || '',
    companyRegistrationNumber: company?.company_registration_number || company?.companyRegistrationNumber || '',
    licenseDocumentUrl: company?.licenseDocumentUrl || company?.license_document_url || '',
    logoUrl: company?.logo_url || company?.logoUrl || '',
    isVerified: company?.verification_status === 'verified' || company?.verificationStatus === 'verified' || Boolean(company?.is_verified),
  };
}

export default function CompanyLegal({ company, onSaveSuccess }) {
  const [formData, setFormData] = useState(() => buildFieldState(company));
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [phoneOperator, setPhoneOperator] = useState(() => (String(company?.phone || '').replace(/\D/g, '').startsWith('7') ? 'safaricom' : 'ethio-telecom'));
  const [phoneNumber, setPhoneNumber] = useState(() => String(company?.phone || '').replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '').slice(0, 9));
  const lastSavedSignatureRef = useRef('');

  useEffect(() => {
    setFormData(buildFieldState(company));
  }, [company]);

  useEffect(() => {
    setPhoneOperator((current) => (String(formData.phone || '').replace(/\D/g, '').startsWith('7') ? 'safaricom' : current || 'ethio-telecom'));
    setPhoneNumber(String(formData.phone || '').replace(/\D/g, '').replace(/^251/, '').replace(/^0/, '').slice(0, 9));
  }, [formData.phone]);

  useEffect(() => {
    setFormData((current) => ({ ...current, phone: normalizePhoneNumber(phoneNumber) }));
  }, [phoneNumber]);

  const completion = useMemo(() => {
    const fields = [
      formData.companyName,
      formData.repFullName,
      formData.workEmail,
      formData.industry,
      formData.hqLocation,
      formData.website,
      formData.companySummary,
      formData.logoUrl,
    ];
    const filled = fields.filter((value) => String(value || '').trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const update = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  const buildPayload = (data = formData) => ({
    representative_name: data.repFullName,
    representative_title: data.repPosition,
    work_email: data.workEmail,
    phone: data.phone,
    company_name: data.companyName,
    company_registration_number: data.companyRegistrationNumber,
    industry: data.industry,
    company_size: data.companySize,
    location: data.hqLocation,
    website: data.website,
    logo_url: data.logoUrl,
    linkedin: data.linkedin,
    social_media_urls: { linkedin: data.linkedin, hiring_volume: data.hiringVolume },
    company_summary: data.companySummary,
    description: data.companySummary,
    hiring_volume: data.hiringVolume,
    tinNumber: data.tinNumber,
    licenseDocumentUrl: data.licenseDocumentUrl,
    verificationStatus: data.isVerified ? 'verified' : 'pending',
  });

  const persistProfile = async (data = formData, manual = false) => {
    const payload = buildPayload(data);
    const signature = JSON.stringify(payload);

    if (signature === lastSavedSignatureRef.current && !manual) return;
    lastSavedSignatureRef.current = signature;

    setSaving(true);
    if (manual) setNotice('');

    try {
      const response = await api.put('/employer/profile', payload);
      if (manual) {
        setNotice(response?.data?.message || 'Company profile saved and synced with your workspace.');
      }
      onSaveSuccess?.(response?.data?.profile || payload);
    } catch (error) {
      if (manual) {
        setNotice(error?.response?.data?.message || 'Unable to save company profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const hasBasicValues = Boolean(
      formData.companyName ||
      formData.repFullName ||
      formData.workEmail ||
      formData.industry ||
      formData.hqLocation ||
      formData.website ||
      formData.companySummary
    );

    if (!hasBasicValues) return undefined;

    const timeoutId = setTimeout(() => {
      persistProfile(formData, false);
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [formData.companyName, formData.repFullName, formData.workEmail, formData.industry, formData.hqLocation, formData.website, formData.companySummary, formData.phone, formData.companySize, formData.linkedin, formData.tinNumber, formData.companyRegistrationNumber, formData.logoUrl, formData.hiringVolume]);

  const save = async (event) => {
    event.preventDefault();
    await persistProfile(formData, true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Company & Legal</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Business profile</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          {formData.isVerified ? 'Verified business profile' : 'Verification in progress'}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Representative name" value={formData.repFullName} onChange={(value) => update('repFullName', value)} />
            <Field label="Position / title" value={formData.repPosition} onChange={(value) => update('repPosition', value)} />
            <Field label="Work email" type="email" value={formData.workEmail} onChange={(value) => update('workEmail', value)} />
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Phone number</label>
              <div className="flex gap-2">
                <select value={phoneOperator} onChange={(event) => setPhoneOperator(event.target.value)} className="h-11 min-w-[150px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  <option value="ethio-telecom">Ethio Telecom</option>
                  <option value="safaricom">Safaricom</option>
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="912345678"
                />
              </div>
            </div>

            <Field label="Company name" required value={formData.companyName} onChange={(value) => update('companyName', value)} />
            <Field label="Industry" value={formData.industry} onChange={(value) => update('industry', value)} />
            <Field label="Company size" select value={formData.companySize} onChange={(value) => update('companySize', value)} options={companySizeOptions} />
            <Field label="HQ location" value={formData.hqLocation} onChange={(value) => update('hqLocation', value)} />

            <Field label="Website" type="url" value={formData.website} onChange={(value) => update('website', value)} />
            <Field label="LinkedIn" type="url" value={formData.linkedin} onChange={(value) => update('linkedin', value)} />
            <Field label="TIN / tax ID" value={formData.tinNumber} onChange={(value) => update('tinNumber', value)} />
            <Field label="Registration number" value={formData.companyRegistrationNumber} onChange={(value) => update('companyRegistrationNumber', value)} />

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">About company</label>
              <textarea
                rows={4}
                value={formData.companySummary}
                onChange={(event) => update('companySummary', event.target.value)}
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Describe your mission, products, or hiring focus..."
              />
            </div>

            <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
              <Field label="Hiring volume" select value={formData.hiringVolume} onChange={(value) => update('hiringVolume', value)} options={hiringVolumeOptions} />
              <Field label="License document URL" type="url" value={formData.licenseDocumentUrl} onChange={(value) => update('licenseDocumentUrl', value)} />
            </div>
          </div>

          {notice && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Profile completeness: {completion}%
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save & Update Profile'}
            </button>
          </div>
        </form>

        <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-xl shadow-slate-900/10 lg:col-span-5">
          <div className="relative h-44 w-full overflow-hidden sm:h-48">
            <img src={officeImage} alt="Professional corporate office setting" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100 shadow-lg backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Workspace
            </div>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-lg font-black text-white">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Company logo" className="h-full w-full object-cover" />
                ) : (
                  <span>{String(formData.companyName || 'C').slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-white">{formData.companyName || 'Your Company'}</p>
                <p className="text-sm text-slate-300">{formData.industry || 'Industry not set'}</p>
              </div>
            </div>

            <InfoRow icon={MapPin} label="HQ Location" value={formData.hqLocation || 'Add location'} />
            <InfoRow icon={Globe2} label="Website" value={formData.website || 'Add website'} />

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Registration & Legal</p>
                <p className="truncate text-sm font-semibold text-white">
                  {formData.isVerified ? 'Verified' : 'Pending'}
                  {formData.tinNumber ? ` • TIN ${formData.tinNumber}` : ' • TIN not added'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
                <span>Profile strength</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {formData.isVerified ? 'Verified and ready for hiring' : 'Awaiting verification approval'}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, select = false, options = [] }) {
  const safeValue = value ?? '';
  const classes = 'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </span>
      {select ? (
        <select value={safeValue} onChange={(event) => onChange(event.target.value)} className={classes}>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} value={safeValue} onChange={(event) => onChange(event.target.value)} className={classes} />
      )}
    </label>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

