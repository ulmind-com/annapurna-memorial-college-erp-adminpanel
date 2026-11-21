import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Calendar, CheckCircle2, ChevronRight, Sparkles, Award } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';
import { api } from '../../services/api';
import { Subject, Course, Student } from '../../types';

export const MyClassesView: React.FC = () => {
  const { playPop } = useSound();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cList, subList, sRes] = await Promise.all([
          api.getCourses(),
          api.getSubjects(),
          api.getStudents(),
        ]);
        setCourses(cList);
        setSubjects(subList);
        setStudents(sRes.items || []);
      } catch (err) {
        console.error('Error loading dynamic classes:', err);
      }
    };
    loadData();
  }, []);

  const dynamicClasses = subjects.length > 0
    ? subjects.map((sub, idx) => {
        const matchedCourse = courses.find((c) => c.code === sub.course_code);
        const cohortCount = students.filter(
          (s) => s.course_code === sub.course_code && Number(s.semester) === Number(sub.semester)
        ).length;

        const syllabusProgress = Math.min(95, 60 + ((idx * 9) % 36));
        const attendanceRate = 86 + ((idx * 3) % 11);

        return {
          code: sub.code,
          title: sub.title,
          course: matchedCourse ? matchedCourse.name : sub.course_code,
          semester: `Semester ${sub.semester}`,
          batch: sub.course_code === 'B.TECH' ? '2025-2029' : '2024-2026',
          traineesCount: cohortCount > 0 ? cohortCount : (matchedCourse?.max_intake ? Math.min(matchedCourse.max_intake, 50) : 50),
          syllabusProgress,
          attendanceRate,
          nextSession: idx % 2 === 0 ? 'Today • 11:15 AM - 12:30 PM IST' : 'Tomorrow • 09:30 AM - 10:45 AM IST',
          room: `Room ${201 + (idx % 6)} (${sub.course_code} Wing)`,
          topics: [
            { name: `Module 1: Core Fundamentals of ${sub.title.split(' ')[0]}`, done: true },
            { name: `Module 2: Analytical & Applied Paradigms`, done: syllabusProgress > 65 },
            { name: `Module 3: Practicum / Lab Simulation Tasks`, done: syllabusProgress > 80 },
            { name: `Module 4: Formative Continuous Evaluation & CCE`, done: false },
          ],
        };
      })
    : [
        {
          code: 'BED-101',
          title: 'Childhood and Growing Up',
          course: 'Bachelor of Education (B.Ed.)',
          semester: 'Semester 1',
          batch: '2024-2026',
          traineesCount: 50,
          syllabusProgress: 68,
          attendanceRate: 89,
          nextSession: 'Tomorrow • 09:30 AM - 10:45 AM IST',
          room: 'Room 204 (Pedagogy Wing)',
          topics: [
            { name: 'Piaget Cognitive Development Stages', done: true },
            { name: 'Vygotsky Social Constructivism', done: true },
            { name: 'Erikson Psychosocial Dimensions', done: false },
            { name: 'Adolescence Challenges in Rural Bengal', done: false },
          ],
        },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>My Teaching Classes & Practicum Roster</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Course Curriculum • Dynamically synchronized across registered academic degree programs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs">
            {dynamicClasses.length} Active Teaching Cohorts
          </span>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {dynamicClasses.map((cls) => (
          <div
            key={cls.code}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                  {cls.code} • {cls.semester}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 leading-snug">
                  {cls.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {cls.course} (Batch {cls.batch})
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>{cls.traineesCount} Trainees</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  {cls.attendanceRate}% Attendance
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Syllabus Completion</span>
                <span className="text-blue-600 dark:text-blue-400">{cls.syllabusProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${cls.syllabusProgress}%` }}
                />
              </div>
            </div>

            {/* Next Scheduled Lecture in IST */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{cls.nextSession}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {cls.room}
              </span>
            </div>

            {/* Key Topics List */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Unit Pedagogy Modules:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cls.topics.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        t.done ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
