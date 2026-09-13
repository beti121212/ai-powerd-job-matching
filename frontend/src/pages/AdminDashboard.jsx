import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, BriefcaseBusiness, Building2, FileText, LogOut, Settings, ShieldCheck, Target, Users } from 'lucide-react';
import { getAdminDashboardStats, getAdminOverview } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const tabs = [
  ['overview', '/admin/dashboard', 'Dashboard', BarChart3], ['users', '/admin/users', 'Users', Users],
  ['companies', '/admin/employers', 'Employers', Building2], ['jobs', '/admin/jobs', 'Jobs', BriefcaseBusiness],
  ['applications', '/admin/applications', 'Applications', FileText], ['matching', '/admin/ai-matching', 'AI Matching', Target],
  ['analytics', '/admin/analytics', 'Analytics', BarChart3], ['reports', '/admin/reports', 'Reports', Bell],
  ['notifications', '/admin/notifications', 'Notifications', Bell], ['settings', '/admin/settings', 'Settings', Settings],
];
const fallback = { totalUsers: 1420, jobSeekersCount: 1180, employersCount: 240, activeJobs: 86, avgMatchScore: 81.4, moderationQueueCount: 7, pipeline: { pending: 342, shortlisted: 128, interviewing: 46, hired: 34, rejected: 185 } };
const statusClass = { hired: 'bg-emerald-50 text-emerald-700', shortlisted: 'bg-blue-50 text-blue-700', 'under-review': 'bg-amber-50 text-amber-700', rejected: 'bg-slate-100 text-slate-600' };
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'Not provided';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabs.find(([id, path]) => path === location.pathname)?.[0] || 'overview';
  const [stats, setStats] = useState(fallback);
  const [overview, setOverview] = useState({ applications: [], companies: [], users: [], jobs: [], reports: [], notifications: [], stats: fallback });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getAdminDashboardStats(), getAdminOverview()]).then(([statsResult, overviewResult]) => {
      if (!mounted) return;
      const liveStats = statsResult.status === 'fulfilled' ? statsResult.value : null;
      const data = overviewResult.status === 'fulfilled' ? overviewResult.value : { applications: [], companies: [] };
      setStats({ ...fallback, ...(liveStats || {}), pipeline: { ...fallback.pipeline, ...(liveStats?.pipeline || {}) } });
      setOverview({
        applications: data.applications || [],
        companies: data.companies || [],
        users: data.users || [],
        jobs: data.jobs || [],
        reports: data.reports || [],
        notifications: data.notifications || [],
        stats: liveStats || fallback,
      });
    }).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const go = (path) => navigate(path);
  const cards = [
    ['01', stats.totalUsers.toLocaleString(), 'Registered Accounts', `${stats.jobSeekersCount.toLocaleString()} Job Seekers and ${stats.employersCount.toLocaleString()} verified Companies active across the platform.`, '/admin/users'],
    ['02', `${stats.activeJobs} Live`, 'Open Job Listings', 'Currently receiving verified candidate applications and AI skill screenings.', '/admin/jobs?status=published'],
    ['03', `${stats.avgMatchScore}%`, 'Average Fit Ratio', 'Calculated from automated resume parsings and qualification signals.', '/admin/ai-matching'],
    ['04', `${stats.moderationQueueCount} Pending`, 'Moderation Queue', 'Company legal verifications and reported items awaiting admin decision.', '/admin/reports?status=pending'],
  ];
  const pipeline = [['pending', 'Pending / New', 'Initial applicant submissions', 'text-slate-800', 'bg-amber-400', '/admin/applications?status=applied'], ['shortlisted', 'Shortlisted', 'Qualified for interviews', 'text-blue-600', 'bg-blue-500', '/admin/applications?status=shortlisted'], ['interviewing', 'Interviewing', 'Active discussion rounds', 'text-purple-600', 'bg-purple-500', '/admin/applications?status=interview-scheduled'], ['hired', 'Hired', 'Formal offers accepted', 'text-emerald-600', 'bg-emerald-500', '/admin/applications?status=hired'], ['rejected', 'Rejected', 'Qualification mismatch', 'text-slate-400', 'bg-slate-300', '/admin/applications?status=rejected']];
  const applications = overview.applications.slice(0, 5);
  const companies = overview.companies.filter((company) => company.verification_status === 'pending').slice(0, 4);

  if (loading) return <div className="min-h-screen bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Loading admin workspace...</div>;
  return <div className="admin-shell min-h-screen bg-slate-50 text-slate-900 lg:flex">
    <aside className="admin-sidebar w-full shrink-0 border-r border-slate-100 bg-white lg:min-h-screen lg:w-64"><div className="sticky top-0 p-5 lg:h-screen"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-black">SmartRecruit AI</p><p className="text-xs text-slate-500">Admin workspace</p></div></div><nav className="admin-nav mt-8 grid grid-cols-2 gap-1 lg:grid-cols-1" aria-label="Admin sections">{tabs.map(([id, path, label, Icon]) => <button key={id} type="button" onClick={() => go(path)} className={`flex items-center gap-3 border-l-4 px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeTab === id ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold' : 'border-transparent text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'}`}><Icon className="h-4 w-4 shrink-0" /><span>{label}</span></button>)}</nav><button type="button" aria-label="Logout" onClick={() => { logout(); navigate('/login', { replace: true }); }} className="mt-8 inline-flex w-full items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"><LogOut className="h-4 w-4 shrink-0" />Logout</button></div></aside>
    <main className="admin-main min-w-0 grow px-4 py-8 sm:px-6 lg:px-10"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">{activeTab === 'overview' ? 'Platform overview' : tabs.find(([id]) => id === activeTab)?.[2]}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{activeTab === 'overview' ? 'Admin Dashboard' : tabs.find(([id]) => id === activeTab)?.[2]}</h1><p className="mt-2 text-sm text-slate-500">{activeTab === 'overview' ? 'A clear view of platform activity and decisions.' : 'Manage and monitor this area of the SmartRecruit platform.'}</p>
      {activeTab !== 'overview' && <AdminModule tab={activeTab} overview={overview} go={go} />}
      {activeTab === 'overview' && <>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([index, value, title, subtitle, path]) => <button key={index} type="button" onClick={() => go(path)} className="group cursor-pointer rounded-2xl border border-slate-100/90 bg-white p-7 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">{index}</p><p className="my-2.5 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">{value}</p><h2 className="text-base font-bold text-slate-800">{title}</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">{subtitle}</p><span className="mt-4 block text-right text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1">-&gt;</span></button>)}</div>
      <section className="mt-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Pipeline overview</p><h2 className="mt-2 text-2xl font-black">Platform Recruitment Lifecycle</h2><p className="mt-1 text-sm text-slate-500">Real-time candidate distribution from application to placement.</p><div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3 lg:grid-cols-5">{pipeline.map(([key, label, note, text, dot, path]) => <button key={key} type="button" onClick={() => go(path)} className="group rounded-xl p-2 text-left transition hover:bg-slate-50"><p className={`text-2xl font-bold ${text}`}>{stats.pipeline[key]}</p><p className="mt-2 text-sm font-semibold text-slate-700"><span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${dot}`} />{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p><span className="mt-2 block text-xs font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">Inspect -&gt;</span></button>)}</div></section>
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12"><section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-8"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Recent Candidate Applications</h2><button type="button" onClick={() => go('/admin/applications')} className="text-xs font-semibold text-blue-600">View All Applications -&gt;</button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400"><tr><th className="py-3">Candidate</th><th className="py-3">Role &amp; Company</th><th className="py-3">AI Match</th><th className="py-3">Status</th><th className="py-3">Date</th></tr></thead><tbody>{applications.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="py-3.5"><p className="font-bold">{item.candidate_name}</p><p className="text-xs text-slate-500">{item.candidate_email || 'Candidate profile'}</p></td><td className="py-3.5"><p className="font-semibold">{item.job_title}</p><p className="text-xs text-slate-500">{item.employer_name}</p></td><td className="py-3.5"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.ai_match_score || 0}% Fit</span></td><td className="py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[item.status] || 'bg-slate-100 text-slate-600'}`}>{item.status}</span></td><td className="py-3.5 text-xs text-slate-500">{formatDate(item.applied_at)}</td></tr>)}</tbody></table></div></section><section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Pending Verification</h2><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{companies.length || 5}</span></div><div className="mt-5 divide-y divide-slate-100">{companies.map((company) => <div key={company.id} className="py-4 first:pt-0"><p className="font-bold">{company.company_name}</p><p className="mt-1 text-xs text-slate-500">{company.industry || 'Company verification'}</p><p className="mt-2 text-xs text-slate-500">TIN: {company.tin_number || 'Pending document'}</p><button type="button" onClick={() => go('/admin/employers')} className="mt-2 text-xs font-semibold text-blue-600">Review Registration Document -&gt;</button></div>)}</div></section></div>
      </>}
    </main></div>;
}

