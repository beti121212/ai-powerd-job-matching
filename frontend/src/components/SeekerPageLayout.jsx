import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Target, Search, Bookmark, ClipboardList, MessageSquare, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutFlowModals from './LogoutFlowModals';

const navItems = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['My Profile', '/profile', User],
  ['My Resume', '/resume', FileText],
  ['Find Jobs', '/explore-jobs', Search],
  ['AI Job Matches', '/ai-matches', Target],
  ['Saved Jobs', '/saved-jobs', Bookmark],
  ['My Applications', '/applications', ClipboardList],
  ['Messages', '/chat', MessageSquare],
  ['Notifications', '/notifications', Bell],
  ['Settings', '/settings', Settings],
  ['Logout', null, LogOut],
];

export default function SeekerPageLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, setSession, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const handleLogout = () => { setLogoutSession({ token, user }); setLogoutOpen(true); };

  useEffect(() => {
    if (!logoutOpen) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') setLogoutOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [logoutOpen]);

  return <div className="information-page min-h-screen bg-slate-50 lg:flex"><aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block"><div className="sticky top-0 flex h-screen flex-col p-5"><div className="mb-8 shrink-0 border-b border-slate-100 pb-5"><p className="text-lg font-black lowercase text-slate-900">job <span className="text-[var(--brand-deep)]">matching</span></p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Platform</p></div><nav className="seeker-sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Seeker navigation">{navItems.map(([label, path, Icon]) => { const active = path && (location.pathname === path || (path === '/dashboard' && ['/seeker-dashboard', '/seekerDashboard'].includes(location.pathname))); const action = label === 'Logout' ? handleLogout : () => navigate(path === '/explore-jobs' ? '/explore-jobs?from=dashboard' : path); return <button key={label} type="button" onClick={action} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${label === 'Logout' ? 'text-red-500 hover:bg-red-50' : active ? 'bg-[var(--brand-primary)] text-white shadow-sm' : 'text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]'}`}><Icon className="h-4 w-4" />{label}</button>; })}</nav></div></aside><div className="min-w-0 flex-1">{children}</div>{logoutOpen && <LogoutFlowModals user={logoutSession?.user} token={logoutSession?.token} logout={logout} setSession={setSession} navigate={navigate} onClose={() => setLogoutOpen(false)} />}</div>;
}
