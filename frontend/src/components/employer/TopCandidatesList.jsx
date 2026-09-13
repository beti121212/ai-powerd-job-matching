import { useEffect, useState } from 'react';
import { CalendarDays, Check, Loader2, UserRound } from 'lucide-react';
import api from '../../services/api';
import AICandidateSummaryDrawer from './AICandidateSummaryDrawer';

function skills(value) { return Array.isArray(value) ? value : String(value || '').split(',').map((item) => item.trim()).filter(Boolean); }

export default function TopCandidatesList({ jobId, jobs: incomingJobs = [], onJobChange, onSelectCandidate, onShortlist, onSchedule }) {
  const [candidates, setCandidates] = useState([]);
  const [ownedJobs, setOwnedJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const jobs = incomingJobs.length ? incomingJobs : ownedJobs;
  const activeJobId = selectedJobId || jobId || String(jobs[0]?.id || '');
  useEffect(() => {
    if (!selectedJobId && jobs[0]?.id) setSelectedJobId(String(jobs[0].id));
  }, [jobs, selectedJobId]);
  useEffect(() => {
    api.get('/employer/jobs').then(({ data }) => setOwnedJobs(data.jobs || [])).catch(() => {});
  }, []);
  useEffect(() => {
    if (!activeJobId) return undefined;
    let mounted = true;
    setLoading(true);
    setError('');
    api.get(`/employer/jobs/${activeJobId}/top-candidates`, { params: { limit: 5 } })
      .then(({ data }) => mounted && setCandidates(data.candidates || []))
      .catch((requestError) => mounted && setError(requestError?.response?.data?.message || 'Unable to load matched candidates.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [activeJobId]);

  if (!activeJobId) return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Select a job to view its top matched candidates.</div>;
  if (loading) return <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm font-bold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading top matches...</div>;
  if (error) return <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>;
  return <><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-xl font-black text-slate-900">Top 5 Matched Candidates</h3><p className="text-sm text-slate-500">Candidates ranked by AI compatibility score.</p></div><select aria-label="Select job for matching" value={activeJobId} onChange={(event) => { setSelectedJobId(event.target.value); onJobChange?.(event.target.value); setSelectedCandidate(null); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></div><div className="space-y-4">{candidates.map((candidate, index) => <article key={candidate.applicationId || candidate.candidateId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-black text-blue-700">{candidate.avatarUrl ? <img src={candidate.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-6 w-6" />}</div><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">#{index + 1} Top Match ({candidate.matchScore}%)</span><h3 className="text-lg font-black text-slate-900">{candidate.name}</h3></div><p className="mt-1 text-sm font-semibold text-slate-600">{candidate.currentTitle || 'Candidate'} · {candidate.experienceYears || 0} years experience</p><p className="mt-2 text-sm text-slate-600">{candidate.snapshot}</p></div></div></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]"><div><p className="mb-2 text-xs font-black uppercase tracking-wider text-emerald-600">Matched skills</p><div className="flex flex-wrap gap-2">{skills(candidate.matchedSkills).map((skill) => <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{skill}</span>)}</div>{skills(candidate.missingSkills).length > 0 && <><p className="mb-2 mt-3 text-xs font-black uppercase tracking-wider text-amber-600">Missing skills</p><div className="flex flex-wrap gap-2">{skills(candidate.missingSkills).map((skill) => <span key={skill} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{skill}</span>)}</div></>}</div><div className="flex flex-wrap items-end justify-end gap-2"><button type="button" onClick={() => { setSelectedCandidate(candidate); onSelectCandidate?.(candidate); }} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">View Full AI Breakdown</button><button type="button" onClick={() => onShortlist?.(candidate)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check className="h-4 w-4" />Shortlist</button><button type="button" onClick={() => onSchedule?.(candidate)} className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white"><CalendarDays className="h-4 w-4" />Schedule Interview</button></div></div></article>)}{!candidates.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No scored applicants are available for this job yet.</div>}</div><AICandidateSummaryDrawer candidate={selectedCandidate} jobId={activeJobId} onClose={() => setSelectedCandidate(null)} onShortlist={onShortlist} onSchedule={onSchedule} /></>;
}
