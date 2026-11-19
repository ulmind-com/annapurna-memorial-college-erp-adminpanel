import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  FileCheck2,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { api } from '../../services/api';
import { Marksheet, FeeOverview, Notice } from '../../types';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [feeOverview, setFeeOverview] = useState<FeeOverview | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [studentCount, setStudentCount] = useState<number>(6);
  const [facultyCount, setFacultyCount] = useState<number>(4);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [msData, feeData, noticesData, stData, facData] = await Promise.all([
          api.getExamMarksheets('exam-1'),
          api.getFeeOverview(),
          api.getNotices(),
          api.getStudents(),
          api.getFaculty(),
        ]);
        setMarksheets(msData);
        setFeeOverview(feeData);
        setNotices(noticesData.slice(0, 3));
        setStudentCount(stData.total);
        setFacultyCount(facData.total);
      } catch (e) {
        console.error('Error loading dashboard:', e);
      }
    };
    loadDashboardData();
  }, []);

  const pendingApprovals = marksheets.filter(
    (m) => m.status === 'SUBMITTED_BY_FACULTY' || m.status === 'DEPARTMENT_VERIFIED'
  ).length;

  const publishedCount = marksheets.filter((m) => m.status === 'PUBLISHED').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* College Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Session 2024-2026 Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Annapurna Memorial College ERP
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Annapurna Memorial College of Education, Kashinagar Administrative System. Oversee admissions, curriculum,
              biometric attendance compliance, and multi-stage marksheet approval workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SoundButton
              onClick={() => onNavigate('examinations')}
              variant="primary"
              soundType="approve"
              icon={<FileCheck2 className="w-4 h-4" />}
            >
              Approval Pipeline ({pendingApprovals})
            </SoundButton>
            <SoundButton
              onClick={() => onNavigate('attendance')}
              variant="secondary"
              soundType="tab"
            >
              Take Attendance
            </SoundButton>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Enrolled Trainees"
          value={studentCount}
          subtitle="B.Ed. & D.El.Ed. Batch"
          change="+12% YoY"
          isPositive={true}
          icon={<GraduationCap className="w-5 h-5" />}
          colorScheme="indigo"
        />
        <StatCard
          title="Teaching Faculty"
          value={facultyCount}
          subtitle="Professors & Lecturers"
          change="100% Active"
          isPositive={true}
          icon={<Users className="w-5 h-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          subtitle={`${publishedCount} published marksheets`}
          change="Action Required"
          isPositive={pendingApprovals === 0}
          icon={<Clock className="w-5 h-5" />}
          colorScheme="amber"
        />
        <StatCard
          title="Fee Collection Rate"
          value={`${feeOverview ? feeOverview.collection_rate : 66.7}%`}
          subtitle={`₹${feeOverview ? feeOverview.total_collected.toLocaleString() : '1,40,000'} Collected`}
          change="+5.4% this term"
          isPositive={true}
          icon={<CreditCard className="w-5 h-5" />}
          colorScheme="emerald"
        />
      </div>

      {/* Flagship Marksheet Approval Pipeline Tracker */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              BSAEU Semester Marksheet Approval Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-stage review lifecycle enforcing faculty entry, department verification, principal approval, and publication
            </p>
          </div>
          <SoundButton
            onClick={() => onNavigate('examinations')}
            size="sm"
            variant="outline"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Workflow Center
          </SoundButton>
        </div>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-6">
          {[
            { stage: 'DRAFT', label: '1. Draft Entry', count: marksheets.filter((m) => m.status === 'DRAFT').length, color: 'text-slate-400 bg-slate-800/50' },
            { stage: 'SUBMITTED', label: '2. Faculty Submitted', count: marksheets.filter((m) => m.status === 'SUBMITTED_BY_FACULTY').length, color: 'text-indigo-400 bg-indigo-500/10' },
            { stage: 'VERIFIED', label: '3. Dept. Verified', count: marksheets.filter((m) => m.status === 'DEPARTMENT_VERIFIED').length, color: 'text-purple-400 bg-purple-500/10' },
            { stage: 'APPROVED', label: '4. Admin Approved', count: marksheets.filter((m) => m.status === 'ADMIN_APPROVED').length, color: 'text-blue-400 bg-blue-500/10' },
            { stage: 'PUBLISHED', label: '5. Published', count: marksheets.filter((m) => m.status === 'PUBLISHED').length, color: 'text-emerald-400 bg-emerald-500/10' },
          ].map((s) => (
            <div key={s.stage} className={`p-4 rounded-xl border border-slate-800 ${s.color}`}>
              <div className="text-xs font-semibold">{s.label}</div>
              <div className="text-2xl font-extrabold mt-2 text-white">{s.count}</div>
              <div className="text-[10px] opacity-75 mt-0.5">Marksheets</div>
            </div>
          ))}
        </div>

        {/* Recent Pipeline Activity Table Preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">SGPA</th>
                <th className="py-2.5 px-3">Result Status</th>
                <th className="py-2.5 px-3">Pipeline Stage</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {marksheets.slice(0, 4).map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{m.student_name}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{m.roll_number}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-indigo-400">{m.sgpa}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-300 font-medium">{m.result_status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={m.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <SoundButton
                      onClick={() => onNavigate('examinations')}
                      size="sm"
                      variant="ghost"
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Inspect
                    </SoundButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Urgent Notices & Financial Ledger Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institutional Notices */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Latest Circulars & NCTE Updates
              </h3>
              <SoundButton
                onClick={() => onNavigate('notices')}
                size="sm"
                variant="ghost"
                className="text-xs text-indigo-400"
              >
                View All
              </SoundButton>
            </div>

            <div className="space-y-3 mt-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white line-clamp-1">{n.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        n.priority === 'URGENT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.content}</p>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>By {n.published_by_name}</span>
                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fees Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Semester Fee Collection Health
              </h3>
              <SoundButton
                onClick={() => onNavigate('fees')}
                size="sm"
                variant="ghost"
                className="text-xs text-indigo-400"
              >
                Manage Fees
              </SoundButton>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Total Billed This Term</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    ₹{feeOverview ? feeOverview.total_billed.toLocaleString() : '2,10,000'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Collected</div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    ₹{feeOverview ? feeOverview.total_collected.toLocaleString() : '1,40,000'}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Collection Completion</span>
                  <span className="text-emerald-400">
                    {feeOverview ? feeOverview.collection_rate : 66.7}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${feeOverview ? feeOverview.collection_rate : 66.7}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-emerald-400 font-bold text-sm">
                    {feeOverview ? feeOverview.paid_invoices : 3}
                  </div>
                  <div className="text-[10px] text-slate-400">Paid Invoices</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-amber-400 font-bold text-sm">
                    {feeOverview ? feeOverview.partial_invoices : 2}
                  </div>
                  <div className="text-[10px] text-slate-400">Partial Invoices</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="text-rose-400 font-bold text-sm">
                    {feeOverview ? feeOverview.unpaid_invoices : 1}
                  </div>
                  <div className="text-[10px] text-slate-400">Unpaid Invoices</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
