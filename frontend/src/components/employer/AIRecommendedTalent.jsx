import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, Star, UserRound } from 'lucide-react';
import api from '../../services/api';

export default function AIRecommendedTalent({ jobId }) {
  const [talent, setTalent] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/employer/jobs').then(({ data }) => {
      const items = data?.jobs || data || [];
      setJobs(items.filter((job) => (job.status || '').toLowerCase() === 'published'));
    }).catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    if (!jobId) return;
    api.get(`/employer/jobs/${jobId}/ai-talent-pool`).then(({ data }) => {
      const items = data?.candidates || data || [];
      setTalent(items);
    }).catch(() => {
      setTalent([]);
    });
  }, [jobId]);

  const action = async (candidate, type) => {
    if (type === 'shortlist') {
      try {
        await api.patch(`/employer/applications/${candidate.applicationId || candidate.id}/status`, { status: 'shortlisted' });
      } catch (requestError) {
        console.warn('Unable to shortlist candidate:', requestError);
      }
      setTalent((current) => current.map((item) => item.id === candidate.id ? { ...item, shortlisted: true } : item));
      setMessage(`${candidate.name} moved to shortlist.`);
      return;
    }

    const targetJob = jobs[0];
    if (!targetJob) {
      setMessage('Publish a job before inviting candidates.');
      return;
    }

    try {
      await api.post('/employer/job-invitations', {
        candidateId: candidate.candidateId || candidate.id,
        jobId: targetJob.id,
        message: `Hi ${candidate.name || 'Candidate'}, we would like to invite you to apply for ${targetJob.title}.`,
      });
      setMessage(`Invitation sent to ${candidate.name}.`);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to send invitation.');
    }
  };

  return <section className="space-y-4"><div><h3 className="text-xl font-black text-slate-900">AI Recommended Talent</h3><p className="text-sm text-slate-500">Registered seekers matched to this role before they submit an application.</p></div>{message && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</p>}<div className="space-y-3">{talent.map((candidate) => <article key={candidate.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UserRound className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-black text-slate-900">{candidate.name || candidate.fullName}</h4><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{candidate.matchScore}% match</span></div><p className="mt-1 text-sm text-slate-600">{candidate.currentTitle || 'Registered candidate'} · {candidate.experienceYears || 0} years</p><p className="mt-2 text-sm text-slate-500">{candidate.snapshot || 'Profile matched by skills and experience.'}</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => action(candidate, 'invite')} className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Mail className="h-3.5 w-3.5" /> Invite to Apply</button><button onClick={() => action(candidate, 'shortlist')} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Star className="h-3.5 w-3.5" /> Directly Shortlist</button></div></div><div className="mt-4 flex flex-wrap gap-2">{(candidate.skills || candidate.matchedSkills || []).map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{skill}</span>)}</div>{candidate.shortlisted && <p className="mt-3 text-xs font-bold text-emerald-700">Candidate is shortlisted.</p>}</article>)}</div></section>;
}
