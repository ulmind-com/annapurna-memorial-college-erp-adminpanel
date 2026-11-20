import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  FileText,
  AlertCircle,
  Search,
  Check,
  X,
  User,
  GraduationCap,
} from 'lucide-react';
import { LeaveApplication, Student } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import { formatIST } from '../../utils/date';

export const LeaveManagementView: React.FC = () => {
  const { activeRole, user } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isTeacher = activeRole === 'TEACHER';

  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Student apply leave modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'MEDICAL' | 'PERSONAL' | 'ACADEMIC' | 'EMERGENCY'>('MEDICAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Review modal for Faculty / Super Admin
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    leave: LeaveApplication | null;
    action: 'APPROVED' | 'REJECTED';
    remarks: string;
  }>({
    isOpen: false,
    leave: null,
    action: 'APPROVED',
    remarks: '',
  });

  const { playSuccess, playAlert, playPop } = useSound();

  const loadLeaves = async () => {
    try {
      const [data, sRes] = await Promise.all([
        api.getLeaveApplications(),
        api.getStudents(),
      ]);
      setLeaves(data);
      if (user?.email) {
        const found = sRes.items.find(
          (s) => s.email?.toLowerCase() === user.email?.toLowerCase() || s.id === user.id
        );
        if (found) setMatchedStudent(found);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleOpenApply = () => {
    playPop();
    setLeaveType('MEDICAL');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setReason('');
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state a valid reason for the leave application.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    try {
      await api.applyForLeave({
        student_id: matchedStudent?.id || user?.id || 'st-1',
        student_name: matchedStudent?.full_name || user?.full_name || 'Enrolled Student',
        roll_number: matchedStudent?.roll_number || 'AMC-TR-2024',
        course_code: matchedStudent?.course_code || 'BED',
        semester: matchedStudent?.semester || 1,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        reason,
      });

      playSuccess();
      setIsApplyModalOpen(false);
      loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Leave submission failed');
    }
  };

  const handleOpenReview = (leave: LeaveApplication, action: 'APPROVED' | 'REJECTED') => {
    if (action === 'REJECTED') playAlert();
    else playPop();

    setReviewModal({
      isOpen: true,
      leave,
      action,
      remarks: action === 'APPROVED' ? 'Approved by Department Academic Authority.' : '',
    });
  };

  const handleReviewConfirm = async () => {
    if (!reviewModal.leave) return;

    if (reviewModal.action === 'REJECTED' && !reviewModal.remarks.trim()) {
      alert('Rejection remarks are mandatory.');
      return;
    }

    try {
      await api.reviewLeaveApplication(
        reviewModal.leave.id,
        reviewModal.action,
        reviewModal.remarks,
        user?.full_name || 'Academic Authority'
      );
      playSuccess();
      setReviewModal({ isOpen: false, leave: null, action: 'APPROVED', remarks: '' });
      loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Failed to review leave application');
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (isStudent) {
      const myRoll = matchedStudent?.roll_number || user?.roll_number;
      const isMyLeave = (myRoll && l.roll_number === myRoll) || l.student_id === user?.id || l.student_name === user?.full_name || l.roll_number === 'AMC-BED-2024-001';
      if (!isMyLeave) return false;
    }

    const matchesSearch =
      l.student_name.toLowerCase().includes(search.toLowerCase()) ||
      l.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    return l.status === activeFilter;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header Desk */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Academic Attendance Registry
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">B.Ed. & D.El.Ed. Regulation</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Leave Application & Absence Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isStudent
              ? 'Submit formal leave applications and track clearance status from college mentors'
              : 'Review trainee leave applications and sanction medical / academic leaves'}
          </p>
        </div>

        {isStudent && (
          <SoundButton
            onClick={handleOpenApply}
            variant="primary"
            size="md"
            soundType="pop"
            icon={<Plus className="w-4 h-4" />}
          >
            Apply for Leave
          </SoundButton>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                playPop();
                setActiveFilter(f);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'ALL' ? 'All Applications' : f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search trainee name, roll, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Leaves Ledger */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-4">Trainee</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leave applications found matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{l.student_name}</div>
                      <div className="text-[10px] text-slate-400">{l.course_code} - Sem {l.semester}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{l.roll_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {l.leave_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {l.start_date} to {l.end_date}
                      </div>
                      <div className="text-[10px] text-slate-400">{l.total_days} Day(s) Total</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 dark:text-slate-300 truncate" title={l.reason}>
                        {l.reason}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : l.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {(isTeacher || isSuperAdmin) && l.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(l, 'APPROVED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 text-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReview(l, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 text-xs transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          {l.remarks ? (
                            <span title={l.remarks} className="italic text-slate-600 dark:text-slate-300">
                              {l.remarks}
                            </span>
                          ) : (
                            formatIST(l.applied_at)
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply for Leave (Student) */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Online Leave Application"
        subtitle="Annapurna Memorial College of Education, Kashinagar"
        maxWidth="lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Classification *</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="MEDICAL">Medical Leave (Doctor Certificate)</option>
                <option value="PERSONAL">Personal / Family Obligation</option>
                <option value="ACADEMIC">Academic / Workshop / Pedagogy Seminar</option>
                <option value="EMERGENCY">Emergency Family Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Trainee Name</label>
              <input
                type="text"
                disabled
                value={matchedStudent?.full_name || user?.full_name || 'Enrolled Student'}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Reason for Absence *
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the circumstances necessitating absence from academic instruction..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsApplyModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Submit Leave Application
            </SoundButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Review Leave Application (Faculty / Admin) */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, leave: null, action: 'APPROVED', remarks: '' })}
        title={`${reviewModal.action === 'APPROVED' ? 'Approve' : 'Reject'} Leave Application`}
        subtitle={`Trainee: ${reviewModal.leave?.student_name} (${reviewModal.leave?.roll_number})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div><b>Dates:</b> {reviewModal.leave?.start_date} to {reviewModal.leave?.end_date} ({reviewModal.leave?.total_days} Days)</div>
            <div><b>Reason:</b> {reviewModal.leave?.reason}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Remarks {reviewModal.action === 'REJECTED' && '*'}
            </label>
            <textarea
              rows={3}
              value={reviewModal.remarks}
              onChange={(e) => setReviewModal({ ...reviewModal, remarks: e.target.value })}
              placeholder="Add departmental instructions or conditions..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton
              type="button"
              onClick={() => setReviewModal({ isOpen: false, leave: null, action: 'APPROVED', remarks: '' })}
              variant="secondary"
              size="sm"
            >
              Cancel
            </SoundButton>
            <SoundButton
              type="button"
              onClick={handleReviewConfirm}
              variant={reviewModal.action === 'APPROVED' ? 'primary' : 'danger'}
              size="sm"
              soundType="success"
            >
              Confirm {reviewModal.action}
            </SoundButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
