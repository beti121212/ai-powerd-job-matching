import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast.js';
import { scrollToFeedback } from '../utils/scrollHelper.js';
import { clearUserWorkspace } from '../utils/authSession';
import GoogleAuthButton from '../components/GoogleAuthButton';
import {
  Sparkles, ShieldCheck, Cpu, Lock,
  ArrowRight, Eye, EyeOff, Target, User, Briefcase, RefreshCw, ArrowLeft
} from 'lucide-react';
import EmailInputWithDomains from '../components/EmailInputWithDomains';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const { showSuccess, showError } = useToast();

  // Multi-step Registration State: 1 = Form, 2 = OTP, 3 = Role
  const [step, setStep] = useState(1);

  // Form State (Phone Number Removed)
  const [formData, setFormData] = useState({
    fullName: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    role: '' // 'jobseeker' or 'employer'
  });

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const canResendOtp = otpTimer === 0;

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState(location.state?.message || '');
  const [emailSuggestion, setEmailSuggestion] = useState('');

  const API_URL = import.meta.env.VITE_BACKEND_URL || '/api';

  const formatOtpTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  // OTP Countdown Timer Effect
  useEffect(() => {
    let timer;
    if (step === 2 && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  // Input Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      const [localPart, domain] = value.trim().toLowerCase().split('@');
      const fixes = { 'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'yaho.com': 'yahoo.com', 'outlok.com': 'outlook.com' };
      setEmailSuggestion(localPart && fixes[domain] ? `Did you mean ${localPart}@${fixes[domain]}?` : '');
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input field
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.target.previousSibling;
      if (prevInput) prevInput.focus();
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]{3,60}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\x5B\x5D{};':"\\|,.<>/?]).{6,32}$/;
    const disposableDomains = new Set(['mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com', 'getairmail.com', 'dispostable.com', 'throwawaymail.com', 'mytemp.email', 'temp-mail.org']);
    const email = formData.email.trim().toLowerCase();
    const domain = email.split('@')[1];

    if (!nameRegex.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name must contain letters and spaces only, between 3 and 60 characters.';
    }

    if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    } else if (disposableDomains.has(domain)) {
      newErrors.email = 'Temporary or disposable email addresses are not allowed.';
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 6-32 characters and include a letter, number, and special character.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      showError('Please correct the highlighted fields.');
      scrollToFeedback('error');
    }
    return Object.keys(newErrors).length === 0;
  };

  // STEP 1: Registration Submit & Send OTP
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setApiError('');
    setIsLoading(true);

    try {
      const signupPayload = JSON.stringify({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role || 'job_seeker',
      });
      const configuredSignupUrl = `${API_URL.replace(/\/$/, '')}/auth/signup`;
      let response;
      try {
        response = await fetch(configuredSignupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: signupPayload,
        });
      } catch (requestError) {
        if (configuredSignupUrl === '/api/auth/signup') throw requestError;
        response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: signupPayload,
        });
      }
      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        const fieldErrors = data.errors || {};
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((currentErrors) => ({ ...currentErrors, ...fieldErrors }));
        }
        if (response.status === 409 && data.isAlreadyVerified) {
          navigate('/login', {
            replace: true,
            state: { message: 'This email is already registered. Please log in.' },
          });
          return;
        }
        throw new Error(Object.values(fieldErrors)[0] || data.message || `Unable to create your account (HTTP ${response.status}).`);
      }

      setStep(2);
      setOtpTimer(60);
      setApiSuccess('OTP code sent to your email.');
      showSuccess('Verification code sent successfully.');
    } catch (error) {
      console.error('Registration Error:', error);
      const isNetworkError = error instanceof TypeError && /fetch|network|failed/i.test(error.message || '');
      const message = isNetworkError
        ? 'Unable to reach the signup service. Please make sure the backend is running and try again.'
        : (error.message || 'Unable to create your account. Please try again.');
      setApiError(message);
      showError(message);
      scrollToFeedback('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Send OTP
  const sendOtpRequest = async (email) => {
    try {
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setApiSuccess('OTP code sent to your email.');
      } else {
        setApiError(data.message || 'Failed to send OTP.');
      }
    } catch (otpErr) {
      console.warn("OTP Send Error:", otpErr);
      setApiError('Failed to send OTP code. Please try again.');
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setApiError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setApiError('');
    setApiSuccess('');

    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otpCode,
          role: formData.role,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        if (!data.token || !data.user) throw new Error('Authentication response was incomplete.');
        clearUserWorkspace();
        const verifiedUser = {
          ...data.user,
          onboardingRoleSelected: false,
          onboardingCvUploaded: false,
          onboardingProfileCompleted: false,
          is_verified: true,
          otpVerified: true,
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        localStorage.setItem('currentUser', JSON.stringify(verifiedUser));
        setSession({ token: data.token, user: verifiedUser });
        navigate('/select-role');
      } else {
        setApiError(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setApiError('Unable to verify the OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setIsLoading(true);
    setApiError('');
    setApiSuccess('');
    await sendOtpRequest(formData.email.trim());
    setOtpTimer(60);
    setOtp(['', '', '', '', '', '']);
    setIsLoading(false);
  };

  // STEP 3: Complete Registration with Selected Role
  const handleSelectRole = async (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    setIsLoading(true);
    setApiError('');

    try {
      const normalizedRole = selectedRole === 'jobseeker' ? 'job_seeker' : selectedRole;
      const roleResponse = await fetch(`${API_URL.replace(/\/$/, '')}/auth/select-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: normalizedRole,
        }),
      });
      const roleData = await roleResponse.json().catch(() => ({}));
      if (!roleResponse.ok || !roleData.user || !roleData.token) throw new Error(roleData.message || 'Unable to save role');

      setFormData((prev) => ({ ...prev, role: normalizedRole }));
      setStep(2);
      setOtpTimer(60);
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookRegister = () => {
    window.location.href = `${API_URL.replace(/\/$/, '')}/auth/facebook`;
  };

  return (
    <div className="min-h-screen w-full bg-brand-soft bg-[radial-gradient(#d0e5f5_1px,transparent_1px)] bg-size-[16px_16px] flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 font-sans overflow-x-hidden">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-300 my-auto">

        {/* LEFT SIDE: Info Section */}
        <div className="md:col-span-5 brand-gradient p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center shadow-lg shadow-[#2b73a4]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight tracking-wide">
                  SmartRecruit <span className="text-white/80">AI</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-400">Deep CV Inspector</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs text-white shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Step {step} of 3</span>
            </div>
          </div>

          <div className="my-6 sm:my-8 z-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
              {step === 1 && <>Create Account <br /><span className="text-white/80">Smart Registration</span></>}
              {step === 2 && <>Verify Email <br /><span className="text-white/80">Security Check</span></>}
              {step === 3 && <>Choose Role <br /><span className="text-white/80">Tailored Experience</span></>}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Our AI platform matches top talents with top companies automatically using dynamic CV parsing.
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-sm">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/15 text-white border border-white/25 shrink-0">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">AI Match Score & Skill Extraction</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Scans CV text to score compatibility & list missing skills.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-sm">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/15 text-white border border-white/25 shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-100">Career Goals Alignment</h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Tailors job recommendations based on salary & title goals.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 flex items-center gap-3 z-10">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 border border-white/35 flex items-center justify-center font-bold text-white text-xs shrink-0">
              100%
            </div>
            <div>
              <p className="text-xs text-slate-200 font-medium leading-snug">
                "Instant parsing & high-precision skill verification active."
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic Form (Step 1, 2, 3) */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center relative min-h-full">

          {/* API Notifications */}
          {apiError && (
            <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
              <span>{apiError}</span>
            </div>
          )}

          {apiSuccess && (
            <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              {apiSuccess}
            </div>
          )}

          {/* STEP 1: Registration Credentials Form */}
          {step === 1 && (
            <>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Enter your credentials to get started</p>
              </div>

              <form onSubmit={handleSubmitStep1} noValidate className="space-y-4 sm:space-y-5">
                {/* FULL NAME */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative group flex items-center">
                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className={`w-full text-base sm:text-lg pl-12 pr-4 py-5 rounded-xl border bg-slate-100 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.fullName ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
                        }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs font-bold text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <EmailInputWithDomains
                    value={formData.email}
                    onChange={(value) => handleChange({ target: { name: 'email', value } })}
                    error={errors.email}
                    suggestion={emailSuggestion}
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative group flex items-center">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className={`w-full text-base sm:text-lg pl-12 pr-12 py-5 rounded-xl border bg-slate-100 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.password ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs font-bold text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group flex items-center">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full text-base sm:text-lg pl-12 pr-12 py-5 rounded-xl border bg-slate-100 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50/20' : 'border-slate-300 hover:border-slate-400'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs font-bold text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* PRIMARY SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 sm:py-4 px-6 brand-gradient hover:opacity-90 text-white rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-[#56a2d8]/25 active:scale-[0.98] cursor-pointer mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* SOCIAL BUTTONS */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="mb-5 flex items-center justify-center gap-3">
                  <div className="w-full border-t border-slate-200" />
                  <span className="shrink-0 text-sm font-bold uppercase tracking-widest text-slate-500">OR</span>
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="flex flex-col gap-3">
                  <GoogleAuthButton label="Continue with Google" />
                  <button type="button" onClick={handleFacebookRegister} className="w-full py-3 px-4 brand-bg hover:bg-[#f0f7fc] hover:text-[#2b73a4] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#56a2d8] shadow-sm transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer">
                    <span className="w-6 h-6 rounded-md bg-white text-[#56a2d8] flex items-center justify-center text-lg font-black">f</span>
                    <span>Sign up with Facebook</span>
                  </button>
                </div>
              </div>

            </>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <div className="py-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to details
              </button>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Enter Verification Code</h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 mb-6">
                We sent a 6-digit code to <span className="text-blue-600 font-bold">{formData.email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-10 sm:w-12 h-12 sm:h-14 text-center font-bold text-lg sm:text-xl rounded-xl border border-slate-300 bg-slate-100 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                    />
                  ))}
                </div>

                <div className="text-center text-xs text-slate-500 font-semibold">
                  {otpTimer > 0 ? (
                    <p>Resend code in <span className="text-blue-600 font-bold">{formatOtpTime(otpTimer)}</span></p>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-bold">
                      OTP expired —
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> ኮድ እንደገና ላክ (Resend OTP)
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpTimer === 0}
                  className="w-full py-3.5 sm:py-4 px-6 brand-bg hover:opacity-90 text-white rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition shadow-lg shadow-[#56a2d8]/25 active:scale-[0.98] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : otpTimer === 0 ? (
                    <span>OTP Expired</span>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Role Selection */}
          {step === 3 && (
            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Select Account Type</h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 mb-6">
                Tell us how you plan to use SmartRecruit AI
              </p>

              <div className="grid sm:grid-cols-2 gap-4 my-6">
                {/* Job Seeker Role */}
                <div
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  aria-label="Select Job Seeker account"
                  onClick={() => !isLoading && handleSelectRole('jobseeker')}
                  onKeyDown={(event) => {
                    if (!isLoading && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      handleSelectRole('jobseeker');
                    }
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/30 cursor-pointer transition-all duration-200 group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1">Job Seeker</h3>
                    <p className="text-xs text-slate-500 font-medium">I want to upload my CV, search for jobs, and get AI career matches.</p>
                  </div>
                  <button type="button" disabled={isLoading} onClick={(event) => { event.stopPropagation(); handleSelectRole('jobseeker'); }} className="mt-4 flex items-center text-xs font-extrabold text-blue-600 disabled:opacity-50">
                    <span>Select Job Seeker</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </button>
                </div>

                {/* Employer Role */}
                <div
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  aria-label="Select Employer account"
                  onClick={() => !isLoading && handleSelectRole('employer')}
                  onKeyDown={(event) => {
                    if (!isLoading && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault();
                      handleSelectRole('employer');
                    }
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover-brand-border hover:bg-brand-soft cursor-pointer transition-all duration-200 group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-brand-soft brand-text flex items-center justify-center mb-4 group-hover:scale-110 transition">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-1">Employer / Hiring Manager</h3>
                    <p className="text-xs text-slate-500 font-medium">I want to post jobs, parse candidate CVs, and hire top tech talent.</p>
                  </div>
                  <button type="button" disabled={isLoading} onClick={(event) => { event.stopPropagation(); handleSelectRole('employer'); }} className="mt-4 flex items-center text-xs font-extrabold brand-text disabled:opacity-50">
                    <span>Select Employer</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOGIN LINK */}
          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm font-semibold text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold brand-text hover:underline transition">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default Register
