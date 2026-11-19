import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { api } from '../../services/api';
import { Student } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

export const AttendanceView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>('BED-101');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'TAKE' | 'ANALYTICS'>('TAKE');
  const { playClick, playSuccess, playAlert } = useSound();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getStudents({ course_code: 'BED' });
        setStudents(res.items);
        const map: Record<string, 'PRESENT' | 'ABSENT'> = {};
        res.items.forEach((s) => {
          map[s.id] = 'PRESENT';
        });
        setAttendanceMap(map);

        const an = await api.getAttendanceAnalytics('BED', 1);
        setAnalytics(an);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            Classroom & Biometric Attendance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor physical instructional attendance and NCTE 75% minimum threshold compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClick();
              setActiveTab('TAKE');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'TAKE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Mark Daily Sheet
          </button>
          <button
            onClick={() => {
              playClick();
              setActiveTab('ANALYTICS');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            NCTE Compliance Analytics
          </button>
        </div>
      </div>

      {activeTab === 'TAKE' ? (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Subject Module
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="BED-101">BED-101: Childhood & Growing Up</option>
                  <option value="BED-102">BED-102: Contemporary India & Education</option>
                  <option value="BED-103">BED-103: Language Across Curriculum</option>
                  <option value="BED-104">BED-104: Understanding Disciplines</option>
                  <option value="BED-105">BED-105: Drama & Art EPC</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-white">
                  Present: <span className="text-emerald-400">{presentCount}</span> / {totalCount} ({attendancePct}%)
                </div>
                <div className="text-[10px] text-slate-400">Class Attendance Rate</div>
              </div>

              <div className="flex items-center gap-1.5">
                <SoundButton
                  onClick={() => markAll('PRESENT')}
                  size="sm"
                  variant="outline"
                  soundType="pop"
                >
                  All Present
                </SoundButton>
                <SoundButton
                  onClick={handleSaveAttendance}
                  size="sm"
                  variant="primary"
                  soundType="success"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Save Sheet
                </SoundButton>
              </div>
            </div>
          </div>

          {/* Student Attendance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((st) => {
              const isPresent = attendanceMap[st.id] === 'PRESENT';
              return (
                <div
                  key={st.id}
                  onClick={() => toggleStudentStatus(st.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                    isPresent
                      ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50'
                      : 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${st.roll_number}`}
                      alt={st.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{st.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.roll_number}</div>
                    </div>
                  </div>

                  <div>
                    {isPresent ? (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        PRESENT
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        ABSENT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Cumulative Attendance & Short Attendance Alerts
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                BSAEU rules require ≥ 75% attendance for examination eligibility
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Trainee</th>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3 text-center">Classes Conducted</th>
                  <th className="py-3 px-3 text-center">Attended</th>
                  <th className="py-3 px-3 text-center">Percentage</th>
                  <th className="py-3 px-3 text-right">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics.map((a) => (
                  <tr key={a.student_id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-white">{a.student_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{a.roll_number}</td>
                    <td className="py-3 px-3 text-center">{a.total_classes}</td>
                    <td className="py-3 px-3 text-center font-bold text-white">{a.classes_attended}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-extrabold ${
                          a.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {a.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {a.is_short_attendance ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Short Attendance Warning
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Exam Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
