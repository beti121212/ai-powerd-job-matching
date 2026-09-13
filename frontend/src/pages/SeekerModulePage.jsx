import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileText,
  MapPin,
  Mic2,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Bell,
  X,
  Send,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { getMockNotifications } from "../utils/interviewFlow";

const modules = {
  matches: {
    title: "AI Job Matches",
    eyebrow: "PERSONALIZED FOR YOU",
    icon: Target,
    description:
      "Ranked opportunities based on your CV, skills, preferences, and career goals.",
  },
  saved: {
    title: "Saved Jobs",
    eyebrow: "YOUR SHORTLIST",
    icon: Bookmark,
    description:
      "Keep promising opportunities in one place and apply before deadlines.",
  },
  applications: {
    title: "My Applications",
    eyebrow: "APPLICATION TRACKER",
    icon: FileText,
    description:
      "Follow every application from submission to interview and offer.",
  },
  skillgap: {
    title: "Skill Gap Analysis",
    eyebrow: "AI CAREER INSIGHT",
    icon: TrendingUp,
    description:
      "See the skills that can increase your match score and plan your next move.",
  },
  interview: {
    title: "AI Interview Prep",
    eyebrow: "PRACTICE WITH AI",
    icon: Mic2,
    description:
      "Prepare with role-specific questions and receive instant feedback.",
  },
  notifications: {
    title: "Notifications",
    eyebrow: "YOUR UPDATES",
    icon: Bell,
    description:
      "Stay on top of job alerts, application updates, and interview invitations.",
  },
  settings: {
    title: "Settings",
    eyebrow: "ACCOUNT CONTROL",
    icon: Settings,
    description:
      "Manage preferences, notifications, privacy, and account security.",
  },
};

const matches = [
  {
    id: "job-101",
    title: "Senior React & Node.js Developer",
    company: "YeneTech Solutions",
    location: "Addis Ababa · Hybrid",
    score: 94,
    matchScore: 94,
    skillsMatch: 95,
    experienceMatch: 90,
    salary: "30,000 - 40,000 ETB",
    salaryMin: 30000,
    jobType: "Full-time",
    whyMatch:
      "Your 3 years of React and Node.js experience matches the role requirements.",
    matchingSkills: ["React", "Node.js", "JavaScript"],
    skillsToImprove: ["Docker"],
  },
  {
    id: "job-102",
    title: "Frontend Developer",
    company: "EthioTelecom Innovation Lab",
    location: "Addis Ababa · On-site",
    score: 88,
    matchScore: 88,
    skillsMatch: 89,
    experienceMatch: 86,
    salary: "28,000 - 35,000 ETB",
    salaryMin: 28000,
    jobType: "Permanent",
    whyMatch:
      "Your React, JavaScript, and frontend experience are a strong match for this team.",
    matchingSkills: ["React", "JavaScript", "CSS"],
    skillsToImprove: ["TypeScript", "Testing"],
  },
  {
    id: "job-103",
    title: "Full Stack Engineer",
    company: "Kacha Digital Financial",
    location: "Remote · Ethiopia",
    score: 84,
    matchScore: 84,
    skillsMatch: 85,
    experienceMatch: 82,
    salary: "35,000 - 50,000 ETB",
    salaryMin: 35000,
    jobType: "Contract",
    whyMatch:
      "Your Node.js, MongoDB, and remote-work preferences align with this opportunity.",
    matchingSkills: ["Node.js", "MongoDB", "REST APIs"],
    skillsToImprove: ["AWS"],
  },
];

const applications = [
  {
    title: "Frontend Engineer",
    company: "Gebeya Inc.",
    status: "review",
    date: "Aug 02, 2026",
    history: [
      "Application submitted · Aug 02",
      "Profile viewed · Aug 03",
      "Shortlisted · Aug 05",
    ],
    message:
      "Your profile is a strong match. We would like to continue with the next step.",
  },
  {
    title: "Full Stack Developer",
    company: "Kacha Digital Financial",
    status: "review",
    date: "Jul 28, 2026",
    history: [
      "Application submitted · Jul 28",
      "Application received · Jul 28",
    ],
    message:
      "Thank you for applying. Our hiring team is reviewing your application.",
  },
  {
    title: "React Developer",
    company: "YeneTech Solutions",
    status: "interview",
    date: "Jul 20, 2026",
    history: [
      "Application submitted · Jul 20",
      "Shortlisted · Jul 23",
      "Interview scheduled · Jul 25",
    ],
    message: "Your interview is scheduled for Aug 26, 2026 at 10:00 AM.",
  },
  {
    title: "Backend Engineer",
    company: "Chapa Technologies",
    status: "offer",
    date: "Jul 12, 2026",
    history: [
      "Application submitted · Jul 12",
      "Interview completed · Jul 18",
      "Offer sent · Jul 22",
    ],
    message: "Congratulations. Your offer letter is ready to review.",
  },
  {
    title: "Junior JavaScript Developer",
    company: "Orbit Systems",
    status: "rejected",
    date: "Jul 08, 2026",
    history: [
      "Application submitted · Jul 08",
      "Application reviewed · Jul 10",
      "Closed · Jul 12",
    ],
    message:
      "Thank you for your interest. We decided to move forward with another candidate.",
  },
  {
    title: "UI Developer",
    company: "Zemen Bank Digital",
    status: "applied",
    date: "Aug 14, 2026",
    history: ["Application submitted · Aug 14"],
    message:
      "Your application was received and will be reviewed by the hiring team.",
  },
];

