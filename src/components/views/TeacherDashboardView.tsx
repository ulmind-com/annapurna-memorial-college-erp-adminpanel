import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  FileText,
  Library,
  FileCheck2,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  Bell,
  Clock,
  AlertCircle,
  Megaphone,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { api, MyFacultyProfile, StudentQuery } from '../../services/api';
import { Notice, LeaveApplication, Marksheet } from '../../types';

interface TeacherDashboardViewProps {
  onNavigate: (view: string) => void;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const card = 'p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm';

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ onNavigate }) => {
  const { playHaptic } = useSound();
  const { user } = useAuth();

  const [profile, setProfile] = useState<MyFacultyProfile | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMyFacultyProfile();
        setProfile(me);
        const [asg, tt, nList, lv, qs, ms] = await Promise.all([
          api.getAssignments(),
          api.getTimetableSlots(),
          api.getNotices(),
          api.getLeaveApplications(),
          api.getStudentQueries(),
          api.getAllMarksheets(),
        ]);
        setAssignments(asg);
        setSlots(tt);
        setNotices(nList);
        setLeaves(lv);
        setQueries(qs);
        setMarksheets(ms);
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const today = DAYS[new Date().getDay()];
  const todaySlots = slots.filter((s) => s.day === today);
  const totalStudents = (profile?.classes || []).reduce((acc, c) => acc + c.student_count, 0);
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const toGrade = assignments.reduce((acc, a) => acc + Math.max(0, (a.submittedCount || 0) - (a.gradedCount || 0)), 0);
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');
  const openQueries = queries.filter((q) => q.status === 'OPEN');

  const submitted = assignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
  const pending = assignments.reduce((acc, a) => acc + (a.isOverdue ? 0 : a.pendingCount || 0), 0);
  const overdue = assignments.reduce((acc, a) => acc + (a.overdueCount || 0), 0);
  const submissionData = [
    { name: 'Submitted', value: submitted, color: '#3b82f6' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Overdue', value: overdue, color: '#ef4444' },
  ];

  // Per-subject average & top percentage from marksheets of my classes
  const performanceData = (profile?.subjects || []).map((sub) => {
    const scores = marksheets
      .flatMap((m) => m.subject_scores || [])
      .filter((sc: any) => sc.subject_code === sub.code) as any[];
    const pcts = scores.map((sc) => ((Number(sc.total_obtained) || 0) / (Number(sc.total_maximum || sc.max_marks) || 100)) * 100);
    return {
      class: sub.code,
      classAvg: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0,
      topScore: pcts.length ? Math.round(Math.max(...pcts)) : 0,
    };
  });
  const hasPerformance = performanceData.some((p) => p.classAvg > 0);

  const upcoming = activeAssignments
    .filter((a) => !a.isOverdue)
    .sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`))
    .slice(0, 4);

  const stats = [
    { label: 'Assigned Classes', value: profile?.classes.length ?? 0, icon: BookOpen, view: 'my-classes' },
    { label: 'Students', value: totalStudents, icon: Users, view: 'my-classes' },
    { label: 'Active Assignments', value: activeAssignments.length, icon: ClipboardList, view: 'assignments' },
    { label: 'Submissions to Grade', value: toGrade, icon: FileCheck2, view: 'assignments' },
    { label: 'Pending Leaves', value: pendingLeaves.length, icon: CheckSquare, view: 'leave-management' },
    { label: 'Open Queries', value: openQueries.length, icon: MessageSquare, view: 'communication' },
  ];

  const quickLinks = [
    { label: 'Class Roster', view: 'my-classes', icon: Users },
    { label: 'Timetable', view: 'timetable', icon: Calendar },
    { label: 'Lesson Plans', view: 'lesson-plans', icon: BookOpen },
    { label: 'Assignments', view: 'assignments', icon: FileText },
    { label: 'Study Materials', view: 'materials', icon: Library },
    { label: 'Enter Marks', view: 'examinations', icon: FileCheck2 },
    { label: 'Announcements', view: 'communication', icon: Megaphone },
  ];

  const go = (view: string) => {
    playHaptic();
    onNavigate(view);
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile?.avatar_url || user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'T')}`}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 bg-white/10"
            />
            <div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                {profile?.designation && <span className="px-2 py-0.5 rounded-full bg-white/20">{profile.designation}</span>}
                {profile?.employee_id && <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono">ID: {profile.employee_id}</span>}
              </div>
              <h1 className="text-2xl font-black mt-1">{profile?.full_name || user?.full_name}</h1>
              <div className="text-xs text-blue-100 mt-0.5">
                {[profile?.department, profile?.qualification, profile?.specialization].filter(Boolean).join(' • ')}
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-blue-100">
            <div className="font-bold text-white text-sm">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div>{todaySlots.length} class(es) today</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {!loading && profile && profile.subjects.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-300">
          No subjects are assigned to you yet. Ask the Super Admin to assign you as faculty in Academic Structure → Subjects.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.label} type="button" onClick={() => go(s.view)} className={`${card} text-left hover:border-blue-300 transition-all`}>
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{loading ? '…' : s.value}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{s.label}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's classes */}
        <div className={card}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-600" /> Today's Classes
          </h3>
          {todaySlots.length === 0 ? (
            <p className="text-xs text-slate-400">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todaySlots.map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{s.time}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{s.subject}</div>
                  <div className="text-[10px] text-slate-500">{s.class_label} • {s.room} • {s.type}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submissions donut */}
        <div className={card}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-blue-600" /> Assignment Submissions
          </h3>
          {submitted + pending + overdue === 0 ? (
            <p className="text-xs text-slate-400">No assignment activity yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={submissionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {submissionData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className={card}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Deadlines
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-slate-400">No upcoming assignment deadlines.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => (
                <div key={a.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {a.courseCode} Sem {a.semester} • Due {a.dueDate} {a.dueTime} • {a.submittedCount}/{a.totalAssigned} submitted
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Subject performance */}
        <div className={`${card} xl:col-span-2`}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <FileCheck2 className="w-4 h-4 text-blue-600" /> Subject Performance (% marks)
          </h3>
          {!hasPerformance ? (
            <p className="text-xs text-slate-400">No marks entered yet for your subjects.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="classAvg" name="Class Average" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="topScore" name="Top Score" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Notices */}
        <div className={card}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-blue-600" /> Latest Notices
          </h3>
          {notices.length === 0 ? (
            <p className="text-xs text-slate-400">No notices.</p>
          ) : (
            <div className="space-y-2">
              {notices.slice(0, 5).map((n) => (
                <button key={n.id} type="button" onClick={() => go('notices')} className="w-full text-left p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {n.category} • {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assigned subjects & quick links */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${card} xl:col-span-2`}>
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" /> My Subjects
          </h3>
          {!profile?.subjects.length ? (
            <p className="text-xs text-slate-400">No subjects assigned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.subjects.map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-[10px] font-mono font-bold text-blue-600">{s.code}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {s.course_code} Sem {s.semester} • {s.student_count} students • {s.credits} credits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={card}>
          <h3 className="text-sm font-black mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => go(l.view)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left transition-all"
                >
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-[11px] font-bold mt-1">{l.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
