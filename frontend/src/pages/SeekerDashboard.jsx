import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Target, Search, Bookmark,
  ClipboardList, Bell, Settings, LogOut, Sparkles, CheckCircle2,
  AlertTriangle, MapPin, Briefcase, DollarSign, Send, Globe, Lightbulb, Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useSeekerDashboard from '../hooks/useSeekerDashboard';
import LogoutFlowModals from '../components/LogoutFlowModals';

// የተስተካከለ Import Path (ከ pages ፎልደር ወጥቶ ወደ components/seeker ይሄዳል)
import CvAnalysisPage from '../components/seeker/CvAnalysis';

export default function SeekerDashboard() {
  const { user: sessionUser, token, setSession, logout } = useAuth();
  const {
    profile,
    stats,
    recommendations = [],
    skillGaps = { userSkills: [], missingSkills: [] },
    isLoading,
    error,
    isUsingFallback,
  } = useSeekerDashboard();
  const [language, setLanguage] = useState('EN'); // 'EN' or 'AM'
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => location.state?.activeTab || 'dashboard');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const navigate = useNavigate();

  const user = profile || sessionUser || { name: 'Job Seeker' };
  const userName = typeof user.name === 'string' && user.name.trim() ? user.name : 'Job Seeker';

  const handleLogout = () => {
    setLogoutSession({ token, user: sessionUser });
    setLogoutOpen(true);
  };

  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: language === 'EN'
        ? `Hello ${userName}! I'm your AI Career Assistant. How can I help you today?`
        : `ሰላም ${userName}! እኔ የሥራ አጋር የ AI ረዳትዎ ነኝ። ዛሬ እንዴት ልረዳዎት?`
    }
  ]);

  const applications = stats?.applicationsList || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', text: aiMessage }];
    setChatHistory(newHistory);
    setAiMessage('');

    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: language === 'EN'
            ? "I found 3 high-matching React jobs in Addis Ababa within your 25,000+ ETB salary range!"
            : "በአዲስ አበባ ውስጥ ከ 25,000 ETB በላይ ደመወዝ ያላቸው 3 ለስራዎ ተስማሚ የሆኑ የ React ስራዎችን አግኝቻለሁ!"
        }
      ]);
    }, 1000);
  };

  return (
    <div className="seeker-dashboard min-h-screen bg-slate-50 text-slate-800 flex font-sans">

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'EN' ? "Search jobs, skills, companies..." : "ስራ፣ ክህሎት ወይም ድርጅት ፈልግ..."}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'EN' ? 'AM' : 'EN')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{language === 'EN' ? 'EN | አማርኛ' : 'አማርኛ | EN'}</span>
            </button>

            {/* Notifications Icon */}
            <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>

            {/* User Dropdown Preview */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/20" /> : <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold ring-2 ring-blue-600/20">{userName.charAt(0).toUpperCase()}</div>}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-none">{userName}</p>
                <p className="text-xs text-slate-500 mt-1">{user.headline || user.email || 'Job seeker'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* DASHBOARD MAIN BODY */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {isLoading && (
            <div className="space-y-4" role="status" aria-label="Loading dashboard">
              <div className="h-40 rounded-3xl bg-slate-200 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />)}</div>
            </div>
          )}
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {!isLoading && isUsingFallback && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Dashboard API unavailable. Showing your available profile data while the service reconnects.</div>}
          {!isLoading && !error && (activeTab === 'cv' ? (
            /* activeTab 'cv' ሲሆን የ CV Analysis ገጽ ይከፈታል */
            <CvAnalysisPage />
          ) : (
            /* activeTab ሌላ (ለምሳሌ 'dashboard') ሲሆን ዋናው Dashboard ይታያል */
            <>
              {/* WELCOME BANNER & PROFILE COMPLETION */}
              <div className="dashboard-hero rounded-3xl p-6 md:p-8 text-slate-900 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'EN' ? 'AI Career Dashboard' : 'የ AI የሥራ እድል ዳሽቦርድ'}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                      {language === 'EN' ? `Welcome, ${userName.split(' ')[0]} 👋` : `እንኳን ደህና መጡ፣ ${userName.split(' ')[0]} 👋`}
                    </h1>
                    <p className="text-slate-600 text-sm max-w-xl">
                      {language === 'EN'
                        ? "Here are your latest job matches based on your profile and CV analysis."
                        : "ከእርስዎ መረጃ እና CV ትንተና በመነሳት የተዘጋጁ የቅርብ ጊዜ የሥራ እድሎች ከዚህ በታች ቀርበዋል።"}
                    </p>
                  </div>

                  {/* Profile Completion & CV Status Card */}
                  <div className="bg-slate-50 border border-slate-200 p-4 md:p-5 rounded-2xl flex items-center gap-6 shrink-0">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">{language === 'EN' ? 'Profile Completion' : 'የመረጃ ምልአት'}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">{user.profileCompletion}%</span>
                        <span className="text-xs text-emerald-600 font-semibold">{language === 'EN' ? 'Complete' : 'ተጠናቋል'}</span>
                      </div>
                      <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${user.profileCompletion}%` }} />
                      </div>
                      <button onClick={() => navigate('/profile')} className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline">
                        {language === 'EN' ? 'Add your CV' : 'CVዎን ይጨምሩ'}
                      </button>
                    </div>

                    <div className="border-l border-slate-200 pl-6 space-y-1">
                      <p className="text-xs text-slate-500 font-medium">{language === 'EN' ? 'AI CV Score' : 'የ CV ነጥብ'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-blue-600">{user.cvScore}/100</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {user.cvScore > 0 ? 'Analyzed' : 'Not analyzed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: language === 'EN' ? 'AI Job Matches' : 'የ AI የተጣጣሙ ስራዎች', count: stats?.matches ?? 0, detail: language === 'EN' ? 'new matches' : 'አዲስ', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', path: '/ai-matches' },
                  { title: language === 'EN' ? 'Applied Jobs' : 'ያመለከቱባቸው ስራዎች', count: stats?.applications ?? 0, detail: language === 'EN' ? 'applications' : 'ማመልከቻዎች', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/applications' },
                  { title: language === 'EN' ? 'Saved Jobs' : 'ያስቀመጧቸው ስራዎች', count: stats?.savedJobs ?? 0, detail: language === 'EN' ? 'saved jobs' : 'የተቀመጡ', icon: Bookmark, color: 'text-amber-600', bg: 'bg-amber-50', path: '/saved-jobs' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <button key={idx} onClick={() => navigate(stat.path)} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between text-left hover:border-blue-300 hover:shadow-md transition">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.count}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.detail}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* MAIN CONTENT LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-8">

                  {/* RECOMMENDED JOBS SECTION */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-900">
                          {language === 'EN' ? 'Recommended For You' : 'ለእርስዎ የተመከሩ ስራዎች'}
                        </h2>
                      </div>
                      <button onClick={() => navigate('/ai-matches')} className="text-xs font-bold text-blue-600 hover:underline">
                        {language === 'EN' ? 'View All Matches' : 'ሁሉንም ተመልከት'}
                      </button>
                    </div>

                    {/* Job Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {recommendations.filter((job) => job.matchScore > 90).map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all space-y-4">

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200 shrink-0">
                                {job.company.charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer">{job.title}</h3>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{job.company}</p>
                              </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                              <Target className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-black text-emerald-700">{job.matchScore}% Match</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salary}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.workMode}
                            </span>
                          </div>

                          <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl space-y-1.5">
                            <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-blue-600" />
                              {language === 'EN' ? 'Why this job matches you:' : 'ይህ ስራ ለእርስዎ የመረጠበት ምክንያት:'}
                            </p>
                            <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                              {job.whyMatch.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className="text-slate-400 font-medium">Posted {job.posted}</span>
                            <div className="flex gap-3">
                              <button className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 transition">
                                {language === 'EN' ? 'Save' : 'አስቀምጥ'}
                              </button>
                              <button onClick={() => navigate('/explore-jobs')} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm">
                                {language === 'EN' ? 'Quick Apply' : 'በፍጥነት አመልክት'}
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* APPLICATIONS TRACKING SECTION */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">
                        {language === 'EN' ? 'Active Applications Tracking' : 'የማመልከቻዎች ወቅታዊ ሁኔታ'}
                      </h3>
                      <button className="text-xs font-bold text-blue-600 hover:underline">
                        {language === 'EN' ? 'View All' : 'ሁሉንም ተመልከት'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {applications.map((app, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{app.position}</p>
                              <p className="text-xs text-slate-500">{app.company} • Applied on {app.date}</p>
                            </div>
                            <span className="text-xs font-extrabold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                              {app.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 pt-2">
                            {['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer'].map((stepName, sIdx) => (
                              <div key={sIdx} className="space-y-1">
                                <div className={`h-1.5 rounded-full ${sIdx < app.step ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                <p className="text-[10px] text-center font-medium text-slate-400 hidden sm:block">{stepName}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">

                  {/* AI SKILL GAP ANALYSIS CARD */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">
                        {language === 'EN' ? 'AI Skill Gap Analysis' : 'የክህሎት ክፍተት ትንተና'}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'EN'
                        ? "Adding these missing skills can increase your eligibility for 14 new recommended jobs."
                        : "እነዚህን ክፍተቶች በመሙላት ተጨማሪ 14 አዳዲስ የሥራ እድሎችን ማግኘት ይችላሉ።"}
                    </p>

                    <div className="space-y-3">
                      {skillGaps.missingSkills.map((skill, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {skill.name}
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {skill.impact}
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800/80 pl-5">{skill.demand}</p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition">
                      {language === 'EN' ? 'Explore Skill Courses' : 'የክህሎት ማሻሻያዎችን ተመልከት'}
                    </button>
                  </div>

                  {/* AI CAREER ASSISTANT CHAT WIDGET */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-80">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">AI Career Assistant</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        value={aiMessage}
                        onChange={(e) => setAiMessage(e.target.value)}
                        placeholder={language === 'EN' ? "Ask AI for advice..." : "AI ረዳቱን ይጠይቁ..."}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-100 text-xs border-none outline-none"
                      />
                      <button type="submit" className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </>
          ))}
        </main>
      </div>

      {logoutOpen && <LogoutFlowModals user={logoutSession?.user} token={logoutSession?.token} logout={logout} setSession={setSession} navigate={navigate} onClose={() => setLogoutOpen(false)} />}
    </div>
  );
}
