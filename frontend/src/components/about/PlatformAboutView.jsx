import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LineChart, Sparkles } from "lucide-react";
import api from "../../services/api";
import heroImageStart from "../../pages/images/peoples.jpg";
import heroImageOne from "../../pages/images/logo.jpg";
import heroImageTwo from "../../pages/images/images.jpg";
import heroImageThree from "../../pages/images/images (3).jpg";
import employerImage from "../../pages/images/about3.jpg";
import seekerImage from "../../pages/images/seeker.jpg";

const workflow = [
  ["Create Profile", "Build a clear profile with your background, goals, and career preferences.", "register"],
  ["Add Skills & Experience", "Add skills, projects, education, experience, and your CV.", "create-profile"],
  ["Browse / Create Jobs", "Job seekers explore opportunities while employers publish relevant roles.", "jobs"],
  ["AI Analyzes Profiles & Jobs", "The system compares candidate signals with job requirements.", "matches"],
  ["Generate Match Score", "A transparent score explains how closely the profile fits the role.", "scores"],
  ["Recommend Best-Matching Jobs", "Personalized recommendations bring the most relevant opportunities forward.", "matches"],
];

const technology = [
  ["Skill Analysis", "Compares job seeker skills with the required skills for each job.", "skills"],
  ["Experience Analysis", "Reviews work experience and compares it with the role requirements.", "experience"],
  ["Education Analysis", "Checks education and qualification requirements against the job.", "create-profile"],
  ["Profile Matching", "Combines profile signals to identify the strongest overall fit.", "matches"],
];

const seekerBenefits = ["Find relevant jobs faster", "Receive personalized job recommendations", "Understand why a job matches", "Identify missing skills", "Reduce time spent searching", "Discover opportunities based on your profile"];
const employerBenefits = ["Find qualified candidates", "Reduce manual candidate screening", "Compare candidate qualifications", "Identify candidates based on job requirements", "Improve recruitment efficiency"];
const heroImages = [heroImageStart, heroImageOne, heroImageTwo, heroImageThree];

