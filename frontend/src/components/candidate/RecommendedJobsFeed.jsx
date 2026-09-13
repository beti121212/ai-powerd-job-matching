import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import api from '../../services/api';

const fallbackJobs = [
  { id: 'ai-job-1', title: 'Senior React Developer', company: 'AfroTech', location: 'Remote', matchScore: 96, salary: '80,000–120,000 ETB', tags: ['React', 'TypeScript', 'Node.js'] },
  { id: 'ai-job-2', title: 'Product Designer', company: 'Nile Labs', location: 'Hybrid', matchScore: 91, salary: '65,000–95,000 ETB', tags: ['Figma', 'UI/UX', 'Research'] },
  { id: 'ai-job-3', title: 'Full Stack Engineer', company: 'Chapa', location: 'Addis Ababa', matchScore: 87, salary: '90,000–140,000 ETB', tags: ['Node.js', 'PostgreSQL', 'APIs'] },
];

export default function RecommendedJobsFeed({ onViewDetails }) {
  const [jobs, setJobs] = useState(fallbackJobs);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/candidate/recommended-jobs').then(({ data }) => {
      const items = data?.jobs || data || [];
      if (items.length) setJobs(items);
    }).catch(() => {});
  }, []);

  const quickApply = async (job) => {
    try {
      await api.post('/candidate/quick-apply', { jobId: job.id });
      setMessage(`Quick application sent for ${job.title}.`);
    } catch {
      const applications = JSON.parse(localStorage.getItem('candidateQuickApplications') || '[]');
      localStorage.setItem('candidateQuickApplications', JSON.stringify([{ jobId: job.id, title: job.title, appliedAt: new Date().toISOString() }, ...applications]));
      setMessage(`Quick application saved for ${job.title}.`);
    }
  };

  return <section aria-labelledby="ai-recommended-jobs-heading" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600"><Sparkles className="h-4 w-4" /> Reverse matching</p><h2 id="ai-recommended-jobs-heading" className="mt-1 text-2xl font-black text-slate-900">AI Recommended Jobs for You</h2><p className="mt-1 text-sm text-slate-500">New and existing roles ranked against your saved profile.</p></div></div>
    {message && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</p>}
    <div className="grid gap-4 lg:grid-cols-3">{jobs.map((job) => <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">{job.company?.charAt(0) || 'J'}</div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">{job.matchScore}% Match</span></div><h3 className="mt-4 font-black text-slate-900">{job.title}</h3><p className="mt-1 text-sm font-bold text-slate-600">{job.company}</p><p className="mt-3 text-xs text-slate-500"><MapPin className="mr-1 inline h-3.5 w-3.5" />{job.location}</p><p className="mt-2 text-sm font-bold text-slate-700">{job.salary}</p><div className="mt-4 flex flex-wrap gap-1.5">{(job.tags || job.requiredSkills || []).map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => quickApply(job)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Quick Apply with My Profile</button><button type="button" onClick={() => onViewDetails?.(job.id)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Details <ArrowRight className="h-3.5 w-3.5" /></button></div></article>)}</div>
  </section>;
}
