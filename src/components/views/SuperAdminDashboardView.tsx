import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  ClipboardList,
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
  Edit3,
  Mail,
  Phone,
  School,
  Award,
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
import { Marksheet } from '../../types';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';

interface SuperAdminDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({ onNavigate }) => {
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kakdwip');
  const { playHaptic, playApprove, playSuccess, playPop } = useSound();

  // College Profile & Institutional Settings (Editable by Super Admin)
  const [collegeProfile, setCollegeProfile] = useState(() => {
    const saved = localStorage.getItem('annapurna_college_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return api.getCollegeProfile();
  });

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState(collegeProfile);

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
        const ms = await api.getExamMarksheets('exam-1');
        setMarksheets(ms);
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

  const handleOpenEditProfile = () => {
    playPop();
    setProfileFormData({ ...collegeProfile });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCollegeProfile(profileFormData);
    localStorage.setItem('annapurna_college_profile', JSON.stringify(profileFormData));
    api.updateCollegeProfile(profileFormData);
    playSuccess();
    setIsEditProfileModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Institutional Identity Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <img
              src="/logo.png"
              alt="Annapurna Memorial College of Education Crest"
              className="w-20 h-20 rounded-full border-4 border-white/30 object-contain bg-white p-1 shadow-lg flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  NCTE Recognized • BSAEU Affiliated
                </span>
                <span className="text-xs text-blue-200 font-mono">Code: {collegeProfile.college_code}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                {collegeProfile.name}
              </h1>
              <div className="text-xs text-blue-100 flex flex-wrap items-center gap-2 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {collegeProfile.address}
                </span>
                <span>•</span>
                <span>Principal: {collegeProfile.principal_name}</span>
                <span>•</span>
                <span>AISHE: {collegeProfile.aishe_code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SoundButton
              onClick={handleOpenEditProfile}
              variant="white"
              size="sm"
              soundType="pop"
              icon={<Edit3 className="w-4 h-4 text-blue-600" />}
            >
              Edit College Profile
            </SoundButton>

            <SoundButton
              onClick={() => onNavigate('excel-import')}
              variant="secondary"
              size="sm"
              soundType="haptic"
              icon={<Upload className="w-4 h-4" />}
            >
              Excel Bulk Import
            </SoundButton>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Trainees
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">128</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            100% NCTE Intake Filled
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Faculty & Mentors
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">18</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">1:7 Trainee-Teacher Ratio</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monitored Assignments
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            16 Tasks
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            96.8% Trainee Submission Rate
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Marksheets
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
            Requires Principal Clearance
          </div>
        </div>
      </div>

      {/* Interactive Map & Regional Trainee Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                South 24 Parganas & Sundarban Regional Trainee Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Catchment analysis: Kakdwip, Namkhana, Diamond Harbour, Kulpi & Patharpratima
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Interactive Vector Regional Map Canvas */}
            <div className="md:col-span-2 relative h-64 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <svg className="w-full h-full opacity-30 pointer-events-none" viewBox="0 0 400 240">
                <path
                  d="M 50 20 Q 120 60 160 120 T 260 180 T 380 220"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="4,4"
                />
              </svg>

              {/* Geographic Pins */}
              {districtDistribution.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    playHaptic();
                    setSelectedDistrict(d.name);
                  }}
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-md ${
                    selectedDistrict === d.name
                      ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-500/30 z-10'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{d.name}</span>
                </button>
              ))}
            </div>

            {/* Region Details Pane */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400">
                Active Region Highlight
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {selectedDistrict} Sub-division
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Enrolled Trainees:{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {districtDistribution.find((d) => d.name === selectedDistrict)?.trainees || 0} Students
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Catchment Share:{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {districtDistribution.find((d) => d.name === selectedDistrict)?.percentage || '0%'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                Affiliation Hub: Kashinagar, South 24 Parganas campus
              </div>
            </div>
          </div>
        </div>

        {/* Program Enrollment Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Program Enrollment Quota</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">B.Ed. & D.El.Ed. Teacher Training</p>
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
              <span className="text-xl font-black text-slate-900 dark:text-white">190</span>
              <span className="text-[10px] text-slate-500 font-medium">Total Capacity</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {enrollmentBreakdown.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{e.value} seats</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Marksheet Approval Queue for Principal */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Direct Principal Clearance Desk (Marksheets)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-2.5 px-3">Trainee Name</th>
                <th className="py-2.5 px-3">Roll Number</th>
                <th className="py-2.5 px-3">SGPA</th>
                <th className="py-2.5 px-3">Result Classification</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marksheets.slice(0, 4).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{m.student_name}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{m.roll_number}</td>
                  <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{m.sgpa}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{m.result_status}</td>
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
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
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

      {/* Modal: Edit College Profile & Settings */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Institutional Profile & College Details"
        subtitle="Super Admin Institutional Configuration"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Legal College Name *
            </label>
            <input
              type="text"
              required
              value={profileFormData.name}
              onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campus Address (Kashinagar, South 24 Parganas) *
            </label>
            <input
              type="text"
              required
              value={profileFormData.address}
              onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Code
              </label>
              <input
                type="text"
                value={profileFormData.college_code}
                onChange={(e) => setProfileFormData({ ...profileFormData, college_code: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                AISHE Code
              </label>
              <input
                type="text"
                value={profileFormData.aishe_code}
                onChange={(e) => setProfileFormData({ ...profileFormData, aishe_code: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Principal Full Name
              </label>
              <input
                type="text"
                value={profileFormData.principal_name}
                onChange={(e) => setProfileFormData({ ...profileFormData, principal_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Session
              </label>
              <input
                type="text"
                value={profileFormData.academic_year}
                onChange={(e) => setProfileFormData({ ...profileFormData, academic_year: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Helpline Phone
              </label>
              <input
                type="text"
                value={profileFormData.phone}
                onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={profileFormData.email}
                onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsEditProfileModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Save Institutional Profile
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
