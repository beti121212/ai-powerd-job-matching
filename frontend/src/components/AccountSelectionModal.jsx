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
      <div className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-slate-200 bg-white px-4 py-6 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:px-9 sm:py-8" role="dialog" aria-modal="true" aria-labelledby="account-selection-title">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-800 hover:bg-slate-100 sm:right-5 sm:top-5"><X className="h-6 w-6 sm:h-7 sm:w-7" /></button>
        <div className="mx-auto max-w-[470px] text-center">
          <h2 id="account-selection-title" className="text-[2.1rem] font-medium tracking-tight text-slate-950 sm:text-[42px]">Welcome back</h2>
          <p className="mt-4 text-base text-slate-900 sm:mt-6 sm:text-[22px]">Choose an account to continue.</p>
          <div className="mt-8 space-y-3 sm:mt-10">
            {visibleAccounts.map((account) => {
              const name = displayName(account);
              const initials = name.slice(0, 2).toUpperCase();
              return <div key={account.email} role="button" tabIndex={0} onClick={() => onSelect(account, getUserDestination(account))} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(account, getUserDestination(account)); }} className="flex w-full cursor-pointer items-center gap-3 rounded-[30px] border-2 border-slate-950 px-4 py-3 text-left transition hover:bg-[var(--brand-soft)] sm:gap-4 sm:px-5 sm:py-4">
                {account.avatarUrl || account.avatar_url ? <img src={account.avatarUrl || account.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-base text-white sm:h-14 sm:w-14 sm:text-xl">{initials}</span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-lg font-semibold text-slate-950 sm:text-[28px]">{name}</span><span className="mt-1 block truncate text-sm text-slate-500 sm:text-lg">{account.email}</span></span>
                <button type="button" aria-label={`Remove ${account.email}`} onClick={(event) => { event.stopPropagation(); removeStoredAccount(account.email); setVisibleAccounts((current) => current.filter((item) => item.email !== account.email)); }} className="shrink-0 rounded-full p-1 text-slate-950 hover:bg-slate-100"><X className="h-5 w-5 sm:h-6 sm:w-6" /></button>
              </div>;
            })}
          </div>
          <div className="my-6 flex items-center gap-4 text-base font-bold text-slate-950 sm:my-8 sm:gap-6 sm:text-lg"><span className="h-px flex-1 bg-slate-300" />OR<span className="h-px flex-1 bg-slate-300" /></div>
          <div className="space-y-3"><button type="button" onClick={onAnotherAccount} className="min-h-[52px] w-full rounded-[30px] border border-slate-300 px-5 text-lg font-bold text-slate-950 hover:bg-[var(--brand-soft)] sm:min-h-[60px] sm:text-xl">Log in to another account</button><button type="button" onClick={onCreateAccount} className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[30px] border border-slate-300 px-5 text-lg font-bold text-slate-950 hover:bg-[var(--brand-soft)] sm:min-h-[60px] sm:text-xl"><Plus className="h-5 w-5 sm:h-6 sm:w-6" />Create account</button></div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
