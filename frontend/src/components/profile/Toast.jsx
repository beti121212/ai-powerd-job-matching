import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
	useEffect(() => {
		if (!message) return undefined;
		const timer = window.setTimeout(onClose, 5000);
		return () => window.clearTimeout(timer);
	}, [message, onClose]);

	if (!message) return null;
	return <div className="animate-[alertPulse_0.45s_ease-out] fixed bottom-5 right-5 z-60 flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl" role="status"><CheckCircle2 className="h-5 w-5 text-emerald-400" />{message}<button type="button" onClick={onClose} className="ml-2 min-h-0 text-slate-300 hover:text-white" aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div>;
}
