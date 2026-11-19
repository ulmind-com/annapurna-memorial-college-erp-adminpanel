import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle, Layers, Calendar, ChevronRight } from 'lucide-react';
import { Course, Subject } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';

export const AcademicsView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('BED');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const loadAcademics = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        const sList = await api.getSubjects(selectedCourse);
        setSubjects(sList);
      } catch (e) {
        console.error(e);
      }
    };
    loadAcademics();
  }, [selectedCourse]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Academic Curriculum & Course Programs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          BSAEU syllabus, course credits, evaluation patterns, and subject allocations
        </p>
      </div>

      {/* Courses Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {courses.map((c) => {
          const isSelected = selectedCourse === c.code;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCourse(c.code)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold text-xs font-mono">
                  {c.code}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  NCTE Approved
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3 leading-snug">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
                <div className="text-slate-400">
                  Duration: <span className="font-semibold text-slate-200">{c.duration_years} Years</span>
                </div>
                <div className="text-slate-400 text-right">
                  Semesters: <span className="font-semibold text-slate-200">{c.total_semesters}</span>
                </div>
                <div className="text-slate-400">
                  Intake: <span className="font-semibold text-slate-200">{c.max_intake} Trainees</span>
                </div>
                <div className="text-slate-400 text-right">
                  Dept: <span className="font-semibold text-slate-200 truncate">Education</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subjects Catalog for Selected Course */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Syllabus & Subject Modules: {selectedCourse}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Credits, theory/practical breakdown, and instructor assignments
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Subject Code</th>
                <th className="py-3 px-3">Title & Module</th>
                <th className="py-3 px-3 text-center">Semester</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Theory (Max)</th>
                <th className="py-3 px-3 text-center">Practicum (Max)</th>
                <th className="py-3 px-3 text-center">Full Marks</th>
                <th className="py-3 px-3 text-right">Assigned Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{s.code}</td>
                  <td className="py-3 px-3 font-semibold text-white">{s.title}</td>
                  <td className="py-3 px-3 text-center font-medium text-slate-300">Sem {s.semester}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-400">{s.credits}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{s.theory_marks}</td>
                  <td className="py-3 px-3 text-center text-slate-300">{s.practical_marks}</td>
                  <td className="py-3 px-3 text-center font-bold text-white">{s.full_marks}</td>
                  <td className="py-3 px-3 text-right font-medium text-indigo-300">
                    {s.faculty_name || 'Department Faculty'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