const applicationStatuses = [
  {
    id: "applied",
    label: "Applied",
    description: "Application sent",
    color: "border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  {
    id: "review",
    label: "In Review / Shortlisted",
    description: "Employer is reviewing",
    color: "border-blue-200 bg-blue-50 text-blue-800",
  },
  {
    id: "interview",
    label: "Interview",
    description: "Interview scheduled",
    color: "border-violet-200 bg-violet-50 text-violet-800",
  },
  {
    id: "offer",
    label: "Offer / Hired",
    description: "Offer received",
    color: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    id: "rejected",
    label: "Rejected",
    description: "Application closed",
    color: "border-red-200 bg-red-50 text-red-800",
  },
];

const notifications = [
  {
    id: 1,
    type: "application",
    label: "Applications",
    title: "Application Update",
    message:
      "Your application for Frontend Developer at Blue Nile Tech is now under review.",
    relatedId: "application-201",
    createdAt: "Today, 10:30 AM",
    isRead: false,
  },
  {
    id: 2,
    type: "interview",
    label: "Interviews",
    title: "Interview Invitation",
    message: "You have been invited for an interview for Frontend Developer.",
    relatedId: "interview-301",
    createdAt: "Today, 9:00 AM",
    isRead: false,
  },
  {
    id: 3,
    type: "message",
    label: "Messages",
    title: "New Message",
    message: "Blue Nile Tech sent you a new message about your application.",
    relatedId: "conversation-501",
    createdAt: "Yesterday",
    isRead: true,
  },
  {
    id: 4,
    type: "recommendation",
    label: "AI Recommendations",
    title: "AI Recommendation",
    message:
      "Senior React & Node.js Developer is a strong match for your profile.",
    relatedJobId: "job-101",
    createdAt: "2 days ago",
    isRead: false,
  },
  {
    id: 5,
    type: "system",
    label: "System",
    title: "Profile reminder",
    message:
      "Complete your profile to receive more relevant job recommendations.",
    createdAt: "3 days ago",
    isRead: true,
  },
];

const savedJobs = [
  {
    ...matches[0],
    savedAt: "Aug 18, 2026",
    deadline: "Aug 25, 2026",
    daysLeft: 3,
  },
  {
    ...matches[1],
    savedAt: "Aug 16, 2026",
    deadline: "Sep 02, 2026",
    daysLeft: 11,
  },
  {
    ...matches[2],
    savedAt: "Aug 14, 2026",
    deadline: "Aug 28, 2026",
    daysLeft: 6,
  },
];

const roleRoadmaps = {
  "Senior AI/ML Engineer": {
    current: ["Python", "Pandas", "SQL"],
    missing: ["PyTorch", "Docker", "Kubernetes", "LLM Fine-Tuning"],
    roadmap: [
      {
        phase: "1",
        title: "Deep Learning Foundations",
        duration: "4 weeks",
        skills: ["PyTorch", "Neural networks"],
        courses: [
          {
            name: "PyTorch for Deep Learning",
            provider: "freeCodeCamp · Free",
            url: "https://www.youtube.com/watch?v=V_xro1bcAuA",
          },
        ],
      },
      {
        phase: "2",
        title: "Production ML Engineering",
        duration: "3 weeks",
        skills: ["Docker", "Model serving"],
        courses: [
          {
            name: "Docker for Developers",
            provider: "Docker · Free",
            url: "https://www.docker.com/101-tutorial/",
          },
        ],
      },
      {
        phase: "3",
        title: "Scale and LLM Systems",
        duration: "5 weeks",
        skills: ["Kubernetes", "LLM Fine-Tuning"],
        courses: [
          {
            name: "Kubernetes Basics",
            provider: "Kubernetes · Free",
            url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
          },
          {
            name: "LLM Fine-Tuning",
            provider: "DeepLearning.AI · Paid",
            url: "https://www.deeplearning.ai/short-courses/",
          },
        ],
      },
    ],
  },
  "Senior Frontend Engineer": {
    current: ["React.js", "JavaScript", "CSS", "Git"],
    missing: ["TypeScript", "Next.js", "Testing", "System Design"],
    roadmap: [
      {
        phase: "1",
        title: "Type-safe React",
        duration: "3 weeks",
        skills: ["TypeScript", "Next.js"],
        courses: [
          {
            name: "TypeScript Handbook",
            provider: "TypeScript · Free",
            url: "https://www.typescriptlang.org/docs/handbook/intro.html",
          },
        ],
      },
      {
        phase: "2",
        title: "Reliable Frontend Systems",
        duration: "3 weeks",
        skills: ["Testing", "Performance"],
        courses: [
          {
            name: "Testing JavaScript Applications",
            provider: "Testing Library · Free",
            url: "https://testing-library.com/docs/",
          },
        ],
      },
      {
        phase: "3",
        title: "Senior Engineering Practice",
        duration: "4 weeks",
        skills: ["System Design", "Architecture"],
        courses: [
          {
            name: "Frontend System Design",
            provider: "Frontend Masters · Paid",
            url: "https://frontendmasters.com/courses/frontend-system-design/",
          },
        ],
      },
    ],
  },
};

