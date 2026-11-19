import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, AlertTriangle, Pin, Mail, Smartphone, CheckCircle } from 'lucide-react';
import { Notice } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

export const NoticesView: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { playSuccess } = useSound();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'ACADEMIC' | 'EXAMINATION' | 'ADMISSION' | 'EVENT' | 'ADMINISTRATIVE' | 'EMERGENCY'>('ACADEMIC');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'FACULTY' | 'STAFF'>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);

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
    if (!title || !content) return;

    try {
      await api.createNotice({
        title,
        content,
        category,
        target_audience: targetAudience,
        priority,
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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            Institutional Notices & University Circulars
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
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
            className={`glass-panel p-5 rounded-2xl border transition-all ${
              n.is_pinned
                ? 'border-indigo-500/40 bg-indigo-950/10 shadow-lg'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {n.is_pinned && <Pin className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                <h3 className="text-base font-bold text-white leading-snug">{n.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    n.priority === 'URGENT'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : n.priority === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {n.priority}
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase">
                  Audience: {n.target_audience}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
              {n.content}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Published by: <b className="text-slate-300">{n.published_by_name}</b></span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commencement of B.Ed. 2nd Semester Classes"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Alert</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                Pin to top of notice board
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Circular Content *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full announcement body and guidelines..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
