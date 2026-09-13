import { ArrowRight, CalendarClock, MapPin, Video } from 'lucide-react';

export default function UpcomingInterviewCard({ interview, onViewDetails, isLoading, error, onRetry }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="upcoming-interview-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="upcoming-interview-heading" className="text-lg font-black text-slate-900">Upcoming interview</h2>
        <CalendarClock className="h-5 w-5 text-[var(--brand-primary)]" />
      </div>

      {isLoading && <div className="h-48 animate-pulse rounded-xl bg-slate-100" />}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button type="button" onClick={onRetry} className="ml-3 font-bold underline">Retry</button>
        </div>
      )}

      {!isLoading && !error && !interview && (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No upcoming interviews.</p>
      )}

      {!isLoading && !error && interview && (
        <div className="rounded-xl bg-[var(--brand-soft)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-deep)]">{interview.date}</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">{interview.jobTitle}</h3>
              <p className="text-sm font-semibold text-slate-600">{interview.company}</p>
            </div>
            <span className="rounded-lg bg-white p-2 text-[var(--brand-deep)]" title={interview.format}>
              <Video className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-[var(--brand-deep)]" /> {interview.time}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--brand-deep)]" /> {interview.format} · with {interview.interviewerName}, {interview.interviewerRole}
            </p>
          </div>

          <button type="button" onClick={() => onViewDetails(interview.id)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-deep)] hover:underline">
            View Interview <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
