import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Send,
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ClassAnnouncement } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { formatIST } from '../../utils/date';

export const CommunicationAnnouncementsView: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [courseCode, setCourseCode] = useState('BED');
  const [semester, setSemester] = useState(1);
  const [subjectCode, setSubjectCode] = useState('BED-101');
  const [batch, setBatch] = useState('All Sections');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');

  const { playSuccess, playPop } = useSound();

  const loadAnnouncements = async () => {
    try {
      const data = await api.getClassAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message.');
      return;
    }

    try {
      await api.createClassAnnouncement({
        faculty_id: user?.id || 'fac-1',
        faculty_name: user?.full_name || 'Dr. Debabrata Roy',
        course_code: courseCode,
        semester,
        subject_code: subjectCode,
        batch,
        title,
        message,
        priority,
      });

      playSuccess();
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Faculty Communication
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Ed. & D.El.Ed. Instruction</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Class Announcements & Batch Communication
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Broadcast lesson updates, assignment alerts, and practicum guidelines to assigned classes
          </p>
        </div>

        <SoundButton
          onClick={() => {
            playPop();
            setIsModalOpen(true);
          }}
          variant="primary"
          size="md"
          soundType="pop"
          icon={<Plus className="w-4 h-4" />}
        >
          New Class Announcement
        </SoundButton>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {ann.course_code} - Sem {ann.semester} ({ann.batch})
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : ann.priority === 'IMPORTANT'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {ann.priority}
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {formatIST(ann.created_at)}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                {ann.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {ann.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Instructor: <b className="text-slate-700 dark:text-slate-300">{ann.faculty_name}</b></span>
              <span>Target: <b>{ann.subject_code || 'All Subjects'}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: New Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Class Announcement"
        subtitle="Broadcast instruction to assigned student batches"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Micro-Teaching Pedagogy Submission Deadline"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="BED">B.Ed.</option>
                <option value="DELED">D.El.Ed.</option>
                <option value="BA_ED">B.A. Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                {[1, 2, 3, 4].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Announcement Message *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide complete instructions, room changes, or syllabus updates..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Post Announcement
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
