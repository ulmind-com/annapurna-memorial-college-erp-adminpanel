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
} from 'lucide-react';
import { StudentFeedback, Faculty, Subject } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { formatIST } from '../../utils/date';

export const StudentFeedbackView: React.FC = () => {
  const { activeRole, user } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';

  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Submit modal (Student)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [category, setCategory] = useState<StudentFeedback['category']>('CURRICULUM');
  const [rating, setRating] = useState(5);
  const [subjectCode, setSubjectCode] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Respond modal (Super Admin)
  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    feedback: StudentFeedback | null;
    response: string;
  }>({
    isOpen: false,
    feedback: null,
    response: '',
  });

  const { playSuccess, playPop } = useSound();

  const loadFeedbacks = async () => {
    try {
      const [data, facs, subs] = await Promise.all([
        api.getStudentFeedbacks(),
        api.getFaculty(),
        api.getSubjects(),
      ]);
      setFeedbacks(data);
      const facultyArr = Array.isArray(facs) ? facs : (facs.items || []);
      setFacultyList(facultyArr);
      setSubjectList(subs);
      if (subs.length > 0 && !subjectCode) {
        setSubjectCode(subs[0].code);
      }
      if (facultyArr.length > 0 && !facultyName) {
        setFacultyName(facultyArr[0].full_name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleOpenSubmit = () => {
    playPop();
    setCategory('CURRICULUM');
    setRating(5);
    setComments('');
    setIsAnonymous(false);
    setIsSubmitModalOpen(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert('Please enter your feedback comments.');
      return;
    }

    try {
      await api.submitFeedback({
        student_id: user?.id || 'st-1',
        student_name: user?.full_name || 'Enrolled Student',
        roll_number: user?.role === 'STUDENT' ? (user.id || 'AMC-TR-2024') : 'AMC-TR-2024',
        course_code: 'BED',
        semester: 1,
        subject_code: subjectCode || (subjectList[0]?.code || 'BED-101'),
        faculty_name: facultyName || (facultyList[0]?.full_name || 'Faculty Member'),
        category,
        rating,
        comments,
        is_anonymous: isAnonymous,
      });

      playSuccess();
      setIsSubmitModalOpen(false);
      loadFeedbacks();
    } catch (err: any) {
      alert(err.message || 'Feedback submission failed');
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
      await api.respondToFeedback(respondModal.feedback.id, respondModal.response);
      playSuccess();
      setRespondModal({ isOpen: false, feedback: null, response: '' });
      loadFeedbacks();
    } catch (err: any) {
      alert(err.message || 'Failed to submit response');
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (isStudent && !f.is_anonymous) {
      const isOwner = f.student_id === user?.id || f.student_name === user?.full_name || (user?.roll_number && f.roll_number === user.roll_number);
      if (!isOwner && f.student_id !== 'st-1') {
        return false;
      }
    }
    const matchesSearch =
      f.comments.toLowerCase().includes(search.toLowerCase()) ||
      (f.subject_code && f.subject_code.toLowerCase().includes(search.toLowerCase())) ||
      (f.faculty_name && f.faculty_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeCategory === 'ALL') return true;
    return f.category === activeCategory;
  });

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
              Quality Assurance Desk
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">NCTE Academic Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Student Academic Feedback System
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isStudent
              ? 'Share constructive academic feedback on teaching methodology, curriculum, and practicum labs'
              : 'Review trainee evaluations, monitor satisfaction indices, and respond to suggestions'}
          </p>
        </div>

        {isStudent && (
          <SoundButton
            onClick={handleOpenSubmit}
            variant="primary"
            size="md"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Submit Feedback
          </SoundButton>
        )}
      </div>

      {/* KPI Cards (for Admin) */}
      {!isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Average Trainee Rating</div>
            <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
              <span>{avgRating} / 5.0</span>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">High Pedagogical Satisfaction</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Feedbacks Received</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{feedbacks.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">B.Ed. & D.El.Ed. Cohorts</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Action Response Rate</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {Math.round((feedbacks.filter((f) => f.status === 'RESOLVED').length / (feedbacks.length || 1)) * 100)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Resolution SLA &lt; 48h</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'CURRICULUM', 'TEACHING_METHODOLOGY', 'PRACTICUM_LAB', 'FACILITIES'].map((cat) => (
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
          filteredFeedbacks.map((fb) => (
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
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{fb.admin_response}</div>
                </div>
              ) : (
                isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleOpenRespond(fb)}
                    className="self-end px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    Respond to Trainee
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

      {/* Modal: Submit Feedback (Student) */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Academic Feedback"
        subtitle="Help us enhance teacher education excellence"
        maxWidth="lg"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="CURRICULUM">Curriculum & BSAEU Syllabus</option>
                <option value="TEACHING_METHODOLOGY">Teaching Pedagogy & Mentorship</option>
                <option value="PRACTICUM_LAB">Micro-Teaching & Practicum Labs</option>
                <option value="FACILITIES">Library & Campus Facilities</option>
                <option value="GENERAL">General Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rating *</label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-2">{rating} Star(s)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Module</label>
              <select
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {subjectList.length > 0 ? (
                  subjectList.map((s) => (
                    <option key={s.id || s.code} value={s.code}>
                      {s.code}: {s.title}
                    </option>
                  ))
                ) : (
                  <option value="GEN-101">General Pedagogical Studies</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Faculty Member</label>
              <select
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {facultyList.length > 0 ? (
                  facultyList.map((f) => (
                    <option key={f.id} value={f.full_name}>
                      {f.full_name} ({f.designation || 'Faculty'})
                    </option>
                  ))
                ) : (
                  <option value="Academic Faculty">Academic Faculty Member</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Remarks & Suggestions *</label>
            <textarea
              rows={4}
              required
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive feedback to help enhance the teaching-learning process..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous-check"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anonymous-check" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
              Submit Anonymously (Hide Trainee Name and Roll Number)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsSubmitModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Submit Feedback
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Respond to Feedback (Super Admin) */}
      <Modal
        isOpen={respondModal.isOpen}
        onClose={() => setRespondModal({ isOpen: false, feedback: null, response: '' })}
        title="Respond to Trainee Feedback"
        subtitle="Official response from Academic Council"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs italic">
            "{respondModal.feedback?.comments}"
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Council Response *</label>
            <textarea
              rows={3}
              value={respondModal.response}
              onChange={(e) => setRespondModal({ ...respondModal, response: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton
              type="button"
              onClick={() => setRespondModal({ isOpen: false, feedback: null, response: '' })}
              variant="secondary"
              size="sm"
            >
              Cancel
            </SoundButton>
            <SoundButton type="button" onClick={handleRespondConfirm} variant="primary" size="sm" soundType="success">
              Publish Response
            </SoundButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
