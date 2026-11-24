import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Search, AlertCircle, Mail, Phone } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { api, FacultySubject } from '../../services/api';
import { Student } from '../../types';

/** Teacher: assigned subjects and the student list of each class. */
export const MyClassesView: React.FC = () => {
  const { playTab } = useSound();
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<FacultySubject | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyFacultyProfile(), api.getStudents()])
      .then(([me, sRes]) => {
        setSubjects(me.subjects);
        setStudents(sRes.items || []);
        if (me.subjects.length) setSelected(me.subjects[0]);
      })
      .catch((e) => setError(e.message || 'Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const roster = selected
    ? students.filter(
        (s) =>
          s.course_code === selected.course_code &&
          Number(s.semester) === Number(selected.semester) &&
          (s.full_name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q))
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" /> My Assigned Classes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Subjects assigned to you and their enrolled students</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {!loading && !error && subjects.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-300">
          No subjects are assigned to you yet. Ask the Super Admin to assign subjects in Academic Structure.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const active = selected?.id === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                playTab();
                setSelected(sub);
              }}
              className={`p-5 rounded-3xl border text-left transition-all shadow-sm ${
                active
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
              }`}
            >
              <div className={`text-[10px] font-mono font-bold ${active ? 'text-blue-100' : 'text-blue-600'}`}>{sub.code}</div>
              <div className="text-sm font-black mt-0.5">{sub.title}</div>
              <div className={`text-[11px] mt-2 ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                {sub.course_code} • Semester {sub.semester} • {sub.credits} credits
              </div>
              <div className={`text-[11px] mt-1 flex items-center gap-1 font-bold ${active ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                <Users className="w-3.5 h-3.5" /> {sub.student_count} students • Marks {sub.practical_marks} internal + {sub.theory_marks} external
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black">
              Student List — {selected.course_code} Semester {selected.semester} ({roster.length})
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or roll..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-3">Roll</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Session</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-3 font-mono font-bold">{s.roll_number}</td>
                    <td className="py-2 pr-3 font-bold">{s.full_name}</td>
                    <td className="py-2 pr-3 text-slate-500">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</div>
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</div>
                    </td>
                    <td className="py-2 pr-3">{s.academic_session}</td>
                    <td className="py-2">{s.status}</td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No students enrolled in this class.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
