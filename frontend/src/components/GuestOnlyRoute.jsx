import { Navigate } from 'react-router-dom';
import { getNextOnboardingStep } from '../utils/applicationFlow';
import { resolveUserRole } from '../utils/authSession';

export default function GuestOnlyRoute({ children }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (!localStorage.getItem('token') || !user) return children;

  const role = resolveUserRole(user);
  const destination = ['job_seeker', 'seeker', 'jobseeker', 'user', 'employee'].includes(role)
    ? getNextOnboardingStep()
    : role === 'admin' || role === 'super_admin'
      ? '/admin-dashboard'
      : '/employer/dashboard';

  return <Navigate to={destination} replace />;
}
