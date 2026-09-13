import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { UploadCloud, Sparkles, Loader2, ArrowRight, FileText, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { continueApplicationFlow, hasCompletedCv } from '../utils/applicationFlow';
import { notifyProfileUpdated } from '../utils/profileUpdateEvent';

const CvUploader = ({
  cvFile: externalCvFile,
  setCvFile: externalSetCvFile,
  isParsing: externalIsParsing,
  setIsParsing: externalSetIsParsing,
  parsedAnalysis: externalParsedAnalysis,
  onNext,
  onSkip
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const applicationJobId = searchParams.get('jobId');
  const isReplaceMode = Boolean(location.state?.replaceMode);
  const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';

  const [internalCvFile, setInternalCvFile] = useState(null);
  const [internalIsParsing, setInternalIsParsing] = useState(false);
  const [internalParsedAnalysis] = useState(null);
  const [continueError, setContinueError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const cvFile = externalCvFile !== undefined ? externalCvFile : internalCvFile;
  const setCvFile = externalSetCvFile || setInternalCvFile;
  const isParsing = externalIsParsing !== undefined ? externalIsParsing : internalIsParsing;
  const setIsParsing = externalSetIsParsing || setInternalIsParsing;
  const parsedAnalysis = externalParsedAnalysis !== undefined ? externalParsedAnalysis : internalParsedAnalysis;

  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const parsedUser = savedUser ? JSON.parse(savedUser) : null;
  const storedResume = (() => {
    try {
      return JSON.parse(localStorage.getItem('seekerResume') || 'null');
    } catch {
      return null;
    }
  })();
  const hasExistingCv = Boolean(storedResume?.fileName || parsedUser?.cvFileName);
  const welcomeName = parsedUser?.full_name || parsedUser?.name || parsedUser?.email || null;
  const isSeeker = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'].includes((parsedUser?.role || '').toString().toLowerCase());

  const saveResumeToStorage = (file) => {
    const nextResume = {
      id: `resume-${Date.now()}`,
      fileName: file.name,
      fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    localStorage.setItem('seekerResume', JSON.stringify(nextResume));
    notifyProfileUpdated();
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...userData, cvFileName: file.name }));
    } catch {
      console.error('Unable to save CV filename.');
    }

    return nextResume;
  };

  const processFile = (file) => {
    if (!file) return;

    const validFile = /\.(pdf|docx)$/i.test(file.name);
    if (!validFile) {
      setContinueError('Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setContinueError('Your CV must be smaller than 10MB.');
      return;
    }

    setContinueError('');
    setCvFile(file);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSubmitCv = async () => {
    if (!cvFile) {
      setContinueError('Please choose a CV file before continuing.');
      return;
    }

    const file = cvFile;
    const token = localStorage.getItem('token');

    if (!token) {
      setContinueError('Please sign in again before uploading your CV.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('cv', file);
    setIsParsing(true);
    let analyzedData;
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/cv/upload-and-analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Unable to analyze CV');
      analyzedData = result.data;
      if (analyzedData?.id) localStorage.setItem('lastAnalyzedCvId', String(analyzedData.id));
    } catch {
      setContinueError('Unable to save your CV. Please try again.');
      setIsParsing(false);
      return;
    }

    saveResumeToStorage(file);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, onboardingCvUploaded: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setIsParsing(false);

    if (applicationJobId) {
      continueApplicationFlow(navigate, { jobId: applicationJobId });
      return;
    }

    if (isReplaceMode) {
      navigate('/resume');
      return;
    }

    navigate('/cv-analysis', { state: { analysis: analyzedData } });
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    if (applicationJobId) {
      if (!cvFile && !hasCompletedCv()) {
        setContinueError('Please upload your CV before continuing.');
        return;
      }

      if (cvFile) {
        await handleSubmitCv();
        return;
      }

      continueApplicationFlow(navigate, { jobId: applicationJobId });
      return;
    }

    if (!cvFile && !hasExistingCv) {
      setContinueError('Please upload your CV before continuing.');
      return;
    }

    if (cvFile) {
      await handleSubmitCv();
      return;
    }

    if (isReplaceMode || hasExistingCv) {
      navigate('/profile', { replace: true });
      return;
    }

    if (onNext) {
      onNext();
      return;
    }

    navigate('/profile', { replace: true });
  };

  const rightCardTitle = isReplaceMode ? 'Replace Current CV' : hasExistingCv ? 'Your Profile' : 'Complete Your Profile';
  const rightCardText = isReplaceMode
    ? 'Choose a new file to replace the CV currently stored in your profile.'
    : hasExistingCv
      ? 'Your CV is already connected to your profile.'
      : 'Your CV is required to complete your profile and improve AI-powered job matching.';

  const handlePreviewResume = () => {
    if (!storedResume) {
      setContinueError('No CV uploaded yet.');
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className="information-page w-full max-w-6xl mx-auto my-6 px-4 sm:px-6 lg:my-10">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="px-6 py-8 text-slate-900 sm:px-10" style={{ backgroundColor: '#f8fafc' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"><Sparkles className="h-4 w-4 text-[var(--brand-deep)]" /> AI-powered CV analysis</div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{isReplaceMode ? 'Replace your CV' : hasExistingCv ? 'Update your CV' : 'Upload your CV'}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{isSeeker ? `Welcome, ${welcomeName || 'Job Seeker'}. ${isReplaceMode ? 'Choose a new file to replace your current CV.' : hasExistingCv ? 'Choose a new file to replace your current CV.' : 'Upload your CV to unlock personalized job matches.'}` : 'Upload your resume to analyze skills and discover better opportunities.'}</p>
            </div>
            <FileText className="hidden h-9 w-9 text-[var(--brand-deep)] sm:block" />
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_0.8fr] sm:p-10">
          <div className="space-y-6">
            {hasExistingCv && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Your Current Resume</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{storedResume?.fileName || parsedUser?.cvFileName}</p>
                    <p className="text-xs text-slate-500">Uploaded and ready to use</p>
                  </div>
                </div>
              </div>
            )}

            <div onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }} onDragLeave={() => setIsDragActive(false)} onDrop={handleDrop} className={`relative min-h-[260px] rounded-3xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${isDragActive ? 'bg-[var(--brand-soft-hover)] ring-4 ring-[#d0e5f5]' : 'bg-[var(--brand-soft)]'}`} style={{ borderColor: 'var(--brand-primary)' }}>
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="absolute inset-0 z-10 h-full w-full cursor-pointer !opacity-0" aria-label="Upload CV" />
              <div className="pointer-events-none mx-auto flex max-w-lg flex-col items-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white/70" style={{ backgroundColor: 'var(--brand-primary)' }}>
                  <UploadCloud className="h-10 w-10" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{cvFile ? cvFile.name : hasExistingCv ? 'Choose New CV' : 'Drag & drop your CV here'}</h3>
                <p className="mt-2 text-sm text-slate-500">{cvFile ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB · Ready to replace` : 'or click to browse from your device'}</p>
                <span className="mt-5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#56a2d8]/25" style={{ backgroundColor: 'var(--brand-primary)' }}>{cvFile ? 'Choose a different file' : hasExistingCv ? 'Choose New CV' : 'Choose CV file'}</span>
                <p className="mt-4 text-xs font-medium text-slate-400">PDF, DOC or DOCX · Maximum 10MB</p>
              </div>
            </div>

            {continueError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{continueError}</p>}

            {isParsing && (
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">AI is analyzing your CV...</h4>
                  <p className="text-xs text-blue-700">Extracting skills, experience, and match score.</p>
                </div>
              </div>
            )}

            {parsedAnalysis && !isParsing && (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-900">AI CV Analysis Results</span>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white">
                    {parsedAnalysis.matchScore}% Match
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-100 bg-white p-3">
                    <span className="block text-xs text-slate-400">Extracted Skills:</span>
                    <span className="font-semibold text-slate-800">{parsedAnalysis.skillsMatched.join(', ')}</span>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-white p-3">
                    <span className="block text-xs text-slate-400">Recommended Role:</span>
                    <span className="font-semibold text-slate-800">{parsedAnalysis.recommendedRole}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Your CV stays private and secure</div>
              <button
                type="button"
                onClick={onSkip || (() => navigate('/profile'))}
                disabled={isParsing}
                className="rounded-xl border border-slate-300 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip for Now / ለጊዜው እለፈው
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="brand-button flex items-center gap-2 px-6 py-3 text-xs shadow-lg shadow-[#56a2d8]/25 active:scale-[0.98]"
              >
                <span>{isReplaceMode ? 'Replace CV' : hasExistingCv ? 'Replace CV' : 'Upload CV'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 text-[var(--brand-deep)]">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-lg font-black text-slate-900">{rightCardTitle}</h3>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{rightCardText}</p>

            {hasExistingCv || isReplaceMode ? (
              <button
                type="button"
                onClick={handlePreviewResume}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-primary-hover)]"
              >
                View Resume
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-primary-hover)]"
              >
                Continue to Profile
              </button>
            )}
          </aside>
        </div>
      </div>

      {previewOpen && storedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Resume Preview</h3>
                <p className="text-sm text-slate-500">{storedResume.fileName}</p>
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
              {storedResume.fileType === 'PDF' ? (
                <iframe
                  title="Resume PDF preview"
                  src={storedResume.fileUrl}
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
    </div>
  );
};

export default CvUploader;