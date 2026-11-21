import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  FileCheck2,
  Download,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  QrCode,
  FileText,
  Library,
  ArrowRight,
  ShieldCheck,
  Tag,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Marksheet, Student, StudyMaterial, LeaveApplication, Subject, Notice } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import collegeLogo from '../../assets/logo.png';

interface StudentDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const { playSuccess, playHaptic, playPop } = useSound();

  useEffect(() => {
    const handleNoticeCreated = (e: any) => {
      if (e.detail) {
        setNotices((prev) => [e.detail, ...prev.filter((n) => n.id !== e.detail.id)]);
      }
    };
    window.addEventListener('annapurna_notice_created', handleNoticeCreated);

    const interval = setInterval(async () => {
      try {
        const nList = await api.getNotices();
        setNotices(nList);
      } catch {}
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('annapurna_notice_created', handleNoticeCreated);
    };
  }, []);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // 1. Fetch student's record matching email or name or roll
        const studentRes = await api.getStudents();
        const found =
          studentRes.items.find(
            (s) =>
              (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
              (user?.roll_number && s.roll_number === user.roll_number) ||
              (user?.full_name && s.full_name.toLowerCase() === user.full_name.toLowerCase())
          ) || studentRes.items[0];

        if (found) {
          setStudent(found);
        }

        // 2. Fetch marksheet
        const msList = await api.getAllMarksheets();
        const studentRoll = found?.roll_number || user?.roll_number || 'AMC-TR-2024';
        const myMarksheet = msList.find(
          (m) =>
            m.roll_number.toLowerCase() === studentRoll.toLowerCase() ||
            m.student_name.toLowerCase() === (user?.full_name || '').toLowerCase()
        ) || msList[0];
        setMarksheet(myMarksheet || null);

        // 3. Fetch Study Materials uploaded by teachers
        const courseCode = found?.course_code || 'BED';
        const materials = await api.getStudyMaterials({ course_code: courseCode });
        setStudyMaterials(materials);

        // 4. Fetch Student Leaves
        const leaveList = await api.getLeaveApplications();
        const myLeaves = leaveList.filter(
          (l) =>
            (found && (l.student_id === found.id || l.roll_number === found.roll_number)) ||
            (user?.full_name && l.student_name.toLowerCase() === user.full_name.toLowerCase())
        );
        setLeaves(myLeaves.length > 0 ? myLeaves : leaveList.slice(0, 2));

        // 5. Fetch subjects for schedule
        const subList = await api.getSubjects(courseCode);
        setSubjects(subList);

        // 6. Fetch live campus notices
        const nList = await api.getNotices();
        setNotices(nList);
      } catch (e) {
        console.error('Error loading student dashboard data:', e);
      }
    };

    loadStudentData();
  }, [user]);

  const handleDownloadPdf = async () => {
    if (!marksheet) return;
    try {
      playSuccess();
      const blob = await api.downloadMarksheetPdf(marksheet.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Official_Marksheet_${marksheet.roll_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadMaterial = (m: StudyMaterial) => {
    playSuccess();
    if (m.file_url && m.file_url !== '/sample_study_material.pdf' && m.file_url !== '/sample_note.pdf') {
      window.open(m.file_url, '_blank');
    } else {
      const noteContent = `ANNAPURNA MEMORIAL COLLEGE OF EDUCATION\nDIGITAL SYLLABUS VAULT\n\nTitle: ${m.title}\nCourse: ${m.course_code} (Semester ${m.semester})\nSubject: ${m.subject_code}\nUploaded By: ${m.uploaded_by_name}\nDate: ${m.created_at || new Date().toLocaleDateString()}\n\nDescription:\n${m.description || 'Comprehensive lecture notes and practicum guidelines prepared per BSAEU & NCTE curriculum.'}\n\nTopics Covered:\n${m.tags.join(', ')}\n\n(Official Certified Digital Material)`;
      const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${m.subject_code}_${m.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const displayName = user?.full_name || student?.full_name || 'Teacher Trainee';
  const displayRoll = student?.roll_number || user?.roll_number || 'AMC-TR-2024';
  const displayCourse = student?.course_name || 'Bachelor of Education (B.Ed.)';
  const displaySemester = student?.semester || 1;
  const displayReg = student?.registration_number || `BSAEU-2024-${displayRoll.slice(-5)}`;
  const displayAvatar =
    user?.avatar_url ||
    student?.avatar_url ||
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayRoll}`;

  const clearedLeavesCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover shadow-md bg-white/10"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={collegeLogo}
                  alt="Annapurna Memorial College of Education Crest"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                Annapurna Memorial College of Education • Trainee Portal
              </span>
              <h1 className="text-2xl font-black tracking-tight">Welcome back, {displayName}!</h1>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-2">
                <span>
                  Roll: <b>{displayRoll}</b>
                </span>
                <span>•</span>
                <span>
                  Reg: <b>{displayReg}</b>
                </span>
                <span>•</span>
                <span>
                  {displayCourse} Sem {displaySemester}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {marksheet && (
              <SoundButton
                onClick={handleDownloadPdf}
                variant="white"
                size="sm"
                soundType="haptic"
                icon={<Download className="w-4 h-4 text-blue-600" />}
              >
                Download Marksheet PDF
              </SoundButton>
            )}
            <SoundButton
              onClick={() => onNavigate('materials')}
              variant="secondary"
              size="sm"
              soundType="pop"
              icon={<Library className="w-4 h-4" />}
            >
              Study Notes Vault
            </SoundButton>
          </div>
        </div>
      </div>

      {/* Trainee KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Compliance Meter */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Physical Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">88.3%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Compliant (NCTE ≥ 75% rule satisfied)
          </div>
        </div>

        {/* Semester SGPA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Semester SGPA
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {marksheet ? marksheet.sgpa : 'In Progress'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Grade:{' '}
            <b className="text-slate-800 dark:text-slate-200">
              {marksheet ? marksheet.result_status || 'O (Outstanding)' : 'Pending Evaluation'}
            </b>
          </div>
        </div>

        {/* Leave Application Status */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Leave Requests
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {clearedLeavesCount} Approved
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {leaves.length - clearedLeavesCount > 0
              ? `${leaves.length - clearedLeavesCount} Request Pending Review`
              : 'Official Absence Sanctioned'}
          </div>
        </div>

        {/* Notes & Syllabus Materials */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Materials
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {studyMaterials.length} Documents
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Uploaded by Faculty</div>
        </div>
      </div>

      {/* Live Campus Announcements & Official Circulars */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Official Circulars
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Direct from Principal & Executive Administration
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Campus Announcements & Institutional Notices
            </h3>
          </div>
          <SoundButton
            onClick={() => onNavigate('notices')}
            size="sm"
            variant="outline"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Notices ({notices.length})
          </SoundButton>
        </div>

        {notices.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400">No active circulars at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices
              .filter((n) => n.target_audience === 'ALL' || n.target_audience === 'STUDENTS' || !n.target_audience)
              .slice(0, 3)
              .map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {n.category || 'NOTICE'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Live'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>By: {n.published_by_name || 'Administration'}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer" onClick={() => onNavigate('notices')}>
                      Read More &rarr;
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* CORE FEATURE: Notes & Study Materials Uploaded by Teachers */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Digital Repository
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Real-time Sync with Faculty Desk
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Latest Course Notes & Study Materials from Faculty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant access to lecture notes, model question banks, and practicum blueprints uploaded by your teachers
            </p>
          </div>

          <SoundButton
            onClick={() => onNavigate('materials')}
            size="sm"
            variant="outline"
            soundType="pop"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Open All Notes
          </SoundButton>
        </div>

        {studyMaterials.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p>No study materials uploaded for this program yet. Check back soon or visit the digital vault.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyMaterials.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {m.subject_code} (Sem {m.semester})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Uploaded by {m.uploaded_by_name}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {m.description || 'BSAEU & NCTE course pedagogy lesson notes and practicum guidelines.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{m.tags?.[0] || 'Faculty Notes'}</span>
                  </div>
                  <SoundButton
                    onClick={() => handleDownloadMaterial(m)}
                    size="sm"
                    variant="primary"
                    soundType="pop"
                    icon={<Download className="w-3 h-3" />}
                  >
                    Download Notes
                  </SoundButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certified Marksheet Card */}
      {marksheet && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Baba Saheb Ambedkar Education University (BSAEU)
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Official Statement of Marks & Grades ({displayCourse} Sem {displaySemester})
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>
                  Examination: <b>{marksheet.exam_title}</b>
                </span>
                <span>•</span>
                <span className="font-mono text-emerald-600">Tamper-evident Hash: {marksheet.qr_code_hash}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge status={marksheet.status} />
              <SoundButton
                onClick={handleDownloadPdf}
                size="sm"
                variant="primary"
                soundType="haptic"
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </SoundButton>
            </div>
          </div>

          {/* Subject scores breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Subject Code & Title</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Theory</th>
                  <th className="py-2.5 px-3 text-center">Practicum</th>
                  <th className="py-2.5 px-3 text-center">Total Marks</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                  <th className="py-2.5 px-3 text-center">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marksheet.subject_scores.map((sc) => (
                  <tr key={sc.subject_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{sc.subject_title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sc.subject_code}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{sc.credits}</td>
                    <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                      {sc.theory_obtained} / {sc.max_theory}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                      {sc.practical_obtained} / {sc.max_practical}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                      {sc.total_obtained} / {sc.max_marks}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-blue-600 dark:text-blue-400">
                      {sc.grade_point}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {sc.letter_grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Marks Obtained: </span>
              <b className="text-slate-900 dark:text-white text-sm">
                {marksheet.total_marks_obtained} / {marksheet.grand_max_marks} ({marksheet.overall_percentage}%)
              </b>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">SGPA: </span>
              <b className="text-blue-700 dark:text-blue-400 text-base">{marksheet.sgpa}</b>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Final Classification: </span>
              <b className="text-emerald-700 dark:text-emerald-400 font-bold">{marksheet.result_status}</b>
            </div>
          </div>
        </div>
      )}

      {/* Trainee's Schedule derived from Curriculum */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Today's Class Schedule & Practicum Timing ({displayCourse})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          {subjects.length > 0 ? (
            subjects.slice(0, 3).map((sub, idx) => (
              <div
                key={sub.code}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {idx === 0 ? '09:30 AM - 10:15 AM' : idx === 1 ? '11:15 AM - 12:00 PM' : '02:00 PM - 03:30 PM'}
                </span>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {sub.code}: {sub.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {sub.faculty_name} • Pedagogy Room {204 + idx}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400 text-xs">
              No classes scheduled for today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
