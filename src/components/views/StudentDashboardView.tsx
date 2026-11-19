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
} from 'lucide-react';
import { api } from '../../services/api';
import { Marksheet } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { useSound } from '../../context/SoundContext';
import collegeLogo from '../../assets/logo.png';

interface StudentDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const { playSuccess, playHaptic } = useSound();

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const msList = await api.getExamMarksheets('exam-1');
        // Find Ananya Das's published marksheet
        const published = msList.find((m) => m.roll_number === 'AMC-BED-2024-001') || msList[0];
        setMarksheet(published);
      } catch (e) {
        console.error(e);
      }
    };
    loadStudentData();
  }, []);

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

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                alt="Ananya Das"
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover shadow-md"
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
              <h1 className="text-2xl font-black tracking-tight">Welcome back, Ananya Das!</h1>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-2">
                <span>Roll: <b>AMC-BED-2024-001</b></span>
                <span>•</span>
                <span>BSAEU Reg: <b>BSAEU-2024-81001</b></span>
                <span>•</span>
                <span>Bachelor of Education (B.Ed.) Sem 1</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SoundButton
              onClick={handleDownloadPdf}
              variant="white"
              size="sm"
              soundType="haptic"
              icon={<Download className="w-4 h-4 text-blue-600" />}
            >
              Download Marksheet PDF
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
            Compliant (NCTE ≥ 75% required)
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
            {marksheet ? marksheet.sgpa : '9.29'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Grade: <b className="text-slate-800 dark:text-slate-200">O (Outstanding)</b>
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
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">1 Cleared</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Official Absence Sanctioned
          </div>
        </div>

        {/* Practicum Portfolios */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Micro-Teaching
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">5 of 5</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Lesson Plans Approved</div>
        </div>
      </div>

      {/* Certified Marksheet Card */}
      {marksheet && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Baba Saheb Ambedkar Education University (BSAEU)
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Statement of Marks & Grades (Semester I)
              </h3>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Examination: <b>{marksheet.exam_title}</b></span>
                <span>•</span>
                <span className="font-mono text-emerald-600">Hash: {marksheet.qr_code_hash}</span>
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
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Subject Code & Title</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Theory</th>
                  <th className="py-2.5 px-3 text-center">Practicum</th>
                  <th className="py-2.5 px-3 text-center">Total Marks</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                  <th className="py-2.5 px-3 text-center">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksheet.subject_scores.map((sc) => (
                  <tr key={sc.subject_code} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{sc.subject_title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sc.subject_code}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{sc.credits}</td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium">
                      {sc.theory_obtained} / {sc.max_theory}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium">
                      {sc.practical_obtained} / {sc.max_practical}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">
                      {sc.total_obtained} / {sc.max_marks}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-blue-600">
                      {sc.grade_point}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                        {sc.letter_grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-500">Total Marks Obtained: </span>
              <b className="text-slate-900 text-sm">
                {marksheet.total_marks_obtained} / {marksheet.grand_max_marks} ({marksheet.overall_percentage}%)
              </b>
            </div>
            <div>
              <span className="text-slate-500">SGPA: </span>
              <b className="text-blue-700 text-base">{marksheet.sgpa}</b>
            </div>
            <div>
              <span className="text-slate-500">Final Classification: </span>
              <b className="text-emerald-700 font-bold">{marksheet.result_status}</b>
            </div>
          </div>
        </div>
      )}

      {/* Trainee's Weekly Schedule Preview */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Today's Class Schedule & Internship Timing
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-blue-600">09:30 AM - 10:15 AM</span>
            <div className="font-bold text-slate-900 mt-1">BED-101: Childhood and Growing Up</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Dr. Debabrata Roy • Room 204</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-purple-600">11:15 AM - 12:00 PM</span>
            <div className="font-bold text-slate-900 mt-1">BED-103: Language Across Curriculum</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Prof. Mousumi Mukherjee • Room 108</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold text-emerald-600">02:00 PM - 03:30 PM</span>
            <div className="font-bold text-slate-900 mt-1">BED-105: Drama & Art EPC Workshop</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Smt. Priyanka Mondal • Activity Hall</div>
          </div>
        </div>
      </div>
    </div>
  );
};
