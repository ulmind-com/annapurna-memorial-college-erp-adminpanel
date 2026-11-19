import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  BookOpen,
  FileText,
  Brain,
  FileCheck2,
  Calendar,
  CreditCard,
  Bell,
  Library,
  ShieldCheck,
  History,
  FileSpreadsheet,
  Sparkles,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { playHaptic } = useSound();
  const { user, activeRole } = useAuth();

  // Distinct Nav items per role with zero duplicate IDs!
  const getNavItems = () => {
    if (activeRole === 'TEACHER') {
      return [
        { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
        { id: 'my-classes', label: 'My Classes', icon: BookOpen },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck },
        { id: 'lesson-plans', label: 'Lesson Plans', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'quiz-builder', label: 'AI Quiz Builder', icon: Brain },
        { id: 'examinations', label: 'Results & Grades', icon: FileCheck2 },
        { id: 'notices', label: 'Circulars & Notices', icon: Bell },
        { id: 'materials', label: 'Digital Library', icon: Library },
      ];
    }

    if (activeRole === 'STUDENT') {
      return [
        { id: 'dashboard', label: 'Trainee Portal', icon: LayoutDashboard },
        { id: 'attendance', label: '75% Attendance Meter', icon: CalendarCheck },
        { id: 'examinations', label: 'Certified Marksheets', icon: FileCheck2 },
        { id: 'fees', label: 'Fee Ledger & Invoices', icon: CreditCard },
        { id: 'materials', label: 'Study Materials', icon: BookOpen },
        { id: 'notices', label: 'College Notices', icon: Bell },
        { id: 'verify', label: 'Verify Marksheet QR', icon: ShieldCheck },
      ];
    }

    // Default Super Admin / Admin
    return [
      { id: 'dashboard', label: 'Principal Console', icon: LayoutDashboard },
      { id: 'students', label: 'Student Trainees', icon: GraduationCap },
      { id: 'faculty', label: 'Faculty & Mentors', icon: Users },
      { id: 'academics', label: 'Courses & Curriculum', icon: BookOpen },
      { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
      { id: 'examinations', label: 'Marksheet Approval Desk', icon: FileCheck2 },
      { id: 'fees', label: 'Fee Structures & Accounts', icon: CreditCard },
      { id: 'excel-import', label: 'Excel Bulk Data Import', icon: FileSpreadsheet },
      { id: 'notices', label: 'Digital Circulars', icon: Bell },
      { id: 'materials', label: 'Library Vault', icon: Library },
      { id: 'verify', label: 'Public Marksheet Verifier', icon: ShieldCheck },
      { id: 'audit', label: 'Security & Audit Logs', icon: History },
    ];
  };

  const navItems = getNavItems();

  const handleNavClick = (viewId: string) => {
    playHaptic();
    onSelectView(viewId);
  };

  return (
    <aside className="w-64 h-screen flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200 z-20">
      {/* College Identity & Logo */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white font-black text-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              EduNova AI <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase">ERP</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]">
              Annapurna & SABED College
            </div>
          </div>
        </div>

        {/* Active Badge */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-blue-600 text-white flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>EduNova AI ERP 2026</span>
          </div>
          <span className="text-[10px] bg-blue-700/60 px-1.5 py-0.5 rounded uppercase">
            {activeRole === 'SUPER_ADMIN' ? 'Admin' : activeRole === 'TEACHER' ? 'Faculty' : 'Student'}
          </span>
        </div>
      </div>

      {/* Nav List - Independently Scrollable */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Legal / Institution Footprint */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex-shrink-0">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center">
          BSAEU Affiliated • NCTE Recognized
        </div>
      </div>
    </aside>
  );
};
