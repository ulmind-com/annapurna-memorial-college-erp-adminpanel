import React, { useRef } from 'react';
import { CalendarDays, Clock3 } from 'lucide-react';

interface PickerInputProps {
  type: 'date' | 'time';
  value: string;
  onChange: (v: string) => void;
  min?: string;
  required?: boolean;
  className?: string;
}

/**
 * Native date/time input with a clear calendar/clock icon button (lucide-react) that opens the
 * browser's picker. Clicking anywhere on the field opens it too. Works in light and dark mode.
 */
export const PickerInput: React.FC<PickerInputProps> = ({ type, value, onChange, min, required, className = '' }) => {
  const ref = useRef<HTMLInputElement>(null);
  const open = () => {
    const el = ref.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!el) return;
    try {
      el.showPicker?.();
    } catch {
      el.focus();
    }
  };
  const Icon = type === 'date' ? CalendarDays : Clock3;
  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        value={value}
        min={min}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onClick={open}
        className={`w-full pl-3.5 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full ${className}`}
      />
      <button
        type="button"
        onClick={open}
        aria-label={type === 'date' ? 'Open calendar' : 'Open clock'}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 pointer-events-none"
      >
        <Icon className="w-4 h-4" />
      </button>
    </div>
  );
};

/** "Fri, 5 Dec 2026 • 5:00 PM" preview for a date + time pair. */
export const formatDueDateTime = (date: string, time?: string): string => {
  if (!date) return '';
  const d = new Date(`${date}T${time || '00:00'}`);
  if (isNaN(d.getTime())) return '';
  const day = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return time ? `${day} • ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : day;
};
