import React, { useState, useEffect } from 'react';
import {
  Search,
  GraduationCap,
  Users,
  FileCheck,
  CreditCard,
  Bell,
  BookOpen,
  Shield,
  ArrowRight,
  Calendar,
  FileText,
  ClipboardList,
  Brain,
  FileSpreadsheet,
} from 'lucide-react';
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
    { title: 'Dashboard Overview', desc: 'System statistics, key metrics and role alerts', view: 'dashboard', icon: <GraduationCap className="w-4 h-4 text-blue-500" /> },
    { title: 'My Teaching Classes', desc: 'Active assigned B.Ed. & D.El.Ed. cohorts and syllabus progress', view: 'my-classes', icon: <BookOpen className="w-4 h-4 text-sky-500" /> },
    { title: 'Lecture & Practicum Timetable', desc: 'Weekly schedule in Indian Standard Time (IST)', view: 'timetable', icon: <Calendar className="w-4 h-4 text-indigo-500" /> },
    { title: 'Lesson Pedagogy Planner', desc: 'NCTE 5E model & BSAEU lesson plans and TLM tools', view: 'lesson-plans', icon: <FileText className="w-4 h-4 text-purple-500" /> },
    { title: 'Assignments & Homework', desc: 'CCE practicum tasks, submission tracker, and grading', view: 'assignments', icon: <ClipboardList className="w-4 h-4 text-amber-500" /> },
    { title: 'AI Quiz Builder', desc: 'Curriculum assessment & pedagogy MCQ generator', view: 'quiz-builder', icon: <Brain className="w-4 h-4 text-blue-500" /> },
    { title: 'Student Trainees', desc: 'Manage roll numbers, student roster, registration', view: 'students', icon: <Users className="w-4 h-4 text-emerald-500" /> },
    { title: 'Faculty & Mentors', desc: 'Faculty profiles, departmental rosters, teaching staff', view: 'faculty', icon: <Users className="w-4 h-4 text-purple-500" /> },
    { title: 'Examinations & Marksheet Pipeline', desc: 'Verify, approve, reject, publish semester marksheets', view: 'examinations', icon: <FileCheck className="w-4 h-4 text-amber-500" /> },
    { title: 'Fee Management', desc: 'Student fee ledgers, payment collections, receipts', view: 'fees', icon: <CreditCard className="w-4 h-4 text-emerald-500" /> },
    { title: 'Excel Bulk Data Import', desc: 'Ingest student admissions & marks from .xlsx/.csv files', view: 'excel-import', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> },
    { title: 'Notices & Circulars', desc: 'Publish announcements, push notifications, emails', view: 'notices', icon: <Bell className="w-4 h-4 text-rose-500" /> },
    { title: 'Digital Library & Materials', desc: 'Course syllabus, lecture notes, question banks', view: 'materials', icon: <BookOpen className="w-4 h-4 text-sky-500" /> },
    { title: 'Public Marksheet Verification', desc: 'Verify digital credential hash for third-parties', view: 'verify', icon: <Shield className="w-4 h-4 text-indigo-500" /> },
    { title: 'Security Audit Logs', desc: 'Institutional audit trail, security events, changes', view: 'audit', icon: <Shield className="w-4 h-4 text-slate-500" /> },
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a module or action (e.g. lesson plans, timetable, marksheets)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">
            ESC
          </kbd>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              No matching modules or actions found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  playClick();
                  onNavigate(item.view);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
