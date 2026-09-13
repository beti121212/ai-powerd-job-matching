import { BriefcaseBusiness, CalendarCheck, CheckCircle2, Clock3, Send } from 'lucide-react';

const cards = [
  ['total', 'Total Applications', Send],
  ['pending', 'Pending', Clock3],
  ['shortlisted', 'Shortlisted', CheckCircle2],
  ['interviewScheduled', 'Interview Scheduled', CalendarCheck],
  ['hired', 'Hired / Accepted', BriefcaseBusiness],
];

export default function ApplicationStatsGrid({ stats }) {
  return (
    <section aria-labelledby="application-stats-heading">
      <h2 id="application-stats-heading" className="mb-4 text-lg font-black text-slate-900">Application overview</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([key, label, Icon]) => (
          <article key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{stats[key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
