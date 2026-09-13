import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import HeroSection from '../../components/home/HeroSection';
import TrustedBy from '../../components/home/TrustedBy';

const sectionNavItems = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'AI Matching', id: 'ai-matching' },
  { label: 'Find Jobs', id: 'find-jobs' },
  { label: 'For Job Seekers', id: 'for-job-seekers' },
  { label: 'For Employers', id: 'for-employers' },
  { label: 'Why Choose Us', id: 'why-choose-us' },
];

const howItWorks = [
  { title: 'Create Account', text: 'Set up your talent or company profile in minutes.' },
  { title: 'Complete Profile', text: 'Add the skills, experience, or roles that matter to you.' },
  { title: 'AI Matching', text: 'Our matching engine compares fit across the right signals.' },
  { title: 'Apply / Hire', text: 'Take the next step with more context and less friction.' },
];

const aiFeatures = [
  ['Semantic Skill Extraction', 'Analyzes real demonstrated expertise rather than relying on exact keyword phrasing.'],
  ['Explainable Match Scoring', 'Delivers transparent compatibility scores breaking down skills, seniority, and preferences.'],
  ['Automated Requirements Mapping', 'Maps candidate depth directly against nuanced employer job requirements in real-time.'],
];

const seekerBenefits = [
  ['Upload CV & Build Profile', 'Upload your resume and turn your experience into a clear, searchable profile in seconds.'],
  ['AI CV Analysis & Optimization', 'Get actionable insights to highlight your strongest capabilities for relevant roles.'],
  ['Personalized Job Matches', 'Discover vetted opportunities precisely selected around your skills and preferences.'],
  ['One-Click Easy Apply', 'Apply seamlessly to top companies with complete profile context and zero friction.'],
  ['Unified Application Tracking', 'Monitor your application progress, interview stages, and feedback all in one place.'],
];
const employerPipeline = [
  ['Post Jobs', 'Publish roles in minutes with AI-assisted requirements and candidate criteria.'],
  ['AI Candidate Matching & Ranking', 'Instantly surface verified talent ranked by actual skill proficiency.'],
  ['Application Management & Shortlisting', 'Review curated applicant pools and shortlist top contenders collaboratively.'],
  ['Interview & Hiring Decisions', 'Schedule interviews, share evaluations, and make confident hires.'],
];
const trustPoints = [
  ['AI-Powered Matching', 'Find stronger fit with intelligent skill and requirement analysis that cuts through keyword noise.'],
  ['Faster Hiring & Screening', 'Reduce screening time drastically and move qualified candidates forward sooner.'],
  ['Verified Companies & Roles', 'Explore vetted opportunities from trusted organizations building with confidence.'],
  ['Secure & Frictionless Workflow', 'Your data and application journey remain fully protected at every single step.'],
];

