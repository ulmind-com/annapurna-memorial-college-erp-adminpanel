import React, { useEffect, useState } from 'react';
import { Upload, ImageIcon, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Course } from '../../types';
import { Modal } from '../common/Modal';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

type Kind = 'marksheet' | 'certificate';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

const FIELDS: Record<Kind, { key: string; label: string; textarea?: boolean; hint?: string }[]> = {
  marksheet: [
    { key: 'format_title', label: 'Marksheet heading', hint: 'OFFICIAL STATEMENT OF MARKS & GRADES' },
    { key: 'controller_signature_title', label: 'Left signature title', hint: 'Controller of Examinations' },
    { key: 'principal_signature_title', label: 'Right signature title', hint: 'Principal' },
  ],
  certificate: [
    { key: 'title', label: 'Certificate heading', hint: 'CERTIFICATE OF COMPLETION' },
    {
      key: 'body_text',
      label: 'Certificate text',
      textarea: true,
      hint: 'This is to certify that {student_name} (Roll No. {roll_number}) has completed Semester {semester} of {course_name} ({session}) with SGPA {sgpa}.',
    },
    { key: 'left_signature_title', label: 'Left signature title', hint: 'Controller of Examinations' },
    { key: 'right_signature_title', label: 'Right signature title', hint: 'Principal' },
    { key: 'top_margin', label: 'Text start from top (points)', hint: '150' },
  ],
};

/**
 * Super Admin uploads the official marksheet / certificate design (A4 image) and texts.
 * A design can apply to all courses or to one course (overrides the all-courses design).
 */
export const DocumentTemplatesModal: React.FC<{ isOpen: boolean; onClose: () => void; courses: Course[] }> = ({ isOpen, onClose, courses }) => {
  const { playSuccess, playAlert, playTab } = useSound();
  const [kind, setKind] = useState<Kind>('marksheet');
  const [scope, setScope] = useState('');
  const [value, setValue] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.getTemplate(kind, scope || undefined).then(setValue).catch((e) => alert(e.message));
  }, [isOpen, kind, scope]);

  const upload = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      playAlert();
      alert('Upload the design as a PNG or JPG image (A4 size).');
      return;
    }
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      setValue((v) => ({ ...v, background_url: res.url }));
    } catch (e: any) {
      playAlert();
      alert(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateTemplate(kind, value, scope || undefined);
      playSuccess();
      onClose();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marksheet & Certificate Design" subtitle="Upload the official design and set the printed texts">
      <form onSubmit={save} className="space-y-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
          {(['marksheet', 'certificate'] as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { playTab(); setKind(k); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize ${kind === k ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {k}
            </button>
          ))}
        </div>

        <div>
          <label className={labelCls}>Applies to</label>
          <select className={inputCls} value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="">All courses (default design)</option>
            {courses.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code}) only</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Design image (PNG/JPG, A4 {kind === 'certificate' ? 'landscape' : 'portrait'})</label>
          {value.background_url ? (
            <div className="flex items-center gap-3">
              <img src={api.fileUrl(value.background_url)} alt="design" className="h-28 rounded-xl border border-slate-200 dark:border-slate-700 object-contain bg-white" />
              <SoundButton type="button" size="sm" variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setValue((v) => ({ ...v, background_url: null }))}>
                Remove
              </SoundButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ImageIcon className="w-4 h-4" /> No design uploaded — a plain layout is used.
            </div>
          )}
          <label className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs font-bold cursor-pointer hover:border-blue-400">
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload design'}
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>

        {FIELDS[kind].map((f) => (
          <div key={f.key}>
            <label className={labelCls}>{f.label}</label>
            {f.textarea ? (
              <textarea className={inputCls} rows={3} placeholder={f.hint} value={value[f.key] || ''} onChange={(e) => setValue((v) => ({ ...v, [f.key]: e.target.value }))} />
            ) : (
              <input className={inputCls} placeholder={f.hint} value={value[f.key] || ''} onChange={(e) => setValue((v) => ({ ...v, [f.key]: e.target.value }))} />
            )}
          </div>
        ))}
        {kind === 'certificate' && (
          <p className="text-[11px] text-slate-500">
            Placeholders: {'{student_name} {roll_number} {registration_number} {course_name} {semester} {session} {sgpa} {percentage} {result} {college_name}'}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <SoundButton type="button" variant="secondary" onClick={onClose}>Cancel</SoundButton>
          <SoundButton type="submit" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save Design'}</SoundButton>
        </div>
      </form>
    </Modal>
  );
};
