import { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const readProfile = () => {
  try { return JSON.parse(localStorage.getItem('userProfile') || '{}'); } catch { return {}; }
};
const listValue = (value, fallback) => Array.isArray(value) && value.length ? value : [fallback];

function calculateMatch(job, profile) {
  const candidateSkills = new Set((profile?.skills || []).map((skill) => normalize(typeof skill === 'string' ? skill : skill?.skill_name)).filter(Boolean));
  const jobSkills = (job.skills || job.tags || []).map(normalize).filter(Boolean);
  const overlap = jobSkills.filter((skill) => candidateSkills.has(skill));
  const skillScore = jobSkills.length ? overlap.length / jobSkills.length : 0.55;
  const preferenceText = normalize([profile?.preferredJob, profile?.jobCategory, profile?.preferredWorkSetup, profile?.preferredCity].join(' '));
  const jobText = normalize([job.title, job.location, job.type].join(' '));
  const preferenceScore = preferenceText && preferenceText.split(' ').some((word) => word.length > 2 && jobText.includes(word)) ? 1 : 0.55;
  return { score: Math.max(45, Math.min(99, Math.round((skillScore * 0.75 + preferenceScore * 0.25) * 100))), overlap };
}

export default function MatchedJobsPanel({ jobs = [], onApplicationSubmitted }) {
  const [profile, setProfile] = useState(readProfile);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [appliedIds, setAppliedIds] = useState(() => new Set(jobs.filter((job) => job.isApplied).map((job) => String(job.id))));
  const [savedIds, setSavedIds] = useState(() => new Set(jobs.filter((job) => job.isSaved).map((job) => String(job.id))));
  const [toast, setToast] = useState('');

  useEffect(() => {
    const refreshProfile = () => setProfile(readProfile());
    window.addEventListener('profileUpdated', refreshProfile);
    window.addEventListener('storage', refreshProfile);
    return () => {
      window.removeEventListener('profileUpdated', refreshProfile);
      window.removeEventListener('storage', refreshProfile);
    };
  }, []);

  useEffect(() => {
    if (!selectedMatch) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setSelectedMatch(null);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedMatch]);

  const matches = useMemo(() => jobs.map((job) => {
    const calculated = calculateMatch(job, profile);
    return { job, score: Number.isFinite(Number(job.matchScore)) ? Number(job.matchScore) : calculated.score, overlap: job.matchedSkills || calculated.overlap, missingSkills: job.missingSkills || calculated.missingSkills };
  }).sort((a, b) => b.score - a.score), [jobs, profile]);
  const toggleSaved = async (jobId) => {
    const isSaved = savedIds.has(String(jobId));
    try {
      if (isSaved) await api.delete(`/seeker/saved-jobs/${jobId}`);
      else await api.post('/seeker/saved-jobs', { jobId });
      setSavedIds((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(String(jobId)); else next.add(String(jobId));
        return next;
      });
    } catch (error) {
      setToast(error?.response?.data?.message || 'Unable to update saved jobs.');
    }
  };
  const submitApplication = async (match) => {
    const job = match.job;
    try {
      const { data } = await api.post('/applications', { jobId: job.id });
      const application = data.application;
      setAppliedIds((current) => new Set([...current, String(job.id)]));
      setSelectedMatch(null);
      setToast('Application Submitted Successfully!');
      onApplicationSubmitted?.(application);
    } catch (error) {
      setToast(error?.response?.data?.message || 'Unable to submit application.');
    }
  };

  return <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm" aria-labelledby="matched-jobs-heading">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Personalized for your CV</p><h2 id="matched-jobs-heading" className="mt-1 text-xl font-black text-slate-900">Matched Jobs (AI)</h2><p className="mt-1 text-sm text-slate-500">Your matches recalculate when your profile, skills, or CV changes.</p></div>{toast && <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" />{toast}</div>}</div>
    {matches.length === 0 ? <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Complete your profile or upload a CV to unlock AI-matched roles.</p> : <div className="grid gap-4 md:grid-cols-2">{matches.map((match) => { const job = match.job; const applied = appliedIds.has(String(job.id)); const saved = savedIds.has(String(job.id)); return <article key={job.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{job.title}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{job.company || job.companyName || job.company_name || 'Company'}</p></div>{applied ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Applied ✓</span> : <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{match.score}% {match.score >= 90 ? 'Best Match' : 'Match'}</span>}</div><p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-bold leading-5 text-blue-800">Matched: {match.overlap.length ? match.overlap.slice(0, 4).join(', ') : 'profile preferences and career direction'}</p><div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-3"><span>{job.salary || 'Negotiable'}</span><span>{job.type || job.job_type || 'Full Time'}</span><span>{job.workSetup || job.work_mode || job.location || 'Remote'}</span></div><div className="mt-5 flex items-center gap-2"><button type="button" onClick={() => setSelectedMatch(match)} className="min-h-10 flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700">View Details &amp; Apply</button><button type="button" aria-label={saved ? 'Remove saved job' : 'Save for Later'} title={saved ? 'Remove saved job' : 'Save for Later'} onClick={() => toggleSaved(job.id)} className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${saved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}</button></div></article>; })}</div>}
    {selectedMatch && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedMatch(null)}><section role="dialog" aria-modal="true" aria-labelledby="matched-job-detail-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{selectedMatch.score}% AI match</p><h2 id="matched-job-detail-title" className="mt-2 text-2xl font-black text-slate-950">{selectedMatch.job.title}</h2><p className="mt-1 font-bold text-slate-600">{selectedMatch.job.company || selectedMatch.job.companyName || 'Company'} · {selectedMatch.job.location || 'Remote'}</p></div><button type="button" aria-label="Close job details" onClick={() => setSelectedMatch(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><p className="mt-6 text-sm leading-6 text-slate-600">{selectedMatch.job.description || 'This role is a strong fit for your profile and offers an opportunity to contribute to a growing team.'}</p><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h3 className="font-black text-slate-900">Responsibilities</h3><ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">{listValue(selectedMatch.job.responsibilities, 'Deliver high-quality work with the team.').map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></div><div><h3 className="font-black text-slate-900">Required skills</h3><div className="mt-3 flex flex-wrap gap-2">{listValue(selectedMatch.job.skills || selectedMatch.job.tags, 'Communication').map((skill) => <span key={skill} className={`rounded-full px-3 py-1 text-xs font-bold ${selectedMatch.overlap.includes(normalize(skill)) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{skill}</span>)}</div></div></div><div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-900">Salary expectation: {selectedMatch.job.salary || profile.salaryExpectation || 'Negotiable'}</p><p className="mt-2 text-sm text-slate-600">Benefits: {listValue(selectedMatch.job.benefits, 'Benefits discussed during the hiring process.').join(' · ')}</p></div><button type="button" disabled={appliedIds.has(String(selectedMatch.job.id))} onClick={() => submitApplication(selectedMatch)} className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:bg-emerald-600">{appliedIds.has(String(selectedMatch.job.id)) ? 'Application Submitted' : 'Submit Application (1-Click Apply)'}</button></section></div>}
  </section>;
}
