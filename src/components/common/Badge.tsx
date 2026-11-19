import React from 'react';
import { MarksheetStatus } from '../../types';

interface BadgeProps {
  status: string | MarksheetStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = (s: string) => {
    switch (s.toUpperCase()) {
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'PAID':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: s === 'PAID' ? 'Fully Paid' : s === 'PUBLISHED' ? 'Published' : 'Active',
        };

      case 'ADMIN_APPROVED':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Admin Approved',
        };

      case 'DEPARTMENT_VERIFIED':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'Dept. Verified',
        };

      case 'SUBMITTED_BY_FACULTY':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          dot: 'bg-indigo-400',
          label: 'Faculty Submitted',
        };

      case 'DRAFT':
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          border: 'border-slate-500/30',
          dot: 'bg-slate-400',
          label: 'Draft',
        };

      case 'REJECTED':
      case 'SUSPENDED':
      case 'OVERDUE':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          dot: 'bg-rose-400',
          label: s === 'REJECTED' ? 'Rejected' : s === 'OVERDUE' ? 'Overdue' : 'Suspended',
        };

      case 'PARTIAL':
      case 'ON_LEAVE':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          dot: 'bg-amber-400',
          label: s === 'PARTIAL' ? 'Partially Paid' : 'On Leave',
        };

      case 'UNPAID':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'Unpaid',
        };

      default:
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-300',
          border: 'border-slate-500/20',
          dot: 'bg-slate-400',
          label: s,
        };
    }
  };

  const config = getBadgeConfig(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse-subtle`} />
      {config.label}
    </span>
  );
};
