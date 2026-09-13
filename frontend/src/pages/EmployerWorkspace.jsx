import { useEffect, useMemo, useRef, useState } from "react";
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
  PauseCircle,
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
import {
  PIPELINE_STATUS_OPTIONS,
  getPipelineStatusClasses,
  getPipelineStatusLabel,
  normalizePipelineStatus,
} from "../utils/pipelineStatus";
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
import { EmployerHeader } from "../components/layout/EmployerHeader";
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
const jobSectors = [
  "Select sector",
  "Agriculture",
  "Architecture & Urban Planning",
  "Beauty & Grooming",
  "Brokerage & Case Closing",
  "Chemical & Biomedical Engineering",
  "Construction & Civil Engineering",
  "Creative Art & Design",
  "Customer Service & Care",
  "Documentation & Writing",
  "Event Management & Organization",
  "Food & Drink Preparation / Service",
  "Healthcare",
  "Hospitality & Tourism",
  "Human Resource & Talent Management",
  "Information Technology",
  "Installation & Maintenance",
  "Janitorial & Office Services",
  "Labor & Masonry",
  "Logistics & Supply Chain",
  "Mechanical & Electrical Engineering",
  "Multimedia Content Production",
  "Pharmaceutical",
  "Psychiatry, Psychology & Social Work",
  "Sales & Promotion",
  "Secretarial & Office Management",
  "Security & Safety",
  "Retail & Office Support",
  "Software Design & Development",
  "Transportation & Delivery",
  "Veterinary",
  "Woodwork & Carpentry",
  "Fashion / Clothing & Textile",
  "Media & Entertainment",
  "Environmental, Mining & Energy Engineering",
  "Law & Legal Advocacy",
  "Marketing",
  "Journalism & Communication",
  "Business Administration & Operations",
  "Research Services",
  "Data Science & Analytics",
  "Teaching & Education",
  "Tutoring, Training & Mentorship",
  "Gardening & Landscaping",
  "Horticulture",
  "Livestock & Animal Husbandry",
  "Manufacturing & Production",
  "Purchasing & Procurement",
  "Translation & Transcription",
  "Accounting & Finance",
  "Advisory & Consultancy",
  "Aeronautics & Aerospace",
];

