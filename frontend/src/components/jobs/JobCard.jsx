import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Briefcase, Clock3, Sparkles } from 'lucide-react';

export default function JobCard({ job, saved, onToggleSave }) {
  return (
    <article className="job-listing-card card-floating">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">{job.type || 'Full Time'}</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{job.title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-600">{job.companyName || job.company}</p>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(job.id)}
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${saved ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:text-amber-600'}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{job.location}</span>
        <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" />{job.type}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-slate-400" />{job.postedAt}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(job.skills || []).slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{job.description || 'Explore the role and apply when you are ready.'}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          {job.matchBreakdown?.overall || 87}% match
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
