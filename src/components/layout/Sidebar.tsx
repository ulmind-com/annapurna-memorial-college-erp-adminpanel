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
  BarChart3,
  ShieldCheck,
  History,
  FileSpreadsheet,
  Bot,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { playHaptic, playPop } = useSound();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'My Classes', icon: BookOpen },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'materials', label: 'Lesson Plans', icon: FileText },
    { id: 'materials', label: 'Assignments', icon: FileText },
    { id: 'materials', label: 'AI Quiz Builder', icon: Brain },
    { id: 'examinations', label: 'Results & Grades', icon: FileCheck2 },
    { id: 'academics', label: 'Timetable', icon: Calendar },
    { id: 'fees', label: 'Fees (View)', icon: CreditCard },
    { id: 'excel-import', label: 'Excel Import', icon: FileSpreadsheet },
    { id: 'notices', label: 'Communication', icon: Bell },
    { id: 'materials', label: 'Library', icon: Library },
    { id: 'verify', label: 'Public QR Verify', icon: ShieldCheck },
    { id: 'audit', label: 'Reports & Audit', icon: History },
  ];

  const handleNavClick = (viewId: string) => {
    playHaptic();
    onSelectView(viewId);
  };

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col flex-shrink-0 min-h-screen">
      {/* College Logo & Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 text-white font-black text-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
              EduNova AI <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">ERP</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate">
              Annapurna & SABED College
            </div>
          </div>
        </div>

        {/* Active 2026 Badge matching image */}
        <div className="mt-4 px-3 py-2 rounded-xl bg-blue-600 text-white flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>EduNova AI ERP 2026</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={`${item.label}-${idx}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Meet Nova AI Card Matching Bottom-Left of Image */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-50/50 border border-blue-100 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-extrabold text-slate-900">Meet Nova AI</div>
              <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Your AI Teaching Assistant for smarter & faster teaching.
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => {
              playPop();
              alert('Nova AI Assistant: Preparing pedagogy guidance and NCTE lesson syllabus...');
            }}
            className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            Chat with Nova AI
          </button>
        </div>
      </div>
    </aside>
  );
};
