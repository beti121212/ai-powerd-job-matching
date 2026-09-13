import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const getDisplayName = (user) => user?.name || user?.full_name || user?.email?.split('@')[0] || 'Your account';

export default function LogoutAccountModal({ user, onLogout, onClose }) {
  const displayName = getDisplayName(user);
  const email = user?.email || 'Signed-in account';
  const avatarUrl = user?.avatarUrl || user?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return createPortal(
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-4"
        role="presentation"
        onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      >
        <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-slate-200 bg-white px-4 py-6 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:px-9 sm:py-8" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
          <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-800 transition hover:bg-slate-100 sm:right-5 sm:top-5">
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
          <div className="mx-auto max-w-[470px] text-center">
            <h2 id="logout-confirm-title" className="text-[2.1rem] font-medium tracking-tight text-slate-950 sm:text-[42px]">Are you sure you want to log out?</h2>
            <div className="mt-8 flex w-full items-center gap-3 rounded-[26px] border border-slate-300 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-base font-medium text-white sm:h-14 sm:w-14 sm:text-xl">{initials}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-semibold text-slate-950 sm:text-[28px]">{displayName}</span>
                <span className="mt-1 block truncate text-sm text-slate-500 sm:text-lg">{email}</span>
              </span>
            </div>
            <div className="mt-8 space-y-3 sm:mt-9">
              <button type="button" onClick={onLogout} className="flex min-h-[56px] w-full items-center justify-center rounded-[30px] bg-[var(--brand-deep)] px-6 text-lg font-bold text-white transition hover:bg-[var(--brand-primary)] sm:min-h-[60px] sm:text-xl">Log out</button>
              <button type="button" onClick={onClose} className="flex min-h-[56px] w-full items-center justify-center rounded-[30px] border border-slate-300 px-6 text-lg font-bold text-[var(--brand-deep)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-soft)] sm:min-h-[60px] sm:text-xl">Cancel</button>
            </div>
          </div>
        </div>
      </div>,
    document.body,
  );
}