const blankJob = {
  title: "",
  department: "Select sector",
  experience_level: "mid-level",
  job_type: "full-time",
  work_mode: "hybrid",
  gender_preference: "any",
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
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`fixed right-6 top-6 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl ${
        isError
          ? "border-red-500 bg-red-600 text-white"
          : "border-emerald-500 bg-emerald-600 text-white"
      }`}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 text-white" />
      ) : (
        <CheckCircle2 className="h-5 w-5 text-emerald-200" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
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
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(false);
  const toastTimeoutRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    date: "",
    time: "",
  });
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const [schedule, setSchedule] = useState({
    date: "",
    time: "",
    type: "video",
    link: "",
    notes: "",
  });
  const handleLogout = () => {
    setLogoutSession({ token, user });
    setLogoutOpen(true);
  };

  const handleHeaderLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login", { replace: true });
  };

  const notify = (message, type = "success") => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 5000);
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
      notify(`Please complete: ${missing.join(", ")}`, "error");
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
          api.get("/employer/my-jobs"),
        ]);
        console.log("--> [MY JOBS API RESPONSE]:", jobsResponse?.data);
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
  const activeJobs = useMemo(
    () =>
      jobs.filter((job) =>
        ["published", "active"].includes(
          String(job.status || "").toLowerCase(),
        ),
      ),
    [jobs],
  );
  const publishedJobs = useMemo(
    () =>
      jobs.filter(
        (job) => normalizeJobStatus(job.status) === "active",
      ),
    [jobs],
  );
  const scheduledJobs = useMemo(
    () =>
      jobs.filter(
        (job) => normalizeJobStatus(job.status) === "scheduled",
      ),
    [jobs],
  );
  const draftJobs = useMemo(
    () =>
      jobs.filter(
        (job) => normalizeJobStatus(job.status) === "draft",
      ),
    [jobs],
  );
  useEffect(() => {
    if (
      selectedJobFilter !== "all" &&
      !activeJobs.some(
        (job) => String(job.id) === String(selectedJobFilter),
      )
    ) {
      setSelectedJobFilter("all");
    }
  }, [activeJobs, selectedJobFilter]);
  const filtered = useMemo(
    () =>
      applications.filter(
        (item) =>
          (!search ||
            `${item.name} ${item.jobTitle}`
              .toLowerCase()
              .includes(search.toLowerCase())) &&
          (status === "all" || normalizePipelineStatus(item.status) === status) &&
          Number(item.matchScore || 0) >= minScore,
      ),
    [applications, search, status, minScore],
  );
  const stats = {
    active: jobs.filter((item) => ["published", "active"].includes(item.status)).length,
    applicants: applications.length,
    high: applications.filter((item) => item.matchScore >= 80).length,
    shortlisted: applications.filter(
      (item) => normalizePipelineStatus(item.status) === "shortlisted",
    ).length,
    interviews: interviews.filter((item) =>
      ["scheduled", "upcoming"].includes(
        String(item.interview_status || item.status || "").toLowerCase(),
      ),
    ).length,
    hired: applications.filter(
      (item) => normalizePipelineStatus(item.status) === "hired",
    ).length,
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
  const unreviewedCount = applications.filter((item) =>
    ["applied", "under-review"].includes(
      normalizePipelineStatus(item.status),
    ),
  ).length;
  const expiringJob = jobs
    .filter(
      (job) =>
        job.application_deadline &&
        new Date(job.application_deadline).getTime() > Date.now() &&
        new Date(job.application_deadline).getTime() - Date.now() <
          3 * 24 * 60 * 60 * 1000,
    )
    .sort(
      (first, second) =>
        new Date(first.application_deadline) - new Date(second.application_deadline),
    )[0];
  const pipelineStages = [
    { label: "Applied", value: applications.length || 0, percent: 100, tone: "bg-blue-600" },
    { label: "Screened", value: Math.max(0, Math.floor((applications.filter((item) => ["shortlisted", "under-review", "interview", "hired"].includes(normalizePipelineStatus(item.status))).length / Math.max(applications.length || 1, 1)) * 100)), percent: 45, tone: "bg-violet-600" },
    { label: "Interview", value: applications.filter((item) => normalizePipelineStatus(item.status) === "interview").length || 0, percent: 20, tone: "bg-amber-500" },
    { label: "Offer", value: applications.filter((item) => normalizePipelineStatus(item.status) === "hired").length || 0, percent: 8, tone: "bg-emerald-500" },
    { label: "Hired", value: stats.hired || 0, percent: 4, tone: "bg-emerald-700" },
  ];
  const updateApplication = async (id, nextStatus) => {
    const normalizedStatus = normalizePipelineStatus(nextStatus);

    setApplications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: normalizedStatus } : item,
      ),
    );
    setPipeline((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: normalizedStatus } : item,
      ),
    );
    try {
      await api.patch(`/employer/applications/${id}/status`, {
        status: normalizedStatus,
      });
    } catch (error) {
      notify(error?.response?.data?.message || "Unable to update candidate.");
      return;
    }
    notify(`Candidate moved to ${getPipelineStatusLabel(normalizedStatus)}`);
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
      description: `Responsibilities:\n• Own high-quality ${current.title || "product"} delivery from discovery to launch.\n• Collaborate with cross-functional teams and document decisions.\n• Improve reliability, accessibility, and measurable user outcomes.\n\nScreening questions:\n1. Tell us about a similar project you shipped.\n2. How do you balance speed and quality?`,
    }));
  const saveJob = async (nextStatus = "draft", scheduledAt = null) => {
    const payload = {
      ...job,
      status: nextStatus === "scheduled" ? "scheduled" : nextStatus,
      description: job.description || "",
      sector: job.department,
      jobType: job.job_type,
      workMode: job.work_mode,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      applicationDeadline: job.application_deadline,
      requiredSkills: job.required_skills,
      scheduledDate:
        scheduledAt || scheduleDraft.date || scheduleDraft.time
          ? `${scheduleDraft.date || scheduledAt?.slice(0, 10) || ""}${scheduleDraft.time ? `T${scheduleDraft.time}` : scheduledAt?.slice(11) || ""}`
          : null,
    };
    setLoading(true);
    try {
      const response = editingJobId
        ? await api.put(`/employer/jobs/${editingJobId}`, payload)
        : await api.post("/jobs", payload);
      let savedJob = response.data;
      const savedId = savedJob.id || savedJob.jobId;
      if (nextStatus === "published" || nextStatus === "scheduled")
        savedJob = (
          await api.patch(`/employer/jobs/${savedId}/status`, {
            status: nextStatus === "scheduled" ? "scheduled" : "published",
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
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save job.";
      notify(serverMessage, "error");
    } finally {
      setLoading(false);
    }
  };
  const toggleJob = async (item) => {
    const normalizedStatus = normalizeJobStatus(item.status);
    const next = normalizedStatus === "active" ? "paused" : "published";

    console.log(
      "--> [FRONTEND STATUS TRIGGER] Attempting to update Job ID:",
      item.id,
      "to Status:",
      next,
    );

    if (!item.id || item.id === "undefined") {
      console.error(
        "--> [FATAL] Cannot update status: jobId is undefined or invalid!",
      );
      notify("Error: Invalid Job ID. Please publish the job first.", "error");
      return;
    }

    setJobs((current) =>
      current.map((jobItem) =>
        jobItem.id === item.id ? { ...jobItem, status: next } : jobItem,
      ),
    );

    try {
      const response = await api.patch(`/employer/jobs/${item.id}/status`, {
        status: next,
      });

      console.log("--> [BACKEND RESPONSE]:", response.status, response.data);

      if (response?.data?.success === false) {
        throw new Error(response.data.error || "Failed to update job status.");
      }

      notify(`Job ${next}`);
    } catch (requestError) {
      console.error("--> [STATUS ERROR DETAILS]:", requestError);
      const message =
        requestError?.response?.data?.error ||
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Failed to update job status.";

      notify(message, "error");
    }
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
      experience_level: item.experience_level || item.experienceLevel || "mid-level",
      job_type: item.job_type || "full-time",
      work_mode: item.work_mode || "hybrid",
      gender_preference: item.gender_preference || item.genderPreference || "any",
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
            ? { ...application, status: "interview" }
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
      ? `Welcome, ${employeeName}`
      : stages.find(([id]) => id === active)?.[1] || "Dashboard";
  const companyName = company.company_name || user?.full_name || "Your Company";

  const normalizeJobStatus = (statusValue) => {
    const value = String(statusValue || "draft").trim().toLowerCase();
    return value === "published" ? "active" : value;
  };

  const getJobStatusClasses = (statusValue) => {
    const normalized = normalizeJobStatus(statusValue);

    switch (normalized) {
      case "active":
        return "border border-emerald-200 bg-emerald-50 text-emerald-700";
      case "paused":
        return "border border-amber-200 bg-amber-50 text-amber-700";
      case "draft":
        return "border border-slate-200 bg-slate-100 text-slate-600";
      case "closed":
      case "expired":
      case "archived":
        return "border border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const renderApplications = (items = filtered) => {
    if (active === "matching") {
      return (
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
      );
    }

    const filteredCandidates = (items || []).filter((item) => {
      if (selectedJobFilter === "all") return true;
      const itemJobId = String(
        item.job_id ?? item.jobId ?? item.job?.id ?? "",
      );
      return itemJobId === String(selectedJobFilter);
    });
    const visibleCandidates =
      active === "overview" ? filteredCandidates.slice(0, 4) : filteredCandidates;

    const getStatusClass = (statusValue) =>
      getPipelineStatusClasses(statusValue);

    const getStatusLabel = (statusValue) =>
      getPipelineStatusLabel(statusValue);

    return (
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <span>Recent Applicants & AI Matches</span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {filteredCandidates.length}
              </span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Evaluate incoming resumes, AI compatibility scores, and take quick hiring actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="whitespace-nowrap text-xs font-semibold text-slate-500">
              Filter by Job:
            </label>
            <select
              value={selectedJobFilter}
              onChange={(event) => setSelectedJobFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Posted Jobs ({activeJobs.length})</option>
              {activeJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            {active === "overview" && (
              <button
                onClick={() => navigate("/employer/candidates")}
                className="ml-2 flex items-center gap-1 whitespace-nowrap text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View all</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-blue-200 bg-blue-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <tr>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Applied Job Role</th>
                <th className="px-4 py-3.5 text-center">AI Match</th>
                <th className="px-4 py-3.5">Applied Date</th>
                <th className="px-4 py-3.5">Hiring Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleCandidates.length > 0 ? (
                visibleCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                          {(candidate.name || "CA")
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase() || "CA"}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelected(candidate)}
                            className="text-left text-xs font-bold text-slate-800 hover:text-blue-700 sm:text-sm"
                          >
                            {candidate.name}
                          </button>
                          <p className="text-[11px] text-slate-400">
                            {candidate.email || candidate.phone || "No contact provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {candidate.jobTitle || "General Application"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${candidate.matchScore >= 85 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : candidate.matchScore >= 70 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                      >
                        <span>✦</span>
                        <span>{candidate.matchScore || 85}%</span>
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-500">
                      {candidate.appliedDate ||
                        candidate.applied_at ||
                        candidate.created_at ||
                        candidate.createdAt ||
                        "Today"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusClass(candidate.status)}`}
                      >
                        {getStatusLabel(candidate.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(candidate)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          title="View Full Profile / CV"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => {
                            setSelected(candidate);
                            notify(`Opened chat for ${candidate.name}`);
                          }}
                          className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100"
                          title="Send Message"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => updateApplication(candidate.id, "rejected")}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Decline / Reject"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-semibold text-slate-600">
                        No applicants found for this filter
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Select another job or post a new vacancy to receive applications.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen max-w-full overflow-x-hidden ${shell}`}>
        <EmployerHeader
          currentTabTitle={title}
          breadcrumb={active === "overview" ? "Home / Dashboard" : `Home / ${title}`}
          user={user}
          unreadNotificationsCount={0}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
          onSearchClick={() => notify("Global search is ready for implementation.")}
          onOpenNotifications={() => setActive("notifications")}
          onOpenMessages={() => setActive("messages")}
          onLogout={handleHeaderLogout}
        />
        <div className="flex min-w-0">
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
          <main className="min-w-0 max-w-full flex-1 overflow-x-hidden bg-slate-50/50 p-3 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {active === "overview" ? (
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      Welcome, {companyName || employeeName || "Employer"}
                    </h1>
                    <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500 sm:text-sm">
                      Review AI-matched candidates, track recruitment progress, and connect with top talent seamlessly.
                    </p>
                  </div>

                  <button
                    onClick={() => selectStage("post")}
                    className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
                  >
                    <span className="text-base font-bold">+</span>
                    <span>Post New Job</span>
                  </button>
                </div>
              ) : (
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex-1" />
                  {active !== "post" && (
                    <button
                      onClick={() => selectStage("post")}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                    >
                      <Plus className="h-4 w-4" /> Post New Job
                    </button>
                  )}
                </div>
              )}

              {active === "overview" && (
                <>
                  <div className="mb-8 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white p-5 shadow-xs">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                        <span>Action Required &amp; Today&apos;s Priorities</span>
                      </h3>
                      <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                        {Math.max(1, Math.min(3, unreviewedCount > 0 ? 3 : 1))} pending tasks
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3 shadow-xs">
                        <div className="text-xs">
                          <p className="font-bold text-slate-800">{unreviewedCount} New Unreviewed Resumes</p>
                          <p className="text-[11px] text-slate-400">{activeJobs[0]?.title || "Open role"} listing</p>
                        </div>
                        <button onClick={() => navigate("/employer/applications")} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                          Review
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3 shadow-xs">
                        <div className="text-xs">
                          <p className="font-bold text-slate-800">Interview with Yabsira Today</p>
                          <p className="text-[11px] text-slate-400">Scheduled for 2:30 PM</p>
                        </div>
                        <button onClick={() => navigate("/employer/messages")} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">
                          Details
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3 shadow-xs">
                        <div className="text-xs">
                          <p className="font-bold text-slate-800">{expiringJob ? "1 Job Expiring in 3 Days" : "No Jobs Expiring Soon"}</p>
                          <p className="text-[11px] text-slate-400">
                            {expiringJob ? `${expiringJob.title} role` : "All active listings are healthy"}
                          </p>
                        </div>
                        <button onClick={() => navigate("/employer/jobs")} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">
                          {expiringJob ? "Extend" : "View"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Your Active Job Postings</h3>
                        <p className="text-xs text-slate-400">Manage live listings, monitor applicants, and share public links.</p>
                      </div>
                      <button onClick={() => selectStage("post")} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                        + Add New Role
                      </button>
                    </div>

                    {activeJobs.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {activeJobs.slice(0, 4).map((job) => (
                          <div key={job.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-blue-300 hover:bg-white">
                            <div>
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-slate-800">{job.title}</h4>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Active
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                {job.department || "General"} • {job.location || "Addis Ababa"}
                              </p>
                              <p className="mt-2 text-xs font-semibold text-blue-600">
                                {job.applicantsCount || 0} applicants received
                              </p>
                            </div>

                            <div className="mt-4 flex items-center gap-2 border-t border-slate-200/60 pt-3 text-xs">
                              <button onClick={() => navigate(`/employer/jobs/${job.id}`)} className="flex-1 rounded-xl bg-blue-50 py-1.5 font-bold text-blue-700 hover:bg-blue-100">
                                View Applicants
                              </button>
                              <button
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/jobs/${job.id}`;
                                  navigator.clipboard?.writeText(shareUrl);
                                  notify("Job link copied to clipboard.");
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
                                title="Copy Job Link"
                              >
                                Share 🔗
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                        <p className="text-xs font-medium text-slate-500">You haven&apos;t posted any jobs yet.</p>
                        <button onClick={() => selectStage("post")} className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                          Create Your First Job Listing
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          Hiring Pipeline Overview
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Candidate movement across screening, AI ranking, and hiring milestones.
                        </p>
                      </div>

                      <select
                        defaultValue="this_month"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors focus:border-blue-500 focus:outline-none"
                      >
                        <option value="this_month">This Month ⌄</option>
                        <option value="last_30">Last 30 Days</option>
                        <option value="this_year">This Year</option>
                      </select>
                    </div>

                    <div className="relative h-56 w-full pt-2">
                      <svg className="h-full w-full overflow-visible" viewBox="0 0 800 180" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <line x1="0" y1="40" x2="800" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="0" y1="90" x2="800" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="0" y1="140" x2="800" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

                        {(() => {
                          const chartValues = pipelineStages.map((stage) => Number(stage.value) || 0);
                          const maxValue = Math.max(...chartValues, 1);
                          const points = pipelineStages.map((stage, index) => {
                            const x = 40 + index * 190;
                            const y = 160 - (Number(stage.value || 0) / maxValue) * 110;
                            return { x, y, label: stage.label, value: stage.value };
                          });

                          const linePath = points
                            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                            .join(' ');
                          const areaPath = `${linePath} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                          return (
                            <>
                              <path d={areaPath} fill="url(#pipelineGrad)" />
                              <path
                                d={linePath}
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                              />
                              {points.map((point, index) => (
                                <g key={`${point.label}-${index}`}>
                                  <circle cx={point.x} cy={point.y} r={index === points.length - 1 ? 6 : 5} fill="#2563eb" stroke="#fff" strokeWidth={index === points.length - 1 ? 2 : 0} />
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>

                      <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400">
                        {pipelineStages.map((stage) => (
                          <span key={stage.label}>{stage.label}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {renderApplications(applications.slice(0, 4))}

                  <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      {
                        label: "ACTIVE JOBS",
                        value: stats.active,
                        subtext: stats.active > 0 ? `${stats.active} roles currently open` : "No active listings",
                        icon: BriefcaseBusiness,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                      },
                      {
                        label: "TOTAL APPLICANTS",
                        value: stats.applicants,
                        subtext: "Across all active openings",
                        icon: Users,
                        color: "text-indigo-600",
                        bg: "bg-indigo-50",
                      },
                      {
                        label: "HIGH AI MATCHES (≥80%)",
                        value: stats.high,
                        subtext: "Top qualified talent ready for review",
                        icon: Sparkles,
                        color: "text-purple-600",
                        bg: "bg-purple-50",
                      },
                      {
                        label: "SHORTLISTED",
                        value: stats.shortlisted,
                        subtext: "Moved to decision pipeline",
                        icon: Star,
                        color: "text-amber-500",
                        bg: "bg-amber-50",
                      },
                      {
                        label: "INTERVIEWS SCHEDULED",
                        value: stats.interviews,
                        subtext: nextInterviewLabel,
                        icon: CalendarDays,
                        color: "text-rose-500",
                        bg: "bg-rose-50",
                      },
                      {
                        label: "SUCCESSFULLY HIRED",
                        value: stats.hired,
                        subtext: "Accepted offers & onboarded",
                        icon: UserCheck,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex min-h-[160px] flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md"
                      >
                        <div className="mb-4 flex items-center">
                          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            {stat.label}
                          </span>
                        </div>

                        <div>
                          <div className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900">
                            {stat.value}
                          </div>
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className={`h-1.5 w-1.5 rounded-full ${stat.value > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                            {stat.subtext}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {active === "profile" && (
                <CompanyLegal
                  company={company}
                  onSaveSuccess={(payload) => {
                    setCompany((current) => ({ ...current, ...payload }));
                    setActive("overview");
                  }}
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
                          />
                        </Field>
                        <Field label="Sector">
                          <select
                            className={inputClass(dark)}
                            value={job.department}
                            onChange={(e) =>
                              setJob({ ...job, department: e.target.value })
                            }
                          >
                            {jobSectors.map((sector) => (
                              <option key={sector} value={sector}>
                                {sector}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Job Vacancy Level">
                          <select
                            className={inputClass(dark)}
                            value={job.experience_level}
                            onChange={(e) =>
                              setJob({ ...job, experience_level: e.target.value })
                            }
                          >
                            <option value="entry-level">Entry-level</option>
                            <option value="mid-level">Mid-level</option>
                            <option value="senior-level">Senior-level</option>
                            <option value="executive">Executive</option>
                          </select>
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
                            <option value="freelance">Freelance</option>
                            <option value="temporary">Temporary</option>
                            <option value="internship">Internship</option>
                            <option value="self-employed">Self-employed</option>
                            <option value="volunteer">Volunteer</option>
                          </select>
                        </Field>
                        <Field label="Work Mode">
                          <select
                            className={inputClass(dark)}
                            value={job.work_mode}
                            onChange={(e) =>
                              setJob({ ...job, work_mode: e.target.value })
                            }
                          >
                            <option value="on-site">On-site</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
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
                        <Field label="Gender Preference">
                          <select
                            className={inputClass(dark)}
                            value={job.gender_preference || "any"}
                            onChange={(e) =>
                              setJob({ ...job, gender_preference: e.target.value })
                            }
                          >
                            <option value="any">Any</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </Field>
                        <Field label="Compensation">
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
                          {companyName} • {job.location || "Location"} • {job.work_mode}
                        </p>
                        <div className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">
                          {job.description ||
                            "Your enhanced job description will appear here."}
                        </div>
                      </div>
                    )}
                    {wizard === 3 && (
                      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <h3 className="mt-4 text-2xl font-black text-slate-900">
                          Ready to publish?
                        </h3>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
                          Choose whether this role should be saved as a draft, scheduled for a future launch, or published immediately.
                        </p>

                        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs md:grid-cols-[1fr_auto] md:items-center">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Schedule publication
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              Select a date and time for a future post.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row md:flex-col xl:flex-row">
                            <input
                              type="date"
                              value={scheduleDraft.date}
                              onChange={(event) =>
                                setScheduleDraft((current) => ({
                                  ...current,
                                  date: event.target.value,
                                }))
                              }
                              className={inputClass(dark)}
                            />
                            <input
                              type="time"
                              value={scheduleDraft.time}
                              onChange={(event) =>
                                setScheduleDraft((current) => ({
                                  ...current,
                                  time: event.target.value,
                                }))
                              }
                              className={inputClass(dark)}
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                          <button
                            onClick={() => saveJob("draft")}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400"
                          >
                            Save as Draft
                          </button>
                          <button
                            onClick={() => {
                              if (!scheduleDraft.date && !scheduleDraft.time) {
                                notify("Please select a schedule date and time to publish later.", "error");
                                return;
                              }
                              const scheduledDate = `${scheduleDraft.date}T${scheduleDraft.time || "00:00"}`;
                              saveJob("scheduled", scheduledDate);
                            }}
                            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600"
                          >
                            Schedule Post
                          </button>
                          <button
                            onClick={() => saveJob("published")}
                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
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
                  <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        My Job Listings
                      </h1>
                      <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500 sm:text-sm">
                        Track and manage your published vacancies, monitor real-time applicant pipelines, and control hiring statuses.
                      </p>
                    </div>
                  </div>

                  <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Total jobs",
                        value: jobs.length,
                        tone: "text-slate-900",
                        note: jobs.length > 0 ? `${jobs.length} roles published` : "No active listings",
                      },
                      {
                        label: "Live / Open",
                        value: jobs.filter(
                          (item) => normalizeJobStatus(item.status) === "active",
                        ).length,
                        tone: "text-emerald-600",
                        note: "Accepting new applicants",
                      },
                      {
                        label: "Paused",
                        value: jobs.filter(
                          (item) => normalizeJobStatus(item.status) === "paused",
                        ).length,
                        tone: "text-amber-500",
                        note: "Temporarily on hold",
                      },
                      {
                        label: "Closed / Expired",
                        value: jobs.filter(
                          (item) =>
                            ["closed", "expired", "archived"].includes(
                              normalizeJobStatus(item.status),
                            ),
                        ).length,
                        tone: "text-slate-600",
                        note: "Hiring completed",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs transition-all hover:shadow-md"
                      >
                        <p className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {stat.label}
                        </p>
                        <p className={`mt-2 text-4xl font-black tracking-tight ${stat.tone}`}>
                          {stat.value}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {stat.note}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs md:flex-row md:items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          My Jobs Overview
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-900">
                          Job management workspace
                        </h3>
                      </div>

                      <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={jobSearchQuery}
                          onChange={(event) => setJobSearchQuery(event.target.value)}
                          placeholder="Search listings by title or sector..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-white shadow-xs">
                      <div className="flex flex-col justify-between gap-4 border-b border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 md:flex-row md:items-center">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            Published & Active Jobs
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Live on Explore Jobs, managing applicants and hiring pipeline.
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
                          {publishedJobs.filter((item) => {
                            const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                            return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                          }).length} live vacancies
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                              <th className="px-6 py-4 text-slate-700">Job Role & Sector</th>
                              <th className="px-4 py-4 text-slate-700">Dates</th>
                              <th className="px-4 py-4 text-center text-slate-700">Applicant Pipeline</th>
                              <th className="px-4 py-4 text-slate-700">Status</th>
                              <th className="px-6 py-4 text-right text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {publishedJobs.filter((item) => {
                              const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                              return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                            }).length ? (
                              publishedJobs
                                .filter((item) => {
                                  const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                                  return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                                })
                                .map((item) => {
                                  const postedDate = item.created_at
                                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "Recently";
                                  const deadlineValue = item.application_deadline || item.deadline || item.applicationDeadline || "No deadline";
                                  const deadlineDate =
                                    deadlineValue === "No deadline"
                                      ? "Ongoing"
                                      : new Date(deadlineValue).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        });
                                  const normalizedStatus = normalizeJobStatus(item.status);
                                  const totalApplicants = Number(item.total_applicants ?? item.applicantsCount ?? 0);
                                  const pendingCount = Number(item.pending_count ?? item.pendingCount ?? 0);
                                  const shortlistedCount = Number(item.shortlisted_count ?? item.shortlisted ?? 0);
                                  const hiredCount = Number(item.hired_count ?? item.hiredCount ?? 0);

                                  return (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                                      <td className="px-6 py-4">
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => navigate(`/employer/jobs/${item.id}/applicants`)}
                                            className="text-left text-sm font-extrabold text-slate-900 hover:text-blue-700"
                                          >
                                            {item.title}
                                          </button>
                                          <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                              {item.sector || item.category || "General"}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                              • {item.work_mode || "Hybrid"} • {item.location || "Addis Ababa"}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-slate-600">
                                        <div>
                                          <p className="text-[11px] font-semibold text-slate-800">
                                            <span className="text-slate-400">Posted:</span> {postedDate}
                                          </p>
                                          <p className="mt-0.5 text-[11px] text-slate-500">
                                            <span className="text-slate-400">Deadline:</span> {deadlineDate}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-center">
                                        <div className="inline-flex flex-wrap justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                                          <span className="rounded-xl bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700" title="Total Applicants">
                                            {totalApplicants} Total
                                          </span>
                                          <span className="rounded-xl bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700" title="Pending / New Applicants">
                                            {pendingCount} New
                                          </span>
                                          <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700" title="Shortlisted Applicants">
                                            {shortlistedCount} Shortlisted
                                          </span>
                                          <span className="rounded-xl bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700" title="Hired Applicants">
                                            {hiredCount} Hired
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${getJobStatusClasses(normalizedStatus)}`}>
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                          Active
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => editJob(item)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                                            Edit
                                          </button>
                                          <button onClick={() => navigate(`/employer/jobs/${item.id}/applicants`)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                                            Applicants
                                          </button>
                                          <button onClick={() => toggleJob(item)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                                            Pause
                                          </button>
                                          <button onClick={() => deleteJob(item.id)} className="rounded-xl bg-red-50 p-2 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-6 py-16 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-lg text-[var(--brand-deep)]">
                                      
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">No published jobs yet</p>
                                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                                      Publish a vacancy to make it visible on Explore Jobs and start collecting candidates.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-white shadow-xs">
                      <div className="flex flex-col justify-between gap-4 border-b border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 md:flex-row md:items-center">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            Scheduled Job Posts
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Queued future vacancies with scheduled release dates.
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
                          {scheduledJobs.filter((item) => {
                            const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                            return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                          }).length} queued posts
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                              <th className="px-6 py-4 text-slate-700">Vacancy</th>
                              <th className="px-4 py-4 text-slate-700">Release Schedule</th>
                              <th className="px-4 py-4 text-center text-slate-700">Applications</th>
                              <th className="px-4 py-4 text-slate-700">Status</th>
                              <th className="px-6 py-4 text-right text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {scheduledJobs.filter((item) => {
                              const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                              return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                            }).length ? (
                              scheduledJobs
                                .filter((item) => {
                                  const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                                  return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                                })
                                .map((item) => {
                                  const scheduledOn = item.scheduled_date || item.scheduledDate || item.application_deadline || item.deadline || "Not set";
                                  const releaseDate = scheduledOn === "Not set" ? "Not set" : new Date(scheduledOn).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  });
                                  const totalApplicants = Number(item.total_applicants ?? item.applicantsCount ?? 0);
                                  return (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                                      <td className="px-6 py-4">
                                        <div>
                                          <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                                          <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                              {item.sector || item.category || "General"}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                              {item.work_mode || "Hybrid"} • {item.location || "Addis Ababa"}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-slate-600">
                                        <p className="text-[11px] font-semibold text-slate-800">{releaseDate}</p>
                                      </td>
                                      <td className="px-4 py-4 text-center">
                                        <span className="rounded-xl bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                          {totalApplicants} applicants
                                        </span>
                                      </td>
                                      <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                          Scheduled
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => editJob(item)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                                            Edit
                                          </button>
                                          <button onClick={() => toggleJob(item)} className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700">
                                            Publish Now
                                          </button>
                                          <button onClick={() => deleteJob(item.id)} className="rounded-xl bg-red-50 p-2 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-6 py-16 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-lg text-[var(--brand-deep)]">
                                      
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">No scheduled posts</p>
                                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                                      Schedule a vacancy for a future release date and it will appear here automatically.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-white shadow-xs">
                      <div className="flex flex-col justify-between gap-4 border-b border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 md:flex-row md:items-center">
                        <div>
                          <h4 className="text-lg font-black text-slate-900">
                            Saved Draft Vacancies
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Unpublished drafts with instant one-click publish action.
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
                          {draftJobs.filter((item) => {
                            const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                            return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                          }).length} drafts
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                            <tr>
                              <th className="px-6 py-4 text-slate-700">Draft Role</th>
                              <th className="px-4 py-4 text-slate-700">Last Updated</th>
                              <th className="px-4 py-4 text-slate-700">Status</th>
                              <th className="px-6 py-4 text-right text-slate-700">Quick Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {draftJobs.filter((item) => {
                              const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                              return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                            }).length ? (
                              draftJobs
                                .filter((item) => {
                                  const searchValue = `${item.title || ""} ${item.sector || item.category || ""} ${item.location || ""}`.toLowerCase();
                                  return !jobSearchQuery || searchValue.includes(jobSearchQuery.toLowerCase());
                                })
                                .map((item) => {
                                  const updatedDate = item.updated_at || item.created_at
                                    ? new Date(item.updated_at || item.created_at).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "Recently";
                                  return (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                                      <td className="px-6 py-4">
                                        <div>
                                          <p className="text-sm font-extrabold text-slate-900">{item.title}</p>
                                          <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                              {item.sector || item.category || "General"}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                              {item.work_mode || "Hybrid"} • {item.location || "Addis Ababa"}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-slate-600">
                                        <span className="text-[11px] font-semibold text-slate-800">{updatedDate}</span>
                                      </td>
                                      <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand-deep)]">
                                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                          Draft
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => editJob(item)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                                            Edit
                                          </button>
                                          <button onClick={() => toggleJob(item)} className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
                                            Publish Now
                                          </button>
                                          <button onClick={() => deleteJob(item.id)} className="rounded-xl bg-red-50 p-2 text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-6 py-16 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-lg text-[var(--brand-deep)]">
                                      
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">No saved drafts</p>
                                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                                      Save a vacancy as a draft to return and publish anytime.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
                      {PIPELINE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
        <Toast toast={toast} onClose={() => setToast(null)} />
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
