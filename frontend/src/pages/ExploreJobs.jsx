import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Send,
  Briefcase,
  MapPin,
  Building2,
  Lock,
  PlusCircle,
  Bot,
  User,
  Loader2,
  LogIn,
  UserPlus,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { setPendingApplication } from "../utils/applicationFlow";
import api from "../services/api";

// =========================================================================
// 1. ALL AFRIWORK CONSTANTS & FULL DATASETS (53ቱ ሙሉ ዘርፎች)
// =========================================================================
export const SECTORS = [
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

export const LOCATIONS = [
  "Select location",
  "Addis Ababa",
  "Hawassa",
  "Bahir Dar",
  "Dire Dawa",
  "Adama",
  "Mekelle",
  "Bishoftu",
  "Remote",
  "International / Diaspora",
];

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contractual",
  "Volunteer",
  "Intern (Paid)",
  "Intern (Unpaid)",
];

export const WORK_MODES = [
  { label: "All Workplaces", value: "All" },
  { label: "On-site", value: "On-site" },
  { label: "Remote", value: "Remote" },
  { label: "Hybrid", value: "Hybrid" },
];

export const EXPERIENCE_LEVELS = [
  { label: "Select experience level", value: "all" },
  { label: "Entry level (0-1 yrs)", value: "Entry level" },
  { label: "Junior (1-3 yrs)", value: "Junior" },
  { label: "Intermediate (3-5 yrs)", value: "Intermediate" },
  { label: "Senior (5+ yrs)", value: "Senior" },
  { label: "Expert (8+ yrs)", value: "Expert" },
];

export const EDUCATION_LEVELS = [
  "Select education level",
  "Not Required",
  "Primary School",
  "Middle School",
  "High School",
  "Certificate",
  "Tvet",
  "Diploma",
  "Bachelor’s Degree",
  "Postgraduate Diploma",
  "Master’s Degree",
  "Phd",
];

export const GENDER_PREFERENCES = [
  { label: "Any Gender", value: "Any" },
  { label: "Male Only", value: "Male" },
  { label: "Female Only", value: "Female" },
];

export const DATE_POSTED_OPTIONS = [
  { label: "Any time", value: "all" },
  { label: "Past 24 hours", value: "24h" },
  { label: "Past week", value: "7d" },
  { label: "Past month", value: "30d" },
];

