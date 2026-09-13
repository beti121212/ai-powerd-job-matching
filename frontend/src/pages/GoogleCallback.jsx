import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserDestination } from '../utils/authSession';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const encodedUser = searchParams.get('user');
    const step = searchParams.get('step');

    if (!token) {
      navigate('/login?error=auth_failed', { replace: true });
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);

    let normalizedUser = null;

    if (encodedUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(encodedUser));
        normalizedUser = {
          ...parsedUser,
          role: parsedUser.role || 'job_seeker',
          onboardingRoleSelected: parsedUser.onboardingRoleSelected ?? false,
          onboardingCvUploaded: parsedUser.onboardingCvUploaded ?? false,
          onboardingProfileCompleted: parsedUser.onboardingProfileCompleted ?? false,
          isVerified: !!(parsedUser.isVerified ?? parsedUser.is_verified),
          auth_provider: parsedUser.auth_provider || 'google',
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (error) {
        console.error('Failed to parse Google callback user payload:', error);
      }
    }

    const stepMap = {
      select_role: '/select-role',
      'seeker/cv-upload': '/seeker/cv-upload',
      'seeker/personal-info': '/seeker/personal-info',
      'employer/onboarding': '/employer/onboarding',
      'employer/dashboard': '/employer/dashboard',
      dashboard: '/dashboard',
      'seeker/dashboard': '/seeker/dashboard',
    };

    if (step && stepMap[step]) {
      navigate(stepMap[step], { replace: true });
      return;
    }

    if (normalizedUser) {
      const destination = getUserDestination(normalizedUser);
      navigate(destination || '/select-role', { replace: true });
      return;
    }

    navigate('/select-role', { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-600 font-medium text-sm">Signing in with Google...</p>
      </div>
    </div>
  );
}