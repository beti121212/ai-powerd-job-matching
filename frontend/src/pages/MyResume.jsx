import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Eye, FileText, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteResume,
  downloadResume,
  getResume,
  replaceResume,
  uploadResume,
} from "../services/resumeService";
import {
  DeleteResumeModal,
  ReplaceResumeModal,
  UploadResumeModal,
} from "../components/resume/ResumeModals";
import {
  continueApplicationFlow,
  getPendingApplication,
} from "../utils/applicationFlow";

const buildGeneratedResume = () => {
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fullName = [profile.firstName || profile.name || user.full_name || user.name, profile.lastName]
    .filter(Boolean)
    .join(' ') || 'Your Name';
  const email = profile.email || user.email || '';
  const phone = profile.phone || user.phone || '';
  const location = profile.location || profile.city || profile.preferredCity || '';
  const headline = profile.jobCategory || profile.preferredJob || profile.headline || '';
  const summary = profile.bio || profile.summary || user.bio || '';
  const skills = Array.isArray(profile.skills) ? profile.skills.filter(Boolean) : [];
  const education = Array.isArray(profile.education)
    ? profile.education.filter((item) => item && (item.university || item.degree || item.department || item.graduationYear))
    : [];
  const experience = Array.isArray(profile.experience)
    ? profile.experience.filter((item) => item && (item.company || item.position || item.startDate || item.endDate || item.responsibilities))
    : [];
  const languages = Array.isArray(profile.languages) ? profile.languages.filter(Boolean) : [];
  const links = [
    profile.linkedin && { label: 'LinkedIn', href: profile.linkedin },
    profile.github && { label: 'GitHub', href: profile.github },
    profile.portfolio && { label: 'Portfolio', href: profile.portfolio },
  ].filter(Boolean);

  return { fullName, email, phone, location, headline, summary, skills, education, experience, languages, links };
};

export default function MyResume() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResume(await getResume());
      const stored = JSON.parse(localStorage.getItem('generatedCv') || 'null');
      if (stored) setGeneratedResume(stored);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load your resume.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const submitFile = async (formData, action) => {
    setSaving(true);
    setError("");
    try {
      const result = await action(formData);
      setResume(result);
      setModal(null);
      setToast(
        action === uploadResume
          ? "Resume uploaded successfully"
          : "Resume replaced successfully",
      );
      const pending = getPendingApplication();
      if (pending?.jobId)
        continueApplicationFlow(navigate, { jobId: pending.jobId });
    } catch (requestError) {
      setError(requestError?.message || "Unable to save your resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateResume = () => {
    const generated = buildGeneratedResume();
    setGeneratedResume(generated);
    localStorage.setItem('generatedCv', JSON.stringify(generated));
  };

  const handleDelete = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      await deleteResume(resume.id);
      localStorage.removeItem('generatedCv');
      setResume(null);
      setGeneratedResume(null);
      setModal(null);
      setToast("Resume deleted successfully");
    } catch (requestError) {
      setError(requestError?.message || "Unable to delete your resume.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) {
      setError("No CV uploaded yet.");
      return;
    }
    try {
      await downloadResume(resume.fileUrl, resume.fileName);
    } catch (requestError) {
      setError(requestError?.message || "Unable to download your resume.");
    }
  };

  const handleViewResume = () => {
    if (!resume) {
      setError("No CV uploaded yet.");
      return;
    }
    setPreviewOpen(true);
  };

  const handleReplaceCv = () => {
    navigate('/upload-cv', { state: { replaceMode: true } });
  };

  const handleContinue = () => {
    const pending = getPendingApplication();
    if (pending?.jobId) {
      continueApplicationFlow(navigate, { jobId: pending.jobId });
    } else {
      navigate('/dashboard');
    }
  };

  if (loading)
    return (
      <main className="information-page min-h-[70vh] bg-slate-50 px-4 py-10">
        <div className="mx-auto flex max-w-5xl justify-center rounded-3xl bg-white p-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      </main>
    );

  const hasResume = Boolean(resume);

  return (
    <main className="information-page min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Resume</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your resume and prepare for job applications.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {hasResume ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Your Resume</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Your CV is available and ready for job applications.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-6">
                <p className="text-sm text-slate-600">
                  {resume.fileName}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleViewResume}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  View Resume
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Download Resume
                </button>
                <button
                  type="button"
                  onClick={handleReplaceCv}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Replace CV
                </button>
                <button
                  type="button"
                  onClick={() => setModal('delete')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  Delete Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-black text-slate-900">No resume uploaded yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Your CV is not uploaded yet. Upload it during the profile setup flow to continue.
              </p>
            </div>
          )}
        </div>
      </div>

      {modal === 'delete' && (
        <DeleteResumeModal
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
          isDeleting={saving}
        />
      )}

      {previewOpen && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Resume Preview</h3>
                <p className="text-sm text-slate-500">{resume.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                aria-label="Close resume preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4">
              {resume.fileType === 'PDF' ? (
                <iframe
                  title="Resume PDF preview"
                  src={resume.fileUrl}
                  className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white text-center">
                  <FileText className="h-12 w-12 text-slate-400" />
                  <p className="text-base font-bold text-slate-700">This file type cannot be previewed here.</p>
                  <p className="text-sm text-slate-500">You can still download the current CV.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          {toast}
        </div>
      )}
    </main>
  );
}
