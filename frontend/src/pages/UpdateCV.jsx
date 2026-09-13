import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCandidateProfile,
  updateCandidateProfileManual,
  uploadCandidateCV,
} from '../services/candidateApi';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  summary: '',
};

export default function UpdateCV() {
  const navigate = useNavigate();
  const [candidateId, setCandidateId] = useState('');
  const [profile, setProfile] = useState({
    ...emptyForm,
    cvUploaded: false,
    cvFileName: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentCandidateId = user.id || user._id || user.candidateId || user.userId || '';
      setCandidateId(currentCandidateId);
    } catch {
      setCandidateId('');
    }
  }, []);

  useEffect(() => {
    if (!candidateId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    getCandidateProfile(candidateId)
      .then((data) => {
        if (!active) return;
        const nextProfile = {
          fullName: data?.name || data?.fullName || '',
          email: data?.email || '',
          phone: data?.phone || '',
          location: data?.location || '',
          headline: data?.headline || '',
          summary: data?.bio || data?.summary || '',
          cvUploaded: Boolean(data?.cvUploaded || data?.cvFileName || data?.resumeUploaded),
          cvFileName: data?.cvFileName || data?.resumeName || '',
        };
        setProfile(nextProfile);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError?.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [candidateId]);

  const hasExistingCv = useMemo(() => Boolean(profile.cvUploaded || profile.cvFileName), [profile]);

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose a CV file before continuing.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      await uploadCandidateCV(candidateId, selectedFile);
      setProfile((current) => ({
        ...current,
        cvUploaded: true,
        cvFileName: selectedFile.name,
      }));
      setSuccess('CV uploaded successfully.');
      setSelectedFile(null);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to upload CV.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualSave = async (event) => {
    event.preventDefault();
    if (!candidateId) {
      setError('Candidate session is missing. Please sign in again.');
      return;
    }

    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');

      await updateCandidateProfileManual(candidateId, {
        name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        headline: profile.headline,
        bio: profile.summary,
      });

      setSuccess('Profile updated successfully.');
      navigate('/profile/edit');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-6 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-700">AI-powered CV analysis</span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900">
            {hasExistingCv ? 'Update your CV' : 'Upload your CV'}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {hasExistingCv
              ? 'Choose a new file to replace your current CV.'
              : 'Upload your CV to unlock personalized job matches and faster applications.'}
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.45fr_0.9fr] lg:p-10">
          <div className="space-y-6">
            {hasExistingCv && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Current CV
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{profile.cvFileName}</p>
                    <p className="text-xs text-slate-500">Uploaded and ready to use</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[1.75rem] border-2 border-dashed border-sky-200 bg-sky-50/60 p-6 sm:p-10">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                  <UploadCloud className="h-10 w-10" />
                </div>

                <h2 className="text-2xl font-black text-slate-900">
                  {selectedFile ? selectedFile.name : 'Choose a new CV'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedFile
                    ? 'Your new CV is ready to upload.'
                    : 'Drag and drop or browse from your device.'}
                </p>

                <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-400/20 transition hover:bg-sky-600">
                  {hasExistingCv ? 'Choose New CV' : 'Choose CV file'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  />
                </label>

                <p className="mt-4 text-xs text-slate-500">PDF, DOC or DOCX · Maximum 10MB</p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Your CV stays private and secure
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? 'Uploading...' : hasExistingCv ? 'Replace CV' : 'Upload CV'}
                {!uploading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-black">Your Profile</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {hasExistingCv
                ? 'Your CV is already connected to your profile.'
                : 'Your CV is required to complete your profile and improve job matching.'}
            </p>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
            >
              View Resume
            </button>

            <form onSubmit={handleManualSave} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Full name
                </label>
                <input
                  value={profile.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Email
                </label>
                <input
                  value={profile.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Phone
                </label>
                <input
                  value={profile.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="+251 9xx xxx xxx"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Location
                </label>
                <input
                  value={profile.location}
                  onChange={(event) => updateField('location', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Addis Ababa"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Headline
                </label>
                <input
                  value={profile.headline}
                  onChange={(event) => updateField('headline', event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Summary
                </label>
                <textarea
                  rows={4}
                  value={profile.summary}
                  onChange={(event) => updateField('summary', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  placeholder="Tell employers a little about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>Continue manually <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
