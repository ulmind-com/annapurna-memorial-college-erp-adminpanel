import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Pencil, Trash2, Mail, Phone, GraduationCap, KeyRound, Copy, Check, Settings2, BookOpen } from 'lucide-react';
import { api, MasterItem } from '../../services/api';
import { Faculty } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { EmailField, EmailStatus } from '../common/EmailField';
import { useSound } from '../../context/SoundContext';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

type FormState = {
  full_name: string;
  employee_id: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  specialization: string;
  joining_date: string;
  status: string;
};

const EMPTY: FormState = {
  full_name: '',
  employee_id: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  qualification: '',
  specialization: '',
  joining_date: '',
  status: 'ACTIVE',
};

interface FacultyViewProps {
  onNavigate?: (view: string) => void;
}

export const FacultyView: React.FC<FacultyViewProps> = ({ onNavigate }) => {
  const { playSuccess, playPop, playAlert } = useSound();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [master, setMaster] = useState<MasterItem[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [credentials, setCredentials] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const [res, md] = await Promise.all([api.getFaculty(), api.getMasterData()]);
      setFaculty(res.items);
      setMaster(md);
    } catch (e: any) {
      alert(e.message || 'Failed to load faculty');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const options = (cat: MasterItem['category'], current?: string) => {
    const names = master.filter((m) => m.category === cat).map((m) => m.name);
    // keep a legacy value visible while editing so it isn't silently lost
    if (current && !names.includes(current)) names.unshift(current);
    return names;
  };

  const openAdd = () => {
    playPop();
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setEmailStatus('idle');
    setModalOpen(true);
  };

  const openEdit = (f: Faculty) => {
    playPop();
    setEditing(f);
    setForm({
      full_name: f.full_name,
      employee_id: f.employee_id,
      email: f.email,
      phone: f.phone || '',
      department: f.department || '',
      designation: f.designation || '',
      qualification: f.qualification || '',
      specialization: f.specialization || '',
      joining_date: f.joining_date || '',
      status: (f as any).status || 'ACTIVE',
    });
    setFormError('');
    setEmailStatus('ok');
    setModalOpen(true);
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
    const payload: any = {
      ...form,
      full_name: form.full_name.trim(),
      employee_id: form.employee_id.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      specialization: form.specialization || null,
      joining_date: form.joining_date || null,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.updateFaculty(editing.id, payload);
      } else {
        delete payload.status;
        const res = await api.createFaculty(payload);
        if (res.generated_password) {
          setCredentials({ name: res.full_name, email: res.email, password: res.generated_password });
        }
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

  const remove = async (f: Faculty) => {
    if (!window.confirm(`Remove ${f.full_name}? Their login will be deleted and subjects unassigned.`)) return;
    try {
      await api.deleteFaculty(f.id);
      playSuccess();
      load();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const resend = async (f: Faculty) => {
    if (!window.confirm(`Generate a new password for ${f.full_name} and email it to ${f.email}?`)) return;
    try {
      const res: any = await api.resendFacultyCredentials(f.id);
      playSuccess();
      if (res.generated_password) setCredentials({ name: f.full_name, email: f.email, password: res.generated_password });
      else alert(res.message || 'Credentials sent.');
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const q = search.toLowerCase();
  const filtered = faculty.filter(
    (f) =>
      (!deptFilter || f.department === deptFilter) &&
      [f.full_name, f.employee_id, f.email, f.designation].some((x) => (x || '').toLowerCase().includes(q))
  );
  const missingMaster = ['DEPARTMENT', 'DESIGNATION', 'QUALIFICATION'].filter((c) => !master.some((m) => m.category === c));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Teacher / Faculty Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{faculty.length} faculty members</p>
        </div>
        <div className="flex gap-2">
          {onNavigate && (
            <SoundButton variant="secondary" icon={<Settings2 className="w-4 h-4" />} onClick={() => onNavigate('master-data')}>
              Master Settings
            </SoundButton>
          )}
          <SoundButton icon={<Plus className="w-4 h-4" />} soundType="pop" onClick={openAdd}>
            Add Faculty
          </SoundButton>
        </div>
      </div>

      {missingMaster.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-700 dark:text-amber-300">
          Add {missingMaster.map((m) => m.toLowerCase()).join(', ')} values in Master Settings first — the faculty form dropdowns use them.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input className={`${inputCls} pl-9`} placeholder="Search name, employee ID, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputCls} sm:w-64`} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">All departments</option>
          {Array.from(new Set(faculty.map((f) => f.department).filter(Boolean))).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={f.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(f.full_name)}`}
                alt=""
                className="w-12 h-12 rounded-2xl bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black truncate">{f.full_name}</div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{f.designation}</div>
                <div className="text-[11px] text-slate-500 truncate">{f.department}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800">{f.employee_id}</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {f.qualification}{f.specialization ? ` • ${f.specialization}` : ''}</div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {f.email}</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {f.phone}</div>
              {f.assigned_subjects?.length ? (
                <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {f.assigned_subjects.join(', ')}</div>
              ) : null}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <SoundButton size="sm" variant="secondary" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(f)}>Edit</SoundButton>
              <SoundButton size="sm" variant="secondary" icon={<KeyRound className="w-3.5 h-3.5" />} onClick={() => resend(f)}>Reset Login</SoundButton>
              <SoundButton size="sm" variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => remove(f)}>Delete</SoundButton>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
            No faculty members found.
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${editing.full_name}` : 'Add Faculty Member'}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls} value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className={labelCls}>Employee ID *</label>
              <input className={inputCls} value={form.employee_id} onChange={set('employee_id')} required />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <EmailField
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                onStatus={setEmailStatus}
                type="FACULTY"
                excludeId={editing?.id}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input className={inputCls} value={form.phone} onChange={set('phone')} inputMode="tel" required />
            </div>
            {([
              ['department', 'DEPARTMENT', 'Department *', true],
              ['designation', 'DESIGNATION', 'Designation *', true],
              ['qualification', 'QUALIFICATION', 'Qualification *', true],
              ['specialization', 'SPECIALIZATION', 'Specialization', false],
            ] as const).map(([key, cat, label, required]) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <select className={inputCls} value={form[key]} onChange={set(key)} required={required}>
                  <option value="">{required ? 'Select…' : '— None —'}</option>
                  {options(cat, form[key]).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
            <div>
              <label className={labelCls}>Joining Date</label>
              <input type="date" className={inputCls} value={form.joining_date} onChange={set('joining_date')} />
            </div>
            {editing && (
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={set('status')}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="RESIGNED">Resigned</option>
                </select>
              </div>
            )}
          </div>
          {formError && <p className="text-xs font-bold text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <SoundButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={saving || emailStatus === 'checking'}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Faculty'}
            </SoundButton>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!credentials} onClose={() => setCredentials(null)} title="Faculty Login Created">
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
