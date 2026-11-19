import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Users, FileCheck, CreditCard, Bell, BookOpen, Shield, ArrowRight } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const { playClick, playPop } = useSound();

  const navigationItems = [
    { title: 'Dashboard Overview', desc: 'System statistics, key metrics and alerts', view: 'dashboard', icon: <GraduationCap className="w-4 h-4 text-indigo-400" /> },
    { title: 'Students & Admissions', desc: 'Manage roll numbers, student roster, registration', view: 'students', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { title: 'Faculty & Staff', desc: 'Faculty profiles, departmental rosters, teaching staff', view: 'faculty', icon: <Users className="w-4 h-4 text-purple-400" /> },
    { title: 'Examinations & Marksheet Pipeline', desc: 'Verify, approve, reject, publish semester marksheets', view: 'examinations', icon: <FileCheck className="w-4 h-4 text-amber-400" /> },
    { title: 'Daily Attendance', desc: 'Take attendance, subject tracking, short-attendance flags', view: 'attendance', icon: <GraduationCap className="w-4 h-4 text-blue-400" /> },
    { title: 'Fee Management', desc: 'Student fee ledgers, payment collections, receipts', view: 'fees', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
    { title: 'Notices & Circulars', desc: 'Publish announcements, push notifications, emails', view: 'notices', icon: <Bell className="w-4 h-4 text-rose-400" /> },
    { title: 'Digital Library & Materials', desc: 'Course syllabus, lecture notes, question banks', view: 'materials', icon: <BookOpen className="w-4 h-4 text-sky-400" /> },
    { title: 'Public Marksheet Verification', desc: 'Verify digital credential hash for third-parties', view: 'verify', icon: <Shield className="w-4 h-4 text-indigo-400" /> },
    { title: 'Security Audit Logs', desc: 'Institutional audit trail, security events, changes', view: 'audit', icon: <Shield className="w-4 h-4 text-slate-400" /> },
  ];

  const filtered = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else playPop();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, playPop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search modules (e.g. marksheets, fees, students)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded font-mono">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No matching modules or actions found.</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  playClick();
                  onNavigate(item.view);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
