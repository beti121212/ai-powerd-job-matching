import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function ProfileWelcomeBanner({ profile, onEditProfile }) {
  const initials = profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'JS';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8" aria-labelledby="welcome-heading">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--brand-soft)]" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="h-16 w-16 rounded-2xl object-cover ring-4 ring-[var(--brand-soft)]" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-xl font-black text-white ring-4 ring-[var(--brand-soft)]">
              {initials}
            </div>
          )}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
              <Sparkles className="h-3.5 w-3.5" /> AI Career Dashboard
            </div>
            <h1 id="welcome-heading" className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Welcome, {profile.name} 👋
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              {profile.headline || 'Your personalized path to the right opportunity starts here.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">Profile completion</p>
            <p className="mt-1 text-xl font-black text-slate-900">{profile.profileCompletion}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold text-slate-500">CV review score</p>
            <p className="mt-1 flex items-center gap-1 text-xl font-black text-[var(--brand-deep)]">
              {profile.cvReviewScore}
              <span className="text-xs font-bold text-slate-400">/100</span>
            </p>
          </div>
          <button type="button" onClick={onEditProfile} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-primary-hover)]">
            Complete profile <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[var(--brand-primary)]" style={{ width: `${Math.min(100, Math.max(0, profile.profileCompletion))}%` }} />
        <span className="sr-only">Profile is {profile.profileCompletion}% complete</span>
      </div>

      <p className="relative mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Keep your profile updated for more accurate matches.
      </p>
    </section>
  );
}