const interviewScenarios = {
  "Senior React Developer": {
    "YeneTech Solutions": [
      {
        type: "Technical",
        question:
          "How would you improve the performance of a React application with a slow dashboard?",
      },
      {
        type: "Behavioral",
        question:
          "Tell us about a difficult frontend problem you solved and what you learned.",
      },
      {
        type: "Technical",
        question:
          "How do you design a reliable API integration in a React and Node.js application?",
      },
    ],
    "EthioTelecom Innovation Lab": [
      {
        type: "Technical",
        question:
          "How would you structure a reusable component system for a large product team?",
      },
      {
        type: "Behavioral",
        question:
          "Describe a time you disagreed with a technical decision and how you handled it.",
      },
    ],
  },
  "Senior AI/ML Engineer": {
    "Kacha Digital Financial": [
      {
        type: "Technical",
        question:
          "How would you deploy and monitor a machine-learning model in production?",
      },
      {
        type: "Behavioral",
        question:
          "Tell us about a time your data or model result was challenged by stakeholders.",
      },
    ],
  },
};

function MatchCard({ job, featured = false, onViewDetails }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${featured ? "border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[var(--brand-deep)]">
            {featured ? "Best Match" : "Recommended"}
          </p>
          <h2 className="mt-2 text-lg font-black text-slate-900">
            {job.title}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {job.company}
          </p>
          <p className="mt-2 text-sm text-slate-500">{job.location}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[var(--brand-deep)]">
            {job.score}%
          </p>
          <p className="text-xs font-bold text-slate-500">AI Match</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{job.whyMatch}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Skills Match</p>
          <p className="mt-1 font-black text-slate-900">{job.skillsMatch}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Experience Match</p>
          <p className="mt-1 font-black text-slate-900">
            {job.experienceMatch}%
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="font-bold text-slate-700">Matching Skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.matchingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-700">Skills to Improve</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.skillsToImprove.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onViewDetails(job)}
        className="mt-5 min-h-11 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-black text-white hover:bg-[var(--brand-primary-hover)]"
      >
        View Details
      </button>
    </article>
  );
}

