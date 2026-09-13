import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileText, Send } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../hooks/useToast.js';
import { scrollToFeedback } from '../utils/scrollHelper.js';

export default function ApplicationSubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [coverNote, setCoverNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const job = (() => {
    try {
      return JSON.parse(localStorage.getItem('pendingApplicationJob') || 'null');
    } catch {
      return null;
    }
  })();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/applications', { jobId: id, resumeSnapshot: { coverLetter: coverNote } });
      setSubmitted(true);
      showSuccess('✓ Application Submitted Successfully! Taking you to your dashboard...');
      scrollToFeedback('top');
      window.setTimeout(() => navigate('/dashboard', { state: { activeTab: 'applications' } }), 1500);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to submit your application.';
      setError(message);
      showError(message);
      scrollToFeedback('error');
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-5 text-2xl font-black text-slate-900">Application Submitted Successfully</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Your application has been saved. Taking you to My Applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[65vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-9">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[var(--brand-deep)]"><FileText className="h-6 w-6" /></div>
          <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-deep)]">Final step</p><h1 className="mt-1 text-2xl font-black text-slate-900">Submit your application</h1><p className="mt-2 text-sm text-slate-600">{job?.title || `Application for job ${id}`} {job?.company ? `at ${job.company}` : ''}</p></div>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div><label htmlFor="cover-note" className="mb-2 block text-sm font-bold text-slate-800">Short note <span className="font-normal text-slate-500">(optional)</span></label><textarea id="cover-note" rows="5" value={coverNote} onChange={(event) => setCoverNote(event.target.value)} placeholder="Tell the employer why this role is a strong fit..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white" /></div>
          <button type="submit" className="brand-button w-full sm:w-auto"><Send className="h-4 w-4" /> Submit Application <ArrowRight className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}
