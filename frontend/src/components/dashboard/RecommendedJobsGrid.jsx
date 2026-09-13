import { ArrowRight, BriefcaseBusiness, MapPin } from 'lucide-react';

export default function RecommendedJobsGrid({ jobs, onViewDetails, isLoading, error, onRetry }) {
  return (
    <section aria-labelledby="recommended-jobs-heading">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-deep)]">Worth exploring</p>
          <h2 id="recommended-jobs-heading" className="mt-1 text-xl font-black text-slate-900">Recommended jobs</h2>
        </div>
        <BriefcaseBusiness className="h-6 w-6 text-[var(--brand-primary)]" />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
          <button type="button" onClick={onRetry} className="ml-3 font-bold underline">Retry</button>
        </div>
      )}

      {!isLoading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No recommended jobs available right now.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!isLoading && !error && jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] font-black text-[var(--brand-deep)]">
              {job.company.charAt(0)}
            </div>

            <h3 className="mt-4 font-black text-slate-900">{job.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">{job.company}</p>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</p>
              <p className="font-bold text-slate-700">{job.salary}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">{job.postedAt}</span>
              <button type="button" onClick={() => onViewDetails(job.id)} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-deep)] hover:underline">
                View job <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}