import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  Download,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';
import { api } from '../../services/api';
import { Course } from '../../types';

export const AcademicAnalyticsView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('BED');
  const { playSuccess } = useSound();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        if (cList.length > 0 && !cList.some(c => c.code === selectedCourse)) {
          setSelectedCourse(cList[0].code);
        }
      } catch (e) {
        console.error('Error loading courses for analytics:', e);
      }
    };
    loadCourses();
  }, []);

  // Subject-wise Pass Percentage & Score Average
  const subjectPerformance = [
    { subject: 'BED-101', passRate: 98, avgScore: 78, name: 'Childhood & Growing' },
    { subject: 'BED-102', passRate: 96, avgScore: 74, name: 'Contemporary India' },
    { subject: 'BED-103', passRate: 100, avgScore: 82, name: 'Language Across Curr' },
    { subject: 'BED-104', passRate: 94, avgScore: 71, name: 'Understanding Disc' },
    { subject: 'BED-105', passRate: 100, avgScore: 88, name: 'Drama & Art EPC' },
  ];

  // SGPA Grade Distribution
  const gradeDistribution = [
    { grade: 'O (9.0 - 10.0)', count: 28, color: '#10b981' },
    { grade: 'A+ (8.0 - 8.9)', count: 46, color: '#3b82f6' },
    { grade: 'A (7.0 - 7.9)', count: 34, color: '#8b5cf6' },
    { grade: 'B+ (6.0 - 6.9)', count: 16, color: '#f59e0b' },
    { grade: 'B (5.5 - 5.9)', count: 4, color: '#ec4899' },
  ];

  // Assignment Completion Trajectory
  const assignmentTrends = [
    { week: 'Week 1', submitted: 120, target: 128 },
    { week: 'Week 2', submitted: 125, target: 128 },
    { week: 'Week 3', submitted: 118, target: 128 },
    { week: 'Week 4', submitted: 128, target: 128 },
    { week: 'Week 5', submitted: 124, target: 128 },
  ];

  const handleExportReport = () => {
    playSuccess();
    alert('Institutional Academic Performance Report exported successfully.');
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Academic Governance
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BSAEU Evaluation Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Student & Academic Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise result analysis, grade distribution percentiles, and assignment submission monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-xs"
          >
            {courses.length > 0 ? (
              courses.map((c) => (
                <option key={c.id || c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="BED">B.Ed. (Bachelor of Education)</option>
                <option value="DELED">D.El.Ed. (Elementary Education)</option>
                <option value="BA_ED">B.A. (Honours) in Education</option>
              </>
            )}
          </select>

          <SoundButton
            onClick={handleExportReport}
            variant="primary"
            size="sm"
            soundType="pop"
            icon={<Download className="w-4 h-4" />}
          >
            Export Report
          </SoundButton>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Overall Cohort Pass Rate</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">98.4%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Top in South 24 Parganas</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mean Cohort SGPA</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">8.24 / 10</div>
          <div className="text-[11px] text-slate-400 mt-0.5">First Class Distinction Avg</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Assignment Submission Rate</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">96.8%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Timely Task Completion</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Trainee Retention</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">100%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Zero Academic Dropouts</div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Performance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Subject-Wise Average Score & Pass Rate
            </h3>
            <p className="text-xs text-slate-500">Evaluation breakdown across B.Ed. semester subjects</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="subject" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Average Score (%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="passRate" fill="#10b981" name="Pass Rate (%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Trainee SGPA Letter Grade Distribution
            </h3>
            <p className="text-xs text-slate-500">BSAEU University grading classification</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {gradeDistribution.map((g) => (
              <div key={g.grade} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.grade}
                </span>
                <span className="font-extrabold">{g.count} Trainees</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
