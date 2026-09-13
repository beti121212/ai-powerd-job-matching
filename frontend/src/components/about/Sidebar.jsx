import {
  BriefcaseBusiness,
  Briefcase,
  Code2,
  ContactRound,
  FolderKanban,
  Layers3,
  MessageSquareText,
  Sparkles,
  Target,
  BarChart3,
  FileText,
  UserRound,
} from "lucide-react";

const defaultNavItems = [
  { id: "overview", label: "Overview" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
  { id: "jobs", label: "Jobs" },
  { id: "about", label: "About" },
  { id: "prompts", label: "Prompt Studio" },
  { id: "about", label: "About" },
];

export default function Sidebar({
  navItems = defaultNavItems,
  currentSection = "overview",
  setCurrentSection,
  language = "en",
  sidebarOpen = true,
  onCloseSidebar = () => {},
  profile = {
    name: "Amanuel D.",
    role: "Product Engineer",
    roleAm: "ፕሮዱክት መሐንዲስ",
    available: "Open to roles",
  },
}) {
  const iconMap = {
    overview: Sparkles,
    experience: BriefcaseBusiness,
    skills: Code2,
    projects: FolderKanban,
    services: Layers3,
    jobs: Briefcase,
    about: Sparkles,
    matches: Target,
    scores: BarChart3,
    applications: FileText,
    profile: UserRound,
    prompts: MessageSquareText,
    contact: ContactRound,
  };

  return (
    <aside
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        sidebarOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="p-4">
        <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-sm">
            AD
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{profile.name}</p>
            <p className="truncate text-xs text-slate-500">
              {language === "am" ? profile.roleAm : profile.role}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">
            {profile.available}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.id] || Sparkles;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentSection?.(item.id);
                  onCloseSidebar();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "border border-slate-200 bg-slate-100 text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-slate-900" : "text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
