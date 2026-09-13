import { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Check, CheckCircle2, MapPin, WalletCards, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMatchedJobs } from '../services/dashboardApi';
import api from '../services/api';
const listValue = (value, fallback) => Array.isArray(value) && value.length ? value : [fallback];

export default function AICareerMatches() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = location.state?.profile || JSON.parse(localStorage.getItem('userProfile') || '{}');
  const candidateName = profile.fullName || profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Job Seeker';
  const candidateSkills = (profile.skills || []).map((skill) => typeof skill === 'string' ? skill : skill?.skill_name).filter(Boolean);
  const [jobs, setJobs] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [toast, setToast] = useState('');
  const [applying, setApplying] = useState(false);
  const appliedIds = new Set();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getMatchedJobs().then(setJobs).catch(() => setJobs([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedMatch) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setSelectedMatch(null);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedMatch]);

  const matches = jobs.map((job) => ({ job, score: job.matchScore, overlap: job.matchedSkills || [], rank: job.rank, rationale: job.rationale }));
  useEffect(() => {
    if (location.state?.openMatch && matches.length && !selectedMatch) {
      setSelectedMatch(matches[0]);
    }
  }, [location.state?.openMatch, matches, selectedMatch]);

  const submitApplication = async (match) => {
    const job = match.job;
    setApplying(true);
    try {
      await api.post('/applications', { jobId: job.id });
      setToast('Application submitted successfully.');
      setSelectedMatch(null);
    } catch (error) {
      setToast(error?.response?.data?.message || 'Unable to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl border border-blue-100 bg-white p-7 shadow-sm sm:p-10">
          <div><h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AI Career Match Results</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{candidateName}, your uploaded CV points to these high-fit roles.</p></div>
        </header>
        {toast && <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-black text-emerald-800"><CheckCircle2 className="h-5 w-5" />{toast}</div>}
        {loading ? <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center font-bold text-slate-500">Analyzing your career fit...</div> : <div className="grid gap-5 lg:grid-cols-2">{matches.map((match) => { const job = match.job; return <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start justify-between gap-4"><div><div className="mb-2 text-xs font-black uppercase tracking-wide text-blue-600">{match.rank === 1 ? '🥇 #1 Best Career Match' : match.rank === 2 ? '🥈 #2 Strong Match' : '🥉 #3 High Potential Fit'}</div><h2 className="text-xl font-black text-slate-950">{job.title}</h2><p className="mt-1 font-bold text-slate-600">{job.company || job.companyName || 'Company'}</p></div><span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">{match.score}% Match</span></div><p className="mt-5 flex items-start gap-2 rounded-2xl bg-blue-50 p-3 text-sm font-semibold leading-5 text-blue-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{match.rationale}</p><div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-500" />{job.location || 'Remote'}</span><span className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-blue-500" />{job.salary || 'Negotiable'}</span><span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-blue-500" />{job.type || 'Full Time'}</span></div><button type="button" onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">View Details &amp; Apply<ArrowRight className="h-4 w-4" /></button></article>; })}</div>}
        <div className="mt-8 flex justify-center border-t border-slate-200 pt-6"><button id="explore-all-jobs-btn" type="button" onClick={() => navigate('/jobs')} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"><span>Explore All Jobs</span><ArrowRight className="h-4 w-4" /></button></div>
      </div>
      {selectedMatch && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedMatch(null)}><section role="dialog" aria-modal="true" aria-labelledby="job-detail-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{selectedMatch.score}% AI match</p><h2 id="job-detail-title" className="mt-2 text-2xl font-black text-slate-950">{selectedMatch.job.title}</h2><p className="mt-1 font-bold text-slate-600">{selectedMatch.job.company || selectedMatch.job.companyName || 'Company'} · {selectedMatch.job.location || 'Remote'}</p></div><button type="button" aria-label="Close job details" onClick={() => setSelectedMatch(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><p className="mt-6 text-sm leading-6 text-slate-600">{selectedMatch.job.description || 'This role is a strong fit for your profile and offers an opportunity to contribute to a growing team.'}</p><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h3 className="font-black text-slate-900">Responsibilities</h3><ul className="mt-3 space-y-2 text-sm leading-5 text-slate-600">{listValue(selectedMatch.job.responsibilities, 'Deliver high-quality work with the team.').map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul></div><div><h3 className="font-black text-slate-900">Required skills</h3><div className="mt-3 flex flex-wrap gap-2">{listValue(selectedMatch.job.skills || selectedMatch.job.tags, 'Communication').map((skill) => <span key={skill} className={`rounded-full px-3 py-1 text-xs font-bold ${candidateSkills.some((candidateSkill) => normalize(candidateSkill) === normalize(skill)) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{skill}</span>)}</div><p className="mt-4 text-xs font-semibold text-emerald-700">Green tags match skills found in your CV.</p></div></div><div className="mt-6 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-900">Salary expectation: {selectedMatch.job.salary || profile.salaryExpectation || 'Negotiable'}</p><p className="mt-2 text-sm text-slate-600">Benefits: {listValue(selectedMatch.job.benefits, 'Benefits discussed during the hiring process.').join(' · ')}</p></div><button type="button" disabled={appliedIds.has(String(selectedMatch.job.id))} onClick={() => submitApplication(selectedMatch)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-black text-white hover:bg-blue-700 disabled:bg-emerald-600">{appliedIds.has(String(selectedMatch.job.id)) ? 'Application Submitted' : 'Submit Application (1-Click Apply)'}{!appliedIds.has(String(selectedMatch.job.id)) && <ArrowRight className="h-4 w-4" />}</button></section></div>}
    </main>
  );
}