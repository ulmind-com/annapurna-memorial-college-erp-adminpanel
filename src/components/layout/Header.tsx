import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Clock,
  Shield,
  GraduationCap,
  Users,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentLiveIST } from '../../utils/date';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { SoundButton } from '../common/SoundButton';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { soundEnabled, toggleSound, playHaptic, playPop, playSuccess, playAlert } = useSound();
  const { user, activeRole, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [istTime, setIstTime] = useState(getCurrentLiveIST());

  // Change Password state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(getCurrentLiveIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    playPop();
    logout();
  };

  const getRoleBadge = () => {
    switch (activeRole) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          icon: Shield,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'TEACHER':
        return {
          label: 'Faculty / Teacher',
          icon: Users,
          color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        };
      case 'STUDENT':
        return {
          label: 'Teacher Trainee',
          icon: GraduationCap,
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="h-16 flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between shadow-xs transition-colors duration-200 z-10">
      {/* Search Input with ⌘K */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => {
            playHaptic();
            onOpenSearch();
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs font-medium w-full text-left"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 truncate">Search students, classes, records...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center Indian Standard Time (IST) Clock Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
        <span>{istTime.full}</span>
      </div>

      {/* Right Controls: Theme Toggle, Sound Toggle, Notifications, Profile, Logout */}
      <div className="flex items-center gap-2.5">
        {/* Day Mode / Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            playHaptic();
            toggleTheme();
          }}
          title={isDark ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-2xs"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Haptic Sound FX Toggle */}
        <button
          type="button"
          onClick={() => {
            toggleSound();
            playHaptic();
          }}
          title={`Haptic Audio Feedback: ${soundEnabled ? 'Enabled' : 'Muted'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            soundEnabled
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-2xs'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline text-[11px]">Audio</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-[11px]">Mute</span>
            </>
          )}
        </button>

        {/* Notifications Icon with active badge */}
        <button
          type="button"
          onClick={playHaptic}
          className="relative p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
            3
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Profile Avatar & Name */}
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.full_name || 'ERP User'}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-2xs"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.full_name || 'Principal Arnab Senapati'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${roleBadge.color}`}>
                <RoleIcon className="w-2.5 h-2.5" />
                <span>{roleBadge.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          type="button"
          onClick={() => {
            playPop();
            setPasswordError(null);
            setPasswordSuccess(false);
            setCurrPass('');
            setNewPass('');
            setConfirmPass('');
            setIsChangePasswordOpen(true);
          }}
          title="Change institutional password"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-2xs"
        >
          <KeyRound className="w-4 h-4" />
        </button>

        {/* Sign Out / Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out from session"
          className="ml-1 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Change Security Password"
        subtitle={`Account: ${user?.email || ''}`}
        maxWidth="sm"
      >
        {passwordSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Password Updated Successfully!</h4>
            <p className="text-xs text-slate-500">Your new institutional credentials are now active.</p>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setPasswordError(null);
              if (newPass !== confirmPass) {
                playAlert();
                setPasswordError('New password and confirm password do not match.');
                return;
              }
              if (newPass.length < 6) {
                playAlert();
                setPasswordError('New password must be at least 6 characters long.');
                return;
              }
              try {
                await api.changePassword(user?.email || '', currPass, newPass);
                playSuccess();
                setPasswordSuccess(true);
                setTimeout(() => {
                  setIsChangePasswordOpen(false);
                }, 1800);
              } catch (err: any) {
                playAlert();
                setPasswordError(err.message || 'Failed to change password. Check your current password.');
              }
            }}
            className="space-y-3.5 text-xs"
          >
            {passwordError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <SoundButton
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </SoundButton>
              <SoundButton type="submit" variant="primary" size="sm" soundType="success">
                Update Password
              </SoundButton>
            </div>
          </form>
        )}
      </Modal>
    </header>
  );
};
