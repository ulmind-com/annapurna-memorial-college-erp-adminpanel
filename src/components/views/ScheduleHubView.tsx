import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { TimetableScheduleView } from './TimetableScheduleView';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { api, CalendarEvent } from '../../services/api';
import { Course } from '../../types';

type Tab = 'WEEKLY' | 'EXAM' | 'CALENDAR';

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

const typeBadge: Record<string, string> = {
  HOLIDAY: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  EVENT: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  EXAM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

const EMPTY = {
  title: '',
  event_type: 'EVENT' as CalendarEvent['event_type'],
  exam_kind: 'SEMESTER' as NonNullable<CalendarEvent['exam_kind']>,
  date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  course_code: '',
  semester: '',
  subject_code: '',
  room: '',
  description: '',
};

const EventsPanel: React.FC<{ mode: 'EXAM' | 'CALENDAR' }> = ({ mode }) => {
  const { activeRole } = useAuth();
  const isAdmin = activeRole === 'SUPER_ADMIN';
  const { playPop, playSuccess, playAlert } = useSound();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY, event_type: mode === 'EXAM' ? 'EXAM' : 'EVENT' } as typeof EMPTY);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await api.getCalendarEvents(mode === 'EXAM' ? { event_type: 'EXAM' } : {});
      setEvents(mode === 'EXAM' ? list : list.filter((e) => e.event_type !== 'EXAM'));
      if (isAdmin && !courses.length) setCourses(await api.getCourses());
    } catch (e: any) {
      alert(e.message || 'Failed to load schedule');
    }
  };

  useEffect(() => {
    load();
  }, [mode]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      alert('Title and date are required.');
      return;
    }
    setBusy(true);
    try {
      await api.createCalendarEvent({
        title: form.title.trim(),
        event_type: form.event_type,
        exam_kind: form.event_type === 'EXAM' ? form.exam_kind : null,
        date: form.date,
        end_date: form.end_date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        course_code: form.course_code || null,
        semester: form.semester ? Number(form.semester) : null,
        subject_code: form.subject_code || null,
        room: form.room || null,
        description: form.description || null,
      });
      playSuccess();
      setOpen(false);
      setForm({ ...EMPTY, event_type: mode === 'EXAM' ? 'EXAM' : 'EVENT' } as typeof EMPTY);
      load();
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.deleteCalendarEvent(id);
      setEvents((ev) => ev.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === 'EXAM' ? 'Semester, internal and practical examination schedule' : 'Holidays and college events'}
        </p>
        {isAdmin && (
          <SoundButton size="sm" icon={<Plus className="w-4 h-4" />} soundType="pop" onClick={() => { playPop(); setOpen(true); }}>
            {mode === 'EXAM' ? 'Add Exam' : 'Add Holiday / Event'}
          </SoundButton>
        )}
      </div>

      {events.length === 0 ? (
        <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
          Nothing scheduled yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">Date</th>
                <th className="p-3">Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Time</th>
                <th className="p-3">Class</th>
                {mode === 'EXAM' && <th className="p-3">Room</th>}
                {isAdmin && <th className="p-3" />}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className={`border-b border-slate-100 dark:border-slate-800/60 ${(ev.end_date || ev.date) < today ? 'opacity-50' : ''}`}>
                  <td className="p-3 font-mono font-bold whitespace-nowrap">
                    {ev.date}
                    {ev.end_date && ev.end_date !== ev.date ? ` → ${ev.end_date}` : ''}
                  </td>
                  <td className="p-3">
                    <div className="font-bold">{ev.title}</div>
                    {ev.subject_code && <div className="text-[10px] text-blue-600">{ev.subject_code}</div>}
                    {ev.description && <div className="text-[10px] text-slate-500">{ev.description}</div>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge[ev.event_type]}`}>
                      {ev.event_type === 'EXAM' ? `${ev.exam_kind || ''} EXAM` : ev.event_type}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{[ev.start_time, ev.end_time].filter(Boolean).join(' - ') || '—'}</td>
                  <td className="p-3">{ev.course_code ? `${ev.course_code}${ev.semester ? ` Sem ${ev.semester}` : ''}` : 'All'}</td>
                  {mode === 'EXAM' && <td className="p-3">{ev.room || '—'}</td>}
                  {isAdmin && (
                    <td className="p-3">
                      <button type="button" onClick={() => remove(ev.id)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={mode === 'EXAM' ? 'Add Exam Schedule' : 'Add Holiday / Event'}>
        <form onSubmit={save} className="space-y-3">
          <input className={inputCls} placeholder="Title *" value={form.title} onChange={set('title')} required />
          {mode === 'EXAM' ? (
            <select className={inputCls} value={form.exam_kind} onChange={set('exam_kind')}>
              <option value="SEMESTER">Semester Exam</option>
              <option value="INTERNAL">Internal Exam</option>
              <option value="PRACTICAL">Practical Exam</option>
            </select>
          ) : (
            <select className={inputCls} value={form.event_type} onChange={set('event_type')}>
              <option value="EVENT">Event</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] font-bold">Date *<input type="date" className={inputCls} value={form.date} onChange={set('date')} required /></label>
            <label className="text-[11px] font-bold">End date<input type="date" className={inputCls} value={form.end_date} onChange={set('end_date')} /></label>
            <label className="text-[11px] font-bold">Start time<input type="time" className={inputCls} value={form.start_time} onChange={set('start_time')} /></label>
            <label className="text-[11px] font-bold">End time<input type="time" className={inputCls} value={form.end_time} onChange={set('end_time')} /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className={inputCls} value={form.course_code} onChange={set('course_code')} required={mode === 'EXAM'}>
              <option value="">{mode === 'EXAM' ? 'Select course *' : 'All courses'}</option>
              {courses.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
            <input className={inputCls} type="number" min={1} placeholder="Semester (optional)" value={form.semester} onChange={set('semester')} />
          </div>
          {mode === 'EXAM' && (
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Subject code" value={form.subject_code} onChange={set('subject_code')} />
              <input className={inputCls} placeholder="Room / Hall" value={form.room} onChange={set('room')} />
            </div>
          )}
          <textarea className={inputCls} rows={2} placeholder="Description" value={form.description} onChange={set('description')} />
          <div className="flex justify-end gap-2">
            <SoundButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</SoundButton>
            <SoundButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/** Class timetable + exam routine + academic calendar under one menu item. */
export const ScheduleHubView: React.FC = () => {
  const { playTab } = useSound();
  const [tab, setTab] = useState<Tab>('WEEKLY');
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'WEEKLY', label: 'Class Timetable', icon: Calendar },
    { id: 'EXAM', label: 'Exam Routine', icon: ClipboardList },
    { id: 'CALENDAR', label: 'Academic Calendar', icon: CalendarDays },
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { playTab(); setTab(t.id); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === 'WEEKLY' && <TimetableScheduleView />}
      {tab === 'EXAM' && <EventsPanel mode="EXAM" />}
      {tab === 'CALENDAR' && <EventsPanel mode="CALENDAR" />}
    </div>
  );
};
