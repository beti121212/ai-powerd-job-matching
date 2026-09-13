import { useState } from 'react';
import LogoutAccountModal from './LogoutAccountModal';
import AccountSelectionModal from './AccountSelectionModal';
import { getStoredAccounts, getUserDestination } from '../utils/authSession';

export default function LogoutFlowModals({ user, token, logout, setSession, navigate, onClose }) {
  const [activeModal, setActiveModal] = useState('logoutConfirmation');
  const [accounts] = useState(() => {
    const storedAccounts = getStoredAccounts();
    return user?.email && !storedAccounts.some((account) => account.email === user.email)
      ? [user, ...storedAccounts]
      : storedAccounts;
  });

  const closeFlow = () => {
    setActiveModal(null);
    onClose();
  };

  const handleLogout = () => {
    logout();
    setActiveModal('accountSelection');
  };

  const handleAccountSelect = (account) => {
          if (!account.token) return;
          setSession({ token: account.token, user: account });
    closeFlow();
    navigate(getUserDestination(account), { replace: true });
  };

  const handleAccountSelectionClose = () => {
    navigate('/login', { replace: true });
    closeFlow();
  };

  return (
    <>
      {activeModal === 'logoutConfirmation' && <LogoutAccountModal user={user} onClose={closeFlow} onLogout={handleLogout} />}
      {activeModal === 'accountSelection' && <AccountSelectionModal accounts={accounts} onClose={handleAccountSelectionClose} onSelect={handleAccountSelect} onAnotherAccount={() => { navigate('/login', { replace: true }); closeFlow(); }} onCreateAccount={() => { navigate('/register'); closeFlow(); }} />}
    </>
  );
}
