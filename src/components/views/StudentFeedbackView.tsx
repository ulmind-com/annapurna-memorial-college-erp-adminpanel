import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  Plus,
  Send,
  User,
  ShieldCheck,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { StudentFeedback, Faculty, Subject, Course } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { formatIST } from '../../utils/date';

export const StudentFeedbackView: React.FC = () => {
  const { activeRole, user } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isTeacher = activeRole === 'TEACHER';

  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Evaluation Form State
  const [category, setCategory] = useState<StudentFeedback['category']>('TEACHING_METHODOLOGY');
  const [rating, setRating] = useState(5);
  const [subjectCode, setSubjectCode] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin filter & respond state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    feedback: StudentFeedback | null;
    response: string;
  }>({
    isOpen: false,
    feedback: null,
    response: '',
  });

  const { playSuccess, playPop, playAlert } = useSound();

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const [data, facs, subs, cList] = await Promise.all([
        api.getStudentFeedbacks(),
        api.getFaculty(),
        api.getSubjects(),
        api.getCourses(),
      ]);
      setFeedbacks(data);
      const facultyArr = Array.isArray(facs) ? facs : (facs?.items || []);
      setFacultyList(facultyArr);
      setSubjectList(subs);
      setCourses(cList);

      if (subs.length > 0 && !subjectCode) {
        setSubjectCode(subs[0].code);
      }
      if (facultyArr.length > 0 && !facultyName) {
        setFacultyName(facultyArr[0].full_name);
      }
    } catch (e) {
      console.error('Error loading feedback data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert('Please enter your feedback comments or evaluation observations.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine student course dynamically from user profile or matching subject
      const studentCourse = (user as any)?.course_code || (user as any)?.course || 'GENERAL';
      const studentSemester = (user as any)?.semester || 1;

      await api.submitFeedback({
        student_id: user?.id || 'st-1',
        student_name: user?.full_name || 'Enrolled Student',
        roll_number: (user as any)?.roll_number || user?.id || 'AMC-TR',
        course_code: studentCourse,
        semester: Number(studentSemester),
        subject_code: subjectCode || (subjectList[0]?.code || 'N/A'),
        faculty_name: facultyName || (facultyList[0]?.full_name || 'Faculty Member'),
        category,
        rating,
        comments: comments.trim(),
        is_anonymous: isAnonymous,
      });

      playSuccess();
      setComments('');
      setRating(5);
      alert('Your academic evaluation has been securely recorded and submitted to the Academic Council.');
      await loadFeedbacks();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Feedback submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRespond = (fb: StudentFeedback) => {
    playPop();
    setRespondModal({
      isOpen: true,
      feedback: fb,
      response: fb.admin_response || 'Acknowledged by Academic Council. Action initiated.',
    });
  };

  const handleRespondConfirm = async () => {
    if (!respondModal.feedback) return;
    if (!respondModal.response.trim()) {
      alert('Response cannot be empty.');
      return;
    }

    try {
      await api.respondToFeedback(respondModal.feedback.id, respondModal.response.trim());
      playSuccess();
      setRespondModal({ isOpen: false, feedback: null, response: '' });
      await loadFeedbacks();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to submit response');
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.comments.toLowerCase().includes(search.toLowerCase()) ||
      (f.subject_code && f.subject_code.toLowerCase().includes(search.toLowerCase())) ||
      (f.faculty_name && f.faculty_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeCategory === 'ALL') return true;
    return f.category === activeCategory;
  });

  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              {isStudent ? 'Trainee Evaluation Portal' : 'Internal Quality Assurance Cell (IQAC)'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">NCTE Academic Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{isStudent ? 'Course & Faculty Academic Evaluation' : 'Student Academic Feedback Desk'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isStudent
              ? 'Provide confidential and constructive evaluations on teaching quality, syllabus coverage, and academic mentorship.'
              : 'Review trainee evaluations, monitor satisfaction indices, and record administrative action taken.'}
          </p>
        </div>
      </div>

      {/* STUDENT EXPERIENCE: Direct Interactive Feedback Form + Student's Own History */}
      {isStudent && (
        <div className="space-y-6">
          {/* Evaluation Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Submit Course & Faculty Evaluation</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your feedback directly impacts academic delivery, teaching quality, and institutional development.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Evaluation Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="TEACHING_METHODOLOGY">Teaching Pedagogy & Mentorship</option>
                    <option value="CURRICULUM">Curriculum & Syllabus Coverage</option>
                    <option value="PRACTICUM_LAB">Practicum, Microteaching & Labs</option>
                    <option value="FACILITIES">Library & Study Resources</option>
                    <option value="GENERAL">General Academic Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject / Module *
                  </label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {subjectList.map((s) => (
                      <option key={s.id || s.code} value={s.code}>
                        {s.code} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Member *
                  </label>
                  <select
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.full_name}>
                        {f.full_name} ({f.designation || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Overall Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 ml-2">
                    {rating === 5
                      ? '5.0 - Excellent'
                      : rating === 4
                      ? '4.0 - Very Good'
                      : rating === 3
                      ? '3.0 - Satisfactory'
                      : rating === 2
                      ? '2.0 - Needs Improvement'
                      : '1.0 - Poor'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observations, Detailed Comments & Constructive Suggestions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share constructive feedback regarding teaching clarity, pace, subject coverage, or practicum support..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Submit as Anonymous Trainee (Protects your identity)</span>
                </label>

                <SoundButton
                  type="submit"
                  variant="primary"
                  size="md"
                  soundType="success"
                  disabled={isSubmitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Submitting Evaluation...' : 'Submit Academic Evaluation'}
                </SoundButton>
              </div>
            </form>
          </div>

          {/* Student's Own Evaluation History */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  My Evaluation History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track the evaluations you have submitted and administrative action responses
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {feedbacks.length} Evaluations Logged
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading your evaluation history...</div>
            ) : feedbacks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                You have not submitted any course evaluations yet.
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {fb.category.replace('_', ' ')}
                        </span>
                        {fb.subject_code && (
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {fb.subject_code} • {fb.faculty_name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{fb.comments}"</p>

                    {fb.admin_response ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase">
                          Academic Council Action Taken:
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                          {fb.admin_response}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending Review by IQAC Cell
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                      <span>Status: <b className="uppercase">{fb.status}</b></span>
                      <span>{formatIST(fb.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUPER ADMIN & FACULTY EXPERIENCE: Institutional IQAC Desk */}
      {!isStudent && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Average Pedagogical Rating</div>
              <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
                <span>{avgRating} / 5.0</span>
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Continuous Quality Monitoring</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Evaluations Received</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{feedbacks.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Student Course Assessments</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Action Resolution Rate</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {Math.round(
                  (feedbacks.filter((f) => f.status === 'RESOLVED').length / (feedbacks.length || 1)) * 100
                )}
                %
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Institutional Action Logged</div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'TEACHING_METHODOLOGY', 'CURRICULUM', 'PRACTICUM_LAB', 'FACILITIES'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    playPop();
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search feedback comments or teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Feedbacks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                No feedback entries found matching the filter.
              </div>
            ) : (
              paginatedFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {fb.category.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-slate-400 mt-1 font-medium">
                          {fb.is_anonymous ? 'Submitted Anonymously' : `${fb.student_name} (${fb.roll_number})`}
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {fb.faculty_name && (
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Subject: <span className="text-blue-600">{fb.subject_code}</span> • Faculty: {fb.faculty_name}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{fb.comments}"
                    </p>
                  </div>

                  {/* Admin Response Box */}
                  {fb.admin_response ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase">
                        Institutional Council Response:
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                        {fb.admin_response}
                      </div>
                    </div>
                  ) : (
                    (isSuperAdmin || isTeacher) && (
                      <button
                        type="button"
                        onClick={() => handleOpenRespond(fb)}
                        className="self-end px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      >
                        Record Action Taken / Respond
                      </button>
                    )
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>Status: <b className="uppercase">{fb.status}</b></span>
                    <span>{formatIST(fb.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dynamic Pagination Controls */}
          <div className="rounded-3xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredFeedbacks.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[4, 6, 12, 24]}
            />
          </div>
        </div>
      )}

      {/* Modal: Administrative Response / Resolution */}
      {respondModal.isOpen && (
        <Modal
          isOpen={respondModal.isOpen}
          onClose={() => setRespondModal({ isOpen: false, feedback: null, response: '' })}
          title="Record Administrative Action / Resolution"
          subtitle={`Feedback ID: ${respondModal.feedback?.id} • ${respondModal.feedback?.category}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              "{respondModal.feedback?.comments}"
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Institutional Resolution / Action Taken *
              </label>
              <textarea
                rows={3}
                required
                value={respondModal.response}
                onChange={(e) => setRespondModal({ ...respondModal, response: e.target.value })}
                placeholder="Detail the remedial action taken or council resolution..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton
                variant="secondary"
                size="sm"
                onClick={() => setRespondModal({ isOpen: false, feedback: null, response: '' })}
              >
                Cancel
              </SoundButton>
              <SoundButton
                variant="primary"
                size="sm"
                soundType="success"
                onClick={handleRespondConfirm}
              >
                Save Official Resolution
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
