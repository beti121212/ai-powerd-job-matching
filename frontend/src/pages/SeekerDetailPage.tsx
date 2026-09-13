import { CalendarDays, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';

const labels: Record<string, { title: string; description: string }> = {
  jobs: { title: 'Job details', description: 'Review the opportunity, requirements, and your AI match before applying.' },
  applications: { title: 'Application details', description: 'Track your application progress and next steps.' },
  interviews: { title: 'Interview details', description: 'Review your schedule and prepare for your upcoming conversation.' },
};

export default function SeekerDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const kind = location.pathname.split('/')[1] || 'jobs';
  const content = labels[kind] || labels.jobs;
  return <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-3xl"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]"><Sparkles className="h-3.5 w-3.5" /> Job Matching AI</span><h1 className="mt-4 text-3xl font-black text-slate-900">{content.title}</h1><p className="mt-2 text-slate-500">{content.description}</p></div><span className="rounded-2xl bg-[var(--brand-soft)] p-3 text-xs font-bold text-[var(--brand-deep)]">ID: {id}</span></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><CalendarDays className="h-5 w-5 text-[var(--brand-deep)]" /><p className="mt-3 text-xs font-bold text-slate-500">Status</p><p className="mt-1 font-black text-slate-900">In progress</p></div><div className="rounded-2xl bg-slate-50 p-4"><MapPin className="h-5 w-5 text-[var(--brand-deep)]" /><p className="mt-3 text-xs font-bold text-slate-500">Next step</p><p className="mt-1 font-black text-slate-900">Review details</p></div><div className="rounded-2xl bg-slate-50 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-xs font-bold text-slate-500">Powered by</p><p className="mt-1 font-black text-slate-900">AI matching</p></div></div><div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 text-center"><p className="text-sm text-slate-500">This detail view is ready for live API data.</p></div></section></div></main>;
}
