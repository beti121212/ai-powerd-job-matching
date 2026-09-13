import { BrainCircuit, BriefcaseBusiness, CheckCircle2, Database, FileSearch, Gauge, Network, ShieldCheck, Target } from "lucide-react";

const categories = [
  { title: "AI & Machine Learning", icon: BrainCircuit, tone: "blue", skills: ["Artificial Intelligence", "Machine Learning", "NLP / Text Analysis", "Recommendation Systems", "Match Scoring"] },
  { title: "Web Development", icon: Network, tone: "indigo", skills: ["React.js", "Node.js", "Express.js", "JavaScript", "REST APIs"] },
  { title: "Database & Data", icon: Database, tone: "emerald", skills: ["MySQL / MariaDB", "Database Management", "Data Analysis", "User & Job Data Processing"] },
  { title: "Resume & Profile Analysis", icon: FileSearch, tone: "violet", skills: ["CV Parsing", "Skills Extraction", "Experience Analysis", "Qualification Matching"] },
  { title: "Job Matching Capabilities", icon: Target, tone: "amber", skills: ["Skills Matching", "Experience Matching", "Education Matching", "Job Preference Matching", "AI Match Score"] },
  { title: "Platform Management", icon: ShieldCheck, tone: "cyan", skills: ["Job Seeker Management", "Employer Management", "Job Management", "Application Tracking", "Interview Management"] },
];

const tones = { blue: "border-blue-100 bg-blue-50 text-blue-700", indigo: "border-indigo-100 bg-indigo-50 text-indigo-700", emerald: "border-emerald-100 bg-emerald-50 text-emerald-700", violet: "border-violet-100 bg-violet-50 text-violet-700", amber: "border-amber-100 bg-amber-50 text-amber-700", cyan: "border-cyan-100 bg-cyan-50 text-cyan-700" };

export default function SkillsView() {
  return <section className="space-y-8"><header className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><Gauge className="h-3.5 w-3.5" /> Our Skills</span><h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Technologies and capabilities powering smart job matching.</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">The technical foundation behind CV analysis, intelligent recommendations, match scoring, and connected recruitment workflows.</p></header><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{categories.map(({ title, icon: Icon, tone, skills }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${tones[tone]}`}><Icon className="h-6 w-6" /></div><h2 className="mt-5 text-xl font-black text-slate-900">{title}</h2><div className="mt-5 space-y-3">{skills.map((skill) => <div key={skill} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700"><CheckIcon tone={tone} />{skill}</div>)}</div></article>)}</div><footer className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><BriefcaseBusiness className="mt-0.5 h-5 w-5 text-blue-600" /><div><h2 className="font-black text-slate-900">Skills that power the full hiring journey</h2><p className="mt-1 text-sm leading-6 text-slate-600">These technologies and capabilities work together to connect candidates with better opportunities and help employers make informed decisions.</p></div></div></footer></section>;
}

function CheckIcon({ tone }) {
  return <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}><CheckCircle2 className="h-3 w-3" /></span>;
}
