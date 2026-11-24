import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, BarChart3, Star, Lock, Unlock, CheckCircle2, X } from 'lucide-react';
import { api, FeedbackForm, FeedbackReport } from '../../services/api';
import { Course } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const card = 'p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm';

const Stars: React.FC<{ value: number; onChange?: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} className="p-0.5">
        <Star className={`w-5 h-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
      </button>
    ))}
  </div>
);

/**
 * Feedback cycles: Super Admin creates a form for a class and opens it, students rate every
 * subject/teacher once (anonymous), admin sees the full report, teachers see their own subjects.
 */
export const StudentFeedbackView: React.FC = () => {
  const { activeRole } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isAdmin = activeRole === 'SUPER_ADMIN';
  const { playSuccess, playAlert, playPop } = useSound();

  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');

  // admin create
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);

  // student fill
  const [filling, setFilling] = useState<FeedbackForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [comments, setComments] = useState('');
  const [busy, setBusy] = useState(false);

  // report
  const [report, setReport] = useState<FeedbackReport | null>(null);

  const load = async () => {
    setError('');
    try {
      setForms(await api.getFeedbackForms());
      if (isAdmin) {
        const c = await api.getCourses();
        setCourses(c);
        if (c.length) setCourseCode((p) => p || c[0].code);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load feedback');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const qs = questions.map((q) => q.trim()).filter(Boolean);
    if (!title.trim() || !qs.length) {
      alert('Title and at least one question are required.');
      return;
    }
    setBusy(true);
    try {
      await api.createFeedbackForm({ title, description, course_code: courseCode, semester, questions: qs, deadline: deadline || null, is_open: true });
      playSuccess();
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setDeadline('');
      setQuestions(['']);
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to create form');
    } finally {
      setBusy(false);
    }
  };

  const toggleOpen = async (f: FeedbackForm) => {
    try {
      await api.updateFeedbackForm(f.id, { is_open: !f.is_open });
      playSuccess();
      load();
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const removeForm = async (f: FeedbackForm) => {
    if (!window.confirm(`Delete "${f.title}" and all its responses?`)) return;
    try {
      await api.deleteFeedbackForm(f.id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const openFill = (f: FeedbackForm) => {
    playPop();
    const init: Record<string, number[]> = {};
    (f.subjects || []).forEach((s) => (init[s.subject_code] = f.questions.map(() => 0)));
    setAnswers(init);
    setComments('');
    setFilling(f);
  };

  const submitFill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filling) return;
    const missing = Object.entries(answers).find(([, a]) => a.some((v) => v < 1));
    if (missing) {
      playAlert();
      alert(`Please rate every question for ${missing[0]}.`);
      return;
    }
    setBusy(true);
    try {
      const res = await api.submitFeedbackResponse(filling.id, {
        ratings: Object.entries(answers).map(([subject_code, a]) => ({ subject_code, answers: a })),
        comments,
      });
      playSuccess();
      alert(res.message);
      setFilling(null);
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Submit failed');
    } finally {
      setBusy(false);
    }
  };

  const openReport = async (f: FeedbackForm) => {
    try {
      setReport(await api.getFeedbackReport(f.id));
    } catch (err: any) {
      alert(err.message || 'Failed to load report');
    }
  };

  const course = courses.find((c) => c.code === courseCode);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {isStudent ? 'Academic Feedback' : 'Student Feedback'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? 'Rate your subjects and teachers. Your responses are anonymous.'
              : isAdmin
              ? 'Create feedback cycles per class, open/close them and view anonymous reports.'
              : 'Anonymous feedback summary for your subjects.'}
          </p>
        </div>
        {isAdmin && (
          <SoundButton icon={<Plus className="w-4 h-4" />} soundType="pop" onClick={() => setCreateOpen(true)} disabled={!courses.length}>
            New Feedback Form
          </SoundButton>
        )}
      </div>

      {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((f) => (
          <div key={f.id} className={`${card} space-y-3`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black">{f.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {f.course_code} Semester {f.semester}
                  {f.deadline ? ` • Closes ${f.deadline}` : ''}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${f.accepting ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                {f.accepting ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            {f.description && <p className="text-xs text-slate-600 dark:text-slate-300">{f.description}</p>}
            {!isStudent && (
              <div className="text-xs">
                <b>{f.response_count}</b> of {f.class_size} students responded
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-1">
                  <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${f.class_size ? Math.min(100, (f.response_count / f.class_size) * 100) : 0}%` }} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {isStudent ? (
                f.submitted ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Submitted — thank you</span>
                ) : f.accepting ? (
                  <SoundButton size="sm" onClick={() => openFill(f)}>Give Feedback</SoundButton>
                ) : (
                  <span className="text-xs text-slate-500">Closed</span>
                )
              ) : (
                <>
                  <SoundButton size="sm" variant="secondary" icon={<BarChart3 className="w-3.5 h-3.5" />} onClick={() => openReport(f)}>Report</SoundButton>
                  {isAdmin && (
                    <>
                      <SoundButton size="sm" variant="secondary" icon={f.is_open ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />} onClick={() => toggleOpen(f)}>
                        {f.is_open ? 'Close' : 'Reopen'}
                      </SoundButton>
                      <SoundButton size="sm" variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => removeForm(f)}>Delete</SoundButton>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {forms.length === 0 && !error && (
          <div className="md:col-span-2 p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            {isStudent ? 'No feedback forms are open for your class right now.' : 'No feedback forms yet.'}
          </div>
        )}
      </div>

      {/* Admin: create */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Feedback Form">
        <form onSubmit={createForm} className="space-y-3">
          <input className={inputCls} placeholder="Title * (e.g. Semester 1 Teaching Feedback)" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className={inputCls} rows={2} placeholder="Instructions for students" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <select className={inputCls} value={courseCode} onChange={(e) => { setCourseCode(e.target.value); setSemester(1); }}>
              {courses.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <select className={inputCls} value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              {Array.from({ length: course?.total_semesters || 1 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <input type="date" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} title="Last date (optional)" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">Questions (students rate each 1-5 for every subject) *</label>
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} placeholder={`Question ${i + 1}`} value={q} onChange={(e) => setQuestions((qs) => qs.map((x, j) => (j === i ? e.target.value : x)))} />
                {questions.length > 1 && (
                  <button type="button" className="p-2 text-slate-400 hover:text-rose-600" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <SoundButton type="button" size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setQuestions((qs) => [...qs, ''])}>
              Add question
            </SoundButton>
          </div>
          <div className="flex justify-end gap-2">
            <SoundButton type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create & Open'}</SoundButton>
          </div>
        </form>
      </Modal>

      {/* Student: fill */}
      <Modal isOpen={!!filling} onClose={() => setFilling(null)} title={filling?.title || ''}>
        {filling && (
          <form onSubmit={submitFill} className="space-y-4">
            {(filling.subjects || []).map((s) => (
              <div key={s.subject_code} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black">{s.subject_code} — {s.subject_title}</div>
                {s.faculty_name && <div className="text-[11px] text-slate-500">Teacher: {s.faculty_name}</div>}
                {filling.questions.map((q, qi) => (
                  <div key={qi} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span>{q}</span>
                    <Stars
                      value={answers[s.subject_code]?.[qi] || 0}
                      onChange={(v) => setAnswers((a) => ({ ...a, [s.subject_code]: a[s.subject_code].map((x, j) => (j === qi ? v : x)) }))}
                    />
                  </div>
                ))}
              </div>
            ))}
            <textarea className={inputCls} rows={3} placeholder="Any suggestions (optional, anonymous)" value={comments} onChange={(e) => setComments(e.target.value)} />
            <div className="flex justify-end gap-2">
              <SoundButton type="button" variant="secondary" onClick={() => setFilling(null)}>Cancel</SoundButton>
              <SoundButton type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit Anonymously'}</SoundButton>
            </div>
          </form>
        )}
      </Modal>

      {/* Report */}
      <Modal isOpen={!!report} onClose={() => setReport(null)} title={report ? `Report — ${report.form.title}` : ''}>
        {report && (
          <div className="space-y-4 text-xs">
            <p><b>{report.total_responses}</b> of {report.form.class_size} students responded.</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-2">Subject / Teacher</th>
                    {report.form.questions.map((q, i) => <th key={i} className="p-2" title={q}>Q{i + 1}</th>)}
                    <th className="p-2">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {report.subjects.map((s) => (
                    <tr key={s.subject_code} className="border-b border-slate-100 dark:border-slate-800/60">
                      <td className="p-2"><div className="font-bold">{s.subject_code}</div><div className="text-[10px] text-slate-500">{s.faculty_name || 'Unassigned'}</div></td>
                      {s.question_averages.map((v, i) => <td key={i} className="p-2 font-mono">{v ? v.toFixed(1) : '—'}</td>)}
                      <td className="p-2 font-black text-blue-600">{s.overall_average ? `${s.overall_average.toFixed(2)} / 5` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ol className="list-decimal pl-5 text-[11px] text-slate-500 space-y-0.5">
              {report.form.questions.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
            {report.comments.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold">Comments</div>
                {report.comments.map((c, i) => <p key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">{c.text}</p>)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
