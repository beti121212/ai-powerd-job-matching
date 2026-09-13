import React from "react";
import { Menu, ArrowLeft, Globe, Send } from "lucide-react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Database,
  Download,
  Gauge,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const sectionTitles = {
  about: {
    title: "About Me & Overview",
    titleAm: "ስለ እኔ እና አጠቃላይ ገለጻ",
    subtitle: "Professional journey, philosophy & engineering values",
    subtitleAm: "የሙያ ታሪክ፣ ፍልስፍና እና የሶፍትዌር ምህንድስና እሴቶች",
  },
  experience: {
    title: "Career & Experience",
    titleAm: "የስራ ልምድ እና ጉዞ",
    subtitle: "Track record of high-impact engineering leadership & delivery",
    subtitleAm: "በተለያዩ ድርጅቶች ውስጥ የተሰሩ ዋና ዋና ስራዎች",
  },
  skills: {
    title: "Tech Matrix & Competencies",
    titleAm: "የቴክኖሎጂ ክህሎቶች ማትሪክስ",
    subtitle: "Core proficiencies across frontend, backend, AI & cloud",
    subtitleAm: "በተለያዩ የሶፍትዌር ቴክኖሎጂዎች ላይ ያለው ዝርዝር ብቃት",
  },
  projects: {
    title: "Featured Projects & Case Studies",
    titleAm: "የተመረጡ ፕሮጀክቶች እና ስራዎች",
    subtitle: "Production software architecture and live demonstrations",
    subtitleAm: "የቀጥታ ማሳያዎች እና ዝርዝር የፕሮጀክት መረጃዎች",
  },
  services: {
    title: "Services & Solutions",
    titleAm: "አገልግሎቶች እና መፍትሄዎች",
    subtitle: "Custom engineering, responsive UX & AI automation capabilities",
    subtitleAm: "የድር ጣቢያ ልማት፣ የሞባይል ተስማሚ ዲዛይን እና የኤአይ ስራዎች",
  },
  jobs: {
    title: "Find Jobs & Vacancies",
    titleAm: "ስራዎችን ፈልግ እና ክፍት የስራ መደቦች",
    subtitle: "Discover your next career role with multi-sector filters and instant applications",
    subtitleAm: "በዘርፍ፣ በደመወዝ፣ በልምድ ደረጃ እና በስራ ሁኔታ የተጣሩ ክፍት የስራ እድሎች",
  },
  prompts: {
    title: "Prompt Studio & Templates",
    titleAm: "የፕሮምፕት ማመንጫ እና ቅጾች",
    subtitle: "Ready-to-use production prompts to generate responsive applications",
    subtitleAm: "ተመሳሳይ መተግበሪያዎችን ለመገንባት የሚያግዙ ዝግጁ የፕሮምፕት ቅጾች",
  },
  contact: {
    title: "Contact & Collaboration",
    titleAm: "አግኙኝ እና የስራ ግንኙነት",
    subtitle: "Let’s discuss your next ambitious product or project",
    subtitleAm: "ስለ አዳዲስ ስራዎች ወይም ፕሮጀክቶች አብረን እንወያይ",
  },
};

const metricCards = [
  { label: "3+ Years Experience", value: "6+", icon: BriefcaseBusiness },
  { label: "15+ Production Apps/APIs", value: "15+", icon: Rocket },
  { label: "MySQL & Node Core", value: "Core", icon: Database },
  { label: "Open to Roles", value: "Yes", icon: Gauge },
];

const competencyCards = [
  {
    title: "Frontend UI Engineering",
    description:
      "Responsive React interfaces, polished components, and modern design systems using Tailwind CSS and clean UX patterns.",
    icon: Code2,
    accent: "from-indigo-500/20 to-blue-500/10",
  },
  {
    title: "Backend APIs",
    description:
      "Fast, secure Node.js and Express APIs with validation, routing, authentication, and clean service architecture.",
    icon: ShieldCheck,
    accent: "from-violet-500/20 to-fuchsia-500/10",
  },
  {
    title: "Database Architecture",
    description:
      "MySQL schema design, relational modeling, query optimization, and efficient CRUD workflows built for scale.",
    icon: Database,
    accent: "from-emerald-500/20 to-cyan-500/10",
  },
];

export default function Header({
  currentSection,
  onSelectSection,
  lang,
  onToggleLang,
  accent,
  onOpenMobileMenu,
  onOpenResumeModal,
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/90 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="ml-[-4px] rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function OverviewView({ onNavigate }) {
  const handleProjects = () => {
    if (onNavigate) onNavigate("projects");
  };

  const handleContact = () => {
    if (onNavigate) onNavigate("contact");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/60">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.75fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                Overview
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  About Me & Professional Summary
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  I build scalable web applications with React, Node.js,
                  Express, and MySQL, combining strong product thinking with
                  clean engineering practices. My focus is on building reliable
                  digital experiences that are easy to maintain and a pleasure to
                  use.
                </p>

                <p className="max-w-2xl text-base leading-7 text-slate-400">
                  From database modeling to frontend polish, I enjoy solving real
                  business problems through efficient architecture, thoughtful UI,
                  and maintainable code that teams can trust.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleProjects}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  Explore Projects
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleContact}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600"
                >
                  <Mail className="h-4 w-4" />
                  Get in Touch
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Current Focus
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Building product-ready systems
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  "Full stack product engineering",
                  "API-first backend architecture",
                  "Clean SQL data modeling",
                  "Responsive React product experiences",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Availability
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Open to full stack, backend, and product engineering
                  opportunities where quality and delivery matter.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-indigo-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="mt-2 text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Core Competencies
            </p>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {competencyCards.map(({ title, description, icon: Icon, accent }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
