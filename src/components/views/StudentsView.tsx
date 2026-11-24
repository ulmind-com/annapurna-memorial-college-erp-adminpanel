import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Search, Pencil, Trash2, Eye, KeyRound, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Course, Student } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { EmailField, EmailStatus } from '../common/EmailField';
import { useSound } from '../../context/SoundContext';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

type FormState = {
  roll_number: string;
  registration_number: string;
  full_name: string;
  email: string;
  phone: string;
  course_code: string;
  semester: number;
  academic_session: string;
  section: string;
  gender: string;
  category: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  address: string;
  status: string;
};

const EMPTY: FormState = {
  roll_number: '',
  registration_number: '',
  full_name: '',
  email: '',
  phone: '',
  course_code: '',
  semester: 1,
  academic_session: '',
  section: 'A',
  gender: 'MALE',
  category: 'GEN',
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  address: '',
  status: 'ACTIVE',
};

export const StudentsView: React.FC = () => {
  const { playSuccess, playPop, playAlert } = useSound();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const [sRes, cList, sess] = await Promise.all([
        api.getStudents({ course_code: courseFilter || undefined, semester: semFilter || undefined }),
        api.getCourses(),
        api.getAcademicSessions(),
      ]);
      setStudents(sRes.items);
      setCourses(cList);
      setSessions(sess.map((x) => x.label));
    } catch (e: any) {
      alert(e.message || 'Failed to load students');
    }
  };

  useEffect(() => {
    load();
  }, [courseFilter, semFilter]);

  const course = courses.find((c) => c.code === form.course_code);
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'semester' ? Number(e.target.value) : e.target.value }));

  const openAdd = () => {
    playPop();
    setEditing(null);
    setForm({ ...EMPTY, course_code: courses[0]?.code || '', academic_session: sessions[0] || '' });
    setFormError('');
    setEmailStatus('idle');
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    playPop();
    setViewing(null);
    setEditing(s);
    setForm({
      roll_number: s.roll_number,
      registration_number: s.registration_number || '',
      full_name: s.full_name,
      email: s.email,
      phone: s.phone || '',
      course_code: s.course_code,
      semester: Number(s.semester) || 1,
      academic_session: s.academic_session || '',
      section: s.section || 'A',
      gender: s.gender || 'MALE',
      category: s.category || 'GEN',
      date_of_birth: s.date_of_birth || '',
      guardian_name: s.guardian_name || '',
      guardian_phone: s.guardian_phone || '',
      address: (s as any).address || '',
      status: s.status || 'ACTIVE',
    });
    setFormError('');
    setEmailStatus('ok');
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (emailStatus !== 'ok') {
      playAlert();
      setFormError(emailStatus === 'checking' ? 'Please wait, verifying email…' : 'Please enter a valid, unused email address.');
      return;
    }
    if (!/^[+0-9 ()-]{8,16}$/.test(form.phone.trim())) {
      playAlert();
      setFormError('Enter a valid phone number.');
      return;
    }
    if (form.academic_session && !/^\d{4}-\d{4}$/.test(form.academic_session.trim())) {
      playAlert();
      setFormError('Academic session must look like 2025-2027.');
      return;
    }
    const payload: any = {
      ...form,
      roll_number: form.roll_number.trim(),
      registration_number: form.registration_number.trim() || null,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      academic_session: form.academic_session.trim(),
      date_of_birth: form.date_of_birth || null,
      address: form.address || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.updateStudent(editing.id, payload);
      } else {
        delete payload.status;
        const res = await api.createStudent(payload);
        if (res.generated_password) setCredentials({ name: res.full_name, email: res.email, password: res.generated_password });
      }
      playSuccess();
      setModalOpen(false);
      load();
    } catch (err: any) {
      playAlert();
      setFormError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Student) => {
    if (!window.confirm(`Delete ${s.full_name} (${s.roll_number})? Their login will also be removed.`)) return;
    try {
      await api.deleteStudent(s.id);
      playSuccess();
      setViewing(null);
      load();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const resend = async (s: Student) => {
    if (!window.confirm(`Generate a new password for ${s.full_name} and email it to ${s.email}?`)) return;
    try {
      const res: any = await api.resendStudentCredentials(s.id);
      playSuccess();
      alert(res.message || 'New login details emailed.');
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const q = search.toLowerCase();
  const filtered = students.filter((s) =>
    [s.full_name, s.roll_number, s.email, s.registration_number].some((x) => (x || '').toLowerCase().includes(q))
  );
  const filterCourse = courses.find((c) => c.code === courseFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Student Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{students.length} students</p>
        </div>
        <SoundButton icon={<Plus className="w-4 h-4" />} soundType="pop" onClick={openAdd} disabled={!courses.length}>
          Admit Student
        </SoundButton>
      </div>
      {!courses.length && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
          Create a course in Academic Structure before admitting students.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search name, roll, registration, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputCls} sm:w-60`} value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setSemFilter(''); }}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
          ))}
        </select>
        <select className={`${inputCls} sm:w-40`} value={semFilter} onChange={(e) => setSemFilter(e.target.value)} disabled={!filterCourse}>
          <option value="">All semesters</option>
          {Array.from({ length: filterCourse?.total_semesters || 0 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <th className="p-3">Student</th>
              <th className="p-3">Roll / Reg. No.</th>
              <th className="p-3">Course</th>
              <th className="p-3">Session</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="p-3">
                  <div className="font-bold">{s.full_name}</div>
                  <div className="text-[10px] text-slate-500">{s.email}</div>
                </td>
                <td className="p-3 font-mono">
                  <div className="font-bold">{s.roll_number}</div>
                  <div className="text-[10px] text-slate-500">{s.registration_number || '—'}</div>
                </td>
                <td className="p-3">{s.course_name} ({s.course_code}) • Sem {s.semester}</td>
                <td className="p-3">{s.academic_session}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" title="View" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setViewing(s)}><Eye className="w-4 h-4" /></button>
                    <button type="button" title="Edit" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></button>
                    <button type="button" title="Reset login" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => resend(s)}><KeyRound className="w-4 h-4" /></button>
                    <button type="button" title="Delete" className="p-2 rounded-lg hover:bg-rose-50 text-rose-600" onClick={() => remove(s)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${editing.full_name}` : 'Admit New Student'}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.full_name} onChange={set('full_name')} required /></div>
            <div><label className={labelCls}>Roll Number *</label><input className={inputCls} value={form.roll_number} onChange={set('roll_number')} required /></div>
            <div><label className={labelCls}>Registration Number</label><input className={inputCls} value={form.registration_number} onChange={set('registration_number')} placeholder="University registration no." /></div>
            <div>
              <label className={labelCls}>Email *</label>
              <EmailField value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} onStatus={setEmailStatus} type="STUDENT" excludeId={editing?.id} className={inputCls} />
            </div>
            <div><label className={labelCls}>Phone *</label><input className={inputCls} value={form.phone} onChange={set('phone')} inputMode="tel" required /></div>
            <div>
              <label className={labelCls}>Course *</label>
              <select className={inputCls} value={form.course_code} onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value, semester: 1 }))} required>
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code}) — {c.remaining_seats ?? '?'} seats left
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Semester *</label>
              <select className={inputCls} value={form.semester} onChange={set('semester')}>
                {Array.from({ length: course?.total_semesters || 1 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Academic Session *</label>
              <input className={inputCls} list="session-options" value={form.academic_session} onChange={set('academic_session')} placeholder="2025-2027" required />
              <datalist id="session-options">
                {sessions.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div><label className={labelCls}>Section</label><input className={inputCls} value={form.section} onChange={set('section')} /></div>
            <div>
              <label className={labelCls}>Gender</label>
              <select className={inputCls} value={form.gender} onChange={set('gender')}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category} onChange={set('category')}>
                {['GEN', 'OBC-A', 'OBC-B', 'SC', 'ST', 'EWS'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Date of Birth</label><input type="date" className={inputCls} value={form.date_of_birth} onChange={set('date_of_birth')} /></div>
            <div><label className={labelCls}>Guardian Name</label><input className={inputCls} value={form.guardian_name} onChange={set('guardian_name')} /></div>
            <div><label className={labelCls}>Guardian Phone</label><input className={inputCls} value={form.guardian_phone} onChange={set('guardian_phone')} /></div>
            {editing && (
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={set('status')}>
                  {['ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div><label className={labelCls}>Address</label><textarea className={inputCls} rows={2} value={form.address} onChange={set('address')} /></div>
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <SoundButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={saving || emailStatus === 'checking'}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Admit Student'}</SoundButton>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.full_name || ''}>
        {viewing && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Roll Number', viewing.roll_number],
                ['Registration No.', viewing.registration_number || '—'],
                ['Course', `${viewing.course_name} (${viewing.course_code})`],
                ['Semester', viewing.semester],
                ['Session', viewing.academic_session],
                ['Section', viewing.section],
                ['Email', viewing.email],
                ['Phone', viewing.phone],
                ['Gender', viewing.gender],
                ['Category', viewing.category],
                ['Date of Birth', viewing.date_of_birth || '—'],
                ['Guardian', `${viewing.guardian_name || '—'} ${viewing.guardian_phone || ''}`],
                ['Status', viewing.status],
              ].map(([k, v]) => (
                <div key={String(k)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">{k}</div>
                  <div className="font-bold break-all">{String(v)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <SoundButton icon={<Pencil className="w-4 h-4" />} onClick={() => openEdit(viewing)}>Edit</SoundButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!credentials} onClose={() => setCredentials(null)} title="Student Login Created">
        {credentials && (
          <div className="space-y-3 text-xs">
            <p>Share these login details with <b>{credentials.name}</b>. They were also emailed.</p>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono space-y-1">
              <div>Email: {credentials.email}</div>
              <div>Password: {credentials.password}</div>
            </div>
            <SoundButton
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={() => {
                navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </SoundButton>
          </div>
        )}
      </Modal>
    </div>
  );
};
