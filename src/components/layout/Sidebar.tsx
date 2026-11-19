import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  FileCheck2,
  CreditCard,
  Bell,
  Library,
  ShieldCheck,
  History,
  Building2,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { playTab } = useSound();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students Roster', icon: GraduationCap },
    { id: 'faculty', label: 'Faculty Directory', icon: Users },
    { id: 'academics', label: 'Curriculum & Courses', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
    {
      id: 'examinations',
      label: 'Marksheet Pipeline',
      icon: FileCheck2,
      badge: 'BSAEU',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'notices', label: 'Notices & Circulars', icon: Bell },
    { id: 'materials', label: 'Digital Library', icon: Library },
    { id: 'verify', label: 'QR Verification', icon: ShieldCheck },
    { id: 'audit', label: 'Security Audit Logs', icon: History },
  ];

  const handleNavClick = (viewId: string) => {
    playTab();
    onSelectView(viewId);
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col flex-shrink-0 min-h-screen">
      {/* College Identity Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight uppercase leading-tight">
              Annapurna & SABED
            </div>
            <div className="text-[10px] text-indigo-400 font-medium">College ERP Platform</div>
          </div>
        </div>

        <div className="mt-3 px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-700/50 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">NCTE & BSAEU Affiliated</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Core ERP Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Backend Engine</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            FastAPI 1.0.0
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">MongoDB & Motor Async Layer</div>
      </div>
    </aside>
  );
};
