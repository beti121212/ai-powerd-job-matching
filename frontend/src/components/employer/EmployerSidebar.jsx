import { Bell, BriefcaseBusiness, Building2, ClipboardList, LayoutDashboard, LogOut, MessageCircle, Plus, Settings, Sparkles, Target, UserCheck, Users, X } from 'lucide-react';

const menuItems = [
  ['overview', 'Dashboard', LayoutDashboard],
  ['profile', 'Company & Legal', Building2],
  ['post', 'Post Job', Plus],
  ['jobs', 'My Jobs', BriefcaseBusiness],
  ['applications', 'Applications', ClipboardList],
  ['matching', 'AI Candidate Matching', Target],
  ['hired', 'Hire & Onboarding', UserCheck],
  ['talent-pool', 'Talent Pool / General Applicants', Users],
  ['reviews', 'Reviews Management', MessageCircle],
  ['messages', 'Messages', MessageCircle],
  ['notifications', 'Notifications', Bell],
  ['settings', 'Settings', Settings],
];

export default function EmployerSidebar({ active, onSelect, onLogout, applicationsCount = 0, unreadMessages = 0, unreadNotifications = 0, isOpen = false, onClose, stages = menuItems }) {
  const stageMap = new Map(stages.map((item) => [item[0], item]));
  const navItems = menuItems.filter(([id]) => stageMap.has(id));

  return <>
    {isOpen && <button type="button" aria-label="Close employer navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
    <aside className={`employer-sidebar fixed left-0 top-20 z-40 flex h-[calc(100vh-5rem)] w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white/95 p-5 pb-6 shadow-xl backdrop-blur-sm transition-transform sm:top-24 sm:h-[calc(100vh-6rem)] lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:w-[280px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button type="button" aria-label="Close employer navigation" onClick={onClose} className="absolute right-4 top-5 text-slate-500 lg:hidden"><X className="h-5 w-5" /></button>

      <div className="mb-5 flex shrink-0 items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">Employer Workspace</p>
        </div>
      </div>

      <nav aria-label="Employer dashboard navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300">
        {navItems.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => { onSelect(id); onClose?.(); }}
            aria-current={active === id ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${active === id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-600 hover:bg-blue-50/80 hover:text-blue-600'}`}
          >
            <span className="min-w-0 flex-1">{label}</span>
            {id === 'applications' && applicationsCount > 0 && <Badge value={applicationsCount} active={active === id} />}
            {id === 'messages' && unreadMessages > 0 && <Badge value={unreadMessages} active={active === id} />}
            {id === 'notifications' && unreadNotifications > 0 && <Badge value={unreadNotifications} active={active === id} />}
          </button>
        ))}
      </nav>

      <div className="mt-4 shrink-0 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">AI Matching Engine</p>
        <p className="mt-2 text-xs leading-5 text-blue-700/80">Rank candidates using skills, experience, education, and fit.</p>
      </div>

      <button type="button" onClick={onLogout} className="mt-4 flex w-full shrink-0 items-center gap-3 rounded-xl border border-red-100 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50">
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  </>;
}

function Badge({ value, active }) { return <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>{value}</span>; }
