import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  Menu,
  UserPlus,
  X,
  ChevronDown,
  Play,
  Repeat,
} from 'lucide-react';

// የፎቶ Path — use local asset fallback in project
import siteLogo from '../pages/images/logo1.png';
import { useAuth } from '../context/AuthContext';
import LogoutFlowModals from './LogoutFlowModals';
import { getNextOnboardingStep } from '../utils/applicationFlow';
import API from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setSession, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutSession, setLogoutSession] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  // የ Role ዓይነቶች ማረጋገጫ
  const role = (user?.role || user?.userType || '').toString().trim().toLowerCase().replace(/[\s-]+/g, '_');
  const isEmployer = ['employer', 'company', 'recruiter'].includes(role);
  const isAdmin = role === 'admin';
  const isSeekerDashboardPage = ['/dashboard', '/seeker-dashboard', '/seekerDashboard'].includes(location.pathname);
  const displayName = user?.name || user?.full_name || user?.email || 'User';
  const avatarUrl = user?.avatarUrl || user?.avatar_url;

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  const isOnboardingInProgress = () => {
    const storedUser = getStoredUser();
    const role = String(storedUser.role || user?.role || 'job_seeker').toLowerCase();
    const seekerRoles = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'];
    const employerRoles = ['employer', 'company', 'recruiter'];

    if (seekerRoles.includes(role)) {
      const hasUploadedCv = Boolean(localStorage.getItem('pending_cv_data') || storedUser.onboardingCvUploaded || storedUser.has_cv || storedUser.cvFileName);
      const isProfileComplete = Boolean(storedUser.profileCompleted || storedUser.onboardingProfileCompleted || storedUser.profileComplete);
      return !isProfileComplete || !hasUploadedCv;
    }

    if (employerRoles.includes(role)) {
      return !Boolean(storedUser.companyVerified || storedUser.companyProfileComplete);
    }

    return false;
  };

  const getRoleLabel = (roleName) => {
    const normalized = String(roleName || '').toLowerCase().replace(/[\s-]+/g, '_');
    if (['employer', 'company', 'recruiter'].includes(normalized)) return 'Employer';
    if (['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'].includes(normalized)) return 'Job Seeker';
    return 'Job Seeker';
  };

  const handleResumeProgress = async () => {
    const storedUser = getStoredUser();
    const activeRole = String(storedUser.role || localStorage.getItem('activeRole') || user?.role || 'job_seeker').toLowerCase().replace(/[\s-]+/g, '_');
    const seekerRoles = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'];
    const employerRoles = ['employer', 'company', 'recruiter'];

    setProfileMenuOpen(false);

    if (seekerRoles.includes(activeRole)) {
      try {
        const { data } = await API.get('/seeker/profile-status');
        const step = String(data?.onboarding_step || 'cv_upload');
        const cvSkipped = Boolean(data?.cv_skipped);
        const profileCompleted = Boolean(data?.profile_completed);

        if (profileCompleted || step === 'completed') {
          navigate('/seeker-dashboard', { replace: true });
        } else if (step === 'personal_info' || cvSkipped) {
          console.log('Navigating from Continue button to personal-info');
          navigate('/seeker/personal-info', { replace: true });
        } else {
          navigate('/seeker/cv-upload', { replace: true });
        }
        return;
      } catch (error) {
        console.warn('Profile status fallback used:', error?.message || error);
      }

      const localStep = String(localStorage.getItem('onboarding_step') || '').trim().toLowerCase();
      const isCvSkipped = String(localStorage.getItem('cv_skipped') || '').toLowerCase() === 'true';
      const localProfileComplete = Boolean(storedUser.profileCompleted || storedUser.onboardingProfileCompleted || storedUser.profileComplete || localStorage.getItem('userProfile'));

      if (localProfileComplete || localStep === 'completed') {
        navigate('/seeker-dashboard', { replace: true });
      } else if (localStep === 'personal_info' || isCvSkipped) {
        console.log('Navigating from Continue button to personal-info');
        navigate('/seeker/personal-info', { replace: true });
      } else {
        navigate('/seeker/cv-upload', { replace: true });
      }
      return;
    }

    if (employerRoles.includes(activeRole)) {
      const isCompanyVerified = Boolean(storedUser.companyVerified || storedUser.companyProfileComplete);
      if (isCompanyVerified) {
        navigate('/employer-dashboard', { replace: true });
      } else {
        navigate('/employer/onboarding', { replace: true });
      }
      return;
    }

    navigate(getNextOnboardingStep(), { replace: true });
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setProfileMenuOpen((open) => !open);
  };

  const resumeOnboarding = () => {
    handleResumeProgress();
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((open) => !open);
  };

  const handleSwitchRole = () => {
    setProfileMenuOpen(false);
    localStorage.removeItem('activeRole');
    navigate('/role-selection', { replace: true });
  };

  const goToDashboard = () => {
    setProfileMenuOpen(false);
    navigate(isEmployer ? '/employer/dashboard' : isAdmin ? '/admin-dashboard' : '/dashboard');
  };
  const handleLogout = () => {
    setProfileMenuOpen(false);
    setLogoutSession({ token, user });
    setLogoutOpen(true);
  };

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', closeProfileMenu);
    return () => document.removeEventListener('mousedown', closeProfileMenu);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all w-full">
      {/* Container: px-4 sm:px-6 lg:px-8 በመጠቀም ወደ ግራ እና ቀኝ ዳር እንዲጠጋ ተደርጓል */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between gap-4">

        {/* BRAND LOGO - ሙሉ በሙሉ ወደ ግራ */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-950 shadow-md shadow-blue-500/10 transition-transform duration-200 group-hover:scale-[1.02] sm:h-20 sm:w-20">
            <img
              src={siteLogo}
              alt="AI Job Match"
              className="h-full w-full object-contain object-center"
            />
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS - mr-auto ml-6/ml-10 በመጠቀም ወደ ግራ ተጠግተዋል፣ text-lg በመጠቀም መጠናቸው ጨምሯል */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 mr-auto ml-6 xl:ml-10">

          <Link
            to="/"
            className={`relative py-1 text-base xl:text-lg font-bold tracking-wide transition-colors duration-200 group ${isActive('/') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
          >
            Home
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transition-transform duration-300 origin-left ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
          </Link>

          <Link
            to="/jobs"
            className={`relative py-1 text-base xl:text-lg font-bold tracking-wide transition-colors duration-200 group ${isActive('/jobs') || isActive('/explorejobs') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
          >
            Explore Jobs
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transition-transform duration-300 origin-left ${isActive('/jobs') || isActive('/explorejobs') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
          </Link>

          <Link
            to="/how-it-works"
            className={`relative py-1 text-base xl:text-lg font-bold tracking-wide transition-colors duration-200 group ${isActive('/how-it-works') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
          >
            How It Works
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transition-transform duration-300 origin-left ${isActive('/how-it-works') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
          </Link>

          <Link
            to="/about"
            className={`relative py-1 text-base xl:text-lg font-bold tracking-wide transition-colors duration-200 group ${isActive('/about') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
          >
            About
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transition-transform duration-300 origin-left ${isActive('/about') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
          </Link>

          <Link
            to="/contact"
            className={`relative py-1 text-base xl:text-lg font-bold tracking-wide transition-colors duration-200 group ${isActive('/contact') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
          >
            Contact
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full transition-transform duration-300 origin-left ${isActive('/contact') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
          </Link>

          {/* ተጠቃሚው Login ካደረገ የሚታዩ Dashboard Links */}
          {isAuthenticated && isEmployer && (
            <Link to="/employer-dashboard" className="text-xs font-extrabold bg-indigo-50 text-indigo-600 px-3.5 py-1.5 rounded-full hover:bg-indigo-100 transition flex items-center gap-2 shrink-0">
              <LayoutDashboard className="w-4 h-4" />
              <span>Employer dashboard</span>
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin-dashboard" className="text-xs font-extrabold bg-purple-50 text-purple-600 px-3.5 py-1.5 rounded-full hover:bg-purple-100 transition flex items-center gap-2 shrink-0">
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin dashbord</span>
            </Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0 ml-auto">
          {isAuthenticated && (
            <div ref={profileMenuRef} className="relative">
              <div className="flex min-h-11 items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                <button
                  id="user-avatar-circle"
                  type="button"
                  onClick={handleAvatarClick}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700 shadow-sm ring-2 ring-white transition hover:bg-blue-200"
                  aria-label="Resume progress shortcut"
                >
                  <span className="select-none">Y</span>
                </button>
                <button type="button" onClick={toggleProfileMenu} className="flex items-center gap-1.5 text-slate-700" aria-expanded={profileMenuOpen} aria-haspopup="menu" aria-label="Open account menu">
                  <span className="max-w-40 truncate font-bold text-slate-700">{displayName}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl" role="menu">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{displayName}</span>
                      <span className="mt-1 inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">{getRoleLabel(role)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setProfileMenuOpen(false); handleResumeProgress(); }} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700" role="menuitem">
                    <Play className="h-4 w-4" />
                    <span>Continue Profile Setup</span>
                  </button>
                  <button type="button" onClick={handleSwitchRole} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-100" role="menuitem">
                    <Repeat className="h-4 w-4" />
                    <span>Switch Role</span>
                  </button>
                  <button type="button" onClick={handleLogout} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600 transition hover:bg-red-50" role="menuitem">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {!isAuthenticated && !isSeekerDashboardPage && (
            <>
              <Link to="/login" className="brand-button text-base px-5 xl:px-6 py-2.5"><LogIn className="w-5 h-5 text-blue-600" /><span>Log In</span></Link>
              <Link to="/register" className="brand-button text-base px-6 xl:px-7 py-2.5"><UserPlus className="w-5 h-5" /><span>Sign Up</span></Link>
            </>
          )}
        </div>

        {/* MOBILE & TABLET HAMBURGER MENU BUTTON */}
        <div className="flex items-center lg:hidden ml-auto">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7 text-blue-600" />
            ) : (
              <Menu className="w-7 h-7 text-slate-800" />
            )}
          </button>
        </div>

      </div>

      {/* MOBILE & TABLET DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 shadow-xl w-full">
          <div className="flex flex-col gap-2 w-full">

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              Home
            </Link>

            <Link
              to="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive('/jobs') || isActive('/explorejobs') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              Explore Jobs
            </Link>

            <Link
              to="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive('/how-it-works') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              How It Works
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-base transition-colors ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
            >
              Contact
            </Link>

            {/* Mobile User Consoles */}
            {isAuthenticated && isEmployer && (
              <Link
                to="/employer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-2 my-1 px-4 py-3 rounded-xl text-sm font-extrabold bg-indigo-50 text-indigo-600 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Employer dashboard</span>
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mx-2 my-1 px-4 py-3 rounded-xl text-sm font-extrabold bg-purple-50 text-purple-600 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin dashboard</span>
              </Link>
            )}

            {isAuthenticated && (
              <div ref={profileMenuRef} className="relative pt-3 mt-2 border-t border-slate-100">
                <button type="button" onClick={handleResumeProgress} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" aria-expanded={profileMenuOpen} aria-haspopup="menu" aria-label="Open account menu">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">{displayName.charAt(0).toUpperCase()}</div>}
                  <span className="flex-1 truncate">{displayName}</span><ChevronDown className={`h-4 w-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileMenuOpen && <div className="mt-1 space-y-1 px-1"><button type="button" onClick={() => { handleResumeProgress(); setIsMobileMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"><Play className="w-5 h-5" /><span>{isOnboardingInProgress() ? 'Continue Profile Setup' : 'Dashboard / My Profile'}</span></button><button type="button" onClick={() => { goToDashboard(); setIsMobileMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"><LayoutDashboard className="w-5 h-5" /><span>Go to Dashboard</span></button><button type="button" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="w-5 h-5" /><span>Log Out</span></button></div>}
              </div>
            )}
            {!isAuthenticated && !isSeekerDashboardPage && (
              <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="brand-button w-full text-base"><LogIn className="w-5 h-5 text-blue-600" /><span>Log In</span></Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="brand-button w-full text-base"><UserPlus className="w-5 h-5" /><span>Sign Up</span></Link>
              </div>
            )}

          </div>
        </div>
      )}

      {logoutOpen && <LogoutFlowModals
        user={logoutSession?.user}
        token={logoutSession?.token}
        logout={logout}
        setSession={setSession}
        navigate={navigate}
        onClose={() => setLogoutOpen(false)}
      />}
    </header>
  );
}