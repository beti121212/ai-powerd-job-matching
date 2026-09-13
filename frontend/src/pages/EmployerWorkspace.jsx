import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CompanyReviews from "../components/company/CompanyReviews";
import CompanyQA from "../components/company/CompanyQA";
import TalentPool from "../components/employer/TalentPool";
import AIRecommendedTalent from "../components/employer/AIRecommendedTalent";
import TopCandidatesList from "../components/employer/TopCandidatesList";
import DashboardMetricCards from "../components/employer/DashboardMetricCards";
import ApplicationsTable from "../components/employer/ApplicationsTable";
import EmployerSidebar from "../components/employer/EmployerSidebar";
import {
  EmployerMessages,
  EmployerNotifications,
  EmployerSettings,
} from "../components/employer/EmployerEngagementViews";
import CompanyLegal from "../components/employer/CompanyLegal";
import LogoutFlowModals from "../components/LogoutFlowModals";
import jobMatchingImage from "./images/logo.jpg";

const stages = [
  ["overview", "Dashboard", LayoutDashboard],
  ["profile", "Company & Legal", Building2],
  ["post", "Post Job", Plus],
  ["jobs", "My Jobs", BriefcaseBusiness],
  ["applications", "Applications", ClipboardList],
  ["matching", "AI Matching", Target],
  ["shortlist", "Shortlist", Star],
  ["interviews", "Interviews", CalendarDays],
  ["hired", "Hire & Onboarding", UserCheck],
  ["talent-pool", "Talent Pool / General Applicants", Users],
  ["reviews", "Reviews Management", MessageCircle],
  ["messages", "Messages", MessageCircle],
  ["notifications", "Notifications", Bell],
  ["settings", "Settings", Settings],
  ["summary", "AI Candidate Summary", Sparkles],
];
const stageLabelsAm = {
  overview: "á‹³áˆ½á‰¦áˆ­á‹µ",
  profile: "á‹¨á‹µáˆ­áŒ…á‰µ áˆ˜áŒˆáˆˆáŒ«",
  post: "áˆµáˆ« áˆˆáŒ¥á",
  jobs: "á‹¨áŠ¥áŠ” áˆµáˆ«á‹Žá‰½",
  applications: "áˆ›áˆ˜áˆáŠ¨á‰»á‹Žá‰½",
  matching: "AI áˆ›á‹›áˆ˜áŒƒ",
  shortlist: "á‹¨á‰°áˆ˜áˆ¨áŒ¡",
  interviews: "á‰ƒáˆˆ áˆ˜áŒ á‹­á‰†á‰½",
  hired: "á‰…áŒ¥áˆ­ áŠ¥áŠ“ áˆ›áˆµáŒ€áˆ˜áˆªá‹«",
  "talent-pool":
    "á‹¨á‰°áˆ˜áˆ¨áŒ¡ áŠ¥áŒ©á‹Žá‰½ / áŠ áŒ á‰ƒáˆ‹á‹­ áŠ áˆ˜áˆáŠ«á‰¾á‰½",
  reviews: "á‹¨áŒáˆáŒˆáˆ› áŠ áˆµá‰°á‹³á‹°áˆ­",
  messages: "áˆ˜áˆá‹•áŠ­á‰¶á‰½",
  notifications: "áˆ›áˆ³á‹ˆá‰‚á‹«á‹Žá‰½",
  settings: "á‰…áŠ•á‰¥áˆ®á‰½",
  summary: "AI á‹¨áŠ¥áŒ© áˆ›áŒ á‰ƒáˆˆá‹«",
};
const blankJob = {
  title: "",
  department: "Engineering",
  job_type: "full-time",
  work_mode: "hybrid",
  location: "",
  salary_min: "",
  salary_max: "",
  currency: "ETB",
  application_deadline: "",
  required_skills: "",
  description: "",
};

