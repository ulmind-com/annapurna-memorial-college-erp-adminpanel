import React, { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle2, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

export const AssignmentsView: React.FC = () => {
  const { playPop, playSuccess } = useSound();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SUBMITTED' | 'PENDING' | 'OVERDUE'>('ALL');

  const [assignments] = useState([
    {
      id: 'ASN-01',
      title: 'Micro-Teaching Lesson Plan File (Skill of Questioning)',
      course: 'B.Ed. Semester 2',
      dueDate: '25 May 2026, 05:00 PM IST',
      totalAssigned: 50,
      submittedCount: 42,
      pendingCount: 6,
      overdueCount: 2,
      maxMarks: 25,
      weightage: 'Internal Assessment (BSAEU)',
      status: 'ACTIVE',
    },
    {
      id: 'ASN-02',
      title: 'Practicum: Case Study of a Child in Kakdwip Rural School',
      course: 'B.Ed. Semester 1',
      dueDate: '28 May 2026, 05:00 PM IST',
      totalAssigned: 50,
      submittedCount: 38,
      pendingCount: 12,
      overdueCount: 0,
      maxMarks: 50,
      weightage: 'Course 1.1.1 EPC Practicum',
      status: 'ACTIVE',
    },
    {
      id: 'ASN-03',
      title: 'Foundational Numeracy Assessment Worksheet Design',
      course: 'D.El.Ed. Semester 1',
      dueDate: '20 May 2026, 11:59 PM IST',
      totalAssigned: 50,
      submittedCount: 48,
      pendingCount: 1,
      overdueCount: 1,
      maxMarks: 20,
      weightage: 'Formative CCE Task',
      status: 'REVIEWING',
    },
    {
      id: 'ASN-04',
      title: 'Inclusive Classroom Universal Design Lesson Blueprints',
      course: 'B.Ed. Semester 4',
      dueDate: '15 May 2026, 05:00 PM IST',
      totalAssigned: 48,
      submittedCount: 48,
      pendingCount: 0,
      overdueCount: 0,
      maxMarks: 30,
      weightage: 'Final Practicum Evaluation',
      status: 'GRADED',
    },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Trainee Practicum & Assignments Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Continuous and Comprehensive Evaluation (CCE) • Homework and practicum grading
          </p>
        </div>

        <SoundButton
          onClick={() => {
            playPop();
            alert('Opening Assignment Creator with BSAEU Assessment Rubric...');
          }}
          icon={<Plus className="w-4 h-4" />}
          soundType="pop"
        >
          Assign New Task
        </SoundButton>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Assigned</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">198</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">Across 4 Cohorts</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Submitted</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">176</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">88.8% Completion</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">19</div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">Within Deadline</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Overdue</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">3</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">Requires Reminder</div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((item) => {
          const submissionPercentage = Math.round((item.submittedCount / item.totalAssigned) * 100);

          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {item.id} • {item.course}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.weightage}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Max Marks: {item.maxMarks}
                    </div>
                    <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Due: {item.dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Submissions Breakup */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Submission Progress</span>
                  <span className="text-blue-600 dark:text-blue-400">{submissionPercentage}% ({item.submittedCount}/{item.totalAssigned} Trainees)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${submissionPercentage}%` }}
                  />
                  {item.overdueCount > 0 && (
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(item.overdueCount / item.totalAssigned) * 100}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600">✓ {item.submittedCount} Submitted</span>
                  <span className="text-amber-600">• {item.pendingCount} Pending</span>
                  {item.overdueCount > 0 && <span className="text-rose-600">⚠ {item.overdueCount} Overdue</span>}
                </div>

                <div className="flex items-center gap-2">
                  <SoundButton
                    onClick={() => alert(`Reviewing ${item.submittedCount} submissions for ${item.id}...`)}
                    size="sm"
                    variant="primary"
                    soundType="pop"
                  >
                    Grade Submissions
                  </SoundButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
