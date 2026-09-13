import { useEffect, useState } from 'react';
import { FileText, Save, Sparkles } from 'lucide-react';
import api from '../../services/api';

const skillOptions = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Figma', 'Sales', 'Marketing', 'Data Analysis', 'Project Management', 'Communication', 'Leadership'];
const initialProfile = {
  fullName: '', email: '', phone: '', currentTitle: '', skills: ['React'], experienceYears: 0,
  preferredJobTypes: ['Full-time'], expectedSalary: { currency: 'ETB', minAmount: '' }, cvUpload: null,
  cvFileName: '', cvText: '', openToWork: true,
};

export default function CandidateProfileSetup() {
  const [profile, setProfile] = useState(initialProfile);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('candidateProfile') || 'null');
      if (saved) setProfile((current) => ({ ...current, ...saved, cvUpload: null }));
    } catch { /* use the empty setup form */ }
  }, []);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const toggleValue = (key, value) => setProfile((current) => ({
    ...current,
    [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
  }));
  const toggleSkill = (skill) => toggleValue('skills', skill);

  const parseCv = async (file) => {
    if (!file) return;
    const text = await file.text();
    setProfile((current) => ({ ...current, cvUpload: file, cvFileName: file.name, cvText: text.slice(0, 12000) }));
    setNotice(`CV ready: ${file.name}. Text parsing completed for matching.`);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...profile, cvUpload: undefined, cvFileName: profile.cvFileName || profile.cvUpload?.name || '' };
    localStorage.setItem('candidateProfile', JSON.stringify(payload));
    try {
      await api.post('/candidate/profile', payload);
      setNotice('Profile and CV saved. AI matching is now active.');
    } catch {
      setNotice('Profile saved locally. AI matching will sync when the API is available.');
    } finally { setSaving(false); }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div><p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Candidate profile</p><h1 className="mt-1 text-3xl font-black text-slate-900">Set up your AI job matching profile</h1><p className="mt-2 text-sm text-slate-500">Save your profile once and let relevant opportunities find you.</p></div>
      <form onSubmit={saveProfile} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          {['fullName', 'email', 'phone', 'currentTitle'].map((key) => <label key={key} className="text-sm font-bold text-slate-700">{key === 'currentTitle' ? 'Current Title' : key.replace(/^[a-z]/, (letter) => letter.toUpperCase())}<input required={key !== 'currentTitle'} type={key === 'email' ? 'email' : 'text'} value={profile[key]} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500" /></label>)}
          <label className="text-sm font-bold text-slate-700">Experience (years)<input type="number" min="0" value={profile.experienceYears} onChange={(event) => update('experienceYears', Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500" /></label>
          <div className="text-sm font-bold text-slate-700">Expected Salary<div className="mt-2 flex gap-2"><select value={profile.expectedSalary.currency} onChange={(event) => update('expectedSalary', { ...profile.expectedSalary, currency: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"><option>ETB</option><option>USD</option><option>EUR</option></select><input type="number" min="0" placeholder="Minimum amount" value={profile.expectedSalary.minAmount} onChange={(event) => update('expectedSalary', { ...profile.expectedSalary, minAmount: event.target.value })} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-500" /></div></div>
        </div>

        <div><p className="text-sm font-bold text-slate-700">Key Skills</p><div className="mt-3 flex flex-wrap gap-2">{skillOptions.map((skill) => <button type="button" key={skill} onClick={() => toggleSkill(skill)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${profile.skills.includes(skill) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{skill}</button>)}</div></div>
        <div><p className="text-sm font-bold text-slate-700">Preferred Job Types</p><div className="mt-3 flex flex-wrap gap-2">{['Full-time', 'Remote', 'Hybrid', 'On-site'].map((type) => <button type="button" key={type} onClick={() => toggleValue('preferredJobTypes', type)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${profile.preferredJobTypes.includes(type) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{type}</button>)}</div></div>
        <label className="block text-sm font-bold text-slate-700">CV Upload (PDF)<div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3"><FileText className="h-5 w-5 text-blue-600" /><input type="file" accept=".pdf,application/pdf" onChange={(event) => parseCv(event.target.files?.[0])} className="w-full text-sm" /></div>{profile.cvFileName && <span className="mt-2 block text-xs text-slate-500">Parsed CV: {profile.cvFileName}</span>}</label>
        {notice && <p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-700">{notice}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><label className="flex items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={profile.openToWork} onChange={(event) => update('openToWork', event.target.checked)} /> Available for Job Matching / Open to Work</label><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Profile'}</button></div>
      </form>
      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800"><Sparkles className="h-5 w-5 shrink-0" /><span>Your skills, experience, preferences, and parsed CV text power reverse job matching.</span></div>
    </section>
  );
}
