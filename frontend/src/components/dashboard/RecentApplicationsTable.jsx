import { ArrowRight, CalendarDays } from 'lucide-react';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700',
  Shortlisted: 'bg-blue-50 text-blue-700',
  'Interview Scheduled': 'bg-purple-50 text-purple-700',
  Hired: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-red-50 text-red-700',
};

export default function RecentApplicationsTable({ applications, onViewDetails, isLoading, error, onRetry }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="recent-applications-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-applications-heading" className="text-lg font-black text-slate-900">Recent applications</h2>
        <span className="text-xs font-semibold text-slate-400">Latest activity</span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button type="button" onClick={onRetry} className="ml-3 font-bold underline">Retry</button>
        </div>
      )}

      {!isLoading && !error && applications.length === 0 && (
        <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No applications yet.</p>
      )}

      {!isLoading && !error && applications.length > 0 && (
        <div className="space-y-2">
          {applications.map((application) => (
            <div key={application.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{application.role}</h3>
                <p className="text-xs font-semibold text-slate-500">
                  {application.company}{application.location ? ` · ${application.location}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> {application.appliedDate}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[application.status]}`}>
                  {application.status}
                </span>
                <button
                  type="button"
                  onClick={() => onViewDetails(application.id)}
                  className="text-[var(--brand-deep)]"
                  aria-label={`View ${application.role} application details`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
