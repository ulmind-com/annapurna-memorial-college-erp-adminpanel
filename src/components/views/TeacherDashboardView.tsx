import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Users,
  FileText,
  Bot,
  Brain,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  ChevronLeft,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

interface TeacherDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ onNavigate }) => {
  const { playHaptic, playTab, playPop, playSuccess } = useSound();
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(20);

  // Homework Submissions Donut Data
  const submissionData = [
    { name: 'Submitted', value: 26, color: '#3b82f6' },
    { name: 'Pending', value: 8, color: '#f59e0b' },
    { name: 'Overdue', value: 3, color: '#ef4444' },
  ];

  // Student Performance Bar Chart Data
  const performanceData = [
    { class: 'BED 1A', classAvg: 72, topScore: 94 },
    { class: 'BED 1B', classAvg: 68, topScore: 89 },
    { class: 'BED 2A', classAvg: 75, topScore: 96 },
    { class: 'BED 2B', classAvg: 71, topScore: 91 },
    { class: 'DELED', classAvg: 78, topScore: 95 },
  ];

  const quickLinks = [
    { label: 'Class Roster', view: 'my-classes', icon: Users },
    { label: 'Timetable', view: 'timetable', icon: Calendar },
    { label: 'Lesson Plans', view: 'lesson-plans', icon: BookOpen },
    { label: 'Attendance', view: 'attendance', icon: CheckCircle },
    { label: 'Assignments', view: 'assignments', icon: FileText },
    { label: 'Results', view: 'examinations', icon: FileCheck2 },
    { label: 'AI Quiz Builder', view: 'quiz-builder', icon: Brain },
  ];

