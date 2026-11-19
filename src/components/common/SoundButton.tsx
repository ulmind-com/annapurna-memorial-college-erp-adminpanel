import React from 'react';
import { useSound } from '../../context/SoundContext';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  soundType?: 'click' | 'success' | 'approve' | 'alert' | 'pop' | 'tab';
  icon?: React.ReactNode;
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  soundType = 'click',
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const { playClick, playSuccess, playApprove, playAlert, playPop, playTab } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (soundType) {
      case 'success':
        playSuccess();
        break;
      case 'approve':
        playApprove();
        break;
      case 'alert':
        playAlert();
        break;
      case 'pop':
        playPop();
        break;
      case 'tab':
        playTab();
        break;
      default:
        playClick();
        break;
    }
    if (onClick) onClick(e);
  };

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 focus:ring-indigo-500 border border-indigo-500/30',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 focus:ring-slate-500',
    success:
      'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 border border-emerald-500/30',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 focus:ring-rose-500 border border-rose-500/30',
    warning:
      'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 focus:ring-amber-500 border border-amber-500/30',
    ghost:
      'text-slate-300 hover:text-white hover:bg-slate-800/60 focus:ring-slate-500',
    outline:
      'border border-slate-700 text-slate-300 hover:bg-slate-800/80 hover:text-white focus:ring-slate-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
