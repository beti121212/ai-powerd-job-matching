import { useEffect, useMemo, useState } from 'react';
import { Search, Star, UserRound, FileText, UserPlus } from 'lucide-react';
import api from '../../services/api';

const departmentCatalog = [
  'Software & IT / Technology',
  'Finance, Accounting & Banking',
  'Sales, Marketing & PR',
  'Human Resources & Admin',
  'Engineering & Construction',
  'Healthcare & Pharmaceuticals',
  'Customer Support & Operations',
];

const skillCatalog = [
  'React',
  'Python',
  'Node.js',
  'SQL',
  'Accounting / IFRS',
  'Financial Modeling',
  'Digital Marketing',
  'Project Management',
  'Graphic Design',
  'UI/UX Design',
  'Communication',
  'JavaScript',
  'TypeScript',
  'Figma',
  'Power BI',
  'AWS',
  'REST APIs',
  'Leadership',
  'Customer Service',
];

const experienceOptions = [
  { value: 'All', label: 'All Experience' },
  { value: 'entry', label: 'Entry Level / Fresh Graduate (0 - 1 Year)' },
  { value: 'junior', label: 'Junior (1 - 3 Years)' },
  { value: 'mid', label: 'Mid-Level (3 - 5 Years)' },
  { value: 'senior', label: 'Senior (5 - 8 Years)' },
  { value: 'lead', label: 'Lead / Manager (8+ Years)' },
];

const normalizeText = (value) => String(value || '').toLowerCase().trim();

