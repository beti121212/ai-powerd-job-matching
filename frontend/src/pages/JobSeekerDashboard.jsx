import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  User,
  FileText,
  Target,
  Search,
  Bookmark,
  ClipboardList,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import MatchedJobsPanel from "../components/dashboard/MatchedJobsPanel";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutFlowModals from "../components/LogoutFlowModals";
import {
  getDashboardSummary,
  getJobMatches,
  getRecentApplications,
  getRecommendedJobs,
  getMatchedJobs,
  getUpcomingInterviews,
} from "../services/dashboardApi";
import RecentApplications from "../components/dashboard/RecentApplications";
import UpcomingInterview from "../components/dashboard/UpcomingInterview";
import RecommendedJobs from "../components/dashboard/RecommendedJobs";
import RecommendedJobsFeed from "../components/candidate/RecommendedJobsFeed";
import seekerImage from "./images/seeker.jpg";

function useResource(loader) {
  const [state, setState] = useState({
    data: null,
    isLoading: true,
    error: null,
  });
  const load = useCallback(() => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    loader()
      .then((data) => setState({ data, isLoading: false, error: null }))
      .catch((error) =>
        setState({
          data: null,
          isLoading: false,
          error: error?.message || "Unable to load this section.",
        }),
      );
  }, [loader]);
  useEffect(() => {
    load();
  }, [load]);
  return { ...state, retry: load };
}

