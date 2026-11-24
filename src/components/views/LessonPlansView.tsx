import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Search, Trash2, Upload, BookOpen } from 'lucide-react';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { api, FacultySubject } from '../../services/api';
import { StudyMaterial } from '../../types';

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

/** Teacher lesson plans (B.Ed. micro-teaching plans) — stored as study materials with category LESSON_PLAN. */
export const LessonPlansView: React.FC = () => {
  const { playPop, playSuccess, playAlert } = useSound();
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [plans, setPlans] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [unit, setUnit] = useState('');
  const [tlm, setTlm] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [me, list] = await Promise.all([
        api.getMyFacultyProfile(),
        api.getStudyMaterials({ category: 'LESSON_PLAN' }),
      ]);
      setSubjects(me.subjects);
      if (me.subjects.length) setSubjectId((prev) => prev || me.subjects[0].id);
      setPlans(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.id === subjectId);
    if (!title.trim() || !sub || !file) {
      playAlert();
      alert('Title, subject and lesson plan file are required.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', [unit && `Unit: ${unit}`, tlm && `TLM: ${tlm}`].filter(Boolean).join('\n'));
      fd.append('course_code', sub.course_code);
      fd.append('semester', String(sub.semester));
      fd.append('subject_code', sub.code);
      fd.append('category', 'LESSON_PLAN');
      fd.append('tags', 'lesson-plan');
      fd.append('file', file);
      await api.uploadStudyMaterial(fd);
      playSuccess();
      setIsModalOpen(false);
      setTitle('');
      setUnit('');
      setTlm('');
      setFile(null);
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this lesson plan?')) return;
    try {
      await api.deleteStudyMaterial(id);
      setPlans((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const q = search.toLowerCase();
  const filtered = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.subject_code.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Lesson Plans & Micro-Teaching</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload B.Ed. lesson / micro-teaching plans for your assigned subjects
          </p>
        </div>
        <SoundButton
          onClick={() => {
            playPop();
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
          soundType="pop"
          disabled={!subjects.length}
        >
          Upload Lesson Plan
        </SoundButton>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}
      {!loading && !error && !subjects.length && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-300">
          No subjects are assigned to you yet. Ask the Super Admin to assign subjects in Academic Structure.
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, unit..."
            className={`${inputCls} pl-10`}
          />
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {loading ? 'Loading…' : `${filtered.length} lesson plans`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                {plan.subject_code} • {plan.course_code} Sem {plan.semester}
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{plan.title}</h3>
              {plan.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-line">{plan.description}</p>
              )}
              <p className="text-[11px] text-slate-400">
                {plan.uploaded_by_name} • {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SoundButton
                variant="secondary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => window.open(api.fileUrl(plan.file_url), '_blank')}
              >
                Open
              </SoundButton>
              <SoundButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDelete(plan.id)}
              >
                Delete
              </SoundButton>
            </div>
          </div>
        ))}
        {!loading && !filtered.length && !error && (
          <div className="md:col-span-2 p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No lesson plans uploaded yet.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Lesson Plan">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Lesson Topic *</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Subject *</label>
            <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.title} ({s.course_code} Sem {s.semester})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Unit / Chapter</label>
            <input className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Teaching Learning Material (TLM)</label>
            <input className={inputCls} value={tlm} onChange={(e) => setTlm(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Lesson Plan File (PDF/DOC) *</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              className={inputCls}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <SoundButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </SoundButton>
            <SoundButton type="submit" icon={<Upload className="w-4 h-4" />} disabled={saving}>
              {saving ? 'Uploading…' : 'Upload'}
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