const fallbackJobs = [
  { id: 'featured-full-stack-engineer', title: 'Senior Full Stack Software Engineer', company: 'EthioFinTech Labs', location: 'Addis Ababa', type: 'Full-time', workplace: 'Hybrid' },
  { id: 'featured-ai-research-engineer', title: 'AI / LLM Research Engineer', company: 'Technology Company', location: 'Remote', type: 'Full-time', workplace: 'Remote' },
  { id: 'featured-react-developer', title: 'Frontend React Developer', company: 'Growing Tech Team', location: 'Addis Ababa', type: 'Contract', workplace: 'On-site' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [category, setCategory] = useState('');
  const [searchError, setSearchError] = useState('');
  const [publishedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('employerJobs') || '[]');
    } catch {
      return [];
    }
  });
  const allJobs = publishedJobs.length ? publishedJobs : fallbackJobs;
  const [visibleJobs, setVisibleJobs] = useState(allJobs);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeSection, setActiveSection] = useState('how-it-works');

  useEffect(() => {
    const sections = sectionNavItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      {
        rootMargin: '-18% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    setActiveSection(id);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `#${id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({ search: searchTitle, category }).toString();
    navigate(`/jobs?${query}`);
  };

  const handleExploreSearch = (e) => {
    e.preventDefault();
    const query = searchTitle.trim();

    if (!query) {
      setSearchError('Please enter a job title or skill to search.');
      return;
    }

    setSearchError('');
    const normalizedQuery = query.toLowerCase().trim();
    const matches = allJobs.filter((job) => {
      const company = typeof job.company === 'string' ? job.company : job.company?.name;
      const skills = Array.isArray(job.skills) ? job.skills : [];
      const tags = Array.isArray(job.tags) ? job.tags : [];
      const fields = [job.title, company, job.category, job.sector, ...skills, ...tags];
      return fields.some((field) => String(field || '').toLowerCase().trim().includes(normalizedQuery));
    });

    setActiveQuery(query);
    setVisibleJobs(matches);
    const exactMatch = matches.find((job) => {
      const company = typeof job.company === 'string' ? job.company : job.company?.name;
      return [job.title, company].some((field) => String(field || '').toLowerCase().trim() === normalizedQuery);
    });
    if (exactMatch?.id) {
      navigate(`/jobs/${exactMatch.id}`, { state: { job: exactMatch } });
      return;
    }
    document.getElementById('explore-job-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearExploreSearch = () => {
    setSearchTitle('');
    setSearchError('');
    setActiveQuery('');
    setVisibleJobs(allJobs);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <HeroSection
        searchTitle={searchTitle}
        setSearchTitle={setSearchTitle}
        category={category}
        setCategory={setCategory}
        handleSearch={handleSearch}
      />
      <TrustedBy />
      <section id="how-it-works" className="scroll-mt-20 w-full bg-slate-100 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[1550px] px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-2 inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 shadow-sm">
              HOW IT WORKS
            </div>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">
              A clearer path from profile to opportunity
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mb-12 sm:text-base">
              One focused workflow for people looking for their next role and teams ready to hire.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-4 lg:gap-8 xl:gap-10">
            {howItWorks.map(({ title, text }, index) => (
              <div
                key={title}
                className="card-floating group relative flex min-h-[240px] flex-col justify-between text-left sm:min-h-[260px] lg:min-h-[350px] xl:min-h-[360px]"
              >
                <div className="flex items-start justify-end">
                  <span className="text-sm font-extrabold text-slate-400 sm:text-base">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-2xl xl:text-3xl">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai-matching" className="scroll-mt-20 w-full bg-white py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1550px] px-6 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600">AI JOB MATCHING</p>
            <h2 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">The right signal, at the right moment</h2>
            <p className="mx-auto mb-16 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Go beyond keyword searches. Our platform brings candidate strengths and job requirements into one useful view.
            </p>
          </div>

          <div className="mx-auto grid max-w-[1550px] grid-cols-1 gap-8 px-0 md:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map(([title, text], index) => (
              <article key={title} className="group rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-8 transition-all duration-300 hover:bg-slate-50">
                <span className="text-xs font-bold text-emerald-600">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mb-2 mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="explore-jobs" className="scroll-mt-20 w-full border-b border-slate-200/80 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-[1550px] px-6 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">EXPLORE JOBS</p>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">Opportunities worth opening</h2>
            <p className="mx-auto mb-10 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mb-12 sm:text-base">Search the details that shape your next move, then open the roles that feel like a real fit.</p>
          </div>

          <form onSubmit={handleExploreSearch} className="mx-auto mb-16 mt-10 flex max-w-5xl flex-col items-stretch gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl sm:rounded-full sm:p-3 md:flex-row md:items-center">
            <div className="flex min-w-0 w-full flex-1 flex-col">
              <label className="block w-full rounded-xl px-3 py-2.5 sm:rounded-full">
              <span className="sr-only">Search jobs</span>
              <input value={searchTitle} onChange={(e) => { setSearchTitle(e.target.value); if (searchError) setSearchError(''); }} placeholder="Search job title, skill, or keyword..." className={`min-w-0 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 ${searchError ? 'rounded-md ring-1 ring-red-400' : ''}`} />
              </label>
              {searchError && <p className="px-3 text-sm font-medium text-red-500">{searchError}</p>}
            </div>
            <button type="submit" className="flex w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-indigo-700 sm:w-auto sm:rounded-full">
              Search Jobs
            </button>
          </form>

          {activeQuery && <div id="explore-job-results" className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-sm shadow-sm sm:flex-row sm:items-center"><p className="font-bold text-slate-700">Showing results for: <span className="text-slate-900">'{activeQuery}'</span> ({visibleJobs.length} {visibleJobs.length === 1 ? 'job' : 'jobs'} found)</p><button type="button" onClick={clearExploreSearch} className="font-extrabold text-[var(--brand-deep)] underline-offset-4 hover:underline">Clear Search</button></div>}

          {activeQuery && visibleJobs.length === 0 ? (
            <div id="explore-job-results" className="rounded-[26px] border border-slate-200/90 bg-white p-10 text-center shadow-[0_16px_36px_-10px_rgba(0,0,0,0.12),0_6px_16px_-4px_rgba(0,0,0,0.06)] sm:p-14">
              <h3 className="text-2xl font-black text-slate-900">No jobs found matching '{activeQuery}'.</h3>
              <button type="button" onClick={() => navigate('/jobs')} className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700">View All Jobs</button>
            </div>
          ) : <div id="explore-job-results" className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleJobs.map((job, index) => (
              <article key={job.id || `${job.title}-${index}`} className="card-floating flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-end gap-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">{job.workplace || job.work_mode || 'Hybrid'}</span>
                  </div>
                  <h3 className="mb-2 mt-7 text-xl font-extrabold text-slate-900">{job.title}</h3>
                  <p className="font-bold text-slate-600">{typeof job.company === 'string' ? job.company : job.company?.name || 'Verified company'}</p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span>{job.location || job.locationValue || 'Flexible location'}</span>
                    {job.salary && <span className="font-bold text-slate-700">{job.salary}</span>}
                  </div>
                </div>
                <Link to={`/jobs/${job.id}`} state={{ job }} className="mt-8 inline-flex w-full items-center justify-center border-t border-slate-100 pt-5 text-sm font-extrabold text-[var(--brand-deep)] transition hover:text-slate-900">View Details</Link>
              </article>
            ))}
          </div>}
        </div>
      </section>

      <section id="for-job-seekers" className="scroll-mt-20 w-full border-b border-slate-200/80 bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-[1550px] grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-14">
          <div className="lg:col-span-5">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-blue-600">FOR JOB SEEKERS</p>
            <h2 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">Make your next application count</h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">Build a stronger profile, understand your fit, and keep every application moving forward from one unified workspace.</p>
            <Link to="/find-jobs" className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 sm:w-auto">Find Jobs</Link>
          </div>
          <div className="relative lg:col-span-7">
            <div className="absolute bottom-8 left-4 top-8 w-px bg-blue-200 sm:left-6" aria-hidden="true" />
            <div className="space-y-4">
              {seekerBenefits.map(([title, description], index) => (
                <div key={title} className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-6 pl-14 transition-all duration-300 hover:border-blue-500/40 hover:bg-white hover:shadow-md sm:p-7 sm:pl-16">
                  <span className="absolute left-3 top-7 text-xs font-bold text-blue-600 sm:left-5">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="for-employers" className="scroll-mt-20 w-full border-b border-slate-200/80 bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-[1550px] grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-14">
          <div className="lg:col-span-5">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-blue-600">FOR EMPLOYERS</p>
            <h2 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">Hire with a sharper view of talent</h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">Bring your role, candidates, and hiring decisions into a workspace designed for momentum.</p>
            <Link to="/employer/post-job" className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 sm:w-auto">Post a Job</Link>
          </div>
          <div className="relative lg:col-span-7">
            <div className="absolute bottom-8 left-4 top-8 w-px bg-blue-200 sm:left-6" aria-hidden="true" />
            <div className="space-y-4">
              {employerPipeline.map(([title, description], index) => (
                <div key={title} className="relative ml-0 rounded-2xl border border-slate-200/70 bg-white/80 p-6 pl-14 transition-all duration-300 hover:border-blue-500/40 hover:bg-white hover:shadow-lg sm:pl-16">
                  <span className="absolute left-3 top-6 text-xs font-bold text-blue-600 sm:left-5">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose-us" className="scroll-mt-20 w-full bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto grid w-full max-w-[1550px] grid-cols-1 items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:px-14">
          <div className="lg:col-span-5">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-blue-600">WHY CHOOSE OUR PLATFORM</p>
            <h2 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-3xl lg:text-4xl xl:text-[40px]">Less noise. Better next steps.</h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">A professional hiring experience built around clarity, relevance, and trust for both sides of the market.</p>
            <Link to="/register" className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-700 sm:w-auto">Experience the Difference</Link>
          </div>
          <div className="relative lg:col-span-7">
            <div className="absolute bottom-8 left-4 top-8 w-px bg-blue-200 sm:left-6" aria-hidden="true" />
            <div className="space-y-4">
              {trustPoints.map(([title, text], index) => (
                <div key={title} className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-6 pl-14 transition-all duration-300 hover:border-blue-500/40 hover:bg-white hover:shadow-md sm:p-7 sm:pl-16">
                  <span className="absolute left-3 top-7 text-xs font-bold text-blue-600 sm:left-5">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}