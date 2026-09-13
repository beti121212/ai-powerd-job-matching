import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import { getUserDestination, removeStoredAccount } from '../utils/authSession';

const displayName = (user) => user?.name || user?.full_name || user?.email?.split('@')[0] || 'Your account';

export default function AccountSelectionModal({ accounts, onSelect, onAnotherAccount, onCreateAccount, onClose }) {
  const [visibleAccounts, setVisibleAccounts] = useState(accounts);
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[500px] overflow-y-auto rounded-[24px] border border-slate-200 bg-white px-4 py-5 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:px-7 sm:py-7" role="dialog" aria-modal="true" aria-labelledby="account-selection-title">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-800 hover:bg-slate-100 sm:right-5 sm:top-5"><X className="h-6 w-6 sm:h-7 sm:w-7" /></button>
        <div className="mx-auto max-w-[470px] text-center">
          <h2 id="account-selection-title" className="text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl">Welcome back</h2>
          <p className="mt-3 text-sm text-slate-900 sm:mt-4 sm:text-lg">Choose an account to continue.</p>
          <div className="mt-6 space-y-3 sm:mt-7">
            {visibleAccounts.map((account) => {
              const name = displayName(account);
              const initials = name.slice(0, 2).toUpperCase();
              return <div key={account.email} role="button" tabIndex={0} onClick={() => onSelect(account, getUserDestination(account))} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(account, getUserDestination(account)); }} className="flex w-full cursor-pointer items-center gap-3 rounded-[24px] border-2 border-slate-950 px-3 py-2.5 text-left transition hover:bg-[var(--brand-soft)] sm:gap-4 sm:px-4 sm:py-3">
                {account.avatarUrl || account.avatar_url ? <img src={account.avatarUrl || account.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-base text-white sm:h-14 sm:w-14 sm:text-xl">{initials}</span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-base font-semibold text-slate-950 sm:text-xl">{name}</span><span className="mt-1 block truncate text-xs text-slate-500 sm:text-base">{account.email}</span></span>
                <button type="button" aria-label={`Remove ${account.email}`} onClick={(event) => { event.stopPropagation(); removeStoredAccount(account.email); setVisibleAccounts((current) => current.filter((item) => item.email !== account.email)); }} className="shrink-0 rounded-full p-1 text-slate-950 hover:bg-slate-100"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
              </div>;
            })}
          </div>
          <div className="my-5 flex items-center gap-3 text-sm font-bold text-slate-950 sm:my-6 sm:gap-4 sm:text-base"><span className="h-px flex-1 bg-slate-300" />OR<span className="h-px flex-1 bg-slate-300" /></div>
          <div className="space-y-2.5"><button type="button" onClick={onAnotherAccount} className="min-h-11 w-full rounded-[24px] border border-slate-300 px-4 text-base font-bold text-slate-950 hover:bg-[var(--brand-soft)] sm:min-h-12">Log in to another account</button><button type="button" onClick={onCreateAccount} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[24px] border border-slate-300 px-4 text-base font-bold text-slate-950 hover:bg-[var(--brand-soft)] sm:min-h-12"><Plus className="h-4 w-4" />Create account</button></div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
