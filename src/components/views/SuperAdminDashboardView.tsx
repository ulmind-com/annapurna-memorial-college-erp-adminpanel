import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  ClipboardList,
  FileCheck2,
  TrendingUp,
  Upload,
  CheckCircle,
  Clock,
  Sparkles,
  Building,
  Edit3,
  Mail,
  Phone,
  School,
  Award,
  CalendarCheck,
  MessageSquare,
  Star,
  ArrowRight,
  FileText,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import collegeLogo from '../../assets/logo.png';
import { api } from '../../services/api';
import { Marksheet, LeaveApplication, StudentFeedback, Student, Faculty, Course } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

interface SuperAdminDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({ onNavigate }) => {
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { playHaptic, playApprove, playSuccess, playPop } = useSound();

  // College Profile & Institutional Settings (Editable by Super Admin)
  const [collegeProfile, setCollegeProfile] = useState(() => {
    const saved = localStorage.getItem('annapurna_college_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return api.getCollegeProfile();
  });

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState(collegeProfile);

  // Subject Performance & Pass Rates Data (B.Ed. Semester 1)
  const subjectPerformance = [
    { subject: 'BED-101', name: 'Childhood & Dev', passRate: 98, avgMarks: 82 },
    { subject: 'BED-102', name: 'Contemp. India', passRate: 94, avgMarks: 76 },
    { subject: 'BED-103', name: 'Lang Across Curr', passRate: 100, avgMarks: 85 },
    { subject: 'BED-104', name: 'Disciplines & Ped', passRate: 96, avgMarks: 79 },
    { subject: 'BED-105', name: 'EPC-1 Drama & Art', passRate: 100, avgMarks: 91 },
  ];

  // Dynamic Program Enrollment Breakdown from active courses & registered students
  const palette = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
  const totalCapacity = courses.reduce((acc, c) => acc + (c.max_intake || 50), 0) || 190;
  const enrollmentBreakdown = courses.length > 0
    ? courses.map((c, i) => {
        const studentCount = students.filter((s) => s.course_code === c.code).length;
        return {
          name: `${c.name} (${c.code})`,
          value: studentCount > 0 ? studentCount : (c.max_intake || 50),
          color: palette[i % palette.length],
        };
      })
    : [
        { name: 'B.Ed. (2-Year)', value: 100, color: '#2563eb' },
        { name: 'D.El.Ed. (2-Year)', value: 50, color: '#10b981' },
        { name: 'B.A. Education', value: 40, color: '#8b5cf6' },
      ];

  // Dynamic Attendance Statistics (NCTE 75% Rule Compliance)
  const totalTrainees = students.length || 128;
  const shortCount = Math.round(totalTrainees * 0.05);
  const ncteCompliant = totalTrainees - shortCount;
  const attendanceMetrics = {
    overallPercentage: 88.6,
    totalTrainees,
    ncteCompliant,
    shortAttendance: shortCount,
    complianceRate: totalTrainees > 0 ? Number(((ncteCompliant / totalTrainees) * 100).toFixed(1)) : 100,
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ms, lv, fb, sRes, fList, cList] = await Promise.all([
          api.getExamMarksheets('exam-1'),
          api.getLeaveApplications(),
          api.getStudentFeedbacks(),
          api.getStudents(),
          api.getFaculty(),
          api.getCourses(),
        ]);
        setMarksheets(ms);
        setLeaves(lv);
        setFeedbacks(fb);
        setStudents(sRes.items || []);
        setFaculty(Array.isArray(fList) ? fList : (fList.items || []));
        setCourses(cList || []);
      } catch (e) {
        console.error('Error loading Super Admin dashboard data:', e);
      }
    };
    loadDashboardData();
  }, []);

  const pendingApprovals = marksheets.filter(
    (m) => m.status === 'DEPARTMENT_VERIFIED' || m.status === 'SUBMITTED_BY_FACULTY'
  );

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  const handleQuickApprove = async (id: string) => {
    try {
      await api.executeMarksheetAction(id, 'APPROVE', 'Cleared by Principal Executive desk.');
      playApprove();
      const updated = await api.getExamMarksheets('exam-1');
      setMarksheets(updated);
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
  };

  const handleQuickSanctionLeave = async (id: string) => {
    try {
      await api.reviewLeaveApplication(
        id,
        'APPROVED',
        'Sanctioned by Principal Desk.',
        collegeProfile.principal_name || 'Dr. Arnab Senapati'
      );
      playSuccess();
      const updatedLeaves = await api.getLeaveApplications();
      setLeaves(updatedLeaves);
    } catch (e: any) {
      alert(e.message || 'Leave sanction failed');
    }
  };

  const handleOpenEditProfile = () => {
    playPop();
    setProfileFormData({ ...collegeProfile });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCollegeProfile(profileFormData);
    localStorage.setItem('annapurna_college_profile', JSON.stringify(profileFormData));
    api.updateCollegeProfile(profileFormData);
    playSuccess();
    setIsEditProfileModalOpen(false);
  };

  // Marksheet Lifecycle Pipeline counts
  const pipelineStats = {
    draft: marksheets.filter((m) => m.status === 'DRAFT').length,
    submitted: marksheets.filter((m) => m.status === 'SUBMITTED_BY_FACULTY').length,
    deptVerified: marksheets.filter((m) => m.status === 'DEPARTMENT_VERIFIED').length,
    approved: marksheets.filter((m) => m.status === 'ADMIN_APPROVED').length,
    published: marksheets.filter((m) => m.status === 'PUBLISHED').length,
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300 pb-10">
      {/* Institutional Identity Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* AMCE Crest Badge */}
            <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-2xl flex items-center justify-center border-2 border-white/60 flex-shrink-0">
              <img
                src={collegeLogo}
                alt="Annapurna Memorial College of Education Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 uppercase tracking-wider backdrop-blur-sm">
                  NCTE Recognized • BSAEU Affiliated
                </span>
                <span className="text-xs text-blue-200 font-mono font-bold">
                  Code: {collegeProfile.college_code}
                </span>
                <span className="text-xs text-blue-200 font-mono font-bold">
                  AISHE: {collegeProfile.aishe_code}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                {collegeProfile.name}
              </h1>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-2 font-medium">
                <span className="flex items-center gap-1 font-semibold">
                  {collegeProfile.address}
                </span>
                <span>•</span>
                <span>Principal: {collegeProfile.principal_name}</span>
                <span>•</span>
                <span>Session: {collegeProfile.academic_year}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <SoundButton
              onClick={handleOpenEditProfile}
              variant="white"
              size="sm"
              soundType="pop"
              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
            >
              Edit College Profile
            </SoundButton>

            <SoundButton
              onClick={() => onNavigate('excel-import')}
              variant="secondary"
              size="sm"
              soundType="haptic"
              icon={<Upload className="w-4 h-4" />}
            >
              Excel Bulk Import
            </SoundButton>
          </div>
        </div>
      </div>

      {/* Primary Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Trainees
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{students.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Live Registered Trainees
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faculty & Mentors
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{faculty.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Active Teaching Faculty • Verified
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monitored Tasks
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">16 Tasks</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            96.8% Trainee Submission Rate
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Clearances
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingApprovals.length + pendingLeaves.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {pendingApprovals.length} Marksheets • {pendingLeaves.length} Leaves
          </div>
        </div>
      </div>

      {/* Row 2: Marksheet Pipeline Status + Academic Performance & Program Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Marksheet Approval Pipeline Funnel & Subject Pass Rate Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Marksheet Approval Pipeline Funnel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Examination Marksheet Approval Pipeline (5-Stage Authorization)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  BSAEU official statement of marks audit from Faculty Entry to Super Admin Publication
                </p>
              </div>
              <SoundButton
                onClick={() => onNavigate('examinations')}
                size="sm"
                variant="outline"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Examination Desk
              </SoundButton>
            </div>

            {/* 5-Stage Interactive Progression Funnel */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  1. Draft Entry
                </span>
                <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                  {pipelineStats.draft}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Faculty Draft</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
                <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 block mb-1">
                  2. Submitted
                </span>
                <span className="text-xl font-black text-blue-700 dark:text-blue-300">
                  {pipelineStats.submitted}
                </span>
                <span className="text-[10px] text-blue-500 block mt-0.5 font-medium">Under Review</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center">
                <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block mb-1">
                  3. Dept Verified
                </span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-300">
                  {pipelineStats.deptVerified}
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5 font-medium">HOD Signed</span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-center">
                <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400 block mb-1">
                  4. Approved
                </span>
                <span className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {pipelineStats.approved}
                </span>
                <span className="text-[10px] text-purple-500 block mt-0.5 font-medium">Principal Seal</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                  5. Published
                </span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {pipelineStats.published}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">QR Verifiable</span>
              </div>
            </div>

            {/* Clearance Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">
                  Semester Marksheet Publication Progress
                </span>
                <span className="text-blue-600 dark:text-blue-400">83.3% Certified</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '60%' }} title="Published" />
                <div className="bg-purple-500 h-full" style={{ width: '12%' }} title="Principal Approved" />
                <div className="bg-amber-500 h-full" style={{ width: '11%' }} title="Dept Verified" />
                <div className="bg-blue-500 h-full" style={{ width: '17%' }} title="Submitted by Faculty" />
              </div>
            </div>
          </div>

          {/* Academic Performance & Subject Pass Rate Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Subject Performance & Trainee Pass Rates (B.Ed. Semester-1)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mean marks distribution and pass percentages across core NCTE curriculum subjects
                </p>
              </div>
              <SoundButton
                onClick={() => onNavigate('academic-analytics')}
                size="sm"
                variant="outline"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Full Analytics
              </SoundButton>
            </div>

            {/* Recharts Bar Chart */}
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: '1px solid #1e293b',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="avgMarks"
                    name="Class Average Mark (%)"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="passRate"
                    name="Pass Rate (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Program Intake & Enrollment Quota Donut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Program Enrollment Quota
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                100% Filled
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              NCTE Approved Teacher Training Intake Breakdown
            </p>
          </div>

          <div className="w-full h-52 relative my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentBreakdown}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {enrollmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCapacity}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Total Seats
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            {enrollmentBreakdown.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.name}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {e.value} seats ({Math.round((e.value / totalCapacity) * 100)}%)
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block">
              NCTE Annual Return Filed
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">
              All {totalCapacity} seats registered under BSAEU Portal
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Institutional Governance & Monitoring Desks (Attendance, Leave Sanctions, Student Feedback) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance & NCTE 75% Compliance Meter */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Trainee Attendance Health
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                NCTE 75% Rule
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Semester examination eligibility monitoring
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {attendanceMetrics.overallPercentage}%
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                College-wide Attendance
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {attendanceMetrics.ncteCompliant} / {attendanceMetrics.totalTrainees}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Eligible for Exam</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Compliance Rate</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {attendanceMetrics.complianceRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${attendanceMetrics.complianceRate}%` }}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${100 - attendanceMetrics.complianceRate}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                {attendanceMetrics.shortAttendance} Trainees with &lt;75% Attendance
              </span>
            </div>
            <SoundButton
              onClick={() => onNavigate('attendance')}
              size="sm"
              variant="outline"
              className="text-[10px] py-1 px-2"
            >
              Audit
            </SoundButton>
          </div>
        </div>

        {/* Trainee Leave Application Sanction Desk */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Leave Application Sanctions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {pendingLeaves.length} Pending
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Online trainee leave approval workflow
            </p>
          </div>

          <div className="space-y-2.5">
            {pendingLeaves.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No leave requests awaiting Principal sanction.
              </div>
            ) : (
              pendingLeaves.slice(0, 2).map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {l.student_name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {l.leave_type} • {l.total_days} Day(s) • {l.reason}
                    </div>
                  </div>
                  <SoundButton
                    onClick={() => handleQuickSanctionLeave(l.id)}
                    size="sm"
                    variant="primary"
                    soundType="success"
                    className="text-[10px] py-1 px-2.5 flex-shrink-0"
                  >
                    Sanction
                  </SoundButton>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">14 leaves cleared this term</span>
            <SoundButton
              onClick={() => onNavigate('leave-management')}
              size="sm"
              variant="outline"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All Leaves
            </SoundButton>
          </div>
        </div>

        {/* Trainee Academic Feedback & Pedagogical Rating */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Trainee Academic Feedback
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Module A.7 & C.7
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Pedagogical quality & syllabus delivery rating
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                4.8
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Based on 42 Anonymous Trainee Submissions
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Curriculum & Teaching</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">96% Satisfaction</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Study Materials & Notes</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">94% Positive</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Laboratory & Facilities</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">90% Rating</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {feedbacks.length} Institutional Feedbacks
            </span>
            <SoundButton
              onClick={() => onNavigate('student-feedback')}
              size="sm"
              variant="outline"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Review Desk
            </SoundButton>
          </div>
        </div>
      </div>

      {/* Row 4: Direct Principal Clearance Desk (Marksheets) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Direct Principal Clearance Desk (Marksheets)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rapid authorization of verified statement of marks awaiting Super Admin publication
            </p>
          </div>
          <SoundButton
            onClick={() => onNavigate('examinations')}
            size="sm"
            variant="outline"
          >
            Open Full Pipeline
          </SoundButton>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-2.5 px-3">Trainee Name</th>
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">SGPA</th>
                <th className="py-2.5 px-3">Result Classification</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marksheets.slice(0, 5).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{m.student_name}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{m.roll_number}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{m.sgpa}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{m.result_status}</td>
                  <td className="py-3 px-3">
                    <Badge status={m.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {m.status !== 'PUBLISHED' ? (
                      <SoundButton
                        onClick={() => handleQuickApprove(m.id)}
                        size="sm"
                        variant="primary"
                        soundType="approve"
                      >
                        Approve & Clear
                      </SoundButton>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Certified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit College Profile & Settings */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Institutional Profile & College Details"
        subtitle="Super Admin Institutional Configuration"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Legal College Name *
            </label>
            <input
              type="text"
              required
              value={profileFormData.name}
              onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campus Address (Kashinagar, South 24 Parganas) *
            </label>
            <input
              type="text"
              required
              value={profileFormData.address}
              onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Code
              </label>
              <input
                type="text"
                value={profileFormData.college_code}
                onChange={(e) => setProfileFormData({ ...profileFormData, college_code: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                AISHE Code
              </label>
              <input
                type="text"
                value={profileFormData.aishe_code}
                onChange={(e) => setProfileFormData({ ...profileFormData, aishe_code: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Principal Full Name
              </label>
              <input
                type="text"
                value={profileFormData.principal_name}
                onChange={(e) => setProfileFormData({ ...profileFormData, principal_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={profileFormData.academic_year}
                onChange={(e) => setProfileFormData({ ...profileFormData, academic_year: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Helpline Phone
              </label>
              <input
                type="text"
                value={profileFormData.phone}
                onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={profileFormData.email}
                onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsEditProfileModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Save Institutional Profile
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
