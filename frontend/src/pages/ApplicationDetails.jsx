import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getApplicationById,
  getJobById,
  withdrawApplication,
} from "../services/jobService";

const stages = [
  "Applied",
  "AI Matched",
  "Employer Reviewed",
  "Shortlisted",
  "Interview Scheduled",
  "Final Decision",
];
const blockedStatuses = ["hired", "rejected", "withdrawn"];

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const normalizeStatus = (value) => {
  const status = String(value || "Under Review")
    .toLowerCase()
    .replace(/_/g, " ");
  if (status === "submitted" || status === "applied") return "Pending";
  if (
    status === "review" ||
    status === "in review" ||
    status === "employer reviewed"
  )
    return "Under Review";
  if (status === "interview scheduled") return "Interview";
  if (status === "offer") return "Hired";
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const statusTone = (status) =>
  ({
    Pending: "bg-amber-50 text-amber-800",
    "Under Review": "bg-blue-50 text-[var(--brand-deep)]",
    Shortlisted: "bg-emerald-50 text-emerald-800",
    Interview: "bg-violet-50 text-violet-800",
    Hired: "bg-emerald-50 text-emerald-800",
    Rejected: "bg-red-50 text-red-800",
    Withdrawn: "bg-slate-100 text-slate-600",
  })[status] || "bg-slate-100 text-slate-700";

export default function ApplicationDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [toast, setToast] = useState("");
  const [originalJobError, setOriginalJobError] = useState("");

  useEffect(() => {
    if (!showWithdrawModal) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowWithdrawModal(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [showWithdrawModal]);

  useEffect(() => {
    let active = true;
    const loadApplication = async () => {
      setLoading(true);
      const routedApplication = location.state?.application;
      const stored =
        routedApplication && String(routedApplication.id) === String(id)
          ? routedApplication
          : getApplicationById(id);
      if (!stored) {
        if (active) {
          setError("This application could not be found.");
          setLoading(false);
        }
        return;
      }
      if (active) setApplication(stored);
      try {
        const jobId = stored.jobId || stored.job_id;
        if (jobId) {
          const jobData = await getJobById(jobId);
          if (active) setJob(jobData);
        }
      } catch (loadError) {
        console.error("Unable to load original job post", loadError);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadApplication();
    return () => {
      active = false;
    };
  }, [id, location.state]);

  const statusLabel = useMemo(
    () => normalizeStatus(application?.status),
    [application],
  );
  const canWithdraw =
    !blockedStatuses.includes((application?.status || "").toLowerCase()) &&
    !["Hired", "Rejected", "Withdrawn"].includes(statusLabel);
  const applicationJobId = application?.jobId || application?.job_id;

  const handleViewOriginalJob = () => {
    if (!applicationJobId || typeof applicationJobId === "object") {
      setOriginalJobError(
        "The original job information is currently unavailable.",
      );
      return;
    }
    const submittedJob = application?.job;
    if (submittedJob && String(submittedJob.id) === String(applicationJobId)) {
      localStorage.setItem("jobDetailsPreview", JSON.stringify(submittedJob));
    }
    setOriginalJobError("");
    navigate(`/job-details/${encodeURIComponent(String(applicationJobId))}`);
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setWithdrawError("");
    try {
      await withdrawApplication(id);
      setApplication((current) => ({
        ...current,
        status: "Withdrawn",
        lastUpdated: new Date().toISOString(),
      }));
      setShowWithdrawModal(false);
      setToast("Application withdrawn successfully.");
      window.setTimeout(() => setToast(""), 2800);
    } catch (withdrawalError) {
      console.error("Unable to withdraw application", withdrawalError);
      setWithdrawError(
        "Unable to withdraw this application. Please try again.",
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading)
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-deep)]" />{" "}
          Loading application…
        </div>
      </main>
    );
  if (error || !application)
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            Application unavailable
          </h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/applications")}
            className="brand-button mt-6 px-5 py-3 text-sm"
          >
            View My Applications
          </button>
        </div>
      </main>
    );

  const resume = application.submittedResume || {};
  const resumeName =
    resume.fileName ||
    resume.name ||
    application.submittedResumeName ||
    application.resumeName ||
    application.resumeId ||
    "Submitted resume";
  const resumeUrl =
    application.submittedResumeUrl ||
    resume.url ||
    resume.fileUrl ||
    application.resumeUrl;
  const appliedDate = formatDate(
    application.createdAt || application.appliedAt,
  );
  const matchScore =
    application.aiMatchScore ??
    application.matchScore ??
    job?.matchBreakdown?.overall;
  const activeStage =
    statusLabel === "Withdrawn"
      ? -1
      : ["Hired", "Rejected"].includes(statusLabel)
        ? 5
        : statusLabel === "Interview"
          ? 4
          : statusLabel === "Shortlisted"
            ? 3
            : statusLabel === "Under Review" || matchScore != null
              ? 2
              : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <span>Application Details</span>
        </nav>
        <button type="button" onClick={() => navigate("/applications")} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--brand-deep)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to My Applications
        </button>
        <section className="rounded-3xl border border-[var(--brand-border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
                Application Details
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                {job?.title || application.jobTitle || "Job application"}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4" />
                  {job?.companyName ||
                    job?.company ||
                    application.companyName ||
                    "Company"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job?.location ||
                    application.location ||
                    "Location unavailable"}
                </span>
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Applied on {appliedDate}
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-bold ${statusTone(statusLabel)}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="mt-7 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Application progress
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {stages.map((stage, index) => {
                const completed =
                  (activeStage >= 0 && index < activeStage) ||
                  (activeStage === 5 && index === 5);
                const current =
                  index === activeStage &&
                  !["Hired", "Rejected"].includes(statusLabel);
                return (
                  <div
                    key={stage}
                    className="flex items-start gap-3 lg:block lg:text-center"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold lg:mx-auto ${completed ? "bg-[var(--brand-primary)] text-white" : current ? "border-2 border-[var(--brand-primary)] bg-[var(--brand-soft)] text-[var(--brand-deep)]" : "bg-slate-100 text-slate-400"}`}
                    >
                      {completed ? <Check className="h-5 w-5" /> : index + 1}
                    </span>
                    <div className="pt-1 lg:pt-3">
                      <p className="text-sm font-bold text-slate-800">
                        {stage}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {completed
                          ? "Completed"
                          : current
                            ? "In Progress"
                            : "Waiting"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            id="ai-match"
            className="mt-6 scroll-mt-6 rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-[var(--brand-deep)]" /> AI
                Match Score
              </h2>
              <div className="text-right">
                <p className="text-3xl font-black text-[var(--brand-deep)]">
                  {matchScore != null ? `${matchScore}%` : "--"}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  {matchScore >= 80
                    ? "Strong Match"
                    : matchScore != null
                      ? "Potential Match"
                      : "Not available"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Skills Match", application.skillsMatch],
                ["Experience Match", application.experienceMatch],
                ["Education Match", application.educationMatch],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {value != null ? `${value}%` : "Not available"}
                  </p>
                </div>
              ))}
            </div>
            {(application.matchingSkills || job?.skills)?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-700">
                  Matching skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(application.matchingSkills || job.skills).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {(application.missingSkills || job?.missingSkills)?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-slate-700">
                  Missing or improvement areas
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(application.missingSkills || job.missingSkills).map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900">
              Submitted materials
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[var(--brand-deep)]" />
                  <div>
                    <h3 className="font-bold text-slate-900">Resume</h3>
                    <p className="mt-1 text-sm text-slate-600">{resumeName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Submitted with this application.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {resumeUrl ? (
                    <>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--brand-primary)] px-3 text-sm font-bold text-[var(--brand-deep)] hover:bg-white"
                      >
                        <ExternalLink className="h-4 w-4" /> View Resume
                      </a>
                      <a
                        href={resumeUrl}
                        download={resumeName}
                        className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-3 text-sm font-bold text-white hover:bg-[var(--brand-primary-hover)]"
                      >
                        <Download className="h-4 w-4" /> Download Resume
                      </a>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">
                      Submitted file unavailable
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[var(--brand-deep)]" />
                  <div>
                    <h3 className="font-bold text-slate-900">Cover Letter</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      View the cover letter submitted with this application.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverLetterOpen(true)}
                  className="mt-4 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:border-[var(--brand-primary)]"
                >
                  View Cover Letter
                </button>
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap">
            {statusLabel === "Interview" && application.interviewId && (
              <button
                type="button"
                onClick={() =>
                  navigate(`/interviews/${application.interviewId}`, { state: { sourcePath: "/applications" } })
                }
                className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-[var(--brand-deep)] hover:bg-[var(--brand-soft)] sm:w-auto"
              >
                View Interview Details
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/explore-jobs")}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Explore More Jobs
            </button>
            <button
              type="button"
              onClick={handleViewOriginalJob}
              disabled={
                !applicationJobId || typeof applicationJobId === "object"
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              View Original Job Post <ExternalLink className="h-4 w-4" />
            </button>
            {canWithdraw && (
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" /> Withdraw Application
              </button>
            )}
            {statusLabel === "Withdrawn" && (
              <span className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 sm:w-auto">
                Application Withdrawn
              </span>
            )}
          </div>
          {originalJobError && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
              {originalJobError}
            </p>
          )}
        </section>
      </div>
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}
      {coverLetterOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCoverLetterOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-letter-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="cover-letter-title"
                className="text-xl font-black text-slate-900"
              >
                Cover Letter
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setCoverLetterOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {application.coverLetter ||
                application.submittedCoverLetter ||
                "No cover letter was submitted."}
            </p>
            <button
              type="button"
              onClick={() => setCoverLetterOpen(false)}
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setShowWithdrawModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2
                id="withdraw-title"
                className="text-xl font-black text-slate-900"
              >
                Withdraw Application?
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Are you sure you want to withdraw your application for:
            </p>
            <p className="mt-3 font-bold text-slate-900">
              {job?.title || application.jobTitle}
              <br />
              <span className="font-normal text-slate-600">
                {job?.companyName || job?.company || application.companyName}
              </span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Once withdrawn, the employer will be informed that you are no
              longer interested in this position.
            </p>
            {withdrawError && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {withdrawError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {withdrawing && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Withdraw Application
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