const SectionTitle = ({ eyebrow, title, description }) => (
  <div className="max-w-3xl">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
    {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
  </div>
);

export default function PlatformAboutView({ onNavigate }) {
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [aboutContent, setAboutContent] = useState(null);
  const [aboutError, setAboutError] = useState("");

  useEffect(() => {
    let isActive = true;

    api.get("/about")
      .then(({ data }) => {
        if (isActive) setAboutContent(data.about);
      })
      .catch(() => {
        if (isActive) setAboutError("About content is unavailable right now.");
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveHeroImage((currentImage) => (currentImage + 1) % heroImages.length);
    }, 4500);

    return () => window.clearInterval(rotation);
  }, []);

  if (aboutError) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{aboutError}</p>;
  }

  if (!aboutContent) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading About content...</div>;
  }

  return (
    <section className="space-y-8 pb-8">
      <header className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 shadow-sm">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700"><Sparkles className="h-4 w-4" /> About AI-powered job matching</div>
            <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">{aboutContent.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{aboutContent.description}</p>
            <button type="button" onClick={() => onNavigate?.("jobs")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Explore opportunities <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="relative min-h-64 overflow-hidden lg:min-h-[390px]">
            {heroImages.map((image, index) => <img key={image} src={image} alt="Professionals connecting around a career opportunity" className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${index === activeHeroImage ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />)}
          </div>
        </div>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <SectionTitle eyebrow="What is AI job matching?" title="The right profile, matched to the right opportunity" description="AI job matching uses artificial intelligence to compare a job seeker's profile with job requirements and identify opportunities that best match their qualifications." />
        <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-blue-50 p-5"><p className="font-black text-slate-900">Job seeker signals</p><p className="mt-2 text-sm leading-7 text-slate-600">Skills, experience, education, projects, and career preferences.</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-slate-900">Job requirements</p><p className="mt-2 text-sm leading-7 text-slate-600">Required skills, experience, education, and job description.</p></div></div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionTitle eyebrow="How it works" title="From profile to opportunity" description="A clear workflow turns profile information into useful, explainable recommendations." /><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{workflow.map(([title, description, target]) => <button key={title} type="button" onClick={() => onNavigate?.(target)} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></button>)}<div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:col-span-2 lg:col-span-3"><img src={heroImageThree} alt="Professionals collaborating around a job opportunity" className="aspect-[3/1] w-full object-contain" /></div></div></article>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionTitle eyebrow="AI matching technology" title="Analysis that goes beyond keywords" /><div className="mt-6 grid gap-3 sm:grid-cols-2">{technology.map(([title, description, target]) => <button key={title} type="button" onClick={() => onNavigate?.(target)} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></button>)}</div></article><article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm sm:p-8"><div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center"><div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700"><LineChart className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Match score</p><h2 className="mt-1 text-2xl font-black text-slate-950">Frontend Developer</h2></div></div><p className="mt-6 text-5xl font-black text-blue-700">92%</p><p className="mt-2 text-sm leading-6 text-slate-600">The score shows how closely a profile aligns with a specific job.</p></div><div className="flex h-48 items-end justify-around gap-3 rounded-2xl border border-blue-100 bg-white/70 px-3 pb-3 pt-5" aria-label="Match score breakdown chart">{[["Skills", 40, "bg-blue-600"], ["Experience", 30, "bg-cyan-500"], ["Education", 15, "bg-emerald-500"], ["Other", 7, "bg-amber-500"]].map(([label, value, color]) => <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-black text-slate-700">{value}%</span><div className={`w-full max-w-10 rounded-t-lg ${color}`} style={{ height: `${value * 3}px` }} /><span className="text-center text-[10px] font-bold leading-3 text-slate-500">{label}</span></div>)}</div></div><div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-blue-100 pt-4 text-sm sm:grid-cols-4">{[["Skills", "40%"], ["Experience", "30%"], ["Education", "15%"], ["Other factors", "7%"]].map(([label, value]) => <div key={label} className="flex justify-between gap-2"><span className="font-semibold text-slate-700">{label}</span><span className="font-black text-blue-700">{value}</span></div>)}</div></article></div>

      <div className="grid gap-8 lg:grid-cols-2"><article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={seekerImage} alt="Job seeker working on a laptop" className="h-auto w-full shrink-0 object-contain" /><div className="p-6 sm:p-8"><SectionTitle eyebrow="For job seekers" title="Search with more confidence" /><ul className="mt-5 space-y-3">{seekerBenefits.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{item}</li>)}</ul></div></article><article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="order-1 p-6 sm:p-8"><SectionTitle eyebrow="For employers" title="Find qualified talent faster" /><ul className="mt-5 space-y-3">{employerBenefits.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{item}</li>)}</ul></div><div className="about-employer-reveal order-2"><div className="about-employer-float flex h-full items-center justify-center"><img src={employerImage} alt="Professionals connecting with an employer" className="about-employer-image h-auto max-h-96 w-full rounded-2xl object-contain" /></div></div></article></div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionTitle eyebrow="Personalized recommendations" title="Recommended for you" description="The platform recommends multiple relevant jobs based on profile information, not just one search result." /><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Frontend Developer", "92%"], ["Full Stack Developer", "85%"], ["Backend Developer", "72%"]].map(([title, score]) => <div key={title} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-bold text-slate-800">{title}</span><span className="text-sm font-black text-emerald-600">{score}</span></div>)}</div></article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><SectionTitle eyebrow="Skill & experience analysis" title="A profile that explains your strengths" description="AI uses structured profile information to compare your abilities with job requirements." /><div className="mt-6 grid gap-6 md:grid-cols-2"><div><p className="font-black text-slate-900">Your skills</p><div className="mt-3 flex flex-wrap gap-2">{["React", "JavaScript", "Node.js", "MySQL"].map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">✓ {item}</span>)}</div></div><div><p className="font-black text-slate-900">Your experience</p><div className="mt-3 flex flex-wrap gap-2">{["Frontend Development", "Backend Development"].map((item) => <span key={item} className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">✓ {item}</span>)}</div></div></div></article>

      <div className="grid gap-8 md:grid-cols-2"><article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm sm:p-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Our mission</p><p className="mt-3 text-sm leading-7 text-slate-600">{aboutContent.mission}</p></article><article className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-sm sm:p-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Our vision</p><p className="mt-3 text-sm leading-7 text-slate-600">{aboutContent.vision}</p></article></div>
    </section>
  );
}
