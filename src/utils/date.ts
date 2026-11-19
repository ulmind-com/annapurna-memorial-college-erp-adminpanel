/**
 * Indian Standard Time (IST, UTC+05:30) Date & Time Utilities
 * Annapurna Memorial College ERP & Sundarban Ashutosh B.Ed. College
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

export interface FormatISTOptions {
  dateOnly?: boolean;
  timeOnly?: boolean;
  showSeconds?: boolean;
  compact?: boolean;
}

/**
 * Format any ISO string, date object, or timestamp into Indian Standard Time (IST)
 */
export const formatIST = (
  dateInput: string | number | Date | null | undefined,
  options?: FormatISTOptions
): string => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  if (options?.timeOnly) {
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: IST_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: options.showSeconds ? '2-digit' : undefined,
        hour12: true,
      }).format(date) + ' IST'
    );
  }

  if (options?.dateOnly) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: IST_TIMEZONE,
      day: '2-digit',
      month: options.compact ? 'short' : 'long',
      year: 'numeric',
    }).format(date);
  }

  const datePart = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: options?.compact ? 'short' : 'long',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: options?.showSeconds ? '2-digit' : undefined,
    hour12: true,
  }).format(date);

  return `${datePart}, ${timePart} IST`;
};

/**
 * Get current live IST formatted time string for Header clock
 */
export const getCurrentLiveIST = (): { date: string; time: string; full: string } => {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now);

  return {
    date,
    time: `${time} IST`,
    full: `${date} • ${time} IST`,
  };
};