function ScoreRing({ score, size = 54 }) {
  const color = score >= 85 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${score * 3.6}deg, #e2e8f0 0deg)`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-white font-black text-slate-800"
        style={{
          width: size - 10,
          height: size - 10,
          fontSize: size < 60 ? 12 : 16,
        }}
      >
        {score}%
      </div>
    </div>
  );
}
function Toast({ toast, onClose }) {
  return (
    toast && (
      <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        {toast}
        <button onClick={onClose} className="ml-2 text-slate-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  );
}
function Field({ label, children }) {
  const isDark = String(children?.props?.className || "").includes(
    "bg-slate-900",
  );
  return (
    <div className="block min-w-0">
      <span
        className="mb-2 block text-xs font-black uppercase tracking-wide"
        style={{
          display: "block",
          color: isDark ? "#f8fafc" : "#0f172a",
          fontSize: "0.75rem",
          lineHeight: "1rem",
          fontWeight: 800,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
function inputClass(dark) {
  return `min-h-11 w-full min-w-0 rounded-xl border px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 ${dark ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-400" : "border-slate-300 bg-white shadow-sm hover:border-slate-400"}`;
}

export default function EmployerWorkspace() {
  const { user, token, setSession, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(() =>
    location.pathname.includes("/post-job") ||
    location.pathname.endsWith("/jobs/new")
      ? "post"
      : location.pathname.includes("/applicants")
        ? "applications"
        : searchParams.get("view") || "overview",
  );
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [offers, setOffers] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [company, setCompany] = useState({
    company_name: "",
    industry: "",
    company_size: "11-50",
    location: "",
    website: "",
    description: "",
    benefits: "",
    license_number: "",
    tin_number: "",
    license_expiry_date: "",
    verification_status: "Under Review",
  });
  const [job, setJob] = useState(blankJob);
  const [editingJobId, setEditingJobId] = useState(null);
  const [wizard, setWizard] = useState(1);
  const [selected, setSelected] = useState(null);
  const [aiCandidate, setAiCandidate] = useState(null);
  const [matchingJobId, setMatchingJobId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const [schedule, setSchedule] = useState({
    date: "",
    time: "",
    type: "video",
    link: "",
    notes: "",
  });
  const [language, setLanguage] = useState(
    () => localStorage.getItem("employerLanguage") || "EN",
  );
  const languageOptions = [
    ["EN", "English"],
    ["AM", "áŠ áˆ›áˆ­áŠ›"],
    ["OM", "Afaan Oromoo"],
    ["TI", "á‰µáŒáˆ­áŠ›"],
  ];
  const isAmharic = language === "AM";
  const labelForStage = (id, english) =>
    isAmharic ? stageLabelsAm[id] : english;
  const changeLanguage = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    localStorage.setItem("employerLanguage", nextLanguage);
  };
  const handleLogout = () => {
    setLogoutSession({ token, user });
    setLogoutOpen(true);
  };

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };
  const validateJob = () => {
    const missing = [
      ["Job title", job.title],
      ["Location", job.location],
      ["Description", job.description],
    ]
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label);
    if (missing.length) {
      notify(`Please complete: ${missing.join(", ")}`);
      setWizard(1);
      return false;
    }
    return true;
  };
  useEffect(() => {
    const handleScheduleClick = (event) => {
      const buttonLabel = event.target.closest("button")?.textContent?.trim();
      if (
        buttonLabel === "Save as Draft" ||
        buttonLabel === "Publish Job Now"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!loading && validateJob())
          saveJob(buttonLabel === "Publish Job Now" ? "published" : "draft");
        return;
      }
      if (buttonLabel !== "Schedule Post") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const selectedDate = window.prompt(
        "Enter the publication date and time (YYYY-MM-DDTHH:MM):",
      );
      if (selectedDate) saveJob("scheduled", selectedDate);
    };
    document.addEventListener("click", handleScheduleClick, true);
    return () =>
      document.removeEventListener("click", handleScheduleClick, true);
  });
  useEffect(() => {
    const requestedStage =
      location.pathname.includes("/post-job") ||
      location.pathname.endsWith("/jobs/new")
        ? "post"
        : location.pathname.includes("/applicants")
          ? "applications"
          : searchParams.get("view") || "overview";
    if (stages.some(([id]) => id === requestedStage)) setActive(requestedStage);
  }, [location.pathname, searchParams]);
  const selectStage = (stage) => {
    setActive(stage);
    setSidebarOpen(false);
    const nextUrl =
      stage === "overview"
        ? "/employer/dashboard"
        : stage === "post"
          ? "/employer/jobs/new"
          : `/employer/dashboard?view=${stage}`;
    navigate(nextUrl, { replace: true });
  };
  const navigateFromMetric = (targetTab, subTab) => {
    const stageMap = { my_jobs: "jobs", ai_matching: "matching" };
    const stage = stageMap[targetTab] || targetTab;
    if (stage === "matching") setMinScore(subTab === "top_matches" ? 80 : 0);
    if (stage === "applications") setStatus("all");
    selectStage(stage);
  };
  useEffect(() => {
    const metricTargets = {
      "Active Jobs": ["jobs", "published"],
      Applicants: ["applications", "all"],
      "High AI Matches": ["matching", "top_matches"],
      Shortlisted: ["shortlist", "all"],
      Interviews: ["interviews", "upcoming"],
      Hired: ["hired", "confirmed"],
    };
    const handleMetricClick = (event) => {
      if (active !== "overview") return;
      const cardElement = event.target.closest("div.rounded-2xl.border.p-4");
      const label = cardElement?.querySelector("p")?.textContent?.trim();
      const target = metricTargets[label];
      if (target) navigateFromMetric(target[0], target[1]);
    };
    document.addEventListener("click", handleMetricClick);
    return () => document.removeEventListener("click", handleMetricClick);
  }, [active, applications, jobs, interviews]);
  useEffect(() => {
    let mounted = true;
    const loadEmployerPipeline = async () => {
      try {
        const [
          pipelineResponse,
          offersResponse,
          onboardingResponse,
          interviewsResponse,
          profileResponse,
          jobsResponse,
        ] = await Promise.all([
          api.get("/employer/pipeline"),
          api.get("/employer/offers"),
          api.get("/employer/onboarding"),
          api.get("/employer/interviews"),
          api.get("/employer/profile"),
          api.get("/employer/jobs"),
        ]);
        if (!mounted) return;
        setPipeline(pipelineResponse?.data?.applications || []);
        setOffers(offersResponse?.data?.offers || []);
        setOnboarding(onboardingResponse?.data?.onboarding || []);
        setInterviews(interviewsResponse?.data?.interviews || []);
        setCompany((current) => ({
          ...current,
          ...(profileResponse?.data?.profile || {}),
        }));
        const ownedJobs = jobsResponse?.data?.jobs || jobsResponse?.data || [];
        setJobs(ownedJobs);
        if (ownedJobs.length)
          setMatchingJobId((current) => current || String(ownedJobs[0].id));
        const applicationGroups = await Promise.all(
          ownedJobs.map((item) =>
            api
              .get(`/employer/jobs/${item.id}/applications`)
              .then((response) => response.data.applicants || [])
              .catch(() => []),
          ),
        );
        setApplications(
          applicationGroups
            .flat()
            .map((item) => ({
              ...item,
              id: item.application_id || item.applicationId,
              name: item.full_name || item.name,
              email: item.email || item.contact,
              jobTitle:
                ownedJobs.find(
                  (jobItem) => String(jobItem.id) === String(item.job_id),
                )?.title || item.jobTitle,
              matchScore: Number(
                item.ai_match_score ?? item.matchPercentage ?? 0,
              ),
              status: item.status,
            })),
        );
      } catch (error) {
        if (!mounted) return;
        setPipeline([]);
        setOffers([]);
        setOnboarding([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    setLoading(true);
    loadEmployerPipeline();
    return () => {
      mounted = false;
    };
  }, [token]);
  const filtered = useMemo(
    () =>
      applications.filter(
        (item) =>
          (!search ||
            `${item.name} ${item.jobTitle}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (status === "all" || item.status === status) &&
          Number(item.matchScore || 0) >= minScore,
      ),
    [applications, search, status, minScore],
  );
  const stats = {
    active: jobs.filter((item) => ["published", "active"].includes(item.status)).length,
    applicants: applications.length,
    high: applications.filter((item) => item.matchScore >= 80).length,
    shortlisted: applications.filter((item) => item.status === "shortlisted")
      .length,
    interviews: interviews.filter((item) =>
      ["scheduled", "upcoming"].includes(
        String(item.interview_status || item.status || "").toLowerCase(),
      ),
    ).length,
    hired: applications.filter((item) => item.status === "hired").length,
  };
  const nextInterview = interviews
    .filter((item) =>
      ["scheduled", "upcoming"].includes(
        String(item.interview_status || item.status || "").toLowerCase(),
      ),
    )
    .sort(
      (first, second) =>
        new Date(first.scheduled_at || first.scheduledAt) -
        new Date(second.scheduled_at || second.scheduledAt),
    )[0];
  const nextInterviewLabel = nextInterview
    ? `Next interview: ${new Date(
        nextInterview.scheduled_at || nextInterview.scheduledAt,
      ).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
    : "No upcoming interviews";
  const updateApplication = async (id, nextStatus) => {
    setApplications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setPipeline((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    try {
      await api.patch(`/employer/applications/${id}/status`, {
        status: nextStatus,
      });
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to update candidate.");
      return;
    }
    notify(`Candidate moved to ${nextStatus}`);
  };
  const handleSendOffer = async (application) => {
    const offeredSalary = window.prompt(
      `Enter initial offer salary for ${application.name || "candidate"}:`,
      application.offeredSalary || "75000",
    );
    if (offeredSalary === null) return;
    try {
      await api.post("/employer/offers", {
        applicationId: application.id,
        candidateId:
          application.candidateId ||
          application.job_seeker_id ||
          application.candidate_id,
        offeredSalary: Number(offeredSalary) || null,
        startDate: new Date(Date.now() + 21 * 86400000)
          .toISOString()
          .slice(0, 10),
      });
      setPipeline((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, status: "offered" } : item,
        ),
      );
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, status: "offered" } : item,
        ),
      );
      notify("Offer sent successfully.");
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to send offer.");
    }
  };
  const handleFinalizeEmployee = async (applicationId) => {
    try {
      await api.patch(`/employer/applications/${applicationId}/finalize`);
      setPipeline((current) =>
        current.map((item) =>
          item.id === applicationId ? { ...item, status: "hired" } : item,
        ),
      );
      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId ? { ...item, status: "hired" } : item,
        ),
      );
      notify("Candidate finalized as active employee.");
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to finalize employee.");
    }
  };
  const handleTaskToggle = async (taskId, isCompleted) => {
    try {
      await api.patch(`/employer/onboarding/${taskId}`, { isCompleted });
      setOnboarding((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, isCompleted } : task,
        ),
      );
      notify(isCompleted ? "Task marked complete." : "Task reopened.");
    } catch (error) {
      notify(
        error?.response?.data?.message || "Unable to update onboarding task.",
      );
    }
  };
  const enhanceJob = () =>
    setJob((current) => ({
      ...current,
      description: `Responsibilities:\nÃ¢â‚¬Â¢ Own high-quality ${current.title || "product"} delivery from discovery to launch.\nÃ¢â‚¬Â¢ Collaborate with cross-functional teams and document decisions.\nÃ¢â‚¬Â¢ Improve reliability, accessibility, and measurable user outcomes.\n\nScreening questions:\n1. Tell us about a similar project you shipped.\n2. How do you balance speed and quality?`,
    }));
  const saveJob = async (nextStatus = "draft", scheduledAt = null) => {
    const payload = {
      ...job,
      description: job.description || "",
      sector: job.department,
      jobType: job.job_type,
      workMode: job.work_mode,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      applicationDeadline: job.application_deadline,
      requiredSkills: job.required_skills,
    };
    setLoading(true);
    try {
      const response = editingJobId
        ? await api.put(`/employer/jobs/${editingJobId}`, payload)
        : await api.post("/employer/jobs", payload);
      let savedJob = response.data;
      const savedId = savedJob.id || savedJob.jobId;
      if (nextStatus === "published" || nextStatus === "scheduled")
        savedJob = (
          await api.patch(`/employer/jobs/${savedId}/status`, {
            status: "published",
          })
        ).data;
      savedJob = { ...savedJob, id: savedJob.id || savedId };
      setJobs((current) => [
        savedJob,
        ...current.filter((item) => String(item.id) !== String(savedJob.id)),
      ]);
      setJob(blankJob);
      setEditingJobId(null);
      setWizard(1);
      setActive("jobs");
      notify(
        nextStatus === "published"
          ? "Job published successfully"
          : nextStatus === "scheduled"
            ? "Job scheduled successfully"
            : "Draft saved",
      );
      if (nextStatus === "published")
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.65 } });
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to save job.");
    } finally {
      setLoading(false);
    }
  };
  const toggleJob = async (item) => {
    const next = item.status === "published" ? "paused" : "published";
    setJobs((current) =>
      current.map((jobItem) =>
        jobItem.id === item.id ? { ...jobItem, status: next } : jobItem,
      ),
    );
    try {
      await api.patch(`/employer/jobs/${item.id}/status`, { status: next });
    } catch (requestError) {
      console.warn('Unable to update job status:', requestError);
    }
    notify(`Job ${next}`);
  };
  const deleteJob = async (id) => {
    setJobs((current) => current.filter((item) => item.id !== id));
    try {
      await api.delete(`/employer/jobs/${id}`);
    } catch (requestError) {
      console.warn('Unable to delete job:', requestError);
    }
    notify("Job deleted");
  };
  const editJob = (item) => {
    setEditingJobId(item.id);
    setJob({
      title: item.title || "",
      department: item.department || item.category || "Engineering",
      job_type: item.job_type || "full-time",
      work_mode: item.work_mode || "hybrid",
      location: item.location || "",
      salary_min: item.salary_min || "",
      salary_max: item.salary_max || "",
      currency: item.currency || "ETB",
      application_deadline: item.application_deadline || "",
      required_skills: (item.required_skills || item.tags || []).join
        ? (item.required_skills || item.tags || []).join(", ")
        : item.required_skills || "",
      description: item.description || item.fullDescription || "",
    });
    setWizard(1);
    setActive("post");
    notify("Job loaded for editing");
  };
  const scheduleInterview = async (event) => {
    event.preventDefault();
    if (!selected) return;
    const item = {
      applicationId: selected.id,
      candidateId: selected.candidateId,
      scheduledDate: schedule.date,
      scheduledTime: schedule.time,
      interviewType: schedule.type,
      meetingLink: schedule.link,
      notes: schedule.notes,
    };
    try {
      await api.post("/employer/interviews", item);
      setInterviews((current) => [
        ...current,
        {
          ...item,
          candidate_name: selected.name,
          job_title: selected.jobTitle,
          scheduled_at: `${schedule.date}T${schedule.time}`,
        },
      ]);
      setApplications((current) =>
        current.map((application) =>
          application.id === selected.id
            ? { ...application, status: "interview-scheduled" }
            : application,
        ),
      );
      setShowSchedule(false);
      notify("Interview scheduled");
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to schedule interview.");
    }
  };
  const hire = (item) => {
    updateApplication(item.id, "hired");
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    notify(`${item.name} marked as hired`);
  };

  const shell = dark
    ? "employer-workspace bg-slate-950 text-slate-100"
    : "employer-workspace bg-[#f7f9fc] text-slate-900";
  const card = dark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";
  const employeeName = user?.full_name || user?.name || "Employee";
  const title =
    active === "overview"
      ? isAmharic
        ? `áŠ¥áŠ•áŠ³áŠ• á‹ˆá‹° á‹³áˆ½á‰¦áˆ­á‹µ á‰ á‹°áˆ…áŠ“ áˆ˜áŒ¡á£ ${employeeName}`
        : `Welcome, ${employeeName}`
      : labelForStage(
          active,
          stages.find(([id]) => id === active)?.[1] || "Dashboard",
        );
  const companyName = company.company_name || user?.full_name || "Your Company";
  const renderApplications = (items = filtered) =>
    active === "matching" ? (
      <TopCandidatesList
        jobId={matchingJobId}
        onSelectCandidate={setAiCandidate}
        onShortlist={(candidate) =>
          updateApplication(candidate.applicationId, "shortlisted")
        }
        onSchedule={(candidate) => {
          setSelected({
            ...candidate,
            id: candidate.applicationId,
            candidateId: candidate.candidateId,
          });
          setShowSchedule(true);
        }}
      />
    ) : (
      <div className={`overflow-hidden rounded-2xl border ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#174f73] bg-[#216f9f] text-xs font-extrabold uppercase tracking-wider text-white dark:border-slate-700 dark:bg-[#174f73] dark:text-white">
              <tr>
                <th className="px-5 py-4 font-black">Candidate</th>
                <th className="font-black">Role</th>
                <th className="font-black">AI Score</th>
                <th className="font-black">Status</th>
                <th className="px-5 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => {
                const statusClass = String(item.status || "under-review")
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-left font-bold text-blue-700 hover:underline dark:text-blue-300"
                      >
                        {item.name}
                      </button>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.email}
                      </p>
                    </td>
                    <td className="font-bold text-slate-900 dark:text-slate-100">
                      {item.jobTitle}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(item)}
                        className="flex items-center gap-2"
                      >
                        <ScoreRing score={item.matchScore} size={42} />
                        <span className="font-black text-slate-900 dark:text-white">
                          {item.matchScore}%
                        </span>
                      </button>
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass === "hired" || statusClass === "completed" ? "border border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : statusClass === "shortlisted" || statusClass === "interview-scheduled" || statusClass === "active" ? "border border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200" : "border border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"}`}
                      >
                        {item.status.replaceAll("-", " ")}
                      </span>
                    </td>
                    <td className="px-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateApplication(item.id, "shortlisted")
                          }
                          className="rounded-lg border border-emerald-300 bg-emerald-100 p-2 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                          title="Shortlist"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelected(item);
                            setShowSchedule(true);
                          }}
                          className="rounded-lg border border-violet-300 bg-violet-100 p-2 text-violet-800 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200"
                          title="Schedule"
                        >
                          <CalendarDays className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!items.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-slate-950 dark:text-white font-extrabold"
                  >
                    No candidate matches the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <>
      <div className={`min-h-screen max-w-full overflow-x-hidden ${shell}`}>
        <select
          value={language}
          onChange={changeLanguage}
          className="fixed right-4 top-28 z-30 rounded-xl border-2 border-blue-200 bg-blue-600 px-3 py-2 text-xs font-black text-white shadow-lg outline-none hover:bg-blue-700 sm:top-32"
          aria-label="Change language"
        >
          {languageOptions.map(([value, label]) => (
            <option
              key={value}
              value={value}
              className="bg-white font-semibold text-slate-900"
            >
              {label}
            </option>
          ))}
        </select>
        <div className="flex min-h-[calc(100vh-5rem)] min-w-0 sm:min-h-[calc(100vh-6rem)]">
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            />
          )}
          <EmployerSidebar
            active={active}
            onSelect={selectStage}
            onLogout={handleLogout}
            applicationsCount={applications.length}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            stages={stages}
          />
          <main className="min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-3 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-blue-600">
                    Stage {stages.findIndex(([id]) => id === active) + 1} of 9
                  </p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Operate your hiring pipeline from one intelligent workspace.
                  </p>
                </div>
                {active !== "post" && (
                  <button
                    onClick={() => selectStage("post")}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="h-4 w-4" /> Post New Job
                  </button>
                )}
              </div>

              {active === "overview" && (
                <>
                  <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {[
                      [
                        "Active Jobs",
                        stats.active,
                        BriefcaseBusiness,
                        "bg-blue-50 text-blue-600",
                        stats.active ? "Accepting applications" : "No active listings",
                      ],
                      [
                        "Total Applicants",
                        stats.applicants,
                        Users,
                        "bg-emerald-50 text-emerald-600",
                        "Across all open listings",
                      ],
                      [
                        "High AI Matches (>80%)",
                        stats.high,
                        Sparkles,
                        "bg-purple-50 text-purple-600",
                        "Top qualified talent ready for review",
                      ],
                      [
                        "Shortlisted",
                        stats.shortlisted,
                        Star,
                        "bg-amber-50 text-amber-600",
                        "Moved to decision pipeline",
                      ],
                      [
                        "Interviews Scheduled",
                        stats.interviews,
                        CalendarDays,
                        "bg-rose-50 text-rose-600",
                        nextInterviewLabel,
                      ],
                      [
                        "Successfully Hired",
                        stats.hired,
                        UserCheck,
                        "bg-teal-50 text-teal-600",
                        "Accepted candidates in onboarding",
                      ],
                    ].map(([label, value, Icon, color, statusLabel]) => (
                      <div
                        className={`flex min-h-[145px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md sm:min-h-[160px] ${card}`}
                        key={label}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-extrabold uppercase italic tracking-wider text-slate-500">
                            {label}
                          </p>
                          <span className={`rounded-xl p-3 ${color}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                        </div>
                        <p className="mt-2 mb-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                          {value} <span className="text-sm font-extrabold italic text-slate-500 sm:text-base">{label === "Active Jobs" ? "Active" : label === "Total Applicants" ? "Total" : label.includes("Interviews") ? "Upcoming" : label.includes("Hired") ? "Hired" : "Candidates"}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] font-bold italic text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {statusLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white">
                          Recent Applications
                        </h3>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          The strongest candidates across your open roles.
                        </p>
                      </div>
                      <button
                        onClick={() => setActive("applications")}
                        className="text-sm font-extrabold text-blue-700 hover:text-blue-900"
                      >
                        View all <ArrowRight className="inline h-4 w-4" />
                      </button>
                    </div>
                    {renderApplications(applications.slice(0, 4))}
                  </div>
                </>
              )}

              {active === "profile" && (
                <CompanyLegal
                  company={company}
                  onSaveSuccess={(payload) =>
                    setCompany((current) => ({ ...current, ...payload }))
                  }
                />
              )}
              {active === "post" && (
                <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                  <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                    <div className="mb-6 flex items-center gap-2">
                      {["Job Information", "Live Preview", "Publish"].map(
                        (label, index) => (
                          <div
                            key={label}
                            className={`flex flex-1 items-center gap-2 text-xs font-bold ${wizard === index + 1 ? "text-blue-600" : "text-slate-400"}`}
                          >
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${wizard >= index + 1 ? "bg-blue-600 text-white" : "bg-slate-100"}`}
                            >
                              {index + 1}
                            </span>
                            {label}
                          </div>
                        ),
                      )}
                    </div>
                    {wizard === 1 && (
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Job Title">
                          <input
                            className={inputClass(dark)}
                            value={job.title}
                            onChange={(e) =>
                              setJob({ ...job, title: e.target.value })
                            }
                            placeholder="Senior React Developer"
                          />
                        </Field>
                        <Field label="Department">
                          <input
                            className={inputClass(dark)}
                            value={job.department}
                            onChange={(e) =>
                              setJob({ ...job, department: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Job Type">
                          <select
                            className={inputClass(dark)}
                            value={job.job_type}
                            onChange={(e) =>
                              setJob({ ...job, job_type: e.target.value })
                            }
                          >
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                          </select>
                        </Field>
                        <Field label="Work Model">
                          <select
                            className={inputClass(dark)}
                            value={job.work_mode}
                            onChange={(e) =>
                              setJob({ ...job, work_mode: e.target.value })
                            }
                          >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="on-site">On-site</option>
                          </select>
                        </Field>
                        <Field label="Location">
                          <input
                            className={inputClass(dark)}
                            value={job.location}
                            onChange={(e) =>
                              setJob({ ...job, location: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Currency">
                          <select
                            className={inputClass(dark)}
                            value={job.currency}
                            onChange={(e) =>
                              setJob({ ...job, currency: e.target.value })
                            }
                          >
                            <option>ETB</option>
                            <option>USD</option>
                          </select>
                        </Field>
                        <Field label="Minimum Salary">
                          <input
                            type="number"
                            className={inputClass(dark)}
                            value={job.salary_min}
                            onChange={(e) =>
                              setJob({ ...job, salary_min: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Maximum Salary">
                          <input
                            type="number"
                            className={inputClass(dark)}
                            value={job.salary_max}
                            onChange={(e) =>
                              setJob({ ...job, salary_max: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Deadline">
                          <input
                            type="date"
                            className={inputClass(dark)}
                            value={job.application_deadline}
                            onChange={(e) =>
                              setJob({
                                ...job,
                                application_deadline: e.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label="Required Skills (comma separated)">
                          <input
                            className={inputClass(dark)}
                            value={job.required_skills}
                            onChange={(e) =>
                              setJob({
                                ...job,
                                required_skills: e.target.value,
                              })
                            }
                            placeholder="React, Node.js, SQL"
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Description">
                            <textarea
                              rows="8"
                              className={inputClass(dark)}
                              value={job.description}
                              onChange={(e) =>
                                setJob({ ...job, description: e.target.value })
                              }
                            />
                            <button
                              type="button"
                              onClick={enhanceJob}
                              className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700"
                            >
                              <Sparkles className="h-4 w-4" /> AI Enhance Job
                              Description
                            </button>
                          </Field>
                        </div>
                      </div>
                    )}
                    {wizard === 2 && (
                      <div className="rounded-2xl border border-slate-200 p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                          Candidate preview
                        </p>
                        <h3 className="mt-3 text-2xl font-black">
                          {job.title || "Your new job title"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {companyName} Ã‚Â· {job.location || "Location"} Ã‚Â·{" "}
                          {job.work_mode}
                        </p>
                        <div className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">
                          {job.description ||
                            "Your enhanced job description will appear here."}
                        </div>
                      </div>
                    )}
                    {wizard === 3 && (
                      <div className="rounded-2xl bg-blue-50 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-blue-600" />
                        <h3 className="mt-4 text-2xl font-black">
                          Ready to publish?
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                          Save this role as a draft, schedule it later, or
                          publish it now for candidates to discover.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <button
                            onClick={() => saveJob("draft")}
                            className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700"
                          >
                            Save as Draft
                          </button>
                          <button
                            onClick={() => {
                              saveJob("draft");
                              notify("Job scheduled for publishing");
                            }}
                            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white"
                          >
                            Schedule Post
                          </button>
                          <button
                            onClick={() => saveJob("published")}
                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                          >
                            Publish Job Now
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-8 flex justify-between">
                      <button
                        disabled={wizard === 1}
                        onClick={() => setWizard((value) => value - 1)}
                        className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-30"
                      >
                        Back
                      </button>
                      {wizard < 3 && (
                        <button
                          onClick={() => setWizard((value) => value + 1)}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                        >
                          Continue <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`overflow-hidden rounded-2xl border shadow-sm ${card}`}>
                    <div className="p-6 sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
                        AI assistant
                      </p>
                      <h3 className="mt-3 text-2xl font-black text-slate-950">
                        Build a better role
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-500">
                        Use structured responsibilities and screening questions to
                        improve candidate signal.
                      </p>
                      <div className="mt-7 space-y-4 text-sm font-medium text-slate-600">
                        {[
                          "Skills-based screening",
                          "Candidate-facing preview",
                          "ETB and USD salary support",
                          "Draft, schedule, or publish",
                        ].map((feature) => (
                          <div className="flex items-center gap-3" key={feature}>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative min-h-56 overflow-hidden bg-sky-50 sm:min-h-72">
                      <img
                        src={jobMatchingImage}
                        alt="AI-powered hiring team collaborating"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
                    </div>
                  </div>
                </div>
              )}

              {active === "jobs" && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        label: "Total jobs",
                        value: jobs.length,
                        tone: "text-blue-600",
                      },
                      {
                        label: "Live openings",
                        value: jobs.filter(
                          (item) =>
                            (item.status || "").toLowerCase() === "published",
                        ).length,
                        tone: "text-emerald-600",
                      },
                      {
                        label: "AI matches",
                        value: applications.filter(
                          (item) => Number(item.matchScore || 0) >= 80,
                        ).length,
                        tone: "text-violet-600",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-2xl border p-5 shadow-sm ${card}`}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          {stat.label}
                        </p>
                        <p className={`mt-3 text-3xl font-black ${stat.tone}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {jobs.length ? (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {jobs.map((item) => (
                        <div
                          className={`rounded-2xl border p-5 shadow-sm ${card}`}
                          key={item.id}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/employer/jobs/${item.id}/applicants`,
                                  )
                                }
                                className="text-left"
                              >
                                <h3 className="text-lg font-black hover:text-blue-700">
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                  {item.department ||
                                    item.category ||
                                    "General"}{" "}
                                  · {item.location || "Remote"}
                                </p>
                              </button>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${item.status === "published" ? "bg-emerald-50 text-emerald-700" : item.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {item.status || "draft"}
                            </span>
                          </div>
                          <div className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                              <span>Applicants</span>
                              <b className="font-black text-slate-900">
                                {item.applicantsCount || 0}
                              </b>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Shortlisted</span>
                              <b className="font-black text-slate-900">
                                {item.shortlisted || 0}
                              </b>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>AI fit</span>
                              <b className="font-black text-slate-900">
                                {item.avgMatch ?? "—"}
                              </b>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              onClick={() => editJob(item)}
                              className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/employer/jobs/${item.id}/applicants`)
                              }
                              className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              View Applicants
                            </button>
                            <button
                              onClick={() => toggleJob(item)}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold"
                            >
                              {item.status === "published"
                                ? "Pause"
                                : "Activate"}
                            </button>
                            <button
                              onClick={() => deleteJob(item.id)}
                              className="rounded-xl bg-red-50 p-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border border-dashed p-10 text-center ${card}`}
                    >
                      <h3 className="text-xl font-black text-slate-900">
                        No jobs yet
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Create your first role to start receiving applicant
                        matches.
                      </p>
                      <button
                        onClick={() => selectStage("post")}
                        className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                      >
                        Post a job
                      </button>
                    </div>
                  )}
                </div>
              )}

              {["applications", "matching", "shortlist", "hired"].includes(
                active,
              ) && (
                <div className="space-y-5">
                  <div
                    className={`flex flex-wrap gap-3 rounded-2xl border p-4 ${card}`}
                  >
                    <div className="relative min-w-56 flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        className={`${inputClass(dark)} pl-10`}
                        placeholder="Search candidates or roles"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className={inputClass(dark)}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="all">All statuses</option>
                      <option value="applied">Applied</option>
                      <option value="under-review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview-scheduled">Interview</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      className={inputClass(dark)}
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                    >
                      <option value="0">Any AI score</option>
                      <option value="65">65%+ score</option>
                      <option value="80">80%+ score</option>
                      <option value="90">90%+ score</option>
                    </select>
                  </div>
                  {active === "matching" && (
                    <div className="grid gap-4 md:grid-cols-4">
                      {[
                        ["Hard Skills Overlap", 40],
                        ["Experience Relevance", 30],
                        ["Education & Certs", 15],
                        ["Work Model & Location", 15],
                      ].map(([label, weight]) => (
                        <div
                          className={`rounded-2xl border p-4 ${card}`}
                          key={label}
                        >
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="mt-2 text-2xl font-black">{weight}%</p>
                          <div className="mt-3 h-2 rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${weight * 2.5}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {active === "shortlist" && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <h3 className="font-black text-blue-900">
                        Shortlist ready for action
                      </h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Move high-signal candidates into interviews or export
                        your shortlist.
                      </p>
                    </div>
                  )}
                  {renderApplications(
                    active === "shortlist"
                      ? filtered.filter((item) => item.status === "shortlisted")
                      : active === "hired"
                        ? filtered.filter((item) => item.status === "hired")
                        : filtered,
                  )}
                </div>
              )}

              {active === "hired" && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        label: "Offers sent",
                        value: offers.length,
                        tone: "text-violet-600",
                      },
                      {
                        label: "Onboarding tasks",
                        value: onboarding.length,
                        tone: "text-emerald-600",
                      },
                      {
                        label: "Active hires",
                        value: pipeline.filter(
                          (item) => item.status === "hired",
                        ).length,
                        tone: "text-cyan-600",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-2xl border p-5 ${card}`}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          {stat.label}
                        </p>
                        <p className={`mt-3 text-3xl font-black ${stat.tone}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <section className={`rounded-2xl border p-5 ${card}`}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black">Offer pipeline</h3>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Live
                        </span>
                      </div>
                      <div className="space-y-3">
                        {offers.length ? (
                          offers.map((offer) => (
                            <div
                              key={offer.id || offer.applicationId}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-black text-slate-900">
                                    {offer.candidateName ||
                                      offer.candidateName ||
                                      "Candidate"}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {offer.jobTitle || "Role"} ·{" "}
                                    {offer.offeredSalary
                                      ? `$${offer.offeredSalary}`
                                      : "Salary pending"}
                                  </p>
                                </div>
                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black uppercase text-violet-700">
                                  {offer.status || "sent"}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  onClick={() =>
                                    handleFinalizeEmployee(offer.applicationId)
                                  }
                                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                                >
                                  Finalize hire
                                </button>
                                <button
                                  onClick={() =>
                                    setSelected({
                                      id: offer.applicationId,
                                      name: offer.candidateName,
                                      email: "",
                                      jobTitle: offer.jobTitle,
                                      matchScore: 0,
                                    })
                                  }
                                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                                >
                                  View details
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                            No offers have been sent yet. Candidates from the
                            Applications tab can be moved into the offer stage.
                          </div>
                        )}
                      </div>
                    </section>
                    <section className={`rounded-2xl border p-5 ${card}`}>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-black">
                          Onboarding checklist
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {onboarding.filter((task) => task.isCompleted).length}
                          /{onboarding.length || 0}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {onboarding.length ? (
                          onboarding.map((task) => (
                            <label
                              key={task.id}
                              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900">
                                  {task.taskTitle ||
                                    task.title ||
                                    "Onboarding task"}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {task.candidateName || "Candidate"} ·{" "}
                                  {task.jobTitle || "Role"}
                                </p>
                              </div>
                              <input
                                type="checkbox"
                                checked={Boolean(task.isCompleted)}
                                onChange={(event) =>
                                  handleTaskToggle(
                                    task.id,
                                    event.target.checked,
                                  )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                            No onboarding tasks yet. Finalize a candidate to
                            generate the active employee workflow.
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}
              {active === "interviews" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {interviews.length ? (
                    interviews.map((item, index) => (
                      <div
                        className={`rounded-2xl border p-5 ${card}`}
                        key={item.id || index}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-8 w-8 text-violet-600" />
                          <div>
                            <h3 className="font-black">
                              {item.candidate_name || item.candidateName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {item.job_title} Ã‚Â·{" "}
                              {new Date(item.scheduled_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => notify("Scorecard opened")}
                          className="mt-5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700"
                        >
                          Open Scorecard
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`rounded-2xl border p-10 text-center ${card}`}
                    >
                      <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                      <h3 className="mt-3 font-black">
                        No interviews scheduled
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Schedule an interview directly from an application.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {active === "summary" && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TopCandidatesList
                    jobId={matchingJobId}
                    onSelectCandidate={setAiCandidate}
                    onShortlist={(candidate) =>
                      updateApplication(candidate.applicationId, "shortlisted")
                    }
                    onSchedule={(candidate) => {
                      setSelected({
                        ...candidate,
                        id: candidate.applicationId,
                        candidateId: candidate.candidateId,
                      });
                      setShowSchedule(true);
                    }}
                  />
                </div>
              )}
              {active === "matching" && (
                <div className="mt-8">
                  <AIRecommendedTalent jobId={matchingJobId} />
                </div>
              )}
              {active === "talent-pool" && <TalentPool />}
              {active === "messages" && <EmployerMessages />}
              {active === "notifications" && <EmployerNotifications />}
              {active === "settings" && <EmployerSettings />}
              {active === "reviews" && (
                <div className="space-y-8">
                  <CompanyReviews companyId={company.id || 1} employerView />
                  <CompanyQA companyId={company.id || 1} employerView />
                </div>
              )}
            </div>
          </main>
        </div>
        <Toast toast={toast} onClose={() => setToast("")} />
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
            <div
              className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 shadow-2xl ${card}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Candidate CV Viewer
                  </p>
                  <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
                  <p className="text-sm text-slate-500">
                    {selected.email} Ã‚Â· {selected.jobTitle}
                  </p>
                </div>
                <button onClick={() => setSelected(null)}>
                  <X />
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr]">
                <ScoreRing score={selected.matchScore} size={90} />
                <div>
                  <h3 className="font-black">AI Match Breakdown</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Strong match based on skills and experience. Review the
                    skill gaps before the final decision.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.skills?.map((skill) => (
                      <span
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">
                    Work history
                  </p>
                  <p className="mt-2 font-bold">
                    {selected.experience} relevant experience
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Product delivery and measurable outcomes.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">Education</p>
                  <p className="mt-2 font-bold">{selected.education}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    CV parsing completed successfully.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => updateApplication(selected.id, "shortlisted")}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => setShowSchedule(true)}
                  className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => hire(selected)}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                >
                  Mark Hired
                </button>
                <a
                  href={selected.resumeUrl || "#"}
                  className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold"
                >
                  View PDF
                </a>
              </div>
            </div>
          </div>
        )}
        {showSchedule && selected && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
            <form
              onSubmit={scheduleInterview}
              className={`w-full max-w-lg space-y-5 rounded-3xl p-6 shadow-2xl ${card}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Schedule Interview</h2>
                <button type="button" onClick={() => setShowSchedule(false)}>
                  <X />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date">
                  <input
                    required
                    type="date"
                    className={inputClass(dark)}
                    value={schedule.date}
                    onChange={(e) =>
                      setSchedule({ ...schedule, date: e.target.value })
                    }
                  />
                </Field>
                <Field label="Time">
                  <input
                    required
                    type="time"
                    className={inputClass(dark)}
                    value={schedule.time}
                    onChange={(e) =>
                      setSchedule({ ...schedule, time: e.target.value })
                    }
                  />
                </Field>
                <Field label="Meeting Type">
                  <select
                    className={inputClass(dark)}
                    value={schedule.type}
                    onChange={(e) =>
                      setSchedule({ ...schedule, type: e.target.value })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="in-person">In-person</option>
                  </select>
                </Field>
                <Field label="Meeting Link">
                  <input
                    className={inputClass(dark)}
                    value={schedule.link}
                    onChange={(e) =>
                      setSchedule({ ...schedule, link: e.target.value })
                    }
                    placeholder="https://meet.google.com/..."
                  />
                </Field>
              </div>
              <Field label="Agenda Notes">
                <textarea
                  rows="4"
                  className={inputClass(dark)}
                  value={schedule.notes}
                  onChange={(e) =>
                    setSchedule({ ...schedule, notes: e.target.value })
                  }
                />
              </Field>
              <button className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white">
                Confirm & Schedule
              </button>
            </form>
          </div>
        )}
      </div>
      {logoutOpen && (
        <LogoutFlowModals
          user={logoutSession?.user}
          token={logoutSession?.token}
          logout={logout}
          setSession={setSession}
          navigate={navigate}
          onClose={() => setLogoutOpen(false)}
        />
      )}
    </>
  );
}
