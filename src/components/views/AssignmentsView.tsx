import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle2, AlertCircle, Calendar, User, FileText, CheckCircle, Search } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { api } from '../../services/api';
import { Course } from '../../types';

interface AssignmentItem {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  dueDate: string;
  totalAssigned: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
  maxMarks: number;
  weightage: string;
  status: string;
}

const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'ASN-01',
    title: 'Micro-Teaching Lesson Plan File (Skill of Questioning)',
    course: 'B.Ed. Semester 2',
    courseCode: 'BED',
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
    courseCode: 'BED',
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
    courseCode: 'DELED',
    dueDate: '20 May 2026, 11:59 PM IST',
    totalAssigned: 50,
    submittedCount: 48,
    pendingCount: 1,
    overdueCount: 1,
    maxMarks: 20,
    weightage: 'Formative CCE Task',
    status: 'REVIEWING',
  },
];

export const AssignmentsView: React.FC = () => {
  const { playPop, playSuccess } = useSound();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    return api.getCachedList<AssignmentItem>('amce_assignments', DEFAULT_ASSIGNMENTS);
  });
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCourseCode, setSelectedCourseCode] = useState('BED');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(25);
  const [weightage, setWeightage] = useState('BSAEU Continuous Evaluation');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
        if (cList.length > 0 && !cList.some((c) => c.code === selectedCourseCode)) {
          setSelectedCourseCode(cList[0].code);
        }
      } catch (e) {
        console.error('Error loading courses for assignments:', e);
      }
    };
    loadCourses();
  }, []);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedCourse = courses.find((c) => c.code === selectedCourseCode);
    const courseLabel = matchedCourse ? `${matchedCourse.name} Sem ${selectedSemester}` : `${selectedCourseCode} Sem ${selectedSemester}`;
    const newId = `ASN-0${assignments.length + 1}`;

    const created: AssignmentItem = {
      id: newId,
      title: newTitle,
      course: courseLabel,
      courseCode: selectedCourseCode,
      dueDate: dueDate || 'End of Semester, 05:00 PM IST',
      totalAssigned: matchedCourse?.max_intake || 50,
      submittedCount: 0,
      pendingCount: matchedCourse?.max_intake || 50,
      overdueCount: 0,
      maxMarks,
      weightage,
      status: 'ACTIVE',
    };

    const updated = [created, ...assignments];
    setAssignments(updated);
    api.setCachedList('amce_assignments', updated);
    playSuccess();
    setIsModalOpen(false);
    setNewTitle('');
  };

  const totalAssignedSum = assignments.reduce((acc, a) => acc + a.totalAssigned, 0);
  const submittedSum = assignments.reduce((acc, a) => acc + a.submittedCount, 0);
  const pendingSum = assignments.reduce((acc, a) => acc + a.pendingCount, 0);
  const overdueSum = assignments.reduce((acc, a) => acc + a.overdueCount, 0);
  const completionPct = totalAssignedSum > 0 ? Math.round((submittedSum / totalAssignedSum) * 100) : 0;

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.course.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'ALL' || a.courseCode === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            setIsModalOpen(true);
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
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAssignedSum}</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">Across All Cohorts</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Submitted</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{submittedSum}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{completionPct}% Completion</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingSum}</div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">Within Deadline</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Overdue</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{overdueSum}</div>
          <div className="text-[10px] text-rose-600 font-bold mt-0.5">Requires Reminder</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments or task titles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Programs ({assignments.length})</option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
            {filteredAssignments.length} Assignments
          </span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No tasks match your current filter. Create a new task above or reset the filter.
            </p>
          </div>
        ) : (
          paginatedAssignments.map((item) => {
            const submissionPercentage = item.totalAssigned > 0 ? Math.round((item.submittedCount / item.totalAssigned) * 100) : 0;

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
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {item.submittedCount} Submitted
                    </span>
                    <span className="text-amber-600">• {item.pendingCount} Pending</span>
                    {item.overdueCount > 0 && (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {item.overdueCount} Overdue
                      </span>
                    )}
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
          })
        )}
      </div>

      <Pagination
        totalItems={filteredAssignments.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Trainee Task"
        subtitle="Publish homework, practicum file, or assessment rubric"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assignment / Practicum Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. EPC-2 Drama & Art Portfolio File"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Program / Course *
              </label>
              <select
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
              >
                {courses.map((c) => (
                  <option key={c.id || c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              >
                {Array.from(
                  { length: courses.find((c) => c.code === selectedCourseCode)?.total_semesters || 4 },
                  (_, i) => i + 1
                ).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date & Time
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. 30 June 2026, 05:00 PM IST"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                min={5}
                max={100}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assessment Weightage
            </label>
            <input
              type="text"
              value={weightage}
              onChange={(e) => setWeightage(e.target.value)}
              placeholder="e.g. Internal Continuous Evaluation (BSAEU)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Publish Assignment
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
