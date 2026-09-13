import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { NotificationContext } from './notificationContext.js';

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showSuccess = (message) => setNotification({ type: 'success', message });
  const showError = (message) => setNotification({ type: 'error', message });
  const dismiss = () => setNotification(null);

  useEffect(() => {
    if (!notification) return undefined;
    const timeout = window.setTimeout(dismiss, notification.type === 'success' ? 3500 : 5000);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, dismiss }}>
      {children}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-6 py-3.5 font-medium text-white shadow-2xl animate-[slideDown_0.25s_ease-out] pointer-events-auto ${notification.type === 'success' ? 'border border-emerald-500/30 bg-emerald-600' : 'border border-rose-500/30 bg-rose-600'}`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-white" /> : <AlertCircle className="h-5 w-5 text-white" />}
          <span>{notification.message}</span>
          {notification.type === 'error' && (
            <button type="button" onClick={dismiss} className="ml-2 rounded p-1 text-white/90 hover:bg-white/10" aria-label="Close notification">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
