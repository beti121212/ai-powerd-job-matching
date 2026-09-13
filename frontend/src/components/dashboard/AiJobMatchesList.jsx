import { ArrowRight, Lightbulb, MapPin, Target } from 'lucide-react';

function State({ isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-slate-200" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
        <button type="button" onClick={onRetry} className="ml-3 font-bold underline">Retry</button>
      </div>
    );
  }

  return null;
}

export default function AiJobMatchesList({ jobs, onViewDetails, isLoading, error, onRetry }) {
  return (
    <section aria-labelledby="ai-matches-heading">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-deep)]">Personalized for you</p>
          <h2 id="ai-matches-heading" className="mt-1 text-xl font-black text-slate-900">AI job matches</h2>
        </div>
        <Target className="h-6 w-6 text-[var(--brand-primary)]" />
      </div>

      <State isLoading={isLoading} error={error} onRetry={onRetry} />

      {!isLoading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No job matches found yet. Complete your profile to improve your results.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {!isLoading && !error && jobs.map((job) => (
          <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900">{job.title}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{job.company}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{job.matchScore}% match</span>
            </div>

            <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> {job.location} · {job.salary}
            </p>

            <div className="mt-4 rounded-xl bg-[var(--brand-soft)] p-3">
              <p className="flex items-center gap-1 text-xs font-bold text-[var(--brand-deep)]">
                <Lightbulb className="h-3.5 w-3.5" /> Why it matches
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
                {job.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {job.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}
            </div>

            <button type="button" onClick={() => onViewDetails(job.id)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-deep)] hover:underline">
              View role <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}