import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  colorScheme = 'indigo',
}) => {
  const schemeStyles = {
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      bgGlow: 'bg-indigo-500/10 text-indigo-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGlow: 'bg-emerald-500/10 text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bgGlow: 'bg-amber-500/10 text-amber-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bgGlow: 'bg-rose-500/10 text-rose-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bgGlow: 'bg-purple-500/10 text-purple-400',
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.bgGlow}`}>{icon}</div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {(subtitle || change) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {change && (
              <span
                className={`font-semibold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