  const upcomingActivities = [
    {
      month: 'MAY',
      day: '21',
      title: 'B.Ed. Micro-Teaching Practical Session',
      time: 'Class 10A • 09:30 AM - 11:00 AM',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      month: 'MAY',
      day: '22',
      title: 'Educational Psychology Evaluation',
      time: 'Class 11B • 10:30 AM - 11:30 AM',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      month: 'MAY',
      day: '23',
      title: 'Lesson Plan Methodology Discussion',
      time: 'Class 9C • 11:15 AM - 12:00 PM',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      month: 'MAY',
      day: '24',
      title: 'Trainee Internship Review Meeting',
      time: 'Virtual • 04:00 PM - 05:00 PM',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  const riskAlerts = [
    {
      name: 'Rohan Mehta (10A)',
      reason: 'Declining in Lesson Planning practicum',
      risk: 'High Risk',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    },
    {
      name: 'Aisha Khan (11B)',
      reason: 'Low micro-teaching attendance (68%)',
      risk: 'Medium Risk',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100',
    },
    {
      name: 'Karan Verma (9C)',
      reason: 'Requires improvement in assessment test',
      risk: 'Low Risk',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
    },
  ];

  const notifications = [
    {
      title: 'New micro-teaching assignment submitted',
      sub: 'Arjun Singh submitted Physics Practicum File',
      time: '10 min ago',
    },
    {
      title: 'Leave request received',
      sub: '2 trainee internship leave requests pending',
      time: '1 hr ago',
    },
    {
      title: 'Grades are ready to publish',
      sub: 'B.Ed. Semester 1 marksheet verified by Coordinator',
      time: '2 hr ago',
    },
    {
      title: 'Timetable updated for internship',
      sub: 'School demonstration schedule adjusted for tomorrow',
      time: '3 hr ago',
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teacher Dashboard</h2>
        <div className="text-xs text-slate-500 font-medium">
          Annapurna Memorial College & Sundarban Ashutosh B.Ed. College
        </div>
      </div>

      {/* Main Grid: Left Central Feed + Right Schedule Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Column (3 spans) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Hero Welcome Banner Matching Image */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-100 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Teacher Illustration & Text */}
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-32 flex-shrink-0 hidden sm:block">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                    alt="Teacher"
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Good morning, Dr. Debabrata Roy!
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    Empower minds. Inspire futures.
                  </p>
                  <p className="text-xs text-slate-600">
                    You have <b className="text-blue-600">3 classes today</b> and{' '}
                    <b className="text-blue-600">12 pending tasks</b>.
                  </p>

                  <div className="pt-2">
                    <SoundButton
                      onClick={() => onNavigate('my-classes')}
                      variant="primary"
                      size="sm"
                      soundType="haptic"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View My Classes
                    </SoundButton>
                  </div>
                </div>
              </div>

              {/* Right Side AI Quick Action Cards */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-64">
                <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-blue-600" />
                      AI Lesson Planner
                    </div>
                    <div className="text-[10px] text-slate-500">Create smart lesson plans in seconds.</div>
                  </div>
                  <button
                    onClick={() => {
                      playPop();
                      alert('AI Lesson Planner activated: Generating B.Ed. Curriculum Framework.');
                    }}
                    className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      AI Content Generator
                    </div>
                    <div className="text-[10px] text-slate-500">Generate worksheets, quizzes instantly.</div>
                  </div>
                  <button
                    onClick={() => {
                      playPop();
                      alert('AI Content Generator: Creating pedagogy practicum exercises.');
                    }}
                    className="p-1 rounded-lg text-purple-600 hover:bg-purple-50 text-xs font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Key Metric Cards with Sparklines */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Today's Classes</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">3</div>
              <div className="text-[10px] text-slate-500 mt-1">Next: BED-101 • 09:30 AM</div>
              {/* Blue sparkline visual */}
              <div className="mt-2 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-3/4" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Student Count</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">128</div>
              <div className="text-[10px] text-slate-500 mt-1">Across 4 B.Ed. Batches</div>
              {/* Green sparkline */}
              <div className="mt-2 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-5/6" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Assignments to Grade</span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">12</div>
              <div className="text-[10px] text-slate-500 mt-1">Due within 3 days</div>
              {/* Purple sparkline */}
              <div className="mt-2 h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-1/2" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending Leave Requests</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">2</div>
              <div className="text-[10px] text-slate-500 mt-1">Requires your approval</div>
              {/* Amber sparkline */}
              <div className="mt-2 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-1/3" />
              </div>
            </div>
          </div>

          {/* Quick Links Row */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Quick Links
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      playHaptic();
                      onNavigate(item.view);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-200 transition-all text-center group"
                  >
                    <div className="p-2 rounded-lg bg-white shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 mt-2 truncate w-full">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Charts Row: Homework Submissions Donut & Student Performance Bar Chart with Movement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart with Motion */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Homework Submissions</h3>
                <span className="text-xs font-medium text-blue-600 cursor-pointer" onClick={() => onNavigate('assignments')}>
                  View All
                </span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <div className="w-44 h-44 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={submissionData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      >
                        {submissionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center percentage label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-slate-900">76%</span>
                    <span className="text-[10px] text-slate-500 font-medium">Submitted</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs flex-1 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Total Assigned:</span>
                    <span className="font-bold text-slate-900">34</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Submitted:
                    </span>
                    <span className="font-bold text-blue-600">26</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending:
                    </span>
                    <span className="font-bold text-amber-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Overdue:
                    </span>
                    <span className="font-bold text-rose-600">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Bar Chart with Movement */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Student Performance Overview</h3>
                <span className="text-xs text-slate-500 font-medium">This Semester</span>
              </div>

              <div className="w-full h-44 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="class" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="classAvg" name="Class Average %" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="topScore" name="Top Score %" fill="#93c5fd" radius={[4, 4, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Upcoming Activities, Risk Alerts & Notifications Feed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming Activities */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Activities</h3>
                <span className="text-xs font-medium text-blue-600 cursor-pointer" onClick={() => onNavigate('attendance')}>
                  View All
                </span>
              </div>
              <div className="space-y-3 mt-3">
                {upcomingActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`px-2 py-1 rounded-lg border text-center font-bold text-[10px] ${act.color}`}>
                      <div>{act.month}</div>
                      <div className="text-sm">{act.day}</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">{act.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Student Risk Alerts */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  AI Trainee Risk Alerts
                </h3>
                <span className="text-xs font-medium text-blue-600 cursor-pointer" onClick={() => onNavigate('students')}>
                  View All
                </span>
              </div>
              <div className="space-y-3 mt-3">
                {riskAlerts.map((st, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{st.reason}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.color}`}>
                      {st.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <span className="text-xs font-medium text-blue-600 cursor-pointer" onClick={() => onNavigate('notices')}>
                  View All
                </span>
              </div>
              <div className="space-y-3 mt-3">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="font-semibold text-slate-900">{notif.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{notif.sub}</div>
                    <div className="text-[9px] text-blue-600 font-medium mt-1">{notif.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Calendar, Today's Schedule & Smart Reminders */}
        <div className="space-y-6">
          {/* Mini Calendar Matching Image */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Calendar</h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <ChevronLeft className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-700" />
                <span>May 2026</span>
                <ChevronRight className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mt-3 mb-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {[26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1].map((day, idx) => {
                const isCurrentMonth = idx >= 5 && idx < 35;
                const isSelected = isCurrentMonth && day === selectedCalendarDay;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isCurrentMonth) {
                        playHaptic();
                        setSelectedCalendarDay(day);
                      }
                    }}
                    className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : isCurrentMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 pointer-events-none'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
              <span className="text-xs font-medium text-blue-600 cursor-pointer" onClick={() => onNavigate('academics')}>
                View Timetable
              </span>
            </div>

            <div className="space-y-3">
              {[
                { time: '08:30 AM', end: '09:15 AM', title: 'BED-101: Childhood & Growing Up', room: 'Lecture Hall 1', isNow: false },
                { time: '09:30 AM', end: '10:15 AM', title: 'BED-102: Contemporary Education', room: 'Room 205', isNow: true },
                { time: '11:15 AM', end: '12:00 PM', title: 'BED-103: Language Across Curriculum', room: 'Language Lab', isNow: false },
                { time: '02:00 PM', end: '02:45 PM', title: 'BED-105: Drama & Art EPC Practicum', room: 'Activity Hall', isNow: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="text-[10px] text-slate-500 font-mono w-16 text-right leading-tight">
                    <div>{item.time}</div>
                    <div className="text-slate-400">{item.end}</div>
                  </div>
                  <div className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      {item.isNow && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white animate-pulse">
                          Now
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.room}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Reminders */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Smart Reminders
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-purple-900">Upcoming Lecture</div>
                  <div className="text-[10px] text-purple-600">BED-102 in Room 205 in 15 mins</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-amber-900">Pending Evaluations</div>
                  <div className="text-[10px] text-amber-600">12 micro-teaching assignments to grade</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-900">Next Free Slot</div>
                  <div className="text-[10px] text-emerald-600">Today 12:00 PM - 02:00 PM</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
