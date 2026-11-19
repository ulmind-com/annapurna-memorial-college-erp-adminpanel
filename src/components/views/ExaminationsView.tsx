import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  QrCode,
  Building,
} from 'lucide-react';
import { Marksheet, MarksheetStatus, Examination } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

export const ExaminationsView: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-1');
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);

  // Workflow Action Modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    marksheet: Marksheet | null;
    action: 'SUBMIT' | 'VERIFY' | 'APPROVE' | 'PUBLISH' | 'REJECT';
    remarks: string;
  }>({
    isOpen: false,
    marksheet: null,
    action: 'APPROVE',
    remarks: '',
  });

  const { playClick, playSuccess, playApprove, playAlert } = useSound();

  const loadData = async () => {
    try {
      const exams = await api.getExaminations();
      setExaminations(exams);
      if (exams.length > 0 && !selectedExamId) {
        setSelectedExamId(exams[0].id);
      }
      const ms = await api.getExamMarksheets(selectedExamId || 'exam-1');
      setMarksheets(ms);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExamId]);

  const handleActionClick = (
    ms: Marksheet,
    action: 'SUBMIT' | 'VERIFY' | 'APPROVE' | 'PUBLISH' | 'REJECT'
  ) => {
    if (action === 'REJECT') {
      playAlert();
    } else {
      playClick();
    }
    setActionModal({
      isOpen: true,
      marksheet: ms,
      action,
      remarks: action === 'REJECT' ? '' : `Step completed according to institutional regulations.`,
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.marksheet) return;

    if (actionModal.action === 'REJECT' && !actionModal.remarks.trim()) {
      alert('Rejection remarks are mandatory to inform the faculty member.');
      return;
    }

    try {
      await api.executeMarksheetAction(
        actionModal.marksheet.id,
        actionModal.action,
        actionModal.remarks
      );

      if (actionModal.action === 'PUBLISH' || actionModal.action === 'APPROVE') {
        playApprove();
      } else if (actionModal.action === 'REJECT') {
        playAlert();
      } else {
        playSuccess();
      }

      setActionModal({ isOpen: false, marksheet: null, action: 'APPROVE', remarks: '' });
      // Reload marksheets
      const updated = await api.getExamMarksheets(selectedExamId || 'exam-1');
      setMarksheets(updated);
      if (selectedMarksheet) {
        const refreshed = updated.find((m) => m.id === selectedMarksheet.id);
        if (refreshed) setSelectedMarksheet(refreshed);
      }
    } catch (err: any) {
      alert(err.message || 'Workflow transition failed');
    }
  };

  const handleDownloadPdf = async (ms: Marksheet) => {
    try {
      playSuccess();
      const blob = await api.downloadMarksheetPdf(ms.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Marksheet_${ms.roll_number}_Sem${ms.semester}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Filter marksheets
  const filteredMarksheets = marksheets.filter((m) => {
    const matchesSearch =
      m.student_name.toLowerCase().includes(search.toLowerCase()) ||
      m.roll_number.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    return m.status === activeTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Status Flow Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            Examinations & Marksheet Approval Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            BSAEU & NCTE multi-tiered marks verification, SGPA/CGPA evaluation, and digital publication
          </p>
        </div>

        {/* Exam Select */}
        <div className="flex items-center gap-2">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Workflow Stage Progression Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Marksheet Lifecycle State Machine
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              id: 'DRAFT',
              num: '1',
              title: 'Draft Entry',
              desc: 'Faculty marks input',
              count: marksheets.filter((m) => m.status === 'DRAFT').length,
            },
            {
              id: 'SUBMITTED_BY_FACULTY',
              num: '2',
              title: 'Faculty Submitted',
              desc: 'Awaiting dept. check',
              count: marksheets.filter((m) => m.status === 'SUBMITTED_BY_FACULTY').length,
            },
            {
              id: 'DEPARTMENT_VERIFIED',
              num: '3',
              title: 'Dept. Verified',
              desc: 'Coordinator verified',
              count: marksheets.filter((m) => m.status === 'DEPARTMENT_VERIFIED').length,
            },
            {
              id: 'ADMIN_APPROVED',
              num: '4',
              title: 'Admin Approved',
              desc: 'Principal clearance',
              count: marksheets.filter((m) => m.status === 'ADMIN_APPROVED').length,
            },
            {
              id: 'PUBLISHED',
              num: '5',
              title: 'Published',
              desc: 'Live on student portal',
              count: marksheets.filter((m) => m.status === 'PUBLISHED').length,
            },
          ].map((stage, idx) => (
            <div
              key={stage.id}
              onClick={() => setActiveTab(stage.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeTab === stage.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                  {stage.num}
                </span>
                <span className="text-base font-extrabold text-white">{stage.count}</span>
              </div>
              <div className="text-xs font-bold mt-2 text-white">{stage.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{stage.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: `All (${marksheets.length})` },
            { id: 'DRAFT', label: 'Drafts' },
            { id: 'SUBMITTED_BY_FACULTY', label: 'Submitted' },
            { id: 'DEPARTMENT_VERIFIED', label: 'Dept. Verified' },
            { id: 'ADMIN_APPROVED', label: 'Approved' },
            { id: 'PUBLISHED', label: 'Published' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playClick();
                setActiveTab(t.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Marksheets Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Marks (Obt / Max)</th>
                <th className="py-3 px-4">SGPA</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Current Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Workflow Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMarksheets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No marksheets matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMarksheets.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{m.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.course_code} - Sem {m.semester}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400">{m.roll_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {m.total_marks_obtained} / {m.grand_max_marks} ({m.overall_percentage}%)
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-indigo-400">{m.sgpa}</span>
                      <span className="ml-1 text-[11px] text-slate-400">({m.letter_grade})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-slate-300">{m.result_status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={m.status} size="sm" />
                      {m.status === 'REJECTED' && m.rejection_reason && (
                        <div className="text-[10px] text-rose-400 mt-1 line-clamp-1 italic">
                          "{m.rejection_reason}"
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <SoundButton
                          onClick={() => setSelectedMarksheet(m)}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-slate-300 hover:text-white"
                        >
                          Breakdown
                        </SoundButton>

                        {/* Workflow Action Triggers based on stage */}
                        {m.status === 'DRAFT' && (
                          <SoundButton
                            onClick={() => handleActionClick(m, 'SUBMIT')}
                            size="sm"
                            variant="primary"
                            soundType="click"
                            icon={<Send className="w-3 h-3" />}
                          >
                            Submit
                          </SoundButton>
                        )}

                        {m.status === 'SUBMITTED_BY_FACULTY' && (
                          <>
                            <SoundButton
                              onClick={() => handleActionClick(m, 'VERIFY')}
                              size="sm"
                              variant="secondary"
                              soundType="click"
                              icon={<CheckCircle className="w-3 h-3 text-purple-400" />}
                            >
                              Verify
                            </SoundButton>
                            <SoundButton
                              onClick={() => handleActionClick(m, 'REJECT')}
                              size="sm"
                              variant="danger"
                              soundType="alert"
                            >
                              Reject
                            </SoundButton>
                          </>
                        )}

                        {m.status === 'DEPARTMENT_VERIFIED' && (
                          <>
                            <SoundButton
                              onClick={() => handleActionClick(m, 'APPROVE')}
                              size="sm"
                              variant="primary"
                              soundType="success"
                              icon={<CheckCircle className="w-3 h-3 text-white" />}
                            >
                              Approve
                            </SoundButton>
                            <SoundButton
                              onClick={() => handleActionClick(m, 'REJECT')}
                              size="sm"
                              variant="danger"
                              soundType="alert"
                            >
                              Reject
                            </SoundButton>
                          </>
                        )}

                        {m.status === 'ADMIN_APPROVED' && (
                          <SoundButton
                            onClick={() => handleActionClick(m, 'PUBLISH')}
                            size="sm"
                            variant="success"
                            soundType="approve"
                            icon={<Sparkles className="w-3 h-3" />}
                          >
                            Publish
                          </SoundButton>
                        )}

                        {m.status === 'PUBLISHED' && (
                          <SoundButton
                            onClick={() => handleDownloadPdf(m)}
                            size="sm"
                            variant="outline"
                            soundType="pop"
                            icon={<Download className="w-3 h-3" />}
                          >
                            PDF
                          </SoundButton>
                        )}

                        {m.status === 'REJECTED' && (
                          <SoundButton
                            onClick={() => handleActionClick(m, 'SUBMIT')}
                            size="sm"
                            variant="secondary"
                            soundType="click"
                          >
                            Re-submit
                          </SoundButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Marksheet Subject Breakdown & Audit Trail */}
      {selectedMarksheet && (
        <Modal
          isOpen={!!selectedMarksheet}
          onClose={() => setSelectedMarksheet(null)}
          title="Official Statement of Marks & Evaluation"
          subtitle={`${selectedMarksheet.student_name} (${selectedMarksheet.roll_number})`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white">{selectedMarksheet.exam_title}</div>
                <div className="text-xs text-indigo-400 font-medium">
                  {selectedMarksheet.course_name} • Semester {selectedMarksheet.semester} • Session {selectedMarksheet.academic_session}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                  <QrCode className="w-3 h-3 text-emerald-400" />
                  Hash: {selectedMarksheet.qr_code_hash}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={selectedMarksheet.status} />
                <SoundButton
                  onClick={() => handleDownloadPdf(selectedMarksheet)}
                  size="sm"
                  variant="primary"
                  soundType="pop"
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </SoundButton>
              </div>
            </div>

            {/* Subject score table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/70 text-slate-300 font-semibold border-b border-slate-800 text-[11px]">
                    <th className="py-2.5 px-3">Subject Code & Title</th>
                    <th className="py-2.5 px-3 text-center">Credits</th>
                    <th className="py-2.5 px-3 text-center">Theory (Max)</th>
                    <th className="py-2.5 px-3 text-center">Prac (Max)</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Grade Point</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedMarksheet.subject_scores.map((sc) => (
                    <tr key={sc.subject_code} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{sc.subject_title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sc.subject_code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium">{sc.credits}</td>
                      <td className="py-2.5 px-3 text-center">
                        {sc.theory_obtained} <span className="text-slate-500">({sc.max_theory})</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {sc.practical_obtained} <span className="text-slate-500">({sc.max_practical})</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-white">
                        {sc.total_obtained} / {sc.max_marks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-indigo-400">
                        {sc.grade_point}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-800 text-slate-200 border border-slate-700">
                          {sc.letter_grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary statistics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Grand Total</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedMarksheet.total_marks_obtained} / {selectedMarksheet.grand_max_marks}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Percentage</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {selectedMarksheet.overall_percentage}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Semester GPA (SGPA)</div>
                <div className="text-base font-bold text-indigo-400 mt-0.5">
                  {selectedMarksheet.sgpa}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Classification</div>
                <div className="text-xs font-bold text-amber-400 mt-1 truncate">
                  {selectedMarksheet.result_status}
                </div>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Immutable Audit Trail History
              </div>
              <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2.5">
                {selectedMarksheet.audit_trail.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {item.performed_by_name} ({item.performed_by_role})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-300 font-mono mt-0.5">Action: {item.action}</div>
                      {item.remarks && (
                        <div className="text-slate-400 text-[11px] italic mt-0.5">"{item.remarks}"</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Workflow Action Confirmation (Approve / Publish / Reject / Verify) */}
      {actionModal.isOpen && actionModal.marksheet && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() => setActionModal({ isOpen: false, marksheet: null, action: 'APPROVE', remarks: '' })}
          title={`Confirm Workflow Action: ${actionModal.action}`}
          subtitle={`For student: ${actionModal.marksheet.student_name} (${actionModal.marksheet.roll_number})`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
              {actionModal.action === 'PUBLISH' && (
                <p>
                  Publishing will immediately make this official marksheet accessible to the student, enable public QR verification, and dispatch an automated email notification.
                </p>
              )}
              {actionModal.action === 'APPROVE' && (
                <p>
                  As Administrator / Principal, confirming will advance this marksheet to <b>ADMIN_APPROVED</b> stage.
                </p>
              )}
              {actionModal.action === 'VERIFY' && (
                <p>
                  Confirming indicates that subject internal marks, practicum portfolios, and attendance prerequisites have been checked.
                </p>
              )}
              {actionModal.action === 'REJECT' && (
                <p className="text-rose-300">
                  Rejecting will send this marksheet back to the faculty member with your feedback remarks for immediate rectification.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Remarks / Audit Notes {actionModal.action === 'REJECT' ? '*' : '(Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionModal.action === 'REJECT'}
                value={actionModal.remarks}
                onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
                placeholder={
                  actionModal.action === 'REJECT'
                    ? 'Enter specific rejection reasons or score discrepancies...'
                    : 'Notes regarding verification or approval...'
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <SoundButton
                variant="outline"
                size="sm"
                onClick={() => setActionModal({ isOpen: false, marksheet: null, action: 'APPROVE', remarks: '' })}
              >
                Cancel
              </SoundButton>
              <SoundButton
                variant={actionModal.action === 'REJECT' ? 'danger' : 'primary'}
                size="sm"
                soundType={actionModal.action === 'PUBLISH' ? 'approve' : 'success'}
                onClick={handleConfirmAction}
              >
                Confirm {actionModal.action}
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
