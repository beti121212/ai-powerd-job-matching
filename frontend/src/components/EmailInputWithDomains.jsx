import { useRef, useState } from 'react';
import { Check, Mail, Sparkles } from 'lucide-react';

const POPULAR_DOMAINS = ['@gmail.com', '@outlook.com', '@yahoo.com', '@hotmail.com', '@icloud.com'];

const getPrefix = (text) => {
  if (!text) return '';
  const atIndex = text.indexOf('@');
  return atIndex === -1 ? text : text.substring(0, atIndex);
};

const EmailInputWithDomains = ({ value = '', onChange, error = '', suggestion = '', onBlur, disabled = false, name = 'email' }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const prefix = getPrefix(value);
  const shouldShowSuggestions = value.trim().length >= 2 && !/\.[a-z]{2,}$/i.test(value.trim());

  const handleDomainClick = (domain) => {
    if (!prefix.trim()) return;
    onChange(`${prefix.trim().toLowerCase()}${domain}`);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2 text-left select-none">
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          name={name}
          disabled={disabled}
          placeholder="yourname@gmail.com"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            window.setTimeout(() => setIsFocused(false), 200);
            onBlur?.(event);
          }}
          className={`w-full text-sm sm:text-base pl-12 pr-4 py-3 sm:py-3.5 rounded-xl border bg-slate-50/50 text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${error ? 'border-red-500 bg-red-50/20' : isFocused ? 'border-blue-600' : 'border-slate-300 hover:border-slate-400'}`}
        />
        <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-slate-400'}`} />
      </div>

      {shouldShowSuggestions && (
        <div className="min-h-10 pt-1 animate-fadeIn">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span>Quick domain selection:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_DOMAINS.map((domain) => {
              const selected = value.toLowerCase().endsWith(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleDomainClick(domain)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {selected && <Check className="h-3 w-3" />}
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
      {suggestion && !error && <p className="mt-1 text-xs font-semibold text-amber-600">{suggestion}</p>}
    </div>
  );
};

export default EmailInputWithDomains;
