import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export type EmailStatus = 'idle' | 'checking' | 'ok' | 'error';

interface EmailFieldProps {
  value: string;
  onChange: (v: string) => void;
  /** Reports whether the current value passed the server check (submit should wait for 'ok'). */
  onStatus: (s: EmailStatus) => void;
  type: 'FACULTY' | 'STUDENT';
  /** id of the record being edited, so its own email isn't reported as a duplicate */
  excludeId?: string;
  className?: string;
}

/**
 * Email input validated by the backend while typing: format, common-provider typos
 * (e.g. gmaii.com), domain existence and duplicates across faculty/students/logins.
 */
export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange, onStatus, type, excludeId, className }) => {
  const [status, setStatus] = useState<EmailStatus>('idle');
  const [message, setMessage] = useState('');
  const seq = useRef(0);

  useEffect(() => {
    const v = value.trim();
    if (!v) {
      setStatus('idle');
      setMessage('');
      onStatus('idle');
      return;
    }
    const id = ++seq.current;
    setStatus('checking');
    onStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await api.checkEmailAvailability(v, type, excludeId);
        if (id !== seq.current) return;
        const next: EmailStatus = res.available ? 'ok' : 'error';
        setStatus(next);
        setMessage(res.detail);
        onStatus(next);
      } catch (err: any) {
        if (id !== seq.current) return;
        setStatus('error');
        setMessage(err.message || 'Could not verify email');
        onStatus('error');
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, excludeId]);

  return (
    <div>
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className={`${className} pr-9 ${status === 'error' ? 'border-rose-400 focus:ring-rose-500' : status === 'ok' ? 'border-emerald-400' : ''}`}
          required
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {status === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500" />}
        </span>
      </div>
      {status === 'error' && <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">{message}</p>}
    </div>
  );
};
