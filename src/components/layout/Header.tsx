import React from 'react';
import {
  Volume2,
  VolumeX,
  Search,
  Bell,
  MessageSquare,
  Shield,
  GraduationCap,
  Users,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenSearch: () => void;
  currentRole: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
  onChangeRole: (role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, currentRole, onChangeRole }) => {
  const { soundEnabled, toggleSound, playHaptic } = useSound();
  const { user, logout } = useAuth();

  const handleRoleChange = (newRole: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT') => {
    playHaptic();
    onChangeRole(newRole);
  };

  const getRoleProfile = () => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return {
          name: 'Principal Arnab Senapati',
          roleTitle: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
      case 'TEACHER':
        return {
          name: 'Ms. Ria / Dr. Debabrata',
          roleTitle: 'Teacher / Faculty',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        };
      case 'STUDENT':
        return {
          name: 'Ananya Das',
          roleTitle: 'Teacher Trainee',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        };
    }
  };

  const profile = getRoleProfile();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between shadow-xs">
      {/* Search Input matching image */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all text-xs font-medium w-full max-w-md text-left"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 truncate">Search students, classes, assignments, resources...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white text-slate-500 rounded border border-slate-200 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Center 3-Role View Switcher */}
      <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1 text-xs">
        <button
          onClick={() => handleRoleChange('TEACHER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
            currentRole === 'TEACHER'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Teacher Screen</span>
        </button>

        <button
          onClick={() => handleRoleChange('SUPER_ADMIN')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
            currentRole === 'SUPER_ADMIN'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Super Admin Screen</span>
        </button>

        <button
          onClick={() => handleRoleChange('STUDENT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
            currentRole === 'STUDENT'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Screen</span>
        </button>
      </div>

      {/* Right Controls: Notifications, Sound FX, User Profile */}
      <div className="flex items-center gap-3">
        {/* Haptic Sound FX Toggle */}
        <button
          onClick={() => {
            toggleSound();
          }}
          title={`Haptic Audio Feedback: ${soundEnabled ? 'Enabled' : 'Muted'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            soundEnabled
              ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline text-[11px]">Sound FX</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-[11px]">Muted</span>
            </>
          )}
        </button>

        {/* Notifications Icon with count 6 matching image */}
        <button
          onClick={playHaptic}
          className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
            6
          </span>
        </button>

        {/* Message bubble icon matching image */}
        <button
          onClick={playHaptic}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors hidden sm:block"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Profile Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-1">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{profile.name}</div>
            <div className="text-[10px] font-medium text-slate-400">{profile.roleTitle}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
