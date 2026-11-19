import React, { useState, useEffect } from 'react';
import { Bell, Plus, Pin, Calendar, Tag, AlertTriangle, Send } from 'lucide-react';
import { Notice, NoticeCategory, NoticePriority, TargetAudience } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { formatIST } from '../../utils/date';

export const NoticesView: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('ACADEMIC');
  const [priority, setPriority] = useState<NoticePriority>('NORMAL');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [isPinned, setIsPinned] = useState(false);
  const { playSuccess } = useSound();

  const loadNotices = async () => {
    try {
      const data = await api.getNotices();
      setNotices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNotice({
        title,
        content,
        category,
        priority,
        target_audience: targetAudience,
        is_pinned: isPinned,
      });
      playSuccess();
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      loadNotices();
    } catch (err: any) {
      alert(err.message || 'Notice publishing failed');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Institutional Notices & University Circulars</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Broadcast official circulars, exam notifications, and emergency NCTE alerts
          </p>
        </div>

        <SoundButton
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          soundType="pop"
          icon={<Plus className="w-4 h-4" />}
        >
          Publish Circular
        </SoundButton>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
              n.is_pinned
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {n.is_pinned && <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {n.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${
                    n.priority === 'URGENT'
                      ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                      : n.priority === 'HIGH'
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {n.priority}
                </span>

                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 uppercase">
                  Audience: {n.target_audience}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
              {n.content}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Published by: <b className="text-slate-700 dark:text-slate-300">{n.published_by_name}</b></span>
              <span>{formatIST(n.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Institutional Circular"
        subtitle="Sundarban Ashutosh B.Ed. College & Annapurna Memorial College"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commencement of B.Ed. 2nd Semester Classes"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="EXAMINATION">Examination</option>
                <option value="ADMISSION">Admission</option>
                <option value="EVENT">Event</option>
                <option value="ADMINISTRATIVE">Administrative</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All (Entire College)</option>
                <option value="STUDENTS">Students Only</option>
                <option value="FACULTY">Faculty Members Only</option>
                <option value="STAFF">Administrative Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Pin to top of notice board
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Circular Content *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full announcement body and guidelines..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </SoundButton>
            <SoundButton
              type="submit"
              variant="primary"
              size="sm"
              soundType="success"
              icon={<Send className="w-4 h-4" />}
            >
              Publish Now
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
