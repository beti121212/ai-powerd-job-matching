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
    const timeout = window.setTimeout(dismiss, 10000);
    
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const toastType = notification?.type === 'success' ? 'success' : 'error';

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, dismiss }}>
      {children}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-[9999] min-w-[320px] max-w-md overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${toastType === 'success' ? 'border border-emerald-500 bg-emerald-600 text-white' : 'border border-red-500 bg-red-600 text-white'}`}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <span className="text-xl">{toastType === 'success' ? '✓' : '⚠️'}</span>
            <p className="flex-1 text-sm font-semibold leading-snug">{notification.message}</p>
            <button type="button" onClick={dismiss} className="ml-2 text-lg font-bold text-white/80 hover:text-white" aria-label="Close notification">
              ✕
            </button>
          </div>
          <div className="h-1.5 w-full bg-white/20">
            <div
              className="h-full bg-white"
              style={{ animation: 'toastCountdown 10000ms linear forwards', transformOrigin: 'left center' }}
            />
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