export default function JobSeekerDashboard() {
  const navigate = useNavigate();
  const { user, token, setSession, logout } = useAuth();
  const location = useLocation();
  const summary = useResource(useCallback(() => getDashboardSummary(), []));
  const matches = useResource(useCallback(() => getJobMatches(), []));
  const applications = useResource(
    useCallback(() => getRecentApplications(), []),
  );
  const interviews = useResource(
    useCallback(() => getUpcomingInterviews(), []),
  );
  const recommended = useResource(useCallback(() => getRecommendedJobs(), []));
  const matchedJobs = useResource(useCallback(() => getMatchedJobs(), []));
  useEffect(() => {
    const refreshMatches = () => matchedJobs.retry();
    window.addEventListener("profileUpdated", refreshMatches);
    return () => window.removeEventListener("profileUpdated", refreshMatches);
  }, [matchedJobs.retry]);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const [activeTab, setActiveTab] = useState("matched");
  const profile = summary.data?.profile || {
    name: user?.name || user?.full_name || "User",
    profileCompletion: 0,
    cvReviewScore: 0,
  };
  const displayName = user?.name || user?.full_name || user?.email || profile.name || "User";
  const avatarUrl = user?.avatarUrl || user?.avatar_url || profile.avatarUrl;
  const refreshAll = () =>
    [summary, matches, applications, interviews, recommended, matchedJobs].forEach(
      (resource) => resource.retry(),
    );
  const joinInterview = (url) =>
    window.open(url, "_blank", "noopener,noreferrer");
  const applicationItems = applications.data || [];
  const applicationSummary = {
    total: applicationItems.length,
    pending: applicationItems.filter((item) =>
      ["Pending", "Submitted", "Applied", "Under Review", "In Review"].includes(
        item.status,
      ),
    ).length,
    shortlisted: applicationItems.filter(
      (item) => item.status === "Shortlisted",
    ).length,
    interview: applicationItems.filter((item) =>
      ["Interview", "Interview Scheduled"].includes(item.status),
    ).length,
    hired: applicationItems.filter((item) =>
      ["Hired", "Offer"].includes(item.status),
    ).length,
  };
  const upcomingInterview =
    interviews.data?.find((item) => item.status === "Scheduled") || null;
  const recentApplications = applicationItems.slice(0, 5);
  const recommendationPreview = (recommended.data || []).slice(0, 3);
  const nextAction =
    profile.profileCompletion < 80
      ? {
          label: "Complete Your Profile",
          description: "Complete your profile to improve job matching.",
          path: "/profile",
        }
      : !localStorage.getItem("seekerResume")
        ? {
            label: "Upload Your Resume",
            description: "Upload your resume to start applying for jobs.",
            path: "/resume",
          }
        : upcomingInterview
          ? {
              label: "View Interview",
              description: "You have an upcoming interview to review.",
              path: `/interviews/${upcomingInterview.id}`,
            }
          : null;
  const navItems = [
    ["Dashboard", "/dashboard", LayoutDashboard],
    ["My Profile", "/profile", User],
    ["View Resume", "/resume", FileText],
    ["Find Jobs", "/explore-jobs", Search],
    ["AI Job Matches", "/ai-matches", Target],
    ["Saved Jobs", "/saved-jobs", Bookmark],
    ["My Applications", "/applications", ClipboardList],
    ["Messages", "/chat", MessageSquare],
    ["Notifications", "/notifications", Bell],
  ];
  const handleLogout = () => {
    setLogoutSession({ token, user });
    setLogoutOpen(true);
  };
  return (
    <div className="information-page min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <div className="mb-8 shrink-0 border-b border-slate-100 pb-5">
            <p className="text-lg font-black lowercase text-slate-900">
              job <span className="text-[var(--brand-deep)]">matching</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              AI Platform
            </p>
          </div>
          <nav
            className="seeker-sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto"
            aria-label="Seeker dashboard navigation"
          >
            {navItems.map(([label, path, Icon]) => (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${location.pathname === path || (path === "/dashboard" && location.pathname === "/seeker-dashboard") ? "bg-[var(--brand-primary)] text-white shadow-sm" : "text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-[var(--brand-soft)] hover:text-[var(--brand-deep)]"
            >
              <Settings className="h-3.5 w-3.5" /> Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 px-3 pt-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">{displayName}</span>
            </div>
          </nav>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-7">
          <section
            className="relative isolate overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 shadow-sm sm:px-10 sm:py-14"
            style={{ backgroundImage: `url(${seekerImage})`, backgroundPosition: "center" }}
            aria-labelledby="seeker-dashboard-title"
          >
            <div className="absolute inset-0 -z-10 bg-slate-950/65" aria-hidden="true" />
            <div className="relative max-w-2xl text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
                Job seeker dashboard
              </p>
              <h1 id="seeker-dashboard-title" className="mt-3 text-3xl font-black sm:text-4xl">
                Find the right opportunity for your next chapter
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-100 sm:text-base">
                Welcome back, {profile.name || user?.name || user?.full_name || "Job Seeker"}. Track your applications, explore AI-matched jobs, and move your career forward.
              </p>
            </div>
            <div className="relative mt-7 flex flex-col gap-3 sm:absolute sm:right-8 sm:top-8 sm:mt-0 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={refreshAll}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </section>
          {summary.error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" /> {summary.error}
            </div>
          )}
          {nextAction && (
            <section className="flex flex-col gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {nextAction.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(nextAction.path)}
                className="min-h-10 rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-sm font-bold text-white"
              >
                {nextAction.label}
              </button>
            </section>
          )}
          <section aria-labelledby="application-overview-heading">
            <h2
              id="application-overview-heading"
              className="mb-3 text-lg font-black text-slate-900"
            >
              Application Overview
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Active Applications", applicationSummary.pending, "pending"],
                ["Total Applications", applicationSummary.total, ""],
                ["Pending", applicationSummary.pending, "pending"],
                ["Shortlisted", applicationSummary.shortlisted, "shortlisted"],
                ["Interview", applicationSummary.interview, "interview"],
                ["Hired", applicationSummary.hired, "hired"],
              ].map(([label, value, filter]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/applications${filter ? `?status=${filter}` : ""}`,
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[var(--brand-primary)]"
                >
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {value}
                  </p>
                </button>
              ))}
            </div>
          </section>
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2" aria-label="Seeker dashboard sections">
            {[["matched", "Matched Jobs (AI)"], ["explore", "Explore Jobs"], ["applications", "My Applications"]].map(([tab, label]) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${activeTab === tab ? "bg-[var(--brand-primary)] text-white shadow-sm" : "bg-white text-slate-600 hover:bg-[var(--brand-soft)]"}`}>
                {label}{tab === "applications" && ` (${applicationSummary.total})`}
              </button>
            ))}
          </nav>
          {activeTab === "matched" && <MatchedJobsPanel jobs={matchedJobs.data || []} onApplicationSubmitted={() => { applications.retry(); matchedJobs.retry(); }} />}
          {activeTab === "explore" && <>
            <RecommendedJobsFeed onViewDetails={(id) => navigate(`/jobs/${id}`)} />
            <RecommendedJobs jobs={recommendationPreview} onViewDetails={(id) => navigate(`/jobs/${id}`)} onViewAll={() => navigate("/explore-jobs?from=dashboard")} isLoading={recommended.isLoading} error={recommended.error} onRetry={recommended.retry} />
          </>}
          {activeTab === "applications" && <RecentApplications applications={recentApplications} onViewDetails={(id) => navigate(`/applications/${id}`)} onViewAll={() => navigate("/applications")} isLoading={applications.isLoading} error={applications.error} onRetry={applications.retry} />}
          {interviews.isLoading ? (
            <div className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ) : upcomingInterview ? (
            <UpcomingInterview
              interview={upcomingInterview}
              onViewDetails={(id) => navigate(`/interviews/${id}`, { state: { sourcePath: "/dashboard" } })}
              onJoin={joinInterview}
              isLoading={false}
              error={interviews.error}
              onRetry={interviews.retry}
            />
          ) : (
            <section
              className="rounded-xl border border-slate-200 bg-white p-5"
              aria-labelledby="upcoming-interview-heading"
            >
              <h2
                id="upcoming-interview-heading"
                className="text-lg font-black text-slate-900"
              >
                Upcoming Interview
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                No upcoming interviews.
              </p>
            </section>
          )}
        </div>
      </main>
      {logoutOpen && <LogoutFlowModals
        user={logoutSession?.user}
        token={logoutSession?.token}
        logout={logout}
        setSession={setSession}
        navigate={navigate}
        onClose={() => setLogoutOpen(false)}
      />}
    </div>
  );
}
