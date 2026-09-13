import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { continueApplicationFlow, getPendingApplication } from '../utils/applicationFlow';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Cpu, RefreshCw, ShieldCheck, Sparkles, Target } from 'lucide-react';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setSession } = useAuth();

  const email = location.state?.email || searchParams.get('email') || '';
  const userIdFromUrl = searchParams.get('userId') || null;
  // Read role passed from registration (preferred) or query param 'role'
  const providedRole = location.state?.role || searchParams.get('role') || null;
  const pendingJobId = searchParams.get('jobId') || location.state?.jobId || getPendingApplication()?.jobId || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpInputRefs = useRef([]);

  const formatOtpTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  useEffect(() => {
    otpInputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return undefined;
    const timer = window.setInterval(() => setOtpTimer((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [otpTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (otpTimer === 0) {
      setError('OTP code has expired. Please request a new one.');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('እባክዎን 6 ጊዜ የOTP ቁጥር ያስገቡ።');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/verify-otp', { email, otp: otpCode, role: providedRole });
      if (!data.token || !data.user) throw new Error('Authentication response was incomplete.');
      const verifiedUser = {
        ...data.user,
        onboardingRoleSelected: data.user.onboardingRoleSelected ?? false,
        onboardingCvUploaded: data.user.has_cv ?? false,
        onboardingProfileCompleted: data.user.onboardingProfileCompleted ?? false,
      };
      setSession({ token: data.token, user: verifiedUser });

      const role = data.user.role || providedRole;
      const requiresRoleSelection = data.requiresRoleSelection || !role || role === 'pending';
      if (requiresRoleSelection) {
        const params = new URLSearchParams();
        if (userIdFromUrl) params.set('userId', userIdFromUrl);
        if (pendingJobId) params.set('jobId', pendingJobId);
        navigate(`/select-role${params.toString() ? `?${params.toString()}` : ''}`);
      } else if (['employer', 'company', 'recruiter'].includes(role)) {
        navigate('/employer/dashboard');
      } else if (['admin', 'super_admin'].includes(role)) {
        navigate('/admin/dashboard');
      } else if (verifiedUser.has_cv === false || verifiedUser.onboarding_step === 'cv_upload') {
        navigate('/seeker/cv-upload');
      } else if (pendingJobId) {
        continueApplicationFlow(navigate, { jobId: pendingJobId });
      } else {
        navigate('/select-role');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    try {
      let response;
      try {
        response = await api.post('/send-otp', { email });
      } catch (requestError) {
        if (requestError.response?.status !== 404) throw requestError;
        response = await api.post('/auth/resend-otp', { email });
      }
      if (!response.data?.success) throw new Error(response.data?.message || 'Unable to resend OTP.');
      setOtpTimer(60);
      setOtp(['', '', '', '', '', '']);
      setInfo('A new verification code was sent to your email.');
      setError('');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--brand-soft)] bg-[radial-gradient(#d0e5f5_1px,transparent_1px)] [background-size:16px_16px] px-3 py-6 font-sans sm:p-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl md:grid-cols-12">
        <div className="flex flex-col justify-between bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-deep)] p-6 sm:p-8 md:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Sparkles className="h-5 w-5 text-white" /></div><div><h3 className="text-sm font-bold text-white sm:text-base">SmartRecruit <span className="text-white/80">AI</span></h3><p className="text-[10px] text-white/60 sm:text-xs">Deep CV Inspector</p></div></div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" />Step 2 of 3</div>
          </div>
          <div className="my-8"><h1 className="text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">Verify Email<br /><span className="text-white/80">Security Check</span></h1><p className="mt-3 text-sm leading-relaxed text-blue-100">Our AI platform matches top talents with top companies automatically using dynamic CV parsing.</p><div className="mt-6 space-y-3.5"><div className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-800/60 p-3.5"><div className="rounded-xl border border-white/25 bg-white/15 p-2.5"><Cpu className="h-5 w-5 text-white" /></div><div><h4 className="text-sm font-semibold text-slate-100">AI Match Score &amp; Skill Extraction</h4><p className="mt-0.5 text-xs text-slate-300">Scans CV text to score compatibility &amp; list missing skills.</p></div></div><div className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-800/60 p-3.5"><div className="rounded-xl border border-white/25 bg-white/15 p-2.5"><Target className="h-5 w-5 text-white" /></div><div><h4 className="text-sm font-semibold text-slate-100">Career Goals Alignment</h4><p className="mt-0.5 text-xs text-slate-300">Tailors job recommendations based on salary &amp; title goals.</p></div></div></div></div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/15 text-xs font-bold text-white">100%</div><p className="text-xs font-medium leading-snug text-blue-50">&quot;Instant parsing &amp; high-precision skill verification active.&quot;</p></div>
        </div>
        <div className="flex min-h-[520px] flex-col justify-center bg-white p-6 sm:p-10 md:col-span-7 lg:p-12">
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
          {info && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{info}</div>}
          <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Back to details</button>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Enter Verification Code</h2>
          <p className="mt-1 mb-6 text-xs font-semibold text-slate-500 sm:text-sm">We sent a 6-digit code to <span className="font-bold text-[var(--brand-deep)]">{email || 'your email'}</span></p>
          <form onSubmit={handleSubmit} className="space-y-6"><div className="mx-auto flex max-w-sm items-center justify-between gap-2">{otp.map((digit, index) => <input key={index} type="text" inputMode="numeric" maxLength="1" value={digit} ref={(el) => (otpInputRefs.current[index] = el)} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="h-12 w-10 rounded-xl border border-slate-300 bg-slate-100 text-center text-lg font-bold text-slate-900 outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:h-14 sm:w-12 sm:text-xl" aria-label={`OTP digit ${index + 1}`} />)}</div><div className="text-center text-xs font-semibold text-slate-500">{otpTimer > 0 ? <>Resend code in <span className="font-bold text-[var(--brand-deep)]">{formatOtpTime(otpTimer)}</span></> : <span className="inline-flex items-center gap-1.5 font-bold text-red-600">OTP expired — <button type="button" onClick={handleResendOtp} className="inline-flex items-center gap-1.5 font-bold text-[var(--brand-deep)] hover:underline"><RefreshCw className="h-3.5 w-3.5" /> ኮድ እንደገና ላክ (Resend OTP)</button></span>}</div><button type="submit" disabled={loading || otpTimer === 0} className="w-full rounded-xl bg-[var(--brand-primary)] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-70 sm:py-4">{loading ? 'Verifying...' : otpTimer === 0 ? 'OTP Expired' : 'Verify Code'}</button></form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;