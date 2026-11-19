import React from 'react';
import { Volume2, VolumeX, Search, Bell, Shield, LogOut } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { SoundButton } from '../common/SoundButton';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { soundEnabled, toggleSound, playClick } = useSound();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Search trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs font-medium"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Search...</span>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-slate-700/50 text-slate-300 rounded border border-slate-600/50 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Web Audio API Synthesizer Toggle */}
        <button
          onClick={() => {
            toggleSound();
          }}
          title={`Audio Sound FX: ${soundEnabled ? 'Enabled' : 'Muted'}`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            soundEnabled
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/20 shadow-sm shadow-indigo-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300 hover:bg-slate-750'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse-subtle" />
              <span className="hidden sm:inline">Sound FX: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Sound FX: OFF</span>
            </>
          )}
        </button>

        {/* Notifications badge */}
        <button
          onClick={playClick}
          className="relative p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800" />

        {/* User profile dropdown */}
        <div className="flex items-center gap-3 pl-1">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover ring-2 ring-indigo-500/20"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{user?.full_name}</div>
            <div className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              {user?.role}
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              logout();
            }}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