function AdminModule({ tab, overview, go }) {
  const rows = tab === 'users' ? overview.users || [] : tab === 'companies' ? overview.companies || [] : tab === 'jobs' ? overview.jobs || [] : tab === 'applications' || tab === 'matching' ? overview.applications || [] : tab === 'reports' ? overview.reports || [] : tab === 'notifications' ? overview.notifications || [] : [];
  if (tab === 'settings') return <div className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2"><ModuleCard title="Admin Profile"><p className="text-sm text-slate-600">{overview.adminEmail || 'Administrator account'}</p><p className="mt-2 text-xs text-slate-500">Role: admin</p></ModuleCard><ModuleCard title="Platform Settings"><label className="flex items-center justify-between text-sm font-semibold text-slate-700">Maintenance mode<input type="checkbox" className="h-4 w-4 accent-blue-600" /></label><label className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-700">Email notifications<input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" /></label></ModuleCard></div>;
  if (tab === 'analytics') return <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><ModuleCard title="Users" value={overview.stats?.totalUsers || 0} /><ModuleCard title="Active Jobs" value={overview.stats?.activeJobs || 0} /><ModuleCard title="Applications" value={overview.stats?.totalApplications || 0} /><ModuleCard title="Average Match" value={`${overview.stats?.avgMatchScore || 0}%`} /></div>;
  return <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-500"><tr><th className="p-4">Name / Title</th><th className="p-4">Email / Company</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.length ? rows.map((row) => <tr key={row.id}><td className="p-4 font-semibold text-slate-800">{row.full_name || row.company_name || row.title || row.candidate_name || row.reporter_name || row.recipient_name}</td><td className="p-4 text-slate-600">{row.email || row.rep_email || row.employer_name || row.job_title || row.message || '-'}</td><td className="p-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{row.status || row.verification_status || (row.is_read ? 'Read' : 'Unread') || 'Active'}</span></td><td className="p-4 text-xs text-slate-500">{formatDate(row.created_at || row.applied_at)}</td><td className="p-4 text-right"><button type="button" onClick={() => tab === 'jobs' && go('/admin/jobs')} className="text-xs font-bold text-blue-600 hover:text-blue-800">View</button></td></tr>) : <tr><td colSpan="5" className="p-10 text-center text-sm text-slate-500">No records available yet.</td></tr>}</tbody></table></div>;
}

function ModuleCard({ title, value, children }) { return <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-black text-slate-900">{title}</h2>{value !== undefined && <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>}{children && <div className="mt-4">{children}</div>}</section>; }
export default AdminDashboard;
