import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  CreditCard,
  FileCheck2,
  MapPin,
  TrendingUp,
  Download,
  Upload,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../../services/api';
import { Marksheet, FeeOverview } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { useSound } from '../../context/SoundContext';

interface SuperAdminDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({ onNavigate }) => {
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [feeOverview, setFeeOverview] = useState<FeeOverview | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kakdwip');
  const { playHaptic, playApprove, playSuccess } = useSound();

  // Regional Trainee Distribution in South 24 Parganas / Sundarban
  const districtDistribution = [
    { name: 'Kakdwip', trainees: 48, percentage: '37.5%', x: 42, y: 55 },
    { name: 'Namkhana', trainees: 32, percentage: '25.0%', x: 55, y: 70 },
    { name: 'Diamond Harbour', trainees: 24, percentage: '18.7%', x: 30, y: 35 },
    { name: 'Kulpi', trainees: 14, percentage: '11.0%', x: 38, y: 45 },
    { name: 'Patharpratima', trainees: 10, percentage: '7.8%', x: 65, y: 62 },
  ];

  // Program Enrollment Breakdown
  const enrollmentBreakdown = [
    { name: 'B.Ed. (2-Year)', value: 100, color: '#2563eb' },
    { name: 'D.El.Ed. (2-Year)', value: 50, color: '#10b981' },
    { name: 'B.A. Education', value: 40, color: '#8b5cf6' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [ms, fees] = await Promise.all([
          api.getExamMarksheets('exam-1'),
          api.getFeeOverview(),
        ]);
        setMarksheets(ms);
        setFeeOverview(fees);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const pendingApprovals = marksheets.filter(
    (m) => m.status === 'DEPARTMENT_VERIFIED' || m.status === 'SUBMITTED_BY_FACULTY'
  );

  const handleQuickApprove = async (id: string) => {
    try {
      await api.executeMarksheetAction(id, 'APPROVE', 'Cleared by Principal Executive desk.');
      playApprove();
      const updated = await api.getExamMarksheets('exam-1');
      setMarksheets(updated);
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Super Admin Executive Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Executive Console
            </span>
            <span className="text-xs text-slate-500 font-medium">BSAEU & NCTE Authority Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Super Admin & Principal Institutional Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <SoundButton
            onClick={() => onNavigate('excel-import')}
            variant="white"
            size="sm"
            soundType="haptic"
            icon={<Upload className="w-4 h-4 text-blue-600" />}
          >
            Excel Bulk Import
          </SoundButton>

          <SoundButton
            onClick={() => onNavigate('examinations')}
            variant="primary"
            size="sm"
            soundType="approve"
            icon={<FileCheck2 className="w-4 h-4" />}
          >
            Review Marksheets ({pendingApprovals.length})
          </SoundButton>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Enrolled Trainees
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">128</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            100% NCTE Intake Filled
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty & Academic Staff
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">18</div>
          <div className="text-[11px] text-slate-500 mt-1">1:7 Teacher-Trainee Ratio</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            ₹{feeOverview ? feeOverview.total_collected.toLocaleString() : '1,40,000'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {feeOverview ? feeOverview.collection_rate : 66.7}% Reconciled
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Marksheets
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Requires Principal Clearance
          </div>
        </div>
      </div>

      {/* Interactive Map & Regional Trainee Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                South 24 Parganas & Sundarban Regional Trainee Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive geographic distribution across catchment regions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Interactive Vector Regional Map Canvas */}
            <div className="md:col-span-2 relative h-64 bg-slate-50 rounded-2xl border border-slate-200/80 p-4 overflow-hidden flex items-center justify-center">
              {/* Subtle coastal grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

              {/* Stylized Sundarban River Delta SVG Path */}
              <svg className="w-full h-full opacity-30 pointer-events-none" viewBox="0 0 400 240">
                <path
                  d="M 50 20 Q 120 60 160 120 T 260 180 T 380 220"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 160 120 Q 200 150 220 230"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>

              {/* District interactive pins */}
              {districtDistribution.map((d) => {
                const isSelected = selectedDistrict === d.name;
                return (
                  <button
                    key={d.name}
                    onClick={() => {
                      playHaptic();
                      setSelectedDistrict(d.name);
                    }}
                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all"
                  >
                    <div
                      className={`relative flex items-center justify-center p-2 rounded-full shadow-lg transition-transform ${
                        isSelected
                          ? 'bg-blue-600 text-white scale-125 ring-4 ring-blue-200 z-20'
                          : 'bg-white text-blue-600 hover:scale-110 border border-blue-200 z-10'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {/* Animated radar wave around active marker */}
                      {isSelected && (
                        <span className="absolute -inset-1 rounded-full bg-blue-500 animate-ping opacity-40 pointer-events-none" />
                      )}
                    </div>
                    <div
                      className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-xs ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-white/90 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {d.name} ({d.trainees})
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected District Details Card */}
            <div className="space-y-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                District Profile
              </div>
              <div className="text-lg font-black text-slate-900">{selectedDistrict}</div>
              <div className="text-xs text-slate-600">
                Trainees from this sector constitute{' '}
                <b className="text-blue-700">
                  {districtDistribution.find((d) => d.name === selectedDistrict)?.percentage}
                </b>{' '}
                of the current B.Ed. cohort.
              </div>
              <div className="pt-2 border-t border-blue-200 text-xs flex justify-between font-bold">
                <span className="text-slate-600">Registered:</span>
                <span className="text-blue-700">
                  {districtDistribution.find((d) => d.name === selectedDistrict)?.trainees} Students
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Distribution Donut */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Program Enrollment Ratio</h3>
            <p className="text-[10px] text-slate-500">B.Ed. & D.El.Ed. Teacher Training</p>
          </div>

          <div className="w-full h-44 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentBreakdown}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {enrollmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-900">190</span>
              <span className="text-[10px] text-slate-500 font-medium">Total Capacity</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {enrollmentBreakdown.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.name}
                </span>
                <span className="font-bold text-slate-900">{e.value} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Marksheet Approval Queue for Principal */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              Direct Principal Clearance Desk (Marksheets)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapid authorization of verified statement of marks awaiting Super Admin publication
            </p>
          </div>
          <SoundButton
            onClick={() => onNavigate('examinations')}
            size="sm"
            variant="outline"
          >
            Open Full Pipeline
          </SoundButton>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Trainee Name</th>
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">SGPA</th>
                <th className="py-2.5 px-3">Result Classification</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marksheets.slice(0, 4).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{m.student_name}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{m.roll_number}</td>
                  <td className="py-3 px-3 font-extrabold text-blue-600 text-sm">{m.sgpa}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{m.result_status}</td>
                  <td className="py-3 px-3">
                    <Badge status={m.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    {m.status !== 'PUBLISHED' ? (
                      <SoundButton
                        onClick={() => handleQuickApprove(m.id)}
                        size="sm"
                        variant="primary"
                        soundType="approve"
                      >
                        Approve & Clear
                      </SoundButton>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Certified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