export default function SeekerModulePage({ module: moduleProp }) {
  const { module: routeModule } = useParams();
  const module = moduleProp || routeModule || "matches";
  const navigate = useNavigate();
  const current = modules[module] || modules.matches;
  const [savedJobList, setSavedJobList] = useState(savedJobs);
  const [savedJobToRemove, setSavedJobToRemove] = useState(null);
  const [toast, setToast] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [scoreFilter, setScoreFilter] = useState("70");
  const [salaryFilter, setSalaryFilter] = useState("0");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [targetRole, setTargetRole] = useState("Senior AI/ML Engineer");
  const [notificationTab, setNotificationTab] = useState("all");
  const [notificationItems, setNotificationItems] = useState(() => [
    ...getMockNotifications(),
    ...notifications,
  ]);
  const [interviewRole, setInterviewRole] = useState("Senior React Developer");
  const [interviewCompany, setInterviewCompany] =
    useState("YeneTech Solutions");
  const [interviewMode, setInterviewMode] = useState("chat");
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [settingsSection, setSettingsSection] = useState("account");
  const [accountForm, setAccountForm] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        displayName: user.name || user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      };
    } catch {
      return { displayName: "", email: "", phone: "" };
    }
  });
  const [notificationSettings, setNotificationSettings] = useState({
    applications: true,
    interviews: true,
    messages: true,
    recommendations: true,
    system: true,
  });
  const [resumeVisible, setResumeVisible] = useState(true);
  const [dataPreferences, setDataPreferences] = useState(true);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    if (!savedJobToRemove) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSavedJobToRemove(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [savedJobToRemove]);
  useEffect(() => {
    if (!showDeleteAccount) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowDeleteAccount(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showDeleteAccount]);
  const localApplications = (() => {
    try {
      return JSON.parse(localStorage.getItem("mockApplications") || "[]");
    } catch {
      return [];
    }
  })();
  const displayedApplications = [...localApplications, ...applications];

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const removeSavedJob = () => {
    if (!savedJobToRemove) return;
    setSavedJobList((items) =>
      items.filter((item) => String(item.id) !== String(savedJobToRemove.id)),
    );
    setSavedJobToRemove(null);
    notify("Job removed from saved jobs");
  };

  const notificationFilters = [
    { id: "all", label: "All" },
    ...[
      ...new Map(
        notificationItems.map((item) => [item.type, item.label]),
      ).entries(),
    ].map(([id, label]) => ({ id, label })),
  ];
  const visibleNotifications =
    notificationTab === "all"
      ? notificationItems
      : notificationItems.filter((item) => item.type === notificationTab);

  const openNotification = (notification) => {
    setNotificationItems((items) =>
      items.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );
    if (notification.type === "application" && notification.relatedId)
      navigate(
        `/applications/${encodeURIComponent(String(notification.relatedId))}`,
      );
    if (
      notification.type === "interview" &&
      (notification.relatedInterviewId || notification.relatedId)
    )
      navigate(
        `/interviews/${encodeURIComponent(String(notification.relatedInterviewId || notification.relatedId))}`,
      );
    if (notification.type === "message" && notification.relatedId)
      navigate(`/chat/${encodeURIComponent(String(notification.relatedId))}`);
    if (notification.type === "recommendation" && notification.relatedJobId)
      navigate(
        `/job-details/${encodeURIComponent(String(notification.relatedJobId))}`,
      );
    if (notification.type === "system") navigate("/profile");
  };

  const markAllNotificationsRead = () =>
    setNotificationItems((items) =>
      items.map((item) => ({ ...item, isRead: true })),
    );

  const filteredMatches = matches.filter(
    (job) =>
      job.score >= Number(scoreFilter) &&
      job.salaryMin >= Number(salaryFilter) &&
      (jobTypeFilter === "all" || job.jobType === jobTypeFilter),
  );

  const interviewQuestions =
    interviewScenarios[interviewRole]?.[interviewCompany] ||
    interviewScenarios[interviewRole]?.["YeneTech Solutions"] ||
    interviewScenarios["Senior React Developer"]["YeneTech Solutions"];
  const currentQuestion =
    interviewQuestions[interviewStep % interviewQuestions.length];

  const startInterview = () => {
    setInterviewStep(0);
    setFeedback(null);
    setInterviewMessages([
      {
        sender: "ai",
        text: `Welcome to your ${interviewRole} interview at ${interviewCompany}. Let's begin with a ${currentQuestion.type.toLowerCase()} question.`,
      },
    ]);
  };

  const submitInterviewAnswer = (event) => {
    event.preventDefault();
    const answerText = answer.trim();
    if (!answerText) return;
    const hasStructure =
      /situation|task|action|result|impact|because|therefore/i.test(answerText);
    const score = Math.min(
      96,
      62 +
        Math.min(22, Math.floor(answerText.length / 18)) +
        (hasStructure ? 12 : 0),
    );
    setInterviewMessages((messages) => [
      ...messages,
      { sender: "user", text: answerText },
      {
        sender: "ai",
        text: `Thanks. I have recorded your answer. Next, I will ask a ${interviewQuestions[(interviewStep + 1) % interviewQuestions.length].type.toLowerCase()} question.`,
      },
    ]);
    setFeedback({
      score,
      strengths:
        answerText.length > 100
          ? ["Clear context and relevant detail", "Good connection to the role"]
          : ["Direct response to the question"],
      improvements: hasStructure
        ? ["Add measurable results to make the impact stronger."]
        : [
            "Use STAR: describe the Situation, Task, Action, and measurable Result.",
          ],
      sample:
        "Situation: briefly explain the context. Task: name your responsibility. Action: describe the specific steps you took. Result: close with a measurable outcome.",
    });
    setInterviewStep((step) => step + 1);
    setAnswer("");
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    if (
      !passwordForm.current ||
      !passwordForm.next ||
      passwordForm.next !== passwordForm.confirm
    ) {
      notify("Complete the password fields and make sure they match");
      return;
    }
    setPasswordForm({ current: "", next: "", confirm: "" });
    notify("Password settings updated successfully.");
  };

  const saveAccountSettings = (event) => {
    event.preventDefault();
    notify("Settings updated successfully.");
  };

  return (
    <div className="seeker-module-page min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
              <Sparkles className="h-4 w-4" /> {current.eyebrow}
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {current.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              {module === "saved"
                ? "Keep track of jobs you are interested in and review them later."
                : module === "notifications"
                  ? "Stay updated with your applications, interviews, messages, and job recommendations."
                  : module === "matches"
                    ? "Discover jobs that best match your skills, experience, resume, and profile."
                    : current.description}
            </p>
          </div>
        </div>

        {module === "matches" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <SlidersHorizontal className="h-4 w-4 text-brand" /> Filter
                matches
              </div>
              <select
                value={scoreFilter}
                onChange={(event) => setScoreFilter(event.target.value)}
                className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand"
              >
                <option value="90">90%+ match</option>
                <option value="80">80%+ match</option>
                <option value="70">70%+ match</option>
              </select>
              <select
                value={salaryFilter}
                onChange={(event) => setSalaryFilter(event.target.value)}
                className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand"
              >
                <option value="0">Any salary</option>
                <option value="25000">25,000+ ETB</option>
                <option value="30000">30,000+ ETB</option>
                <option value="40000">40,000+ ETB</option>
              </select>
              <select
                value={jobTypeFilter}
                onChange={(event) => setJobTypeFilter(event.target.value)}
                className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand"
              >
                <option value="all">All job types</option>
                <option value="Full-time">Full-time</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
              </select>
              <span className="ml-auto text-xs font-bold text-slate-400">
                {filteredMatches.length} matches found
              </span>
            </div>

            {filteredMatches.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-500">Best Match</p>
                  <p className="mt-1 text-2xl font-black text-[var(--brand-deep)]">
                    {filteredMatches[0].score}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Recommended Jobs
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {filteredMatches.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Skills Matched
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {filteredMatches[0].matchingSkills.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold text-slate-500">
                    Skills to Improve
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {filteredMatches[0].skillsToImprove.length}
                  </p>
                </div>
              </div>
            )}

            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No Job Matches Available Yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Complete your profile and add your skills to receive better
                  job recommendations.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="mt-5 min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  Update Profile
                </button>
              </div>
            ) : filteredMatches.length > 0 ? (
              <>
                <MatchCard
                  job={filteredMatches[0]}
                  featured
                  onViewDetails={(job) =>
                    navigate(
                      `/job-details/${encodeURIComponent(String(job.id))}`,
                      { state: { job } },
                    )
                  }
                />
                <div>
                  <h2 className="mb-4 text-xl font-black text-slate-900">
                    Recommended Jobs
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {filteredMatches.slice(1).map((job) => (
                      <MatchCard
                        key={job.id}
                        job={job}
                        onViewDetails={(selectedJob) =>
                          navigate(
                            `/job-details/${encodeURIComponent(String(selectedJob.id))}`,
                            { state: { job: selectedJob } },
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                No jobs match these filters. Try a broader score or salary
                range.
              </div>
            )}
          </div>
        )}

        {module === "saved" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Saved Jobs
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {savedJobList.length}
              </p>
            </div>

            {savedJobList.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-3">
                {savedJobList.map((job) => (
                  <article
                    key={job.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-slate-900">
                          {job.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {job.company}
                        </p>
                      </div>
                      {job.score != null && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                          AI Match: {job.score}%
                        </span>
                      )}
                    </div>
                    <div className="mt-5 space-y-2 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand" />
                        {job.location}
                      </p>
                      <p className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4 text-brand" />
                        {job.jobType || job.type || "Job type not specified"}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      Saved on {job.savedAt}
                    </p>
                    <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/job-details/${encodeURIComponent(String(job.id))}`,
                            { state: { job } },
                          )
                        }
                        className="min-h-11 flex-1 rounded-xl bg-brand px-3 text-sm font-black text-white hover:bg-brand-deep"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setSavedJobToRemove(job)}
                        className="min-h-11 flex-1 rounded-xl border border-red-100 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 inline h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No Saved Jobs Yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  You haven't saved any jobs yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/explore-jobs")}
                  className="mt-5 min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  Find Jobs
                </button>
              </div>
            )}
            {savedJobToRemove && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget)
                    setSavedJobToRemove(null);
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="remove-saved-job-title"
                  className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        id="remove-saved-job-title"
                        className="text-xl font-black text-slate-900"
                      >
                        Remove Saved Job?
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Are you sure you want to remove this job from your saved
                        jobs?
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setSavedJobToRemove(null)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSavedJobToRemove(null)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={removeSavedJob}
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {module === "applications" && (
          <div className="relative">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <p className="text-sm font-black text-slate-900">
                  Application progress
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click an application to view its history and employer message.
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand">
                {displayedApplications.length} applications
              </span>
            </div>
            <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
              {applicationStatuses.map((status) => {
                const columnApplications = displayedApplications.filter(
                  (item) =>
                    item.status === status.id ||
                    (status.id === "applied" && item.status === "applied"),
                );
                return (
                  <section
                    key={status.id}
                    className="min-w-[240px] rounded-2xl border border-slate-200 bg-slate-100/70 p-3"
                  >
                    <div className={`rounded-xl border p-3 ${status.color}`}>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-black">{status.label}</h2>
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black">
                          {columnApplications.length}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-semibold opacity-75">
                        {status.description}
                      </p>
                    </div>
                    <div className="mt-3 space-y-3">
                      {columnApplications.length > 0 ? (
                        columnApplications.map((item) => (
                          <button
                            key={item.title}
                            onClick={() => setSelectedApplication(item)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-black text-slate-900">
                                {item.title}
                              </h3>
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {item.company}
                            </p>
                            <p className="mt-4 text-[11px] font-semibold text-slate-400">
                              Applied {item.date}
                            </p>
                            {item.status === "interview" && (
                              <span className="mt-2 block text-xs font-bold text-brand">
                                Interview status: Scheduled
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs font-semibold text-slate-400">
                          No applications
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            {selectedApplication && (
              <div
                className="fixed inset-0 z-50 bg-slate-900/30"
                onClick={() => setSelectedApplication(null)}
              >
                <aside
                  onClick={(event) => event.stopPropagation()}
                  className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">
                        Application detail
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-slate-900">
                        {selectedApplication.title}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {selectedApplication.company}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      aria-label="Close application details"
                      className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-6 rounded-2xl bg-brand-soft p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-brand">
                      Current status
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {
                        applicationStatuses.find(
                          (status) => status.id === selectedApplication.status,
                        )?.label
                      }
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Applied on {selectedApplication.date}
                    </p>
                  </div>
                  <div className="mt-7">
                    <h3 className="text-sm font-black text-slate-900">
                      Application history
                    </h3>
                    <div className="mt-4 space-y-4">
                      {selectedApplication.history.map((event, index) => (
                        <div key={event} className="flex gap-3">
                          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white">
                            {index + 1}
                          </div>
                          <p className="text-sm font-semibold text-slate-600">
                            {event}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-black text-slate-900">
                      Employer message
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedApplication.message}
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}

        {module === "skillgap" &&
          (() => {
            const roadmap = roleRoadmaps[targetRole];
            return (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label
                    htmlFor="target-role"
                    className="block text-sm font-black text-slate-900"
                  >
                    Target dream role
                  </label>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose the role you want AI to help you reach.
                  </p>
                  <select
                    id="target-role"
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    className="mt-4 min-h-12 w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none focus:border-brand"
                  >
                    {Object.keys(roleRoadmaps).map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-emerald-900">
                        Current skills
                      </h2>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                        {roadmap.current.length} skills
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {roadmap.current.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-red-900">
                        Missing skills
                      </h2>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                        {roadmap.missing.length} to learn
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {roadmap.missing.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-red-800 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand">
                        AI learning plan
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-slate-900">
                        Roadmap to {targetRole}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      10-12 weeks estimated
                    </span>
                  </div>
                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {roadmap.roadmap.map((step) => (
                      <article
                        key={step.phase}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
                            {step.phase}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {step.duration}
                          </span>
                        </div>
                        <h3 className="mt-4 font-black text-slate-900">
                          {step.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-brand-soft px-2 py-1 text-[11px] font-bold text-brand"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 space-y-2">
                          {step.courses.map((course) => (
                            <a
                              key={course.name}
                              href={course.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand"
                            >
                              <p className="text-xs font-black text-slate-800">
                                {course.name}
                              </p>
                              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                                {course.provider}
                              </p>
                            </a>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            );
          })()}

        {module === "interview" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="text-sm font-black text-slate-900">
                  Practice role
                  <select
                    value={interviewRole}
                    onChange={(event) => setInterviewRole(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand"
                  >
                    <option>Senior React Developer</option>
                    <option>Senior AI/ML Engineer</option>
                  </select>
                </label>
                <label className="text-sm font-black text-slate-900">
                  Company
                  <select
                    value={interviewCompany}
                    onChange={(event) =>
                      setInterviewCompany(event.target.value)
                    }
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand"
                  >
                    <option>YeneTech Solutions</option>
                    <option>EthioTelecom Innovation Lab</option>
                    <option>Kacha Digital Financial</option>
                  </select>
                </label>
                <button
                  onClick={startInterview}
                  className="min-h-11 rounded-xl bg-brand px-5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  Start interview
                </button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setInterviewMode("chat")}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${interviewMode === "chat" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Chat mode
                </button>
                <button
                  onClick={() => setInterviewMode("voice")}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${interviewMode === "voice" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Voice mode
                </button>
                <span className="text-xs text-slate-400">
                  {interviewMode === "voice"
                    ? "Voice UI ready for microphone integration"
                    : "Text chat with your AI interviewer"}
                </span>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-brand-soft p-3 text-brand">
                      <Mic2 />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900">
                        AI interviewer
                      </h2>
                      <p className="text-xs text-slate-500">
                        {interviewStep + 1} of {interviewQuestions.length}{" "}
                        questions · {currentQuestion.type}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    Live practice
                  </span>
                </div>
                <div className="mt-6 max-h-64 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4">
                  {interviewMessages.length === 0 ? (
                    <p className="text-sm leading-6 text-slate-500">
                      Select a role and company, then start the interview. Your
                      AI interviewer will ask technical and behavioral
                      questions.
                    </p>
                  ) : (
                    interviewMessages.map((message, index) => (
                      <div
                        key={`${message.sender}-${index}`}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <p
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.sender === "user" ? "bg-brand text-white" : "bg-white text-slate-700 shadow-sm"}`}
                        >
                          {message.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-5 rounded-2xl bg-brand-soft p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-brand">
                    {currentQuestion.type} question
                  </p>
                  <p className="mt-2 text-lg font-bold leading-8 text-slate-900">
                    {currentQuestion.question}
                  </p>
                </div>
                <form onSubmit={submitInterviewAnswer}>
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    rows={5}
                    placeholder="Write your answer using the STAR method..."
                    className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="mt-3 flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-black text-white hover:bg-brand-deep"
                  >
                    <Send className="h-4 w-4" /> Submit answer
                  </button>
                </form>
              </section>

              <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Real-time feedback
                </h2>
                {feedback ? (
                  <div className="mt-5 space-y-5">
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-black text-brand">
                        {feedback.score}
                      </span>
                      <span className="pb-2 text-sm font-bold text-slate-500">
                        / 100 score
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Strengths
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                        {feedback.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-700">
                        Improve next
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                        {feedback.improvements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-brand-border bg-brand-soft p-3">
                      <p className="text-xs font-black text-brand">
                        Better STAR answer
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {feedback.sample}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-500">
                    Submit your first answer to receive a score, strengths,
                    improvement tips, and a stronger STAR response.
                  </p>
                )}
              </aside>
            </div>
          </div>
        )}

        {module === "notifications" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {notificationFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setNotificationTab(filter.id)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-black transition ${notificationTab === filter.id ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:bg-brand-soft hover:text-brand"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              {notificationItems.some((item) => !item.isRead) && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-sm font-bold text-[var(--brand-deep)] hover:underline"
                >
                  Mark All as Read
                </button>
              )}
            </div>
            {notificationItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="text-base font-black text-slate-900">
                  No Notifications Yet
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  You are all caught up. New updates will appear here.
                </p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="text-base font-black text-slate-900">
                  No{" "}
                  {notificationFilters.find(
                    (filter) => filter.id === notificationTab,
                  )?.label || "Notifications"}{" "}
                  Notifications
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  You don't have any{" "}
                  {notificationFilters
                    .find((filter) => filter.id === notificationTab)
                    ?.label.toLowerCase() || ""}{" "}
                  updates yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left shadow-sm transition hover:border-brand hover:shadow-md ${item.isRead ? "border-slate-200 bg-white" : "border-[var(--brand-border)] bg-[var(--brand-soft)]/30"}`}
                  >
                    <span className="mt-0.5 rounded-xl bg-brand-soft p-3 text-brand">
                      <Bell className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-brand">
                        {item.label}
                      </span>
                      <strong
                        className={`block text-sm text-slate-900 ${item.isRead ? "font-bold" : "font-black"}`}
                      >
                        {item.title}
                      </strong>
                      <span className="mt-1 block text-sm leading-6 text-slate-600">
                        {item.message}
                      </span>
                      <small className="mt-2 block text-xs text-slate-500">
                        {item.createdAt}
                      </small>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {!item.isRead && (
                        <span className="rounded-full bg-[var(--brand-primary)] px-2 py-1 text-[10px] font-black text-white">
                          New
                        </span>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {module === "settings" && (
          <div className="max-w-4xl space-y-5">
            <div className="overflow-x-auto border-b border-slate-200">
              <div className="flex min-w-max gap-1">
                {[
                  ["account", "Account"],
                  ["security", "Security"],
                  ["notifications", "Notifications"],
                  ["privacy", "Privacy"],
                  ["danger", "Danger Zone"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSettingsSection(id)}
                    className={`min-h-11 border-b-2 px-4 text-sm font-black ${settingsSection === id ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {settingsSection === "account" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Account Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage the contact details shown on your account.
                </p>
                <form
                  onSubmit={saveAccountSettings}
                  className="mt-5 grid gap-4 sm:grid-cols-2"
                >
                  <label className="text-sm font-bold text-slate-700">
                    Display Name
                    <input
                      value={accountForm.displayName}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          displayName: event.target.value,
                        })
                      }
                      className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-brand"
                    />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Email
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          email: event.target.value,
                        })
                      }
                      className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-brand"
                    />
                  </label>
                  <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                    Phone Number
                    <input
                      value={accountForm.phone}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          phone: event.target.value,
                        })
                      }
                      className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-normal outline-none focus:border-brand"
                    />
                  </label>
                  <button
                    type="submit"
                    className="min-h-11 w-fit rounded-xl bg-brand px-5 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                  >
                    Save Changes
                  </button>
                </form>
              </section>
            )}
            {settingsSection === "security" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Password & Security
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Preview password settings without changing your real password.
                </p>
                <form
                  onSubmit={handlePasswordChange}
                  className="mt-5 grid gap-3 sm:grid-cols-3"
                >
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: event.target.value,
                      })
                    }
                    placeholder="Current Password"
                    className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        next: event.target.value,
                      })
                    }
                    placeholder="New Password"
                    className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: event.target.value,
                      })
                    }
                    placeholder="Confirm New Password"
                    className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="min-h-11 rounded-xl bg-brand px-4 text-sm font-black text-white hover:bg-brand-deep sm:col-span-3 sm:w-fit"
                  >
                    Update Password
                  </button>
                </form>
              </section>
            )}
            {settingsSection === "notifications" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">
                  Notification Settings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose which updates you want to see.
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    [
                      "applications",
                      "Application Updates",
                      "Receive updates about your job applications.",
                    ],
                    [
                      "interviews",
                      "Interview Invitations",
                      "Receive interview updates and invitations.",
                    ],
                    [
                      "messages",
                      "Employer Messages",
                      "Receive notifications when an employer sends a message.",
                    ],
                    [
                      "recommendations",
                      "AI Job Recommendations",
                      "Receive recommendations for jobs matching your profile.",
                    ],
                    [
                      "system",
                      "System Notifications",
                      "Receive important system updates.",
                    ],
                  ].map(([key, label, description]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >
                      <span>
                        <strong className="block text-sm text-slate-900">
                          {label}
                        </strong>
                        <small className="text-xs text-slate-500">
                          {description}
                        </small>
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings[key]}
                        onChange={(event) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [key]: event.target.checked,
                          })
                        }
                        className="h-5 w-5 accent-[var(--brand-primary)]"
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => notify("Notification preferences updated.")}
                  className="mt-5 min-h-11 rounded-xl bg-brand px-5 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  Save Preferences
                </button>
              </section>
            )}
            {settingsSection === "privacy" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">Privacy</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Control how employers and matching features use your
                  information.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setProfileVisibility("public")}
                    className={`rounded-xl border p-4 text-left ${profileVisibility === "public" ? "border-brand bg-brand-soft" : "border-slate-200"}`}
                  >
                    <strong className="block text-sm text-slate-900">
                      Public to Employers
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      Allow employers to discover your profile.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileVisibility("private")}
                    className={`rounded-xl border p-4 text-left ${profileVisibility === "private" ? "border-brand bg-brand-soft" : "border-slate-200"}`}
                  >
                    <strong className="block text-sm text-slate-900">
                      Private
                    </strong>
                    <span className="mt-1 block text-xs text-slate-500">
                      Hide your profile from employer searches.
                    </span>
                  </button>
                </div>
                <label className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                  <span>
                    <strong className="block text-sm text-slate-900">
                      Resume Visibility
                    </strong>
                    <small className="text-xs text-slate-500">
                      Allow employers to view your resume when applying.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={resumeVisible}
                    onChange={(event) => setResumeVisible(event.target.checked)}
                    className="h-5 w-5 accent-[var(--brand-primary)]"
                  />
                </label>
                <label className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                  <span>
                    <strong className="block text-sm text-slate-900">
                      Data Preferences
                    </strong>
                    <small className="text-xs text-slate-500">
                      Use your information to improve job matching.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={dataPreferences}
                    onChange={(event) =>
                      setDataPreferences(event.target.checked)
                    }
                    className="h-5 w-5 accent-[var(--brand-primary)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => notify("Privacy preferences updated.")}
                  className="mt-5 min-h-11 rounded-xl bg-brand px-5 py-2.5 text-sm font-black text-white hover:bg-brand-deep"
                >
                  Save Privacy
                </button>
              </section>
            )}
            {settingsSection === "danger" && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-lg font-black text-red-900">Danger Zone</h2>
                <p className="mt-2 text-sm leading-6 text-red-800">
                  Deleting your account will remove your account data and access
                  to the Job Seeker platform.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(true)}
                  className="mt-5 min-h-11 rounded-xl border border-red-600 px-5 py-2.5 text-sm font-black text-red-700 hover:bg-red-100"
                >
                  Delete Account
                </button>
              </section>
            )}
            {showDeleteAccount && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget)
                    setShowDeleteAccount(false);
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-account-title"
                  className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        id="delete-account-title"
                        className="text-xl font-black text-slate-900"
                      >
                        Delete Account?
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        This action will permanently remove your account and
                        cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setShowDeleteAccount(false)}
                      className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowDeleteAccount(false)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteAccount(false);
                        notify("Account deletion request confirmed.");
                      }}
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-slate-900 px-4 py-3 text-sm font-bold text-emerald-300 shadow-2xl">
            <CheckCircle2 className="h-5 w-5" />
            {toast}
            <button onClick={() => setToast("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
