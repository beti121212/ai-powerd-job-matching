import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function PermissionContinueModal({ onContinue, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="permission-title">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-slate-800 hover:bg-slate-100"><X className="h-6 w-6" /></button>
        <h2 id="permission-title" className="text-3xl font-semibold text-slate-950">Continue</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">You have been logged out. Continue to choose an account.</p>
        <button type="button" onClick={onContinue} className="mt-7 min-h-14 w-full rounded-full bg-[var(--brand-deep)] px-6 text-lg font-bold text-white hover:bg-[var(--brand-primary)]">Continue</button>
      </div>
    </div>,
    document.body,
  );
}
