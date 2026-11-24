import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, MessageSquare, Send, Trash2, AlertCircle } from 'lucide-react';
import { api, FacultySubject, StudentQuery } from '../../services/api';
import { ClassAnnouncement, Subject } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { formatIST } from '../../utils/date';

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const priorityCls: Record<string, string> = {
  NORMAL: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  IMPORTANT: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  URGENT: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

/** Class announcements (teacher → class) and student queries (student ↔ teacher). */
export const CommunicationAnnouncementsView: React.FC = () => {
  const { activeRole } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isTeacher = activeRole === 'TEACHER';
  const { playSuccess, playPop, playTab, playAlert } = useSound();

  const [tab, setTab] = useState<'ANN' | 'QUERY'>('ANN');
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [mySubjects, setMySubjects] = useState<FacultySubject[]>([]);
  const [studentSubjects, setStudentSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');

  const [isAnnOpen, setIsAnnOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  const [isQueryOpen, setIsQueryOpen] = useState(false);
  const [querySubject, setQuerySubject] = useState('');
  const [question, setQuestion] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError('');
    try {
      const [anns, qs] = await Promise.all([api.getClassAnnouncements(), api.getStudentQueries()]);
      setAnnouncements(anns);
      setQueries(qs);
      if (isTeacher) {
        const me = await api.getMyFacultyProfile();
        setMySubjects(me.subjects);
        if (me.subjects.length) setSubjectId((p) => p || me.subjects[0].id);
      }
      if (isStudent) {
        const me = await api.getMyStudentProfile();
        setStudentSubjects(await api.getSubjects(me.course_code, me.semester));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = mySubjects.find((s) => s.id === subjectId);
    if (!sub || !title.trim() || !message.trim()) {
      alert('Subject, title and message are required.');
      return;
    }
    setBusy(true);
    try {
      await api.createClassAnnouncement({
        course_code: sub.course_code,
        semester: sub.semester,
        subject_code: sub.code,
        title: title.trim(),
        message: message.trim(),
        priority,
      });
      playSuccess();
      setIsAnnOpen(false);
      setTitle('');
      setMessage('');
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to post announcement');
    } finally {
      setBusy(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.deleteClassAnnouncement(id);
      setAnnouncements((a) => a.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const askQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    try {
      await api.createStudentQuery({ subject_code: querySubject || undefined, question: question.trim() });
      playSuccess();
      setIsQueryOpen(false);
      setQuestion('');
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to send query');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (id: string) => {
    const reply = (replyDrafts[id] || '').trim();
    if (!reply) return;
    try {
      const updated = await api.replyStudentQuery(id, reply);
      playSuccess();
      setQueries((qs) => qs.map((q) => (q.id === id ? updated : q)));
      setReplyDrafts((d) => ({ ...d, [id]: '' }));
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to send reply');
    }
  };

  const tabBtn = (id: 'ANN' | 'QUERY', label: string, count: number) => (
    <button
      type="button"
      onClick={() => {
        playTab();
        setTab(id);
      }}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        tab === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {label} ({count})
    </button>
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {isStudent ? 'Class Updates & Queries' : 'Class Announcements & Student Queries'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isStudent
              ? 'Announcements from your teachers and answers to your questions'
              : 'Broadcast updates to your classes and answer student questions'}
          </p>
        </div>
        {isTeacher && tab === 'ANN' && (
          <SoundButton
            onClick={() => {
              playPop();
              setIsAnnOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            soundType="pop"
            disabled={!mySubjects.length}
          >
            New Announcement
          </SoundButton>
        )}
        {isStudent && tab === 'QUERY' && (
          <SoundButton
            onClick={() => {
              playPop();
              setIsQueryOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            soundType="pop"
          >
            Ask a Question
          </SoundButton>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex gap-2 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {tabBtn('ANN', 'Announcements', announcements.length)}
        {tabBtn('QUERY', isStudent ? 'My Questions' : 'Student Queries', queries.length)}
      </div>

      {tab === 'ANN' && (
        <div className="space-y-3">
          {announcements.length === 0 && (
            <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
              No announcements yet.
            </div>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                    <span className={`px-2 py-0.5 rounded-full ${priorityCls[a.priority] || priorityCls.NORMAL}`}>{a.priority}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {a.course_code} Sem {a.semester}
                      {a.subject_code ? ` • ${a.subject_code}` : ''}
                    </span>
                  </div>
                  <h3 className="text-sm font-black mt-2">{a.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">{a.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {a.faculty_name} • {formatIST(a.created_at)}
                  </p>
                </div>
                {!isStudent && (
                  <button type="button" onClick={() => deleteAnnouncement(a.id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'QUERY' && (
        <div className="space-y-3">
          {queries.length === 0 && (
            <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
              No queries yet.
            </div>
          )}
          {queries.map((q) => (
            <div key={q.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    q.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {q.status}
                </span>
                {!isStudent && (
                  <span className="text-slate-500">
                    {q.student_name} ({q.roll_number}) • {q.course_code} Sem {q.semester}
                  </span>
                )}
                {q.subject_code && <span className="text-blue-600">{q.subject_code}</span>}
                <span className="text-slate-400">{formatIST(q.created_at)}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="whitespace-pre-line">{q.question}</p>
              </div>
              {q.reply ? (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-xs">
                  <div className="font-bold text-blue-700 dark:text-blue-300 text-[10px] mb-1">
                    {q.replied_by} • {q.replied_at ? formatIST(q.replied_at) : ''}
                  </div>
                  <p className="whitespace-pre-line">{q.reply}</p>
                </div>
              ) : (
                !isStudent && (
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Type your reply..."
                      value={replyDrafts[q.id] || ''}
                      onChange={(e) => setReplyDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                    />
                    <SoundButton size="sm" icon={<Send className="w-3.5 h-3.5" />} onClick={() => sendReply(q.id)}>
                      Reply
                    </SoundButton>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isAnnOpen} onClose={() => setIsAnnOpen(false)} title="New Class Announcement">
        <form onSubmit={postAnnouncement} className="space-y-3">
          <div>
            <label className="text-xs font-bold">Class / Subject *</label>
            <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {mySubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.title} ({s.course_code} Sem {s.semester})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold">Title *</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold">Message *</label>
            <textarea className={inputCls} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold">Priority</label>
            <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
              <option value="NORMAL">Normal</option>
              <option value="IMPORTANT">Important</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500">Students of this class get a push notification on the mobile app.</p>
          <div className="flex justify-end gap-2">
            <SoundButton type="button" variant="secondary" onClick={() => setIsAnnOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post'}</SoundButton>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isQueryOpen} onClose={() => setIsQueryOpen(false)} title="Ask Your Teacher">
        <form onSubmit={askQuery} className="space-y-3">
          <div>
            <label className="text-xs font-bold">Subject</label>
            <select className={inputCls} value={querySubject} onChange={(e) => setQuerySubject(e.target.value)}>
              <option value="">General</option>
              {studentSubjects.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} — {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold">Question *</label>
            <textarea className={inputCls} rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <SoundButton type="button" variant="secondary" onClick={() => setIsQueryOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send'}</SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