// =========================================================================
// 2. REALISTIC EMPLOYER JOB POSTINGS DATASET
// =========================================================================
const initialJobs = [
  {
    id: 1,
    title: "Admin Supervisor Transport & Logistics",
    company: "Private Client",
    companyAbout:
      "Private Client is an established enterprise managing modern commercial fleet operations and logistics supply lines throughout Ethiopia.",
    location: "Addis Ababa, Ethiopia",
    locationValue: "Addis Ababa",
    type: "Full-time",
    workplace: "On-site",
    experienceLevel: "Intermediate (3-5 yrs)",
    education: "Bachelor’s Degree in Logistics or Business Administration",
    gender: "Any Gender",
    vacancies: 1,
    deadline: "August 30, 2026",
    deadlineDate: "2026-08-30",
    priorityRank: 1,
    postedAt: "Posted 2 hours ago",
    postedHoursAgo: 2,
    sector: "Logistics & Supply Chain",
    currency: "ETB",
    salary: "ETB 35,000 - 55,000 / mo",
    salaryValue: 45000,
    aiMatchScore: 98,
    matchReason:
      "Direct match for fleet supervision, dispatch tracking, and administrative workflows.",
    tags: [
      "Fleet Management",
      "Logistics Dispatch",
      "Office Administration",
      "Reporting",
    ],
    shortDescription:
      "Are you an organized multi-tasker with a knack for keeping fleet operations, administrative workflows, and driver records running seamlessly? We are looking for an Admin Supervisor to lead and streamline our transport administration function!",
    fullDescription:
      "As an Admin Supervisor in Transport & Logistics, you will serve as the operational backbone for our transportation division. You will oversee daily logistics schedules, maintain detailed driver dispatch records, coordinate routine vehicle maintenance, and ensure strict compliance with Ethiopian road transport safety standards.",
    responsibilities: [
      "Manage daily vehicle dispatch schedules, driver assignments, and fuel consumption logs",
      "Supervise routine mechanical inspections, maintenance cycles, and insurance renewals",
      "Prepare weekly operational and administrative performance reports for senior management",
      "Coordinate with cross-functional departments to fulfill urgent transport and supply requests",
    ],
    requirements: [
      "BA degree in Business Administration, Logistics, Supply Chain Management, or related field",
      "3+ years of proven supervisory experience in transport coordination or office logistics",
      "Proficient in Microsoft Excel, fleet management systems, and inventory tracking tools",
      "Strong leadership and interpersonal communication abilities in both Amharic and English",
    ],
    benefits: [
      "Transport & Mobile Phone Allowance",
      "Comprehensive Medical Coverage",
      "Annual Performance Bonus & Paid Leave",
    ],
  },
  {
    id: 2,
    title: "Senior Full Stack Software Engineer",
    company: "EthioFinTech Labs",
    companyAbout:
      "EthioFinTech Labs is a licensed financial technology provider pioneering next-generation digital payment platforms and financial inclusion across East Africa.",
    location: "Addis Ababa, Ethiopia",
    locationValue: "Addis Ababa",
    type: "Full-time",
    workplace: "Hybrid",
    experienceLevel: "Senior (5+ yrs)",
    education: "Bachelor’s Degree in Computer Science or Software Engineering",
    gender: "Any Gender",
    vacancies: 2,
    deadline: "September 15, 2026",
    deadlineDate: "2026-09-15",
    priorityRank: 2,
    postedAt: "Posted 5 hours ago",
    postedHoursAgo: 5,
    sector: "Software Design & Development",
    currency: "ETB",
    salary: "ETB 65,000 - 95,000 / mo",
    salaryValue: 80000,
    aiMatchScore: 96,
    matchReason:
      "High relevance for React, Node.js, RESTful microservices, and PostgreSQL systems.",
    tags: [
      "React",
      "Node.js",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Docker",
    ],
    shortDescription:
      "Design and deploy scalable next-generation digital payment rails and modern web interfaces. Collaborate with engineering leadership to deliver mission-critical FinTech products.",
    fullDescription:
      "You will lead end-to-end full stack architecture for our flagship digital financial ecosystem. Working alongside product managers and UI designers, you will write resilient backend services, implement clean interactive frontend experiences, and guarantee bank-grade security protocols.",
    responsibilities: [
      "Architect and maintain high-throughput RESTful and GraphQL APIs using Node.js and TypeScript",
      "Build modular, responsive web client components using React, Tailwind CSS, and state management",
      "Optimize PostgreSQL database queries, transactional integrity, and Redis caching layers",
      "Perform code reviews, mentor junior engineers, and contribute to automated CI/CD pipelines",
    ],
    requirements: [
      "4+ years of professional full-stack development experience in production environments",
      "Deep practical expertise in modern JavaScript/TypeScript, React, Node.js, and SQL databases",
      "Solid foundation in software design patterns, cloud deployments, and web application security",
      "Strong analytical mindset and enthusiasm for solving complex technological challenges",
    ],
    benefits: [
      "Competitive Salary + Performance Bonuses",
      "Hybrid Workplace (2 days Remote / week)",
      "Comprehensive Family Health Insurance",
      "Annual Professional Learning & Development Stipend",
    ],
  },
  {
    id: 3,
    title: "AI / LLM Research & Modeling Engineer",
    company: "NeuralCore Global",
    companyAbout:
      "NeuralCore Global is an international artificial intelligence laboratory developing specialized machine intelligence and natural language processing infrastructure for emerging markets.",
    location: "Remote, Ethiopia",
    locationValue: "Remote",
    type: "Full-time",
    workplace: "Remote",
    experienceLevel: "Expert (8+ yrs)",
    education: "Master’s Degree in Artificial Intelligence or Computer Science",
    gender: "Any Gender",
    vacancies: 1,
    deadline: "September 20, 2026",
    deadlineDate: "2026-09-20",
    priorityRank: 3,
    postedAt: "Posted 8 hours ago",
    postedHoursAgo: 8,
    sector: "Data Science & Analytics",
    currency: "USD",
    salary: "$3,500 - $5,200 / mo",
    salaryValue: 430000,
    aiMatchScore: 95,
    matchReason:
      "Strong fit for Python, Transformer architectures, and vector embeddings.",
    tags: [
      "Python",
      "Generative AI",
      "PyTorch",
      "Transformers",
      "Vector DB",
      "FastAPI",
    ],
    shortDescription:
      "Lead experimental research in semantic job parsing and real-time candidate matchmaking models at continental scale.",
    fullDescription:
      "Join an elite research and engineering unit developing cutting-edge AI matchmaking infrastructure. You will fine-tune open-source LLMs, create semantic vector embeddings for cross-lingual African job markets, and deploy scalable inference engines.",
    responsibilities: [
      "Train, fine-tune, and evaluate large language models and semantic retrieval systems",
      "Construct robust ETL pipelines for multilingual job parsing and candidate profile extraction",
      "Optimize model inference throughput and memory footprints for low-latency production APIs",
      "Collaborate with product teams to integrate AI-driven intelligence into user-facing platforms",
    ],
    requirements: [
      "Master's or PhD degree in Computer Science, Artificial Intelligence, or quantitative field",
      "Demonstrated track record with deep learning frameworks (PyTorch, Hugging Face, LangChain)",
      "Hands-on experience with vector search engines (Pinecone, Qdrant, Milvus) and embeddings",
      "Published research or proven production track record with LLM-powered applications",
    ],
    benefits: [
      "100% Remote Global Flexibility",
      "USD-denominated Compensation",
      "Latest Apple M-Series Hardware Provided",
      "Annual Global AI Conference Attendance Budget",
    ],
  },
  {
    id: 4,
    title: "Agri-Tech Supply Chain & Logistics Officer",
    company: "GreenValley Agro Hub",
    companyAbout:
      "GreenValley Agro Hub connects regional farming cooperatives directly with commercial markets and cold-chain logistics across Southern Ethiopia.",
    location: "Hawassa, Ethiopia",
    locationValue: "Hawassa",
    type: "Full-time",
    workplace: "On-site",
    experienceLevel: "Intermediate (3-5 yrs)",
    education: "Bachelor’s Degree in Agribusiness or Supply Chain",
    gender: "Any Gender",
    vacancies: 1,
    deadline: "September 02, 2026",
    deadlineDate: "2026-09-02",
    priorityRank: 2,
    postedAt: "Posted 18 hours ago",
    postedHoursAgo: 18,
    sector: "Agriculture",
    currency: "ETB",
    salary: "ETB 38,000 - 55,000 / mo",
    salaryValue: 46000,
    aiMatchScore: 91,
    matchReason:
      "High relevance in agricultural logistics and farm-to-market dispatch.",
    tags: [
      "Supply Chain",
      "Logistics",
      "Cold Chain",
      "Inventory Control",
      "Agribusiness",
    ],
    shortDescription:
      "Supervise daily distribution schedules, digital traceability platforms, and cooperative vendor operations across Southern Ethiopia.",
    fullDescription:
      "GreenValley Agro Hub connects regional farming cooperatives directly with commercial markets. In this role, you will coordinate cold-chain transportation, manage warehouse intake schedules, and utilize digital tracking systems to eliminate post-harvest losses.",
    responsibilities: [
      "Supervise daily produce intake, grading standards, and cold-storage warehouse inventory",
      "Plan efficient regional trucking routes to transport perishables to major urban markets",
      "Ensure compliance with food quality certifications and sanitary transport standards",
      "Maintain active relationships with local smallholder cooperative leaders and freight vendors",
    ],
    requirements: [
      "Degree in Agribusiness, Supply Chain Management, Logistics, or related field",
      "3+ years managing agricultural freight, temperature-controlled logistics, or warehouse ops",
      "Proficient in warehouse management software (WMS) and spreadsheet analytics",
      "Excellent local communication skills and willingness to travel regionally when needed",
    ],
    benefits: [
      "Housing & Field Travel Allowance",
      "Performance-based Quarterly Incentives",
      "Full Health Insurance Package",
    ],
  },
  {
    id: 5,
    title: "Senior Financial Risk & Compliance Analyst",
    company: "Abyssinia Capital",
    companyAbout:
      "Abyssinia Capital is an institutional investment and advisory firm offering asset portfolio management and enterprise financial audit solutions.",
    location: "Addis Ababa, Ethiopia",
    locationValue: "Addis Ababa",
    type: "Full-time",
    workplace: "On-site",
    experienceLevel: "Senior (5+ yrs)",
    education: "Master’s Degree in Finance, Accounting, or Economics",
    gender: "Any Gender",
    vacancies: 1,
    deadline: "August 28, 2026",
    deadlineDate: "2026-08-28",
    priorityRank: 1,
    postedAt: "Posted 1 day ago",
    postedHoursAgo: 24,
    sector: "Accounting & Finance",
    currency: "ETB",
    salary: "ETB 70,000 - 110,000 / mo",
    salaryValue: 90000,
    aiMatchScore: 94,
    matchReason:
      "Deep regulatory expertise in Ethiopian banking directives and risk modeling.",
    tags: [
      "Risk Assessment",
      "IFRS Standards",
      "Financial Modeling",
      "Corporate Compliance",
    ],
    shortDescription:
      "Guide compliance reviews, capital adequacy modeling, and institutional audit workflows for enterprise clients.",
    fullDescription:
      "Abyssinia Capital is an institutional investment and advisory firm. As Senior Risk & Compliance Analyst, you will evaluate asset portfolios, conduct rigorous financial audits, and ensure all operations adhere to National Bank of Ethiopia regulations and IFRS guidelines.",
    responsibilities: [
      "Conduct quarterly financial risk assessments and build stress-testing econometric models",
      "Formulate compliance guidelines to safeguard institutional investments against market volatility",
      "Draft comprehensive regulatory reports for submission to state regulatory authorities",
      "Advise executive leadership on liquidity requirements, credit risks, and operational exposures",
    ],
    requirements: [
      "Master's Degree in Finance, Accounting, or Economics; ACCA / CFA qualification is a strong plus",
      "5+ years of senior risk assessment or auditing experience within banking or advisory firms",
      "Thorough command of National Bank directives, IFRS compliance, and financial analysis tools",
      "Superior analytical acumen and impeccable professional integrity",
    ],
    benefits: [
      "Executive Tier Compensation & Stock Options",
      "Full Comprehensive Health & Life Coverage",
      "Professional Certification Sponsorship (CFA/ACCA)",
    ],
  },
  {
    id: 6,
    title: "Healthcare Clinical Support Specialist",
    company: "BioHealth Diagnostics",
    companyAbout:
      "BioHealth Diagnostics operates modern medical laboratory and automated clinical testing centers across Northwest Ethiopia.",
    location: "Bahir Dar, Ethiopia",
    locationValue: "Bahir Dar",
    type: "Full-time",
    workplace: "On-site",
    experienceLevel: "Intermediate (3-5 yrs)",
    education: "Bachelor’s Degree in Medical Laboratory Science",
    gender: "Female",
    vacancies: 1,
    deadline: "September 10, 2026",
    deadlineDate: "2026-09-10",
    priorityRank: 3,
    postedAt: "Posted 2 days ago",
    postedHoursAgo: 48,
    sector: "Healthcare",
    currency: "ETB",
    salary: "ETB 32,000 - 48,000 / mo",
    salaryValue: 40000,
    aiMatchScore: 89,
    matchReason:
      "Laboratory diagnostics protocols and patient data management skills.",
    tags: [
      "Clinical Lab",
      "Diagnostics",
      "Patient Care",
      "Hygiene Standards",
      "Healthcare",
    ],
    shortDescription:
      "Support daily clinical testing, automated diagnostic equipment maintenance, and laboratory quality control.",
    fullDescription:
      "BioHealth Diagnostics operates modern laboratory centers across Northwest Ethiopia. You will handle specialized medical testing, operate digital hematology and biochemistry analyzers, maintain quality assurance records, and provide clear diagnostic reports to attending physicians.",
    responsibilities: [
      "Perform diagnostic sample analyses in hematology, clinical chemistry, and microbiology",
      "Calibrate and sanitize automated diagnostic machinery according to international safety standards",
      "Maintain meticulous quality control logs and manage laboratory reagent inventories",
      "Ensure prompt delivery of confidential diagnostic findings to healthcare practitioners",
    ],
    requirements: [
      "BSc in Medical Laboratory Science, Biomedical Technology, or Clinical Nursing",
      "Active professional practicing license with 2+ years of hospital or diagnostic center experience",
      "Demonstrated familiarity with modern digital clinical testing instruments",
      "Compassionate, detail-oriented approach with strict adherence to patient privacy",
    ],
    benefits: [
      "Duty & Professional License Allowance",
      "Annual Health Checkup & Family Coverage",
      "Continuous Medical Education (CME) Credits",
    ],
  },
];

