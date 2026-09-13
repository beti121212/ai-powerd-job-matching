import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cvImage from '../pages/images/cv.jpg';
import { useToast } from '../hooks/useToast.js';
import { scrollToFeedback } from '../utils/scrollHelper.js';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CvUploadScreen = ({ user, onUploadSuccess, onSkip }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const scrollCvFeedback = (type) => {
    window.setTimeout(() => {
      if (type === 'success') {
        document.querySelector('#extracted-cv-details, #parsed-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      document.querySelector('#cv-dropzone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationNotice, setValidationNotice] = useState('');
  const [toastError, setToastError] = useState('');
  const [isInvalidFile, setIsInvalidFile] = useState(false);

  useEffect(() => {
    if (!toastError) return undefined;
    const timer = window.setTimeout(() => setToastError(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toastError, isInvalidFile]);

  const resetUploadState = () => {
    setFile(null);
    setValidationNotice('');
    setToastError('');
    setIsInvalidFile(false);
    setUploadProgress(0);
    localStorage.removeItem('lastAnalyzedCvId');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runCVAnalysis = async (selectedFile) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setValidationNotice('Please sign in again before uploading your CV.');
      showError('Please sign in again before uploading your CV.');
      scrollToFeedback('error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setValidationNotice('');

    try {
      const formData = new FormData();
      formData.append('cv', selectedFile);
      if (user?.id) formData.append('userId', String(user.id));

      const xhr = new XMLHttpRequest();
      const uploadResult = await new Promise((resolve, reject) => {
        xhr.open('POST', '/api/cv/upload-and-analyze');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.responseText });
        xhr.onerror = () => reject(new Error('CV upload failed.'));
        xhr.send(formData);
      });
      const data = JSON.parse(uploadResult.body || '{}');
      if (!uploadResult.ok) {
        const uploadError = new Error(data.message || 'CV upload failed.');
        uploadError.status = uploadResult.status;
        throw uploadError;
      }

      if (data.is_cv === false || data.data?.is_cv === false) {
        showInvalidFileToast(data.message);
        return;
      }

      if (data.success && data.data?.id) localStorage.setItem('lastAnalyzedCvId', String(data.data.id));
      if (onUploadSuccess) onUploadSuccess(data.data || data);
      else navigate('/cv-analysis', { state: { analysis: data.data } });
      showSuccess('✓ CV uploaded and analyzed successfully! Review your details below.');
      scrollCvFeedback('success');
    } catch (uploadError) {
      if (uploadError.status === 422 || /invalid|does not contain|not a cv|resume\/cv/i.test(uploadError.message || '')) {
        showInvalidFileToast(uploadError.message);
      } else {
        setToastError(uploadError.message || 'Unable to analyze your CV. Please try again.');
        showError('⚠️ Upload failed. Please upload a valid PDF or DOCX file (max 5MB).');
        scrollCvFeedback('error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setValidationNotice('');
    setToastError('');
    setIsInvalidFile(false);
    if (!selectedFile) return;

    const extension = `.${selectedFile.name.split('.').pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setValidationNotice('Unsupported file type. Please upload a PDF or DOCX file.');
      showError('⚠️ Upload failed. Please upload a valid PDF or DOCX file (max 5MB).');
      scrollCvFeedback('error');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setValidationNotice(`File size must be under ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      showError('⚠️ Upload failed. Please upload a valid PDF or DOCX file (max 5MB).');
      scrollCvFeedback('error');
      return;
    }

    setFile(selectedFile);
    runCVAnalysis(selectedFile);
  };

  const showInvalidFileToast = (message) => {
    setIsInvalidFile(true);
    setToastError(message || 'Invalid Document - Not a Candidate CV. A valid CV must contain all 4 sections: Contact Details, Work Experience, Education, and Skills.');
    showError('⚠️ Upload failed. Please upload a valid PDF or DOCX file (max 5MB).');
    scrollCvFeedback('error');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleContinue = async () => {
    if (!file || isInvalidFile) {
      setValidationNotice(
        isInvalidFile ? 'Please replace this invalid document before continuing.' : 'Please upload your CV first, or skip this step for now using the button below.'
      );
      showError('⚠️ Upload failed. Please upload a valid PDF or DOCX file (max 5MB).');
      scrollCvFeedback('error');
      return;
    }

    await runCVAnalysis(file);
  };

  const handleSkipAction = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, onboardingCvUploaded: true, cvSkipped: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.removeItem('pending_cv_data');
    localStorage.removeItem('candidateProfile');
    localStorage.removeItem('cvUploaded');

    if (onSkip) {
      onSkip();
    } else {
      navigate('/seeker/personal-info', {
        replace: true,
        state: { onboarding: true, skippedCv: true, fromCvUpload: true },
      });
    }
  };

  return (
    <main className="min-h-[85vh] bg-slate-50/70 px-4 py-8 sm:px-6 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        <aside className="relative min-h-112 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/10 sm:min-h-136 lg:min-h-full">
          <img src={cvImage} alt="Professional CV preview" className="absolute inset-0 h-full w-full scale-105 object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-left sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Your career, clearly presented</p>
            <h2 className="mt-3 max-w-sm text-2xl font-black leading-tight text-white sm:text-3xl">Turn your experience into your next opportunity.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">Upload a clear CV and let our AI highlight your strengths, skills, and best-fit roles.</p>
          </div>
        </aside>

        <section className="w-full rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-900/5 sm:p-12">
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Upload Your Resume
        </h1>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Your CV is your first impression
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
          Our AI analyzes your CV in seconds and helps match you with the most relevant job opportunities. If you do not have a CV ready yet, you can skip this step for now and continue to the next stage.
        </p>

        {validationNotice && !isInvalidFile && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-left text-xs font-bold text-amber-800 shadow-sm animate-[fadeIn_0.2s_ease-out] sm:text-sm" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <span className="leading-relaxed">{validationNotice}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(event) => handleFileSelect(event.target.files?.[0])}
        />

        {!file ? (
          <div
            id="cv-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-8 flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
              isDragging
                ? 'scale-[0.99] border-blue-600 bg-blue-50 ring-4 ring-blue-500/15'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-500 hover:bg-blue-50/30'
            }`}
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-600 text-white shadow-xl shadow-blue-500/25 transition-transform duration-300 hover:scale-110 sm:h-20 sm:w-20">
              <UploadCloud className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h3 className="text-sm font-black text-slate-900 sm:text-base">
              Drag and drop your CV here or click to browse
            </h3>
            <p className="mt-2 text-xs font-semibold text-slate-400 sm:text-sm">
              Supported formats: <span className="font-black text-slate-500">PDF, DOCX, JPG, PNG, WEBP</span> (up to 10MB)
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-blue-600 shadow-sm">
              <FileCheck className="h-4 w-4" />
              <span>Select a file from your computer</span>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border-2 border-blue-200 bg-blue-50/70 p-5 text-left shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-black text-slate-900 sm:text-base">{file.name}</h4>
                  <p className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${isInvalidFile ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isInvalidFile ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    <span>{isInvalidFile ? 'Invalid CV' : `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={resetUploadState}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                aria-label="Remove selected CV"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={resetUploadState}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Replace CV</span>
            </button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 sm:text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Your information is protected with strong privacy and security measures (Encrypted &amp; Secure)</span>
        </div>

        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={isUploading || isInvalidFile}
            onClick={handleContinue}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{uploadProgress < 100 ? `Uploading your CV... ${uploadProgress}%` : 'Analyzing your CV with AI...'}</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <div>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleSkipAction}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 sm:text-sm"
            >
              Skip for now
            </button>
          </div>
        </div>
        </section>
      </div>

      {toastError && (
        <div className="fixed right-5 top-5 z-50 w-[calc(100%-2.5rem)] max-w-md animate-[slideIn_.25s_ease-out]" role="alert">
          <div className="flex items-start gap-3 rounded-xl border border-red-300 border-l-4 border-l-red-500 bg-white p-4 shadow-xl">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">Invalid Document</h4>
              <p className="mt-1 text-xs leading-5 text-slate-600">The uploaded file does not contain CV content. Please upload a valid resume.</p>
            </div>
            <button type="button" onClick={() => setToastError('')} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss invalid document notification"><X className="h-4 w-4" /></button>
          </div>
          <div className="h-1 origin-left animate-[toastProgress_5s_linear] rounded-b-xl bg-red-500" />
        </div>
      )}
    </main>
  );
};

export default CvUploadScreen;
