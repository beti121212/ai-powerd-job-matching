import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Save, Upload } from 'lucide-react';
import officeImage from '../../pages/images/images3.jpg';

const getStoredCompany = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').companyInfo || null;
  } catch {
    return null;
  }
};

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    company_name: '',
    logo_url: '',
    short_description: '',
    description: '',
    mission: '',
    vision: '',
    services: '',
    culture: '',
    benefits: '',
    founded_year: '',
    tin_number: '',
    license_number: '',
    license_document_url: '',
    license_document_name: '',
    license_issue_date: '',
    license_expiry_date: '',
    verification_status: 'Pending',
    linkedin: '',
    facebook: '',
    x: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const savedCompany = getStoredCompany();
      try {
        const source = savedCompany;
        if (!source) throw new Error('No company profile found');
        let socials = source.social_media_urls || {};
        if (typeof socials === 'string') {
          try {
            socials = JSON.parse(socials || '{}');
          } catch {
            socials = {};
          }
        }
        setProfile((current) => ({
          ...current,
          company_name: source.company_name || '',
          logo_url: source.logo_url || '',
          short_description: source.short_description || '',
          description: source.description || '',
          mission: source.mission || '',
          vision: source.vision || '',
          services: source.services || '',
          culture: source.culture || '',
          benefits: source.benefits || '',
          founded_year: source.founded_year || '',
          tin_number: source.tin_number || '',
          license_number: source.license_number || '',
          license_document_url: source.license_document_url || '',
          license_document_name: source.license_document_name || '',
          license_issue_date: source.license_issue_date || '',
          license_expiry_date: source.license_expiry_date || '',
          verification_status: source.verification_status ? source.verification_status.charAt(0).toUpperCase() + source.verification_status.slice(1) : 'Pending',
          linkedin: socials.linkedin || '',
          facebook: socials.facebook || '',
          x: socials.x || ''
        }));
      } catch {
        if (!savedCompany) setError('Unable to load your company profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const completionFields = ['company_name', 'logo_url', 'short_description', 'description', 'mission', 'vision', 'services', 'culture', 'benefits', 'founded_year', 'tin_number', 'license_number', 'license_document_url', 'license_issue_date', 'license_expiry_date', 'linkedin', 'facebook', 'x'];
  const completedFields = completionFields.filter((field) => String(profile[field] || '').trim()).length;
  const completion = Math.round((completedFields / completionFields.length) * 100);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const company = getStoredCompany() || {};
      const updatedCompany = {
          company_name: profile.company_name || company.company_name,
          industry: company.industry || '',
          company_type: company.company_type || 'Private',
          company_size: company.company_size || '11-50',
          location: company.location || '',
          country: company.country || '',
          city: company.city || '',
          website: company.website || '',
          logo_url: profile.logo_url || company.logo_url,
          description: profile.description,
          founded_year: profile.founded_year || null,
          social_media_urls: JSON.stringify({ linkedin: profile.linkedin, facebook: profile.facebook, x: profile.x }),
          short_description: profile.short_description,
          mission: profile.mission,
          vision: profile.vision,
          services: profile.services,
          culture: profile.culture,
          benefits: profile.benefits,
          tin_number: profile.tin_number,
          license_number: profile.license_number,
          license_document_url: profile.license_document_url,
          license_document_name: profile.license_document_name,
          license_issue_date: profile.license_issue_date,
          license_expiry_date: profile.license_expiry_date,
          verification_status: profile.verification_status
      };
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, companyInfo: updatedCompany }));
      navigate('/employer/dashboard');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-3xl p-8 text-center text-slate-500">Loading company profile...</div>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-8 sm:px-6">
      <img
        src={officeImage}
        alt="Office Collaboration"
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-tr from-slate-950/60 via-blue-950/50 to-slate-900/60 backdrop-blur-[2px]" />

      <div className="mx-auto my-10 w-full max-w-3xl rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl shadow-blue-950/40 ring-1 ring-white/20 backdrop-blur-xl sm:max-w-4xl sm:p-12">
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Employer Profile Setup</p>
              <h1 className="text-4xl font-bold text-slate-900">Complete Your Company Profile</h1>
              <p className="mt-2 text-base text-slate-500">Add detailed information candidates should know about your company.</p>
            </div>
          </div>
        </div>
        {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="flex items-center justify-between text-base font-semibold"><span>Profile completion</span><span className="text-blue-600">{completion}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${completion}%` }} /></div>
        <section>
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Company Details</h2>
          <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-base font-semibold">Company Name<input required value={profile.company_name} onChange={(event) => setProfile({ ...profile, company_name: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label>
          <label className="block text-base font-semibold">Company Logo URL<input type="url" value={profile.logo_url} onChange={(event) => setProfile({ ...profile, logo_url: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label>
          </div>
        </section>
        <label className="block text-base font-semibold">Short Company Description<textarea value={profile.short_description} onChange={(event) => setProfile({ ...profile, short_description: event.target.value })} rows="3" className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label>
        {[
          ['description', 'About Company'], ['mission', 'Mission'], ['vision', 'Vision'],
          ['services', 'Services / Products'], ['culture', 'Company Culture'], ['benefits', 'Benefits']
        ].map(([field, label]) => <label key={field} className="block text-base font-semibold">{label}<textarea value={profile[field]} onChange={(event) => setProfile({ ...profile, [field]: event.target.value })} rows="4" className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label>)}
        <div className="grid gap-5 md:grid-cols-2"><label className="block text-base font-semibold">Founded Year<input type="number" min="1800" max="2100" value={profile.founded_year} onChange={(event) => setProfile({ ...profile, founded_year: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label><label className="block text-base font-semibold">TIN Number<input type="text" value={profile.tin_number} onChange={(event) => setProfile({ ...profile, tin_number: event.target.value })} placeholder="Enter company TIN number" className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label></div>
        <div className="rounded-xl border border-slate-200 p-6"><h2 className="mb-5 text-xl font-bold">Legal &amp; Verification</h2><div className="grid gap-5 md:grid-cols-2"><label className="text-base font-semibold">License / Registration Number<input type="text" value={profile.license_number} onChange={(event) => setProfile({ ...profile, license_number: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label><label className="text-base font-semibold">Verification Status<select value={profile.verification_status} onChange={(event) => setProfile({ ...profile, verification_status: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-4 text-base font-normal"><option>Pending</option><option>Verified</option><option>Rejected</option><option>Expired</option></select></label><label className="text-base font-semibold">License Issue Date<input type="date" value={profile.license_issue_date} onChange={(event) => setProfile({ ...profile, license_issue_date: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label><label className="text-base font-semibold">License Expiry Date<input type="date" value={profile.license_expiry_date} onChange={(event) => setProfile({ ...profile, license_expiry_date: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label><label className="text-base font-semibold md:col-span-2">Company License Document Upload<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setProfile({ ...profile, license_document_name: event.target.files?.[0]?.name || profile.license_document_name })} className="mt-2 w-full rounded-xl border border-dashed border-slate-300 p-4 text-base font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700" />{profile.license_document_name && <span className="mt-2 block text-sm text-slate-500">Selected: {profile.license_document_name}</span>}</label><label className="text-base font-semibold md:col-span-2">Existing License Document URL<input type="url" value={profile.license_document_url} onChange={(event) => setProfile({ ...profile, license_document_url: event.target.value })} placeholder="https://example.com/license-document" className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label></div><p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Upload className="h-5 w-5" />Upload a PDF or image for platform verification. Verification status is managed by the platform.</p></div>
        <div className="rounded-xl border border-slate-200 p-6"><h2 className="mb-5 text-xl font-bold">Social Media Links</h2><div className="grid gap-5 md:grid-cols-3">{[['linkedin', 'LinkedIn'], ['facebook', 'Facebook'], ['x', 'X']].map(([field, label]) => <label key={field} className="text-base font-semibold">{label}<input type="url" value={profile[field]} onChange={(event) => setProfile({ ...profile, [field]: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base font-normal" /></label>)}</div></div>
        <button disabled={saving} className="flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"><Save className="h-5 w-5" />{saving ? 'Saving...' : 'Save Profile & Continue'}<ArrowRight className="h-5 w-5" /></button>
        </form>
      </div>
    </div>
  );
};

export default EmployerProfile;