// =========================================================================
// 3. AUTH MODAL (LOGIN / SIGN UP POPUP)
// =========================================================================
function AuthModal({
  isOpen,
  initialMode = "login",
  targetJob,
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onSuccess(email, mode, targetJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 text-left">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F7FC] border border-[#D0E5F5] text-[#2B73A4] mb-3.5">
            {mode === "login" ? (
              <LogIn className="h-6 w-6" />
            ) : (
              <UserPlus className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Login to Apply" : "Create Candidate Account"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {targetJob
              ? `Sign in to submit your application for "${targetJob.title}"`
              : "Sign in to access verified career vacancies & personalized AI matches"}
          </p>
        </div>

        {/* Toggle between Log In & Sign Up */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#2B73A4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition cursor-pointer ${
              mode === "signup"
                ? "bg-white text-[#2B73A4] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#2B73A4]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#2B73A4]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-900">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#2B73A4]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#56A2D8] hover:bg-[#2B73A4] text-white font-black text-base shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {mode === "login" ? "Sign In & Apply" : "Create Account & Apply"}
            </span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 4. CLEAN JOB CARD
// =========================================================================
function CleanJobCard({ job, saved, onToggleSave, onShare, onViewDetails }) {
  const [showFullShort, setShowFullShort] = useState(false);

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="job-listing-card group relative rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xs hover:-translate-y-1 hover:border-[#56A2D8] hover:shadow-xl hover:shadow-[#56A2D8]/15 transition-all duration-200 ease-out text-left cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-[#2B73A4] transition-colors leading-snug tracking-tight">
            {job.title}
          </h3>

          <div className="mt-2.5 flex items-center gap-3 flex-wrap text-base sm:text-lg font-bold text-slate-700">
            <span className="font-black text-slate-900">{job.company}</span>
            <span className="text-slate-500">•</span>
            <span className="font-semibold text-slate-700">{job.location}</span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 shrink-0 text-slate-400"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="hidden sm:inline-block text-sm sm:text-base font-bold text-slate-700">
            {job.postedAt}
          </span>

          <button
            type="button"
            onClick={() => onShare(job)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-[#2B73A4] hover:bg-[#F0F7FC] transition cursor-pointer"
            title="Share Job"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            className={`p-2.5 rounded-xl transition cursor-pointer ${
              saved
                ? "text-[#2B73A4] bg-[#F0F7FC] border border-[#D0E5F5] hover:bg-white"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title={saved ? "Remove bookmark" : "Bookmark Job"}
          >
            <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-base sm:text-lg leading-relaxed text-slate-700 font-normal">
          {showFullShort
            ? job.shortDescription
            : `${job.shortDescription.slice(0, 185)}...`}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullShort(!showFullShort);
          }}
          className="mt-2.5 text-base font-bold text-[#2B73A4] hover:underline cursor-pointer inline-block"
        >
          {showFullShort ? "Show Less" : "Show More"}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-6 sm:gap-10 lg:gap-14 text-sm flex-wrap">
          <div>
            <p className="font-bold text-slate-900 text-base sm:text-lg">
              {job.experienceLevel}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Experience Level
            </p>
          </div>

          <div>
            <p className="text-base font-extrabold text-slate-900 sm:text-lg">
              {job.workplace} – {job.type}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Job Type
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-900 text-base sm:text-lg">
              {job.deadline}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Deadline
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(job);
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] text-[#2B73A4] hover:bg-white hover:text-[#2B73A4] hover:border-[#56A2D8] text-base font-bold transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer tracking-wide"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. "VIEW DETAILS" MODAL (OPENS LOGIN / SIGNUP ON CLICK)
// ============================================================================
function JobDetailModal({
  job,
  onClose,
  onApply,
  onShare,
  onToggleSave,
  isSaved,
}) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 text-left">
      <div
        className="relative w-full max-w-5xl bg-white min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col sm:max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-10 py-5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] px-4 py-2 text-sm font-bold text-[#2B73A4] shadow-2xs">
              <ShieldCheck className="h-4.5 w-4.5 text-[#56A2D8]" />
              <span>Verified Employer Posting</span>
            </span>
            <span className="hidden text-sm font-bold text-slate-700 sm:inline">
              {job.postedAt}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onShare(job)}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#2B73A4] transition cursor-pointer shadow-2xs"
              title="Share Job"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              className={`p-2.5 rounded-xl border transition cursor-pointer shadow-2xs ${
                isSaved
                  ? "border-[#56A2D8] bg-[#56A2D8] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:text-[#2B73A4]"
              }`}
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark
                className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-sm font-extrabold flex items-center gap-2 transition cursor-pointer shadow-2xs ml-1"
            >
              <X className="h-4.5 w-4.5" />
              <span>Close</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 md:p-10 space-y-8 bg-[#F8FAFC]">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm font-bold text-[#2B73A4] flex-wrap">
                  <span className="bg-[#F0F7FC] px-3.5 py-1.5 rounded-xl border border-[#D0E5F5]">
                    {job.sector}
                  </span>
                  <span>•</span>
                  <span className="text-[#2B73A4] font-bold bg-[#F0F7FC] px-3 py-1 rounded-xl border border-[#D0E5F5]">
                    Deadline: {job.deadline}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-base sm:text-lg font-bold text-slate-700 pt-1">
                  <span className="flex items-center gap-2 text-slate-900 font-black">
                    <Building2 className="w-5.5 h-5.5 text-[#56A2D8]" />
                    {job.company}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-2 text-slate-700 font-semibold">
                    <MapPin className="w-5.5 h-5.5 text-[#56A2D8]" />
                    {job.location}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Briefcase className="w-5.5 h-5.5 text-[#56A2D8]" />
                    {job.workplace} ({job.type})
                  </span>
                </div>
              </div>

              <div className="bg-[#F0F7FC] border border-[#D0E5F5] rounded-2xl p-5 flex items-center gap-3.5 shrink-0 self-start lg:self-center">
                <Sparkles className="w-6 h-6 text-[#56A2D8]" />
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    AI Match Confidence
                  </span>
                  <span className="text-xl font-black text-[#2B73A4]">
                    {job.aiMatchScore}% Match Score
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
            <div className="p-6 rounded-2xl bg-[#F0F7FC] border border-[#D0E5F5] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-[#2B73A4] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#56A2D8]" />
                  AI Match Assessment
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-white text-[#2B73A4] text-xs sm:text-sm font-black border border-[#D0E5F5] shadow-2xs">
                  {job.aiMatchScore}% Match
                </span>
              </div>
              <p className="text-base font-semibold leading-relaxed text-slate-800 sm:text-lg">
                ✨ {job.matchReason}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-3.5">
                <span className="w-3 h-3 rounded-full bg-[#56A2D8]"></span>
                <span>Job Overview & Scope</span>
              </h3>
              <p className="text-lg font-normal leading-relaxed text-slate-800 sm:text-xl sm:leading-9">
                {job.fullDescription}
              </p>
            </div>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-3.5">
                  <span className="w-3 h-3 rounded-full bg-[#56A2D8]"></span>
                  <span>Key Responsibilities & Duties</span>
                </h3>
                <ul className="space-y-4 pt-1">
                  {job.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-base font-semibold leading-relaxed text-slate-800 sm:text-lg"
                    >
                      <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#56A2D8]" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-3.5">
                  <span className="w-3 h-3 rounded-full bg-[#56A2D8]"></span>
                  <span>Qualifications & Requirements</span>
                </h3>
                <ul className="space-y-4 pt-1">
                  {job.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-base font-semibold leading-relaxed text-slate-800 sm:text-lg"
                    >
                      <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#56A2D8]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-3.5">
                <span className="w-3 h-3 rounded-full bg-[#56A2D8]"></span>
                <span>Required Skills & Technologies</span>
              </h3>
              <div className="flex flex-wrap gap-3 pt-1">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-4.5 py-2.5 text-base font-bold text-slate-800 hover:border-[#56A2D8] transition shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Compensation & Employer Overview */}
            <div className="pt-8 border-t-2 border-slate-100 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#56A2D8]"></span>
                <span>Employer Specifications & Overview</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#F0F7FC] rounded-2xl p-6 border border-[#D0E5F5] space-y-2 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 sm:text-sm">
                    Offered Compensation
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-1">
                    {job.salary}
                  </span>
                  <span className="block text-xs font-semibold text-slate-700 sm:text-sm">
                    Negotiable Package
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3.5 text-left">
                  <span className="block border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700 sm:text-sm">
                    Employer Specifications
                  </span>
                  <div className="space-y-2.5 text-sm sm:text-base">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Sector:
                      </span>
                      <span className="font-bold text-slate-900">
                        {job.sector}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Vacancies:
                      </span>
                      <span className="font-bold text-slate-900">
                        {job.vacancies || 1} Position
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Education:
                      </span>
                      <span className="font-bold text-slate-900">
                        {job.education}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">
                        Deadline:
                      </span>
                      <span className="font-black text-[#2B73A4] bg-[#F0F7FC] px-2.5 py-1 rounded-lg border border-[#D0E5F5]">
                        {job.deadline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3.5 text-left">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-200 pb-2">
                    <Building2 className="w-5 h-5 text-[#56A2D8]" />
                    <span>About {job.company}</span>
                  </div>
                  <p className="text-sm font-normal leading-relaxed text-slate-700 sm:text-base">
                    {job.companyAbout ||
                      `${job.company} is an established enterprise driving professional employment and organizational growth.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR - TRIGGERS AUTH MODAL */}
        <div className="sticky bottom-0 z-30 flex items-center justify-end border-t border-slate-200 bg-white px-6 md:px-10 py-4.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onApply(job);
            }}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#56A2D8] hover:bg-[#2B73A4] text-white text-base font-black transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-3 tracking-wide group"
          >
            <Lock className="h-5 w-5 text-white/90" />
            <span>Login to Apply</span>
            <Send className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. JOB POST MODAL
// =========================================================================
function JobPostModal({ isOpen, onClose, onJobCreated }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [sector, setSector] = useState(
    SECTORS[1] || "Software Design & Development",
  );
  const [locationValue, setLocationValue] = useState(
    LOCATIONS[1] || "Addis Ababa",
  );
  const [workplace, setWorkplace] = useState("On-site");
  const [jobType, setJobType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState(
    "Intermediate (3-5 yrs)",
  );
  const [education, setEducation] = useState("Bachelor’s Degree");
  const [gender, setGender] = useState("Any");
  const [vacancies, setVacancies] = useState(1);
  const [deadline, setDeadline] = useState("September 30, 2026");
  const [currency, setCurrency] = useState("ETB");
  const [salaryMin, setSalaryMin] = useState("40,000");
  const [salaryMax, setSalaryMax] = useState("65,000");
  const [shortDescription, setShortDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState([
    "Lead and coordinate operational and team deliverables",
    "Collaborate cross-functionally with department heads",
    "Ensure strict compliance with quality and reporting metrics",
  ]);
  const [requirements, setRequirements] = useState([
    "Relevant University Degree or equivalent practical experience",
    "2+ years of proven industry experience",
    "Strong communication and problem-solving skills",
  ]);
  const [tags, setTags] = useState("Leadership, Strategy, Communication");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !company) return;

    const salaryNumeric =
      parseInt(salaryMin.replace(/[^0-9]/g, ""), 10) || 45000;
    const salaryFormatted = `${currency} ${salaryMin} - ${salaryMax} / mo`;
    const cleanTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newJob = {
      id: Date.now(),
      title,
      company,
      companyAbout: `${company} is an active employer seeking top talent to drive organizational excellence.`,
      location: `${locationValue}, Ethiopia`,
      locationValue,
      type: jobType,
      workplace,
      experienceLevel,
      education,
      gender,
      vacancies: Number(vacancies) || 1,
      deadline,
      deadlineDate: "2026-09-30",
      priorityRank: 1,
      postedAt: "Just now",
      postedHoursAgo: 0,
      sector,
      currency,
      salary: salaryFormatted,
      salaryValue: salaryNumeric,
      aiMatchScore: 96,
      matchReason: `Newly posted opportunity matching ${sector} and ${experienceLevel} qualifications.`,
      tags: cleanTags.length > 0 ? cleanTags : [sector, jobType, workplace],
      shortDescription:
        shortDescription ||
        `Exciting opportunity for a ${title} to join ${company}. Lead operational tasks and contribute to team growth.`,
      fullDescription: `We are seeking a dedicated ${title} to join ${company}. In this role, you will collaborate with key departments and execute core deliverables with high quality.`,
      responsibilities: responsibilities.filter((r) => r.trim().length > 0),
      requirements: requirements.filter((r) => r.trim().length > 0),
      benefits: [
        "Competitive Compensation Package",
        "Health & Life Insurance",
        "Performance Bonus & Career Growth",
      ],
    };

    onJobCreated(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 text-left">
      <div
        className="relative w-full max-w-4xl bg-white min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 py-5 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Post a New Job
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Publish a vacancy to connect with thousands of qualified
                professionals
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6 bg-[#F8FAFC]"
        >
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2.5">
              Core Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-[#56A2D8] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EthioTech Labs"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-[#56A2D8] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 outline-none"
                >
                  {SECTORS.filter((s) => s !== "Select sector").map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location
                </label>
                <select
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 outline-none"
                >
                  {LOCATIONS.filter((l) => l !== "Select location").map(
                    (loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2.5">
              Job Description
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Summary
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Overview of the vacancy and key deliverables..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 outline-none focus:border-[#56A2D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. React, Node.js, SQL, Agile"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-white p-4 border-t border-slate-200 rounded-2xl flex items-center justify-end gap-3 shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-[#56A2D8] hover:bg-[#2B73A4] text-white font-black text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Publish Job Posting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 7. GOOGLE AI ASSISTANT MODAL
// =========================================================================
function GoogleAiAssistantModal({ isOpen, onClose, contextJobs }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Hello! I am your Google AI Career & Matchmaking Assistant. Ask me about vacancies, salary expectations, or tips for applying!",
      timestamp: "Just now",
      suggestions: [
        "Which jobs have the highest compensation?",
        "How can I tailor my resume for transport & logistics?",
        "Show me remote opportunities available right now",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let replyText = `Based on your request ("${textToSend.trim()}"), here are top recommendations:\n- **Senior Full Stack Software Engineer** at EthioFinTech Labs (ETB 65K-95K, Hybrid)\n- **AI / LLM Research Engineer** at NeuralCore Global ($3,500-$5,200/mo, Remote)\n- **Admin Supervisor** at Private Client (ETB 35K-55K, On-site)\n\nClick 'View Details' on any card to read qualifications and submit your application!`;

      const assistantReply = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantReply]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 text-left">
      <div
        className="relative w-full max-w-3xl bg-white min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col sm:h-[86vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 text-white shadow-md">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Google AI Assistant
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-[10px] font-extrabold uppercase text-sky-200">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Intelligent Job Matchmaking & Career Advisor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-[#F8FAFC]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs ${
                  msg.role === "user"
                    ? "brand-bg text-white"
                    : "bg-gradient-to-tr from-sky-500 to-indigo-600 text-white"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4.5 w-4.5" />
                ) : (
                  <Bot className="h-4.5 w-4.5" />
                )}
              </div>

              <div
                className={`max-w-[84%] rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  msg.role === "user"
                    ? "brand-bg text-white font-semibold rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(sug)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F0F7FC] hover:bg-white text-[#2B73A4] border border-[#D0E5F5] transition cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-2.5 text-sm font-bold text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin brand-text" />
                <span>Google AI is finding career matches...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Google AI assistant about vacancies, salaries, tips..."
              className="flex-1 px-4.5 py-3.5 rounded-2xl border border-slate-300 text-sm sm:text-base font-semibold text-slate-900 outline-none focus:border-[var(--brand-primary)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              <Send className="h-4.5 w-4.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 8. MAIN EXPLORE JOBS PAGE COMPONENT
// =========================================================================
export default function ExploreJobsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromDashboard = location.state?.fromDashboard === true || searchParams.get('from') === 'dashboard';
  const normalizeApiJob = (job) => {
    const rawTags = Array.isArray(job.tags)
      ? job.tags
      : Array.isArray(job.required_skills)
        ? job.required_skills
        : String(job.required_skills || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

    const normalizedSalaryMin = Number(job.salary_min ?? job.salaryMin ?? 0);
    const normalizedSalaryMax = Number(job.salary_max ?? job.salaryMax ?? 0);
    const priceText =
      normalizedSalaryMin || normalizedSalaryMax
        ? `${job.currency || "ETB"} ${normalizedSalaryMin.toLocaleString()} - ${normalizedSalaryMax.toLocaleString()} / mo`
        : job.salary || "Compensation disclosed upon application";

    return {
      ...job,
      id: job.id || job.jobId,
      company: job.company || job.company_name || "Employer company",
      location: job.location || job.locationValue || "Location not specified",
      locationValue: job.locationValue || job.location || "",
      type: job.type || job.job_type || "Full-time",
      workplace: job.workplace || job.work_mode || "Hybrid",
      experienceLevel:
        job.experienceLevel ||
        job.experience_level ||
        "Mid-level",
      education: job.education || job.required_education || "Any",
      sector: job.sector || job.category || "Other",
      gender: job.gender ||
        (job.gender_preference === "male"
          ? "Male"
          : job.gender_preference === "female"
            ? "Female"
            : "Any Gender"),
      vacancies: Number(job.vacancies ?? job.vacancy_count ?? 1),
      deadline: job.deadline || job.application_deadline || "No deadline",
      deadlineDate: job.deadlineDate || job.application_deadline || "",
      postedAt: job.postedAt || (job.created_at ? `Posted ${new Date(job.created_at).toLocaleDateString()}` : "Recently posted"),
      postedHoursAgo: Number(job.postedHoursAgo) || 0,
      priorityRank: Number(job.priorityRank) || 1,
      salaryValue: Number(job.salaryValue ?? normalizedSalaryMin ?? 0),
      salary: priceText,
      aiMatchScore: Number(job.aiMatchScore || 0),
      matchReason:
        job.matchReason ||
        "Published by an employer on the Job Matching platform.",
      tags: rawTags,
      shortDescription: job.shortDescription || job.description || "",
      fullDescription: job.fullDescription || job.description || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities
        : [],
      requirements: Array.isArray(job.requirements)
        ? job.requirements
        : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
    };
  };
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        const { data } = await api.get('/jobs');
        if (!mounted) return;

        const rawJobs = Array.isArray(data) ? data : data.jobs || [];
        setJobs(rawJobs.map(normalizeApiJob));
      } catch (error) {
        console.error("Unable to load jobs from API:", error);
        if (mounted) {
          setJobs(initialJobs);
        }
      }
    };

    loadJobs();
    return () => {
      mounted = false;
    };
  }, []);

  // Pagination / Limit State
  const INITIAL_VISIBLE_COUNT = 4;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  // Filter States
  const [selectedSector, setSelectedSector] = useState("Select sector");
  const [selectedLocation, setSelectedLocation] = useState("Select location");
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedWorkMode, setSelectedWorkMode] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedEducation, setSelectedEducation] = useState(
    "Select education level",
  );
  const [selectedGender, setSelectedGender] = useState("Any");
  const [datePosted, setDatePosted] = useState("all");

  // Salary & Currency
  const [currency, setCurrency] = useState("ETB");
  const [minSalary, setMinSalary] = useState(0);

  // Accordions Default Closed
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [isJobTypeOpen, setIsJobTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isWorkModeOpen, setIsWorkModeOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isCompensationOpen, setIsCompensationOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDatePostedOpen, setIsDatePostedOpen] = useState(false);

  // Modals State
  const [isJobPostOpen, setIsJobPostOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [authModalState, setAuthModalState] = useState({
    open: false,
    mode: "login",
    targetJob: null,
  });

  const [sortBy, setSortBy] = useState("newest");
  const [savedJobs, setSavedJobs] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-reset visible count back to initial count when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [
    search,
    selectedSector,
    selectedLocation,
    selectedJobTypes,
    selectedWorkMode,
    selectedExperience,
    selectedEducation,
    selectedGender,
    minSalary,
    currency,
    datePosted,
    sortBy,
  ]);

  const selectJobType = (type) => {
    setSelectedJobTypes(type ? [type] : []);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShare = (job) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link copied to clipboard for "${job.title}"!`);
    } else {
      showToast(`Job details ready to share!`);
    }
  };

  const toggleSave = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId],
    );
    showToast(
      savedJobs.includes(jobId)
        ? "Job removed from bookmarks."
        : "Job saved to bookmarks!",
    );
  };

  // When user clicks 'Login to Apply' inside View Details
  const handleApplyClick = (job) => {
    setSelectedJob(null); // Close the detail modal
    setPendingApplication(job.id, job);
    navigate("/login", {
      state: { intent: "apply", jobId: job.id, from: `/job-details/${job.id}` },
    });
  };

  const handleViewDetails = (job) => {
    localStorage.setItem("jobDetailsPreview", JSON.stringify(job));
    navigate(`/job-details/${job.id}`);
  };

  const handleAuthSuccess = (email, mode, targetJob) => {
    if (!targetJob) return;
    handleApplyClick(targetJob);
  };

  const handleJobCreated = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
    showToast(`🎉 New job "${newJob.title}" posted successfully!`);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedLocation("Select location");
    setSelectedSector("Select sector");
    setSelectedJobTypes([]);
    setSelectedWorkMode("All");
    setSelectedExperience("all");
    setSelectedEducation("Select education level");
    setSelectedGender("Any");
    setMinSalary(0);
    setDatePosted("all");
    setSortBy("newest");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim() !== "") count++;
    if (selectedSector !== "Select sector") count++;
    if (selectedLocation !== "Select location") count++;
    if (selectedJobTypes.length > 0) count += selectedJobTypes.length;
    if (selectedWorkMode !== "All") count++;
    if (selectedExperience !== "all") count++;
    if (selectedEducation !== "Select education level") count++;
    if (selectedGender !== "Any") count++;
    if (minSalary > 0) count++;
    if (datePosted !== "all") count++;
    return count;
  }, [
    search,
    selectedSector,
    selectedLocation,
    selectedJobTypes,
    selectedWorkMode,
    selectedExperience,
    selectedEducation,
    selectedGender,
    minSalary,
    datePosted,
  ]);

  const filteredJobs = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = jobs.filter((job) => {
      if (query) {
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesTags = job.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        const matchesSector = job.sector.toLowerCase().includes(query);
        if (
          !matchesTitle &&
          !matchesCompany &&
          !matchesTags &&
          !matchesSector
        ) {
          return false;
        }
      }

      if (selectedSector !== "Select sector" && job.sector !== selectedSector)
        return false;
      if (
        selectedLocation !== "Select location" &&
        job.locationValue !== selectedLocation
      )
        return false;
      if (selectedJobTypes.length > 0 && !selectedJobTypes.includes(job.type))
        return false;
      if (selectedWorkMode !== "All" && job.workplace !== selectedWorkMode)
        return false;
      if (
        selectedExperience !== "all" &&
        job.experienceLevel
          .toLowerCase()
          .indexOf(selectedExperience.toLowerCase()) === -1
      )
        return false;
      if (
        selectedEducation !== "Select education level" &&
        job.education.indexOf(selectedEducation) === -1
      )
        return false;
      if (
        selectedGender !== "Any" &&
        job.gender !== "Any" &&
        job.gender !== selectedGender
      )
        return false;
      if (
        minSalary > 0 &&
        job.currency === currency &&
        job.salaryValue < minSalary
      )
        return false;
      if (datePosted === "24h" && job.postedHoursAgo > 24) return false;
      if (datePosted === "7d" && job.postedHoursAgo > 168) return false;
      if (datePosted === "30d" && job.postedHoursAgo > 720) return false;

      return true;
    });

    const sorted = [...result];
    if (sortBy === "newest") {
      sorted.sort((a, b) => a.postedHoursAgo - b.postedHoursAgo);
    } else if (sortBy === "priority") {
      sorted.sort((a, b) => a.priorityRank - b.priorityRank);
    } else if (sortBy === "match") {
      sorted.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    } else if (sortBy === "salary") {
      sorted.sort((a, b) => b.salaryValue - a.salaryValue);
    } else if (sortBy === "deadline") {
      sorted.sort(
        (a, b) =>
          new Date(a.deadlineDate).getTime() -
          new Date(b.deadlineDate).getTime(),
      );
    }

    return sorted;
  }, [
    jobs,
    search,
    selectedSector,
    selectedLocation,
    selectedJobTypes,
    selectedWorkMode,
    selectedExperience,
    selectedEducation,
    selectedGender,
    minSalary,
    currency,
    datePosted,
    sortBy,
  ]);

  // Sliced Visible Jobs
  const visibleJobs = filteredJobs.slice(0, visibleCount);

  return (
    <div className="jobs-page min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B73A4] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#56A2D8]">
          <CheckCircle2 className="h-5 w-5 text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER WITH TOP-RIGHT 'JOB POST' AND 'AI GOOGLE ASSISTANT' BUTTONS */}
      <div className="w-full px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find Jobs
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-medium mt-1.5">
              Find opportunities that match your skills and experience.
            </p>
          </div>

          {/* TOP RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-3 flex-wrap">
            {fromDashboard && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-deep)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            )}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] text-[#2B73A4] hover:bg-white hover:border-[#56A2D8] text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden px-4 py-2.5 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] text-[#2B73A4] hover:bg-white text-sm font-bold flex items-center gap-2 shadow-2xs"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>

            {/* 1. TOP RIGHT 'JOB POST' BUTTON */}
            <button
              type="button"
              onClick={() => setIsJobPostOpen(true)}
              className="px-5 py-2.5 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] hover:bg-white text-[#2B73A4] hover:border-[#56A2D8] text-sm sm:text-base font-extrabold shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2.5 tracking-tight group"
            >
              <PlusCircle className="h-5 w-5 text-[#56A2D8] group-hover:scale-110 transition-transform" />
              <span>Job Post</span>
            </button>

            {/* 2. TOP RIGHT 'AI GOOGLE ASSISTANT' BUTTON */}
            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-extrabold shadow-sm shadow-blue-500/30 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-2.5 tracking-tight group"
            >
              <Sparkles className="h-5 w-5 text-sky-200 group-hover:rotate-12 transition-transform" />
              <span>AI Google Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDED FULL-WIDTH CONTAINER */}
      <div className="w-full px-3 sm:px-5 md:px-6 lg:px-0 xl:px-0 2xl:px-0 py-4 flex-1">
        {/* TOP SEARCH BAR */}
        <div className="jobs-search-panel mb-8 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs text-left">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4.5 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for job by title, company name, or skills..."
              className="w-full rounded-xl border-none bg-transparent py-3.5 pl-14 pr-12 text-base sm:text-lg font-bold text-slate-900 outline-hidden placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN MAIN LAYOUT: WIDE CARDS (LEFT) & STICKY AFRIWORK SIDEBAR (RIGHT) */}
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* LEFT: FILTER SIDEBAR */}
          <aside
            className={`brand-sidebar explore-sidebar fixed inset-y-0 right-0 w-72 shrink-0 overflow-y-auto overscroll-contain p-6 shadow-2xl transition-transform lg:sticky lg:top-6 lg:left-0 lg:right-auto lg:block lg:h-[calc(100vh-3rem)] lg:translate-x-0 lg:rounded-2xl lg:p-6 lg:shadow-2xs ${
              mobileFiltersOpen
                ? "translate-x-0"
                : "translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="mb-6 flex items-center justify-between pb-3.5 border-b border-slate-100 text-left">
              <h2 className="text-xl font-bold text-slate-900">Filter Jobs</h2>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#2B73A4] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="lg:hidden p-1 text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 text-left text-base">
              {/* 1. SECTOR */}
              <div>
                <div
                  onClick={() => setIsSectorOpen(!isSectorOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Sector
                  </span>
                  {isSectorOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isSectorOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {SECTORS.map((sec, idx) => (
                        <option
                          key={idx}
                          value={sec}
                          className="text-slate-900 font-medium py-1"
                        >
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. JOB TYPES */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsJobTypeOpen(!isJobTypeOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Job Types
                  </span>
                  {isJobTypeOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isJobTypeOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedJobTypes[0] || ""}
                      onChange={(e) => selectJobType(e.target.value)}
                      className={`w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-base font-semibold outline-hidden shadow-2xs transition hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer ${selectedJobTypes.length === 0 ? "text-slate-400" : "text-slate-900"}`}
                    >
                      <option value="" disabled hidden>
                        Select job type
                      </option>
                      {JOB_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. LOCATION */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Location
                  </span>
                  {isLocationOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isLocationOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {LOCATIONS.map((loc, idx) => (
                        <option
                          key={idx}
                          value={loc}
                          className="text-slate-900 font-medium py-1"
                        >
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 4. WORKPLACE MODE */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsWorkModeOpen(!isWorkModeOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Workplace Mode
                  </span>
                  {isWorkModeOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isWorkModeOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {WORK_MODES.map((wm) => (
                        <option
                          key={wm.value}
                          value={wm.value}
                          className="text-slate-900 font-medium py-1"
                        >
                          {wm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 5. EXPERIENCE LEVEL */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Experience Level
                  </span>
                  {isExperienceOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isExperienceOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <option
                          key={exp.value}
                          value={exp.value}
                          className="text-slate-900 font-medium py-1"
                        >
                          {exp.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 6. EDUCATION LEVEL */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsEducationOpen(!isEducationOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Education Level
                  </span>
                  {isEducationOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isEducationOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedEducation}
                      onChange={(e) => setSelectedEducation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {EDUCATION_LEVELS.map((edu, idx) => (
                        <option
                          key={idx}
                          value={edu}
                          className="text-slate-900 font-medium py-1"
                        >
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 7. COMPENSATION */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsCompensationOpen(!isCompensationOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Compensation
                  </span>
                  {isCompensationOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isCompensationOpen && (
                  <div className="mt-3.5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-700">
                        Currency
                      </span>
                      <div className="flex items-center gap-1 bg-[#F0F7FC] border border-[#D0E5F5] p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrency("ETB");
                            setMinSalary(0);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition ${
                            currency === "ETB"
                              ? "bg-[#56A2D8] text-white"
                              : "text-slate-700"
                          }`}
                        >
                          ETB
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrency("USD");
                            setMinSalary(0);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition ${
                            currency === "USD"
                              ? "bg-[#56A2D8] text-white"
                              : "text-slate-700"
                          }`}
                        >
                          USD
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-base font-bold text-slate-900">
                      <span className="text-slate-700">Minimum:</span>
                      <span className="text-[#2B73A4] font-black">
                        {currency === "ETB"
                          ? minSalary > 0
                            ? `ETB ${minSalary.toLocaleString()}`
                            : "Any Salary"
                          : minSalary > 0
                            ? `$${minSalary.toLocaleString()}`
                            : "Any Salary"}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={currency === "ETB" ? 150000 : 8000}
                      step={currency === "ETB" ? 5000 : 250}
                      value={minSalary}
                      onChange={(e) => setMinSalary(Number(e.target.value))}
                      className="w-full accent-[#56A2D8] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* 8. GENDER */}
              <div className="border-t border-slate-100 pt-5">
                <div
                  onClick={() => setIsGenderOpen(!isGenderOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Gender Preference
                  </span>
                  {isGenderOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isGenderOpen && (
                  <div className="mt-3">
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {GENDER_PREFERENCES.map((gp) => (
                        <option
                          key={gp.value}
                          value={gp.value}
                          className="text-slate-900 font-medium py-1"
                        >
                          {gp.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 9. DATE POSTED */}
              <div className="border-t border-slate-100 pt-5 pb-2">
                <div
                  onClick={() => setIsDatePostedOpen(!isDatePostedOpen)}
                  className="flex items-center justify-between font-bold text-slate-900 hover:text-[#2B73A4] cursor-pointer py-1 select-none transition-colors"
                >
                  <span className="text-lg font-bold tracking-tight">
                    Date Posted
                  </span>
                  {isDatePostedOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#56A2D8]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#56A2D8]" />
                  )}
                </div>

                {isDatePostedOpen && (
                  <div className="mt-3">
                    <select
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-base font-semibold text-slate-900 outline-hidden hover:border-[#56A2D8] focus:border-[#56A2D8] focus:bg-white cursor-pointer shadow-2xs"
                    >
                      {DATE_POSTED_OPTIONS.map((dp) => (
                        <option
                          key={dp.value}
                          value={dp.value}
                          className="text-slate-900 font-medium py-1"
                        >
                          {dp.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Apply Filters Button */}
            <div className="lg:hidden sticky bottom-0 mt-6 pt-4 bg-white border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] text-[#2B73A4] hover:bg-white text-sm font-bold shadow-2xs cursor-pointer"
              >
                Apply Filters ({filteredJobs.length} Jobs Found)
              </button>
            </div>
          </aside>

          {/* RIGHT: JOB CARDS */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            <div className="jobs-results-header flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3.5 text-left">
              <span className="text-lg sm:text-xl font-black text-[#2B73A4] border-b-2 border-[#56A2D8] pb-3.5 px-1 self-start">
                All Jobs
              </span>

              <div className="flex items-center gap-2.5 text-base self-end sm:self-auto">
                <span className="font-bold text-slate-700">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="jobs-sort-select rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-base font-bold text-slate-800 outline-hidden transition cursor-pointer shadow-2xs hover:border-[#56A2D8]"
                >
                  <option value="newest">Most Recent (Newest)</option>
                  <option value="priority">Top Priority & Urgent</option>
                  <option value="match">Highest AI Match</option>
                  <option value="salary">Highest Compensation</option>
                  <option value="deadline">
                    Closing Soon (Nearest Deadline)
                  </option>
                </select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="jobs-empty-state rounded-2xl border border-slate-200/90 bg-white p-14 text-center shadow-2xs space-y-4">
                <Search className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900">
                  No jobs match your selected criteria
                </h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                  Try clearing some of your filters in the sidebar to view more
                  opportunities.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-[#D0E5F5] bg-[#F0F7FC] hover:bg-white hover:border-[#56A2D8] text-[#2B73A4] px-6 py-2.5 text-sm font-bold cursor-pointer shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {visibleJobs.map((job) => (
                    <CleanJobCard
                      key={job.id}
                      job={job}
                      saved={savedJobs.includes(job.id)}
                      onToggleSave={toggleSave}
                      onShare={handleShare}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* ================= SHOW MORE / SHOW LESS BUTTONS ================= */}
                {filteredJobs.length > INITIAL_VISIBLE_COUNT && (
                  <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-2">
                    {visibleCount < filteredJobs.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount((prev) =>
                            Math.min(prev + 4, filteredJobs.length),
                          )
                        }
                        className="px-8 py-3.5 rounded-2xl border-2 border-[#D0E5F5] bg-white hover:bg-[#F0F7FC] hover:border-[#56A2D8] text-[#2B73A4] text-base font-extrabold transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2.5 group"
                      >
                        <span>
                          Show More Jobs (+{filteredJobs.length - visibleCount}{" "}
                          remaining)
                        </span>
                        <ChevronDown className="h-5 w-5 text-[#56A2D8] group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleCount(INITIAL_VISIBLE_COUNT);
                          window.scrollTo({ top: 150, behavior: "smooth" });
                        }}
                        className="px-7 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-extrabold transition-all duration-200 shadow-2xs cursor-pointer flex items-center gap-2"
                      >
                        <span>Show Less</span>
                        <ChevronUp className="h-4.5 w-4.5 text-slate-500" />
                      </button>
                    )}
                    <span className="text-xs font-semibold text-slate-500">
                      Showing {visibleJobs.length} of {filteredJobs.length}{" "}
                      positions
                    </span>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* JOB DETAIL MODAL */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApplyClick}
        onShare={handleShare}
        onToggleSave={toggleSave}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
      />

      {/* AUTH MODAL (LOGIN / SIGN UP) */}
      <AuthModal
        isOpen={authModalState.open}
        initialMode={authModalState.mode}
        targetJob={authModalState.targetJob}
        onClose={() =>
          setAuthModalState({ open: false, mode: "login", targetJob: null })
        }
        onSuccess={handleAuthSuccess}
      />

      {/* JOB POST MODAL */}
      <JobPostModal
        isOpen={isJobPostOpen}
        onClose={() => setIsJobPostOpen(false)}
        onJobCreated={handleJobCreated}
      />

      {/* GOOGLE AI ASSISTANT MODAL */}
      <GoogleAiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        contextJobs={jobs}
      />
    </div>
  );
}