const toSkillList = (value) => {
  if (Array.isArray(value)) return value.map((skill) => String(skill).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[|,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const normalizeDepartment = (candidate = {}) => {
  const haystack = [candidate.preferredDepartment, candidate.department, candidate.industry, candidate.headline, candidate.fullName, candidate.role].join(' ').toLowerCase();

  if (/software|technology|it|developer|engineer|frontend|backend|full stack|data analyst|ai|product|design|ux|qa|devops|cloud|digital/.test(haystack)) return 'Software & IT / Technology';
  if (/finance|account|bank|audit|tax|treasury|risk|credit|financial/.test(haystack)) return 'Finance, Accounting & Banking';
  if (/sales|marketing|brand|digital marketing|pr|public relations|media|communication/.test(haystack)) return 'Sales, Marketing & PR';
  if (/hr|human resources|admin|office|operations|recruit|personnel/.test(haystack)) return 'Human Resources & Admin';
  if (/construction|civil|mechanical|electrical|architect|engineering/.test(haystack)) return 'Engineering & Construction';
  if (/health|medical|pharma|pharmacy|nurse|clinic|care/.test(haystack)) return 'Healthcare & Pharmaceuticals';
  if (/customer|support|call center|operations|service/.test(haystack)) return 'Customer Support & Operations';

  return candidate.preferredDepartment || candidate.department || 'Software & IT / Technology';
};

const getExperienceBucket = (years) => {
  const value = Number(years || 0);
  if (value <= 1) return 'entry';
  if (value <= 3) return 'junior';
  if (value <= 5) return 'mid';
  if (value <= 8) return 'senior';
  return 'lead';
};

const formatExperienceLabel = (years) => {
  const safeYears = Number(years || 0);
  if (safeYears <= 1) return 'Entry Level / Fresh Graduate';
  if (safeYears <= 3) return 'Junior';
  if (safeYears <= 5) return 'Mid-Level';
  if (safeYears <= 8) return 'Senior';
  return 'Lead / Manager';
};

export default function TalentPool() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [experience, setExperience] = useState('All');
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadPool = async () => {
      try {
        const [{ data: poolData }, { data: jobsData }] = await Promise.all([
          api.get('/employer/talent-pool'),
          api.get('/employer/jobs'),
        ]);

        const items = (poolData?.candidates || poolData || []).map((candidate) => {
          const rawSkills = toSkillList(candidate.keySkills || candidate.skills || candidate.skillSet || candidate.tags || []);
          const experienceYears = Number(candidate.experienceYears ?? candidate.experience ?? candidate.totalExperience ?? 0);
          const normalizedDepartment = normalizeDepartment({ ...candidate, preferredDepartment: candidate.preferredDepartment || candidate.department || candidate.industry || candidate.headline });

          return {
            ...candidate,
            fullName: candidate.fullName || candidate.name || 'Candidate',
            email: candidate.email || '',
            headline: candidate.headline || candidate.role || candidate.currentTitle || candidate.preferredDepartment || 'Candidate',
            preferredDepartment: normalizedDepartment,
            preferredJobType: candidate.preferredJobType || candidate.jobType || 'full-time',
            keySkills: rawSkills.length ? rawSkills : ['Communication', 'Project Management'],
            experienceYears: Number.isFinite(experienceYears) && experienceYears >= 0 ? experienceYears : 0,
            experience: candidate.experience || formatExperienceLabel(experienceYears),
            aiMatchScore: Number(candidate.aiMatchScore ?? candidate.matchScore ?? 0),
            resumeText: candidate.resumeText || candidate.coverNote || candidate.summary || '',
            coverNote: candidate.coverNote || candidate.summary || candidate.headline || 'No cover note provided yet.',
          };
        });

        setCandidates(items);
        setJobs((jobsData?.jobs || jobsData || []).filter((job) => (job.status || '').toLowerCase() === 'published'));
      } catch {
        const seededCandidates = [
          { id: 1, fullName: 'Eyerus Shibabaw', email: 'shibabaweyerus@gmail.com', preferredDepartment: 'Software & IT / Technology', preferredJobType: 'full-time', keySkills: ['React', 'Node.js', 'SQL', 'JavaScript'], experienceYears: 4, headline: 'Software Engineer', coverNote: 'Strong frontend and backend delivery with product mindset.', resumeText: 'React Node.js SQL JavaScript backend API design', aiMatchScore: 94 },
          { id: 2, fullName: 'Selam Bekele', email: 'selam.bekele@gmail.com', preferredDepartment: 'Finance, Accounting & Banking', preferredJobType: 'full-time', keySkills: ['Accounting / IFRS', 'Financial Modeling', 'SQL'], experienceYears: 3, headline: 'Accountant', coverNote: 'Experienced in financial reporting, controls, and closing processes.', resumeText: 'Accounting IFRS financial modeling reconciliation reporting', aiMatchScore: 90 },
          { id: 3, fullName: 'Netsanet Fikadu', email: 'netsanet.fikadu@gmail.com', preferredDepartment: 'Sales, Marketing & PR', preferredJobType: 'full-time', keySkills: ['Digital Marketing', 'Communication', 'Project Management'], experienceYears: 2, headline: 'Marketing Specialist', coverNote: 'Campaign planning, performance marketing, and customer acquisition.', resumeText: 'Digital marketing campaign strategy communication', aiMatchScore: 87 },
          { id: 4, fullName: 'Mikiyas Tesfaye', email: 'mikiyas.tesfaye@gmail.com', preferredDepartment: 'Human Resources & Admin', preferredJobType: 'full-time', keySkills: ['Project Management', 'Communication', 'Leadership'], experienceYears: 5, headline: 'HR Generalist', coverNote: 'Supports recruitment operations and employee engagement programs.', resumeText: 'HR admin recruitment onboarding employee relations', aiMatchScore: 88 },
          { id: 5, fullName: 'Dawit Alemu', email: 'dawit.alemu@gmail.com', preferredDepartment: 'Engineering & Construction', preferredJobType: 'full-time', keySkills: ['Project Management', 'AutoCAD', 'Leadership'], experienceYears: 8, headline: 'Site Engineer', coverNote: 'Manages construction schedules, QA, and contractor coordination.', resumeText: 'construction project management site engineering budget control', aiMatchScore: 82 },
          { id: 6, fullName: 'Hana Solomon', email: 'hana.solomon@gmail.com', preferredDepartment: 'Healthcare & Pharmaceuticals', preferredJobType: 'part-time', keySkills: ['Communication', 'Healthcare', 'Project Management'], experienceYears: 1, headline: 'Pharmaceutical Sales Representative', coverNote: 'Customer-facing sales support for healthcare and pharmacy channels.', resumeText: 'pharmacy sales healthcare customer relationship', aiMatchScore: 80 },
          { id: 7, fullName: 'Biruktawit Daniel', email: 'biruktawit.daniel@gmail.com', preferredDepartment: 'Customer Support & Operations', preferredJobType: 'full-time', keySkills: ['Customer Service', 'Communication', 'SQL'], experienceYears: 3, headline: 'Customer Success Associate', coverNote: 'Leads service escalations, retention, and process documentation.', resumeText: 'customer support operations service management retention', aiMatchScore: 85 },
          { id: 8, fullName: 'Ephrem Getahun', email: 'ephrem.getahun@gmail.com', preferredDepartment: 'Software & IT / Technology', preferredJobType: 'full-time', keySkills: ['Python', 'SQL', 'REST APIs', 'AWS'], experienceYears: 6, headline: 'Backend Engineer', coverNote: 'Builds scalable APIs and data workflows for product teams.', resumeText: 'Python SQL APIs AWS backend engineering scale', aiMatchScore: 92 },
        ];

        setCandidates(seededCandidates);
        setJobs([]);
      }
    };

    loadPool();
  }, []);

  const departmentOptions = useMemo(() => {
    const options = new Set(['All']);
    candidates.forEach((candidate) => {
      const value = normalizeDepartment(candidate);
      if (value) options.add(value);
    });
    return ['All', ...Array.from(options).filter((option) => option !== 'All')];
  }, [candidates]);

  const skillOptions = useMemo(() => {
    const options = new Set(['All']);
    candidates.forEach((candidate) => {
      (candidate.keySkills || []).forEach((skill) => options.add(skill));
    });
    return ['All', ...Array.from(options).filter((option) => option !== 'All')];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchTerm = normalizeText(search);
      const searchFields = [
        candidate.fullName,
        candidate.email,
        candidate.headline,
        candidate.preferredDepartment,
        candidate.coverNote,
        candidate.resumeText,
        (candidate.keySkills || []).join(' '),
      ].join(' ');

      const matchesSearch = !searchTerm || normalizeText(searchFields).includes(searchTerm);
      const matchesDepartment = department === 'All' || candidate.preferredDepartment === department;
      const matchesSkill = skillFilter === 'All' || (candidate.keySkills || []).includes(skillFilter);
      const candidateBucket = getExperienceBucket(candidate.experienceYears);
      const matchesExperience = experience === 'All' || candidateBucket === experience;

      return matchesSearch && matchesDepartment && matchesSkill && matchesExperience;
    });
  }, [candidates, search, department, skillFilter, experience]);

  useEffect(() => {
    setVisibleCount(3);
  }, [search, department, skillFilter, experience]);

  const visibleCandidates = filteredCandidates.slice(0, visibleCount);

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setDepartment('All');
    setSkillFilter('All');
    setExperience('All');
    setVisibleCount(3);
  };

  const moveToShortlist = async (candidate) => {
    try {
      await api.post('/employer/talent-pool/save', {
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        primaryRole: candidate.preferredDepartment,
        skills: candidate.keySkills || [],
        aiMatchScore: candidate.aiMatchScore || 0,
        notes: 'Saved to shortlist from talent pool',
      });
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? { ...item, shortlisted: true } : item)));
    } catch {
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? { ...item, shortlisted: true } : item)));
    }
  };

  const inviteToApply = async (candidate) => {
    if (!jobs.length) {
      window.alert('Publish a job before sending an invitation.');
      return;
    }

    const targetJob = jobs[0];
    const message = window.prompt(
      `Optional invitation message for ${candidate.fullName || 'this candidate'} to ${targetJob.title}:`,
      `Hi ${candidate.fullName || 'Candidate'}, we would like to invite you to apply for ${targetJob.title}.`
    );

    if (message === null) return;

    try {
      await api.post('/employer/job-invitations', {
        candidateId: candidate.id,
        jobId: targetJob.id,
        message: message || `Hi ${candidate.fullName || 'Candidate'}, we would like to invite you to apply for ${targetJob.title}.`,
      });
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? { ...item, invited: true } : item)));
      window.alert('Invitation sent successfully.');
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Unable to send invitation.');
    }
  };

  const viewCandidateCv = (candidate) => {
    const resumeUrl = candidate.resumeUrl || candidate.cvFileName || candidate.fileUrl || candidate.file_url;
    if (resumeUrl) {
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    window.alert('No CV file is available for this candidate yet.');
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Talent pool</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">General Applicants</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search candidate"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-600 hover:bg-slate-300"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {departmentOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Departments' : option}</option>
            ))}
          </select>

          <select
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {skillOptions.map((option) => (
              <option key={option} value={option}>{option === 'All' ? 'All Skills' : option}</option>
            ))}
          </select>

          <select
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {visibleCandidates.map((candidate) => (
          <article key={candidate.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-700">
                  {candidate.fullName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{candidate.fullName}</h3>
                  <p className="text-sm text-slate-500">{candidate.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">{candidate.preferredDepartment}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{candidate.preferredJobType}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 font-bold text-amber-700">{candidate.experience || 'Experience TBD'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => viewCandidateCv(candidate)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  <FileText className="h-4 w-4" /> View CV
                </button>
                <button
                  onClick={() => inviteToApply(candidate)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                >
                  <UserPlus className="h-4 w-4" /> Invite to Apply for New Job
                </button>
                <button
                  onClick={() => moveToShortlist(candidate)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                >
                  <Star className="h-4 w-4" /> Move to Shortlist
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(candidate.keySkills || []).map((skill) => (
                    <span key={skill} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Cover note</p>
                <p className="mt-2 text-sm text-slate-600">{candidate.coverNote || 'No cover note provided yet.'}</p>
              </div>
            </div>
          </article>
        ))}

        {!filteredCandidates.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <UserRound className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-lg font-black text-slate-700">No candidates match your current search and filter criteria.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
            >
              Reset Filters
            </button>
          </div>
        )}

        {filteredCandidates.length > visibleCount && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 3)}
              className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
            >
              View details
            </button>
          </div>
        )}

        {visibleCount > 3 && filteredCandidates.length > 3 && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setVisibleCount(3)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-100"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
