import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMockApplications } from "../utils/interviewFlow";

const tabs = [
  "All",
  "Pending",
  "Shortlisted",
  "Interview",
  "Hired",
  "Rejected",
];

const normalizeStatus = (value) => {
  const status = String(value || "Pending")
    .toLowerCase()
    .replace(/_/g, " ");
  if (
    status === "submitted" ||
    status === "applied" ||
    status === "pending" ||
    status === "in review"
  )
    return "Pending";
  if (status === "under review") return "Under Review";
  if (status === "interview scheduled") return "Interview";
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const statusStyles = {
  Pending: "bg-amber-50 text-amber-800 ring-amber-200",
  "Under Review": "bg-amber-50 text-amber-800 ring-amber-200",
  Shortlisted: "bg-blue-50 text-blue-800 ring-blue-200",
  Interview: "bg-violet-50 text-violet-800 ring-violet-200",
  Hired: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Rejected: "bg-red-50 text-red-800 ring-red-200",
  Withdrawn: "bg-slate-100 text-slate-700 ring-slate-200",
};

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

const normalizeApplication = (application) => ({
  ...application,
  title:
    application.jobTitle ||
    application.role ||
    application.title ||
    "Untitled application",
  company:
    application.companyName || application.company || "Company unavailable",
  status: normalizeStatus(application.status),
  appliedDate: formatDate(
    application.appliedDate || application.appliedAt || application.createdAt,
  ),
  matchScore: application.aiMatchScore ?? application.matchScore,
  interview: application.interview,
});

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve(getMockApplications())
      .then((items) => {
        if (active) setApplications((items || []).map(normalizeApplication));
      })
      .catch(() => {
        if (active) setError("Unable to load your applications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(
    () => ({
      All: applications.length,
      Pending: applications.filter(({ status }) => ["Pending", "Under Review"].includes(status)).length,
      Shortlisted: applications.filter(({ status }) => status === "Shortlisted")
        .length,
      Interview: applications.filter(({ status }) => status === "Interview")
        .length,
      Hired: applications.filter(({ status }) => status === "Hired").length,
      Rejected: applications.filter(({ status }) => status === "Rejected")
        .length,
    }),
    [applications],
  );

  const filteredApplications =
    activeTab === "All"
      ? applications
      : applications.filter(({ status }) => activeTab === "Pending" ? ["Pending", "Under Review"].includes(status) : status === activeTab);

  return (
    <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">My Applications</h1>
              <p className="mt-2 text-sm text-slate-500">Track and manage your job applications in one place.</p>
            </div>
          </div>
        </header>

        <section className="mt-6" aria-labelledby="summary-title">
          <h2 id="summary-title" className="sr-only">
            Application summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tabs.map((tab) => (
              <div
                key={tab}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-500">{tab}</p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {summary[tab]}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div
          className="mt-7 overflow-x-auto border-b border-slate-200"
          role="tablist"
          aria-label="Filter applications"
        >
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-11 border-b-2 px-4 text-sm font-bold transition ${activeTab === tab ? "border-[var(--brand-primary)] text-[var(--brand-deep)]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-5" aria-live="polite">
          {loading && (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          )}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          {!loading && !error && applications.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-lg font-black text-slate-900">
                No Applications Yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                You have not applied for any jobs yet.
              </p>
              <button
                type="button"
                onClick={() => navigate("/explore-jobs")}
                className="mt-5 rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--brand-primary-hover)]"
              >
                Find Jobs
              </button>
            </div>
          )}
          {!loading &&
            !error &&
            applications.length > 0 &&
            filteredApplications.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="text-lg font-black text-slate-900">
                  No {activeTab} Applications
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  You currently do not have any applications in the {activeTab}{" "}
                  stage.
                </p>
              </div>
            )}
          {!loading && !error && filteredApplications.length > 0 && (
            <div className="space-y-3">
              {filteredApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-900">
                        {application.title}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {application.company}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <span className="font-semibold text-slate-700">
                          AI Match:{" "}
                          <strong className="text-[var(--brand-deep)]">
                            {application.matchScore != null
                              ? `${application.matchScore}%`
                              : "Not available"}
                          </strong>
                        </span>
                        <span className="text-slate-500">
                          Applied: {application.appliedDate}
                        </span>
                        {application.interview && (
                          <span className="font-semibold text-violet-700">
                            Interview status: {application.interview.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[application.status] || statusStyles.Pending}`}
                      >
                        Status: {application.status}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!application.id}
                          onClick={() => {
                            if (application.id)
                              navigate(
                                `/applications/${encodeURIComponent(String(application.id))}`,
                                { state: { application } },
                              );
                          }}
                          className="min-h-11 rounded-xl border border-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-[var(--brand-deep)] hover:bg-[var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View Application
                        </button>
                        {application.interview && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/interviews/${encodeURIComponent(String(application.interview.id))}`,
                                { state: { sourcePath: "/applications" } },
                              )
                            }
                            className="min-h-11 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
                          >
                            View Interview
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
