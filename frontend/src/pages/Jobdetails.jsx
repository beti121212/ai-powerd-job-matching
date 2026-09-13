import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LogIn, Send, Sparkles, Loader2, Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { beginApplication, getApplicationForJob, getApplyButtonState, getApplicationRequirements } from "../utils/applicationFlow";

const getReadableDescription = (description) => {
  if (!description) return "ምንም መግለጫ አልተካተተም።";
  if (typeof description !== "string") return String(description);

  const container = document.createElement("div");
  container.innerHTML = description;
  return container.textContent?.replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim() || "ምንም መግለጫ አልተካተም።";
};

const asList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|\r|•|;/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const currentUser = user || storedUser || {};
  const currentAuthentication = isAuthenticated || Boolean(localStorage.getItem("token"));

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchLoading] = useState(false);
  const [matchScore] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Job details are passed from Explore Jobs and kept in frontend storage.
  useEffect(() => {
    if (!id) return;

    try {
      const previewJob = location.state?.job || JSON.parse(localStorage.getItem("jobDetailsPreview") || "null");
      if (previewJob && String(previewJob.id) === String(id)) {
        // The route preview is external browser state, so sync it into the page model.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setJob(previewJob);
      } else {
        setError("Open this job from Explore Jobs to view its details.");
      }
    } catch {
      setError("The job details could not be loaded.");
    } finally {
      setLoading(false);
      try {
        const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setIsSaved(savedJobs.some((savedId) => String(savedId) === String(id)));
      } catch {
        setIsSaved(false);
      }
    }
  }, [id, location.state]);

  // 2. Click Logic for "Login to Apply" / "Apply Now"
  const handleApplyAction = () => {
    beginApplication(id, job, navigate, { isAuthenticated: currentAuthentication, role: currentUser.role, sourcePage: location.pathname, returnPath: location.pathname });
  };

  const handleCheckMatch = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location.pathname, intent: "match", jobId: id },
      });
      return;
    }

    navigate("/match-results", {
      state: { sourceJob: job },
    });
  };

  const handleToggleSave = () => {
    try {
      const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      const nextSavedJobs = isSaved
        ? savedJobs.filter((savedId) => String(savedId) !== String(id))
        : [...savedJobs, id];
      localStorage.setItem("savedJobs", JSON.stringify(nextSavedJobs));
      setIsSaved(!isSaved);
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const matchBreakdown = job && {
    overall: job.matchBreakdown?.overall ?? job.matchScore ?? job.score ?? job.aiMatchScore,
    skills: job.matchBreakdown?.skills ?? job.skillsMatch,
    experience: job.matchBreakdown?.experience ?? job.experienceMatch,
    matchingSkills: job.matchBreakdown?.matchingSkills ?? job.matchingSkills ?? [],
    skillsToImprove: job.matchBreakdown?.skillsToImprove ?? job.skillsToImprove ?? [],
  };
  const backLabel = "Back to Find Jobs";
  const existingApplication = job && getApplicationForJob(id);
  const applyButtonState = getApplyButtonState({
    isAuthenticated: currentAuthentication,
    role: currentUser.role,
    otpVerified: currentUser.is_verified || currentUser.isVerified || currentUser.otpVerified,
  });
  const deadline = job?.deadlineDate || job?.application_deadline;
  const isExpired = deadline && (() => {
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;
    deadlineDate.setHours(23, 59, 59, 999);
    return deadlineDate < new Date();
  })();
  const responsibilities = asList(job?.responsibilities);
  const requirements = asList(job?.requirements);
  const skills = asList(job?.skills || job?.requiredSkills || job?.tags);
  const benefits = asList(job?.benefits);
  const companyName = job?.companyName || job?.company || "Company";
  const department = job?.department || job?.sector;
  const jobType = job?.jobType || job?.job_type || job?.type;
  const workMode = job?.workMode || job?.work_mode || job?.workplace;
  const locationName = job?.location || job?.locationValue;
  const salaryCurrency = job?.currency || "";
  const salaryMinimum = job?.minSalary || job?.salaryMin;
  const salaryMaximum = job?.maxSalary || job?.salaryMax;
  const salary = job?.salary || [salaryCurrency, salaryMinimum && `${salaryMinimum} –`, salaryMaximum]
    .filter(Boolean)
    .join(" ") || "Not specified";
  const deadlineLabel = job?.deadline || job?.application_deadline || job?.deadlineDate;
  const formattedDeadline = deadlineLabel
    ? new Date(deadlineLabel).toString() !== "Invalid Date"
      ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(deadlineLabel))
      : deadlineLabel
    : "Not specified";
  const applicationRequirements = getApplicationRequirements();
  const canShowMatch = isAuthenticated && applicationRequirements.hasResume && applicationRequirements.profileCompleted;
  const matchValue = canShowMatch ? matchBreakdown?.overall : null;
  const postedDate = job?.postedAt || job?.postedDate;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#0871D1]"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="mb-4 text-[#B42318]">{error || "ስራው አልተገኘም።"}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="inline-flex items-center gap-2 text-[#0871D1] hover:underline"
        >
          <ArrowLeft size={16} /> ወደ Find Jobs ተመለስ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <button onClick={() => navigate("/explore-jobs")} className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
          <ArrowLeft size={18} /> {backLabel}
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0 bg-white pb-6">
            <header className="border-b border-slate-200 pb-8">
              <p className="text-sm font-bold text-[#0871D1]">{jobType || "Job opportunity"}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{job.title}</h1>
              <p className="mt-3 text-lg font-semibold text-slate-700">{companyName}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-slate-500">
                {[locationName, jobType, workMode, department].filter(Boolean).map((value, index, values) => (
                  <span key={`${value}-${index}`}>{value}{index < values.length - 1 ? " •" : ""}</span>
                ))}
              </p>
              {postedDate && <p className="mt-3 text-sm text-slate-500">Posted {postedDate}</p>}
            </header>

            <section className="border-b border-slate-200 py-8" aria-labelledby="job-overview-heading">
              <h2 id="job-overview-heading" className="text-xl font-black text-slate-900">Job Overview</h2>
              <dl className="mt-6 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
                {[
                  ["Department", department],
                  ["Employment Type", jobType],
                  ["Work Mode", workMode],
                  ["Location", locationName],
                  ["Salary", salary],
                  ["Application Deadline", formattedDeadline],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold text-slate-500">{label}</dt>
                    <dd className="mt-1 font-bold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="py-8 rounded-2xl border border-slate-100 bg-gradient-to-br from-[#f0f7fc]/50 via-white to-[#eaf4fb]/30 p-6" aria-labelledby="description-heading">
              <div className="relative inline-block">
                <h2 id="description-heading" className="text-xl font-black text-slate-900">About the Job</h2>
                <div className="absolute -bottom-1 left-0 h-1 w-24 rounded-full bg-gradient-to-r from-red-400 to-transparent opacity-60"></div>
              </div>
              <div className="mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-700">
                {getReadableDescription(job.description || job.fullDescription || job.shortDescription)}
              </div>
            </section>

            {responsibilities.length > 0 && <section className="border-t border-slate-200 py-8 rounded-2xl bg-gradient-to-br from-white to-slate-50/40 -mx-6 px-6" aria-labelledby="responsibilities-heading">
              <div className="relative inline-block">
                <h2 id="responsibilities-heading" className="text-xl font-black text-slate-900">Responsibilities</h2>
                <div className="absolute -bottom-1 left-0 h-1 w-36 rounded-full bg-gradient-to-r from-blue-400 to-transparent opacity-60"></div>
              </div>
              <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-slate-700 marker:text-[#56A2D8] marker:font-bold">
                {responsibilities.map((item, index) => <li key={`${item}-${index}`} className="font-medium">{item}</li>)}
              </ul>
            </section>}

            {requirements.length > 0 && <section className="border-t border-slate-200 py-8 rounded-2xl bg-gradient-to-br from-white to-slate-50/40 -mx-6 px-6" aria-labelledby="requirements-heading">
              <div className="relative inline-block">
                <h2 id="requirements-heading" className="text-xl font-black text-slate-900">Requirements</h2>
                <div className="absolute -bottom-1 left-0 h-1 w-32 rounded-full bg-gradient-to-r from-purple-400 to-transparent opacity-60"></div>
              </div>
              <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-slate-700 marker:text-[#56A2D8] marker:font-bold">
                {requirements.map((item, index) => <li key={`${item}-${index}`} className="font-medium">{item}</li>)}
              </ul>
            </section>}

            {skills.length > 0 && <section className="border-t border-slate-200 py-8 rounded-2xl bg-gradient-to-br from-white to-slate-50/40 -mx-6 px-6" aria-labelledby="skills-heading">
              <div className="relative inline-block">
                <h2 id="skills-heading" className="text-xl font-black text-slate-900">Required Skills</h2>
                <div className="absolute -bottom-1 left-0 h-1 w-40 rounded-full bg-gradient-to-r from-indigo-400 to-transparent opacity-60"></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {skills.map((skill, index) => <span key={`${skill}-${index}`} className="rounded-full bg-gradient-to-r from-[#EAF3FF] to-[#F0F7FC] px-4 py-2 text-sm font-semibold text-[#2B73A4] border border-[#D0E5F5] hover:border-[#56A2D8] transition-colors duration-200">{skill}</span>)}
              </div>
            </section>}

            {benefits.length > 0 && <section className="border-t border-slate-200 py-8 rounded-2xl bg-gradient-to-br from-white to-slate-50/40 -mx-6 px-6" aria-labelledby="benefits-heading">
              <div className="relative inline-block">
                <h2 id="benefits-heading" className="text-xl font-black text-slate-900">Benefits</h2>
                <div className="absolute -bottom-1 left-0 h-1 w-20 rounded-full bg-gradient-to-r from-green-400 to-transparent opacity-60"></div>
              </div>
              <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-slate-700 marker:text-[#56A2D8] marker:font-bold">
                {benefits.map((item, index) => <li key={`${item}-${index}`} className="font-medium">{item}</li>)}
              </ul>
            </section>}

            <section className="border-t border-slate-200 py-8" aria-labelledby="job-summary-heading">
              <h2 id="job-summary-heading" className="text-xl font-black text-slate-900">Job Summary</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                {[
                  ["Department", department],
                  ["Experience", job?.experienceLevel || job?.experience],
                  ["Location", locationName],
                  ["Employment Type", jobType],
                  ["Deadline", formattedDeadline],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold text-slate-500">{label}</dt>
                    <dd className="mt-1 font-bold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <aside className="rounded-2xl bg-[#F4F7FA] p-5 lg:sticky lg:top-6">
            <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F4F7FA] p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Apply for this Job</h2>
              <div className="mt-5 border-b border-slate-100 pb-5">
                <p className="text-xs font-semibold text-slate-500">Application Deadline</p>
                <p className="mt-1 font-bold text-slate-900">{formattedDeadline}</p>
              </div>
              {existingApplication ? (
                <button type="button" onClick={() => navigate(`/applications/${existingApplication.id}`, { state: { application: existingApplication } })} className="mt-5 w-full rounded-xl border border-emerald-600 px-5 py-3.5 font-bold text-emerald-700 transition hover:bg-emerald-50">View Application</button>
              ) : isExpired ? <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700">Applications are closed.</p>
              : <button type="button" onClick={handleApplyAction} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0871D1] px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#075EAE]">
                {applyButtonState.key === "login" ? <LogIn size={18} /> : <Send size={18} />}{applyButtonState.label}
              </button>}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F4F7FA] p-6">
              <h2 className="text-lg font-black text-slate-900">AI Match</h2>
              {matchValue != null ? <>
                <p className="mt-3 text-4xl font-black text-[#0871D1]">{matchValue}%</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">AI Match Score</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">Your skills and profile are a strong match for this position.</p>
                {matchBreakdown.matchingSkills.length > 0 && <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-bold text-slate-700">Matching Skills</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{matchBreakdown.matchingSkills.join(" • ")}</p>
                </div>}
                {matchBreakdown.skillsToImprove.length > 0 && <div className="mt-3">
                  <p className="text-sm font-bold text-slate-700">Skills to Improve</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{matchBreakdown.skillsToImprove.join(" • ")}</p>
                </div>}
              </> : <>
                <p className="mt-3 text-sm leading-6 text-slate-600">{isAuthenticated ? "Check your profile against this role." : "Sign in to see your personalized match."}</p>
                <button type="button" onClick={handleCheckMatch} disabled={matchLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0871D1] px-4 py-3 font-bold text-white transition hover:bg-[#075EAE] disabled:opacity-70">
                  {matchLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}{matchLoading ? "Checking..." : isAuthenticated ? "Check Your Match" : "Sign In to Continue"}
                </button>
              </>}
            </div>

            {!isExpired && !existingApplication && <button type="button" onClick={handleToggleSave} className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${isSaved ? "border-[#0871D1] bg-[#EAF3FF] text-[#075EAE]" : "border-slate-300 bg-white text-slate-700 hover:border-[#0871D1] hover:text-[#075EAE]"}`}>
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />{isSaved ? "Saved" : "Save Job"}
            </button>}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;