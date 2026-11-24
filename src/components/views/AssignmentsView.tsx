import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Search,
  Upload,
  Trash2,
  Eye,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { api, FacultyClass } from '../../services/api';
import { PickerInput, formatDueDateTime } from '../common/PickerInput';
import { Course } from '../../types';

interface AssignmentItem {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseCode: string;
  semester: number;
  dueDate: string;
  dueTime?: string;
  totalAssigned: number;
  submittedCount: number;
  pendingCount: number;
  overdueCount: number;
  maxMarks: number;
  weightage: string;
  status: string;
  creator_name?: string;
  user_submission?: {
    id: string;
    status: string;
    submitted_at: string;
    marks_awarded?: number;
    feedback?: string;
    file_url?: string;
    submission_text?: string;
  } | null;
}

interface StudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  roll_number: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  comments?: string;
  submitted_at: string;
  status: string;
  marks_awarded?: number;
  feedback?: string;
}

export const AssignmentsView: React.FC = () => {
  const { playPop, playSuccess, playAlert, playClick } = useSound();
  const { activeRole, user } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isTeacher = activeRole === 'TEACHER';

  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create Assignment Modal (Teachers / Admin only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [dueTime, setDueTime] = useState('17:00');
  const [maxMarks, setMaxMarks] = useState(25);
  const [weightage, setWeightage] = useState('Continuous & Comprehensive Evaluation (CCE)');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Student Submit Modal
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentItem | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');
  const [submissionComments, setSubmissionComments] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [myClasses, setMyClasses] = useState<FacultyClass[]>([]);

  // Teacher Review & Grade Modal
  const [reviewingAssignment, setReviewingAssignment] = useState<AssignmentItem | null>(null);
  const [submissionsList, setSubmissionsList] = useState<StudentSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingDrafts, setGradingDrafts] = useState<Record<string, { marks: number; feedback: string }>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [cList, aList] = await Promise.all([
        api.getCourses(),
        api.getAssignments(courseFilter !== 'ALL' ? courseFilter : undefined),
      ]);
      setAssignments(aList);
      if (isTeacher) {
        const me = await api.getMyFacultyProfile();
        setMyClasses(me.classes);
        const codes = new Set(me.classes.map((c) => c.course_code));
        const mine = cList.filter((c) => codes.has(c.code));
        setCourses(mine);
        if (me.classes.length && !me.classes.some((c) => c.course_code === selectedCourseCode && c.semester === selectedSemester)) {
          setSelectedCourseCode(me.classes[0].course_code);
          setSelectedSemester(me.classes[0].semester);
        }
      } else {
        setCourses(cList);
        if (cList.length > 0 && !cList.some((c) => c.code === selectedCourseCode)) {
          setSelectedCourseCode(cList[0].code);
        }
      }
    } catch (e: any) {
      alert(e.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseFilter]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter an assignment title');
      return;
    }
    if (!dueDate) {
      alert('Please select a due date from the calendar');
      return;
    }

    setIsSubmittingNew(true);
    try {
      await api.createAssignment({
        title: newTitle.trim(),
        description: newDescription.trim(),
        course_code: selectedCourseCode,
        semester: selectedSemester,
        due_date: dueDate,
        due_time: dueTime || '17:00',
        max_marks: maxMarks,
        weightage,
      });
      playSuccess();
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      await loadData();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"? All student submissions will also be deleted.`)) {
      return;
    }
    try {
      await api.deleteAssignment(id);
      playSuccess();
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to delete assignment');
    }
  };

  const handleOpenStudentSubmit = (item: AssignmentItem) => {
    playPop();
    setSubmittingAssignment(item);
    setSubmissionText(item.user_submission?.submission_text || '');
    setSubmissionFileUrl(item.user_submission?.file_url || '');
    setSubmissionFileName((item.user_submission as any)?.file_name || '');
    setSubmissionComments('');
  };

  const handleStudentSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;
    if (!submissionText.trim() && !submissionFileUrl.trim()) {
      alert('Please write your answer or upload your assignment file');
      return;
    }

    setIsSubmittingWork(true);
    try {
      await api.submitAssignment(submittingAssignment.id, {
        submission_text: submissionText,
        file_url: submissionFileUrl,
        file_name: submissionFileName,
        comments: submissionComments,
      });
      playSuccess();
      setSubmittingAssignment(null);
      await loadData();
      alert('Assignment submitted successfully!');
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleOpenReview = async (item: AssignmentItem) => {
    playPop();
    setReviewingAssignment(item);
    setLoadingSubmissions(true);
    try {
      const subs = await api.getAssignmentSubmissions(item.id);
      setSubmissionsList(subs);
      const drafts: Record<string, { marks: number; feedback: string }> = {};
      subs.forEach((s) => {
        drafts[s.id] = {
          marks: s.marks_awarded !== undefined && s.marks_awarded !== null ? s.marks_awarded : 0,
          feedback: s.feedback || '',
        };
      });
      setGradingDrafts(drafts);
    } catch (e: any) {
      alert(e.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (subId: string) => {
    const draft = gradingDrafts[subId];
    if (!draft) return;
    try {
      await api.gradeAssignmentSubmission(subId, {
        marks_awarded: Number(draft.marks),
        feedback: draft.feedback,
      });
      playSuccess();
      setSubmissionsList((prev) =>
        prev.map((s) =>
          s.id === subId
            ? { ...s, marks_awarded: Number(draft.marks), feedback: draft.feedback, status: 'GRADED' }
            : s
        )
      );
      alert('Marks and feedback recorded successfully!');
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to grade submission');
    }
  };

  const totalAssignedSum = assignments.reduce((acc, a) => acc + (a.totalAssigned || 0), 0);
  const submittedSum = assignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
  const pendingSum = assignments.reduce((acc, a) => acc + (a.pendingCount || 0), 0);
  const overdueSum = assignments.reduce((acc, a) => acc + (a.overdueCount || 0), 0);
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              {isStudent ? 'Student Practicum Portal' : 'Faculty Coursework Desk'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Continuous & Comprehensive Evaluation (CCE)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>
              {isStudent ? 'My Practicum & Academic Assignments' : 'Student Practicum & Assignments Tracker'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? 'View assigned practicum topics, review deadlines, submit coursework reports, and check evaluation scores.'
              : 'Continuous and comprehensive evaluation • Homework, practicum file assessment, and grade reporting.'}
          </p>
        </div>

        {/* Only teachers create assignments; Super Admin monitors, students submit */}
        {isTeacher && (
          <SoundButton
            onClick={() => {
              playPop();
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            soundType="pop"
            variant="primary"
            disabled={myClasses.length === 0}
          >
            New Assignment
          </SoundButton>
        )}
      </div>

      {/* Metrics Row (for Teachers / Admins) */}
      {isTeacher && !loading && myClasses.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-300">
          No subjects are assigned to you yet, so you can't create assignments. Ask the Super Admin to assign subjects in Academic Structure.
        </div>
      )}

      {!isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Enrolled Students</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalAssignedSum}</div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">Across Active Cohorts</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Submissions Received</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{submittedSum}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{completionPct}% Cohort Completion</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pending Submissions</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingSum}</div>
            <div className="text-[10px] text-amber-600 font-bold mt-0.5">Awaiting Student Upload</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Published Assignments</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{assignments.length}</div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Active Academic Tasks</div>
          </div>
        </div>
      )}

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
          {!isStudent && (
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
          )}

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
            {filteredAssignments.length} Assignments Found
          </span>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Loading assignments from database...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isStudent
                ? 'There are no active practicum tasks or assignments assigned to your course cohort at this moment.'
                : 'No assignments yet.'}
            </p>
          </div>
        ) : (
          paginatedAssignments.map((item) => {
            const submissionPercentage =
              item.totalAssigned > 0 ? Math.round((item.submittedCount / item.totalAssigned) * 100) : 0;
            const userSub = item.user_submission;

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                        {item.course}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {item.weightage}
                      </span>
                      {item.creator_name && (
                        <span className="text-xs text-slate-400 font-medium">
                          • Assigned by {item.creator_name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end gap-1 flex-shrink-0">
                    <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      Maximum Marks: <span className="font-mono text-blue-600 dark:text-blue-400">{item.maxMarks}</span>
                    </div>
                    {/* Due Date & Time with Icons for Both Light & Dark Mode */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      <Calendar className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>{item.dueDate}</span>
                      <span className="text-rose-400">•</span>
                      <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>{item.dueTime || '05:00 PM'}</span>
                    </div>
                  </div>
                </div>

                {/* Student Personal Submission Status Strip */}
                {isStudent && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      {userSub?.status === 'GRADED' ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Graded & Evaluated
                          </span>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Score Awarded: <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{userSub.marks_awarded}</span> / {item.maxMarks}
                          </div>
                          {userSub.feedback && (
                            <p className="text-[11px] text-slate-500 italic">Faculty Feedback: "{userSub.feedback}"</p>
                          )}
                        </div>
                      ) : userSub?.status === 'SUBMITTED' ? (
                        <div className="space-y-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Submitted • Pending Evaluation
                          </span>
                          <div className="text-[11px] text-slate-500">
                            Turned in on {new Date(userSub.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Submission Required
                          </span>
                          <div className="text-[11px] text-slate-500">
                            Please upload your homework or practicum report before the deadline.
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <SoundButton
                        onClick={() => handleOpenStudentSubmit(item)}
                        size="sm"
                        variant={userSub ? 'secondary' : 'primary'}
                        soundType="pop"
                        icon={<Upload className="w-3.5 h-3.5" />}
                      >
                        {userSub ? 'View / Update Submission' : 'Submit Assignment'}
                      </SoundButton>
                    </div>
                  </div>
                )}

                {/* Faculty / Admin Submission Progress Bar */}
                {!isStudent && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Cohort Submission Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {submissionPercentage}% ({item.submittedCount}/{item.totalAssigned} Students)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${submissionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Bottom Action Strip for Faculty / Admin */}
                {!isStudent && (
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.submittedCount} Submissions
                      </span>
                      <span className="text-amber-600">• {item.pendingCount} Pending</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <SoundButton
                        onClick={() => handleOpenReview(item)}
                        size="sm"
                        variant="primary"
                        soundType="pop"
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Review Submissions ({item.submittedCount})
                      </SoundButton>

                      {(isSuperAdmin || isTeacher) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(item.id, item.title)}
                          title="Delete Assignment"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

      {/* Modal: Create Assignment (Calendar Date & Clock Time Picker with Light/Dark Mode) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Student Task"
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Provide instructions, expected format, or rubric guidelines for trainees..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Program / Course *
              </label>
              <select
                value={selectedCourseCode}
                onChange={(e) => {
                  setSelectedCourseCode(e.target.value);
                  const firstSem = myClasses.find((c) => c.course_code === e.target.value)?.semester;
                  if (isTeacher && firstSem) setSelectedSemester(firstSem);
                }}
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
                {(isTeacher
                  ? myClasses.filter((c) => c.course_code === selectedCourseCode).map((c) => c.semester)
                  : Array.from(
                      { length: courses.find((c) => c.code === selectedCourseCode)?.total_semesters || 4 },
                      (_, i) => i + 1
                    )
                ).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CALENDAR & CLOCK PICKERS: Fully Responsive with NPM Icons & Dark/Light Mode Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Due Date *</span>
              </label>
              <div className="relative">
<PickerInput type="date" required value={dueDate} min={new Date().toISOString().slice(0, 10)} onChange={setDueDate} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Due Time *</span>
              </label>
              <div className="relative">
<PickerInput type="time" required value={dueTime} onChange={setDueTime} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Evaluation Category
              </label>
              <input
                type="text"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                placeholder="e.g. Continuous Internal Evaluation"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton
              type="submit"
              variant="primary"
              size="sm"
              soundType="success"
              disabled={isSubmittingNew}
            >
              {isSubmittingNew ? 'Publishing...' : 'Publish Assignment'}
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Student Turn-in / Submission */}
      {submittingAssignment && (
        <Modal
          isOpen={!!submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          title={`Submit: ${submittingAssignment.title}`}
          subtitle={`Due: ${submittingAssignment.dueDate} ${submittingAssignment.dueTime || ''} • Max Marks: ${submittingAssignment.maxMarks}`}
          maxWidth="md"
        >
          <form onSubmit={handleStudentSubmitWork} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assignment Work / Notes / Text
              </label>
              <textarea
                rows={4}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your response, assignment answers, or executive summary here..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Upload Assignment File (PDF / DOC / Image, max 15 MB)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploadingFile}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploadingFile(true);
                  try {
                    const up = await api.uploadFile(f);
                    setSubmissionFileUrl(up.url);
                    setSubmissionFileName(up.file_name);
                  } catch (err: any) {
                    playAlert();
                    alert(err.message || 'File upload failed');
                  } finally {
                    setUploadingFile(false);
                  }
                }}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <div className="text-[11px] mt-1 text-slate-500">
                {uploadingFile
                  ? 'Uploading…'
                  : submissionFileUrl
                  ? <a href={api.fileUrl(submissionFileUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold">Attached: {submissionFileName || 'file'}</a>
                  : 'No file attached'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remarks for Faculty (Optional)
              </label>
              <input
                type="text"
                value={submissionComments}
                onChange={(e) => setSubmissionComments(e.target.value)}
                placeholder="Any special remarks or notes for your teacher..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </SoundButton>
              <SoundButton
                type="submit"
                variant="primary"
                size="sm"
                soundType="success"
                disabled={isSubmittingWork || uploadingFile}
              >
                {isSubmittingWork ? 'Submitting...' : 'Turn In Assignment'}
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Teacher Review & Grade Submissions */}
      {reviewingAssignment && (
        <Modal
          isOpen={!!reviewingAssignment}
          onClose={() => setReviewingAssignment(null)}
          title={`Submissions: ${reviewingAssignment.title}`}
          subtitle={`${reviewingAssignment.course} • Max Marks: ${reviewingAssignment.maxMarks}`}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {loadingSubmissions ? (
              <div className="p-8 text-center text-slate-400">Loading student submissions...</div>
            ) : submissionsList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 text-xs">
                No student has submitted work for this task yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {submissionsList.map((sub) => {
                  const draft = gradingDrafts[sub.id] || {
                    marks: sub.marks_awarded ?? 0,
                    feedback: sub.feedback || '',
                  };

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {sub.student_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Roll: {sub.roll_number} • Submitted: {new Date(sub.submitted_at).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          {sub.status === 'GRADED' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Graded: {sub.marks_awarded} / {reviewingAssignment.maxMarks}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Needs Grading
                            </span>
                          )}
                        </div>
                      </div>

                      {sub.submission_text && (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
                          {sub.submission_text}
                        </div>
                      )}

                      {sub.file_url && (
                        <div>
                          <a
                            href={api.fileUrl(sub.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Attached Document / File
                          </a>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <label className="text-slate-500 font-bold">Marks:</label>
                          <input
                            type="number"
                            min={0}
                            max={reviewingAssignment.maxMarks}
                            value={draft.marks}
                            onChange={(e) =>
                              setGradingDrafts({
                                ...gradingDrafts,
                                [sub.id]: { ...draft, marks: Number(e.target.value) },
                              })
                            }
                            className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg font-mono font-bold text-center"
                          />
                          <span className="text-slate-400">/ {reviewingAssignment.maxMarks}</span>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                          <input
                            type="text"
                            placeholder="Feedback / Remarks for student..."
                            value={draft.feedback}
                            onChange={(e) =>
                              setGradingDrafts({
                                ...gradingDrafts,
                                [sub.id]: { ...draft, feedback: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                          />
                        </div>

                        <SoundButton
                          onClick={() => handleSaveGrade(sub.id)}
                          size="sm"
                          variant="primary"
                          soundType="success"
                        >
                          Save Grade
                        </SoundButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton
                variant="secondary"
                size="sm"
                onClick={() => setReviewingAssignment(null)}
              >
                Close
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
