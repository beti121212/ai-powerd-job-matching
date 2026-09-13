import { ExternalLink, MapPin, Phone } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getMockApplications, getMockInterview } from "../utils/interviewFlow";

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const interview =
    getMockInterview(id) ||
    (id === "interview-301"
      ? {
          id,
          applicationId: "application-201",
          jobTitle: "Frontend Developer",
          company: "Blue Nile Tech",
          status: "Scheduled",
          date: "2026-08-28",
          time: "10:00 AM",
          type: "Online",
          meetingLink: "https://meet.google.com/",
          instructions: "Please join the meeting 10 minutes early.",
        }
      : null);
  const application =
    interview &&
    getMockApplications().find(
      (item) => String(item.id) === String(interview.applicationId),
    );
  if (!interview)
    return (
      <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            Interview unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This interview invitation is no longer available.
          </p>
          <button
            type="button"
            onClick={() => navigate("/applications")}
            className="mt-5 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white"
          >
            View Applications
          </button>
        </div>
      </main>
    );
  const join = () =>
    window.open(interview.meetingLink, "_blank", "noopener,noreferrer");
  return (
    <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-deep)]">
            Interview invitation
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Interview Details
          </h1>
          <div className="mt-6 space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {interview.jobTitle}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {interview.company}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Interview Date", formatDate(interview.date)],
                ["Interview Time", interview.time],
                ["Interview Type", interview.type],
                ["Application Status", application?.status || "Interview"],
                ["Interview Status", interview.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            {interview.type === "Online" && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-bold text-slate-900">Meeting Link</p>
                <button
                  type="button"
                  onClick={join}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-bold text-white"
                >
                  Join Interview <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            )}
            {interview.type === "In-person" && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-[var(--brand-deep)]" />{" "}
                Interview Location: {interview.location}
              </p>
            )}
            {interview.type === "Phone" && (
              <p className="flex items-center gap-2 text-sm text-slate-700">
                <Phone className="h-4 w-4 text-[var(--brand-deep)]" /> Phone
                Interview
              </p>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">
                Additional Instructions
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {interview.instructions ||
                  "No additional instructions were provided."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
