import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle, XCircle, Clock, Users, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Student, Course, Subject } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

export const AttendanceView: React.FC = () => {
  const { activeRole } = useAuth();
  const isStudent = activeRole === 'STUDENT';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('BED');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'TAKE' | 'ANALYTICS'>('TAKE');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [analyticsPageSize, setAnalyticsPageSize] = useState(15);
  const { playClick, playSuccess, playAlert } = useSound();

  // Load available courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourse(cList[0].code);
        }
      } catch (e) {
        console.error('Error loading courses:', e);
      }
    };
    loadCourses();
  }, []);

  // Whenever selected course changes, reload subjects and students
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const [subList, sRes] = await Promise.all([
          api.getSubjects(selectedCourse),
          api.getStudents({ course_code: selectedCourse }),
        ]);
        setSubjects(subList);
        if (subList.length > 0) {
          setSelectedSubject(subList[0].code);
        } else {
          setSelectedSubject(`${selectedCourse}-101`);
        }

        setStudents(sRes.items);
        const map: Record<string, 'PRESENT' | 'ABSENT'> = {};
        sRes.items.forEach((s) => {
          map[s.id] = 'PRESENT';
        });
        setAttendanceMap(map);

        const an = await api.getAttendanceAnalytics(selectedCourse, 1);
        setAnalytics(an);
      } catch (e) {
        console.error('Error loading course data for attendance:', e);
      }
    };
    if (selectedCourse) {
      loadCourseData();
    }
  }, [selectedCourse]);

  const toggleStudentStatus = (id: string) => {
    playClick();
    setAttendanceMap((prev) => ({
      ...prev,
      [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    playClick();
    const updated: Record<string, 'PRESENT' | 'ABSENT'> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = () => {
    playSuccess();
    alert('Attendance successfully recorded and saved to institutional records.');
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const totalCount = students.length;
  const attendancePct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Student Personal View
  if (isStudent) {
    return (
      <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              NCTE Compliance Desk
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Ed. Academic Regulation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            75% Physical Attendance Meter & Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mandatory physical instructional attendance for examination eligibility
          </p>
        </div>

        {/* 75% Meter Hero Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trainee Overall Attendance</span>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">88.3%</div>
              <p className="text-xs text-slate-500">
                You have attended <b className="text-slate-900 dark:text-white">53 out of 60</b> instructional classes this semester.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-black text-emerald-800 dark:text-emerald-200 uppercase">NCTE Compliant</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Fully eligible to appear in BSAEU Semester I Examinations
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '88.3%' }} />
              {/* 75% Marker Line */}
              <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-500 z-10" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>0%</span>
              <span className="text-rose-500 font-extrabold">75% Mandatory Minimum Threshold</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Subject-Wise Attendance Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
            Subject-Wise Attendance Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Subject Code & Title</th>
                  <th className="py-3 px-4 text-center">Classes Held</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { code: 'BED-101', title: 'Childhood & Growing Up', total: 16, attended: 15, pct: 93.8 },
                  { code: 'BED-102', title: 'Contemporary India & Education', total: 16, attended: 14, pct: 87.5 },
                  { code: 'BED-103', title: 'Language Across Curriculum', total: 10, attended: 9, pct: 90.0 },
                  { code: 'BED-104', title: 'Understanding Disciplines', total: 10, attended: 8, pct: 80.0 },
                  { code: 'BED-105', title: 'Drama & Art in Education', total: 8, attended: 7, pct: 87.5 },
                ].map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">{row.code}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{row.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">{row.total}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">{row.attended}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.pct}%</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Eligible
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Super Admin view
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Instructional Registry
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">NCTE 75% Compliance Threshold</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Classroom & Biometric Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record daily physical instructional attendance and evaluate student eligibility
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              setActiveTab('TAKE');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'TAKE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Mark Daily Sheet
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveTab('ANALYTICS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            NCTE Compliance Analytics
          </button>
        </div>
      </div>

      {activeTab === 'TAKE' ? (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Program / Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {courses.map((c) => (
                    <option key={c.id || c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Subject Module
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {subjects.length > 0 ? (
                    subjects.map((sub) => (
                      <option key={sub.id || sub.code} value={sub.code}>
                        {sub.code}: {sub.title}
                      </option>
                    ))
                  ) : (
                    <option value={`${selectedCourse}-101`}>{selectedCourse}-101: General Pedagogical Studies</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('PRESENT')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('ABSENT')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Trainee Attendance List */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>{presentCount} Present • {totalCount - presentCount} Absent ({attendancePct}% Attendance)</span>
              <SoundButton onClick={handleSaveAttendance} size="sm" variant="primary" soundType="success">
                Save Daily Attendance
              </SoundButton>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {students
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((st) => {
                  const isPresent = attendanceMap[st.id] === 'PRESENT';
                  return (
                    <div
                      key={st.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${st.roll_number}`}
                          alt={st.full_name}
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-2xs"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">{st.full_name}</div>
                          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{st.roll_number}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleStudentStatus(st.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {isPresent ? 'PRESENT' : 'ABSENT'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <Pagination
            totalItems={students.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        /* Analytics View */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Cohort NCTE 75% Compliance Radar
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4 text-center">Classes</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4 text-center">Attendance %</th>
                  <th className="py-3 px-4 text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics
                  .slice((analyticsPage - 1) * analyticsPageSize, analyticsPage * analyticsPageSize)
                  .map((an) => (
                    <tr key={an.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{an.student_name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{an.roll_number}</td>
                      <td className="py-3.5 px-4 text-center">{an.total_classes}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{an.classes_attended}</td>
                      <td className="py-3.5 px-4 text-center font-black">
                        <span className={an.percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                          {an.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            an.percentage < 75
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {an.percentage < 75 ? 'Short Attendance' : 'Compliant'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={analytics.length}
            currentPage={analyticsPage}
            pageSize={analyticsPageSize}
            onPageChange={setAnalyticsPage}
            onPageSizeChange={(s) => {
              setAnalyticsPageSize(s);
              setAnalyticsPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
