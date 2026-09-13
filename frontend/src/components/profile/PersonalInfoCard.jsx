import { Camera, ExternalLink, Globe, Link2, Mail, MapPin, Phone } from 'lucide-react';

export default function PersonalInfoCard({ profile, onEdit, onAvatarChange }) {
  const socialLinks = [
    profile.github && { label: 'GitHub', href: profile.github, icon: Globe },
    profile.linkedin && { label: 'LinkedIn', href: profile.linkedin, icon: Link2 },
    profile.portfolio && { label: 'Portfolio', href: profile.portfolio, icon: ExternalLink },
  ].filter(Boolean);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="personal-info-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Candidate profile</p>
          <h2 id="personal-info-heading" className="mt-1 text-xl font-black text-slate-900">Personal Information</h2>
        </div>
        <button type="button" onClick={onEdit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Edit Information</button>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        <label className="group relative h-24 w-24 shrink-0 cursor-pointer">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-2xl font-black text-blue-700">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`${profile.name || 'User'} avatar`} className="h-full w-full object-cover" />
            ) : (
              (profile.name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute inset-0 hidden items-center justify-center rounded-2xl bg-slate-900/60 text-white group-hover:flex">
            <Camera className="h-5 w-5" />
          </span>
          <input type="file" accept="image/*" onChange={onAvatarChange} className="sr-only" aria-label="Upload profile avatar" />
        </label>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black text-slate-900">{profile.name || 'Your name'}</h3>
          <p className="mt-1 text-sm font-semibold text-blue-700">{profile.headline || 'Add a professional headline'}</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <span><Mail className="mr-2 inline h-4 w-4" />{profile.email || 'Add your email'}</span>
            <span><Phone className="mr-2 inline h-4 w-4" />{profile.phone || 'Add your phone'}</span>
            <span><MapPin className="mr-2 inline h-4 w-4" />{profile.location || 'Add your location'}</span>
          </div>
        </div>
      </div>

      {socialLinks.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </a>
          ))}
        </div>
      )}

      {profile.bio && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">{profile.bio}</p>}
    </section>
  );
}
