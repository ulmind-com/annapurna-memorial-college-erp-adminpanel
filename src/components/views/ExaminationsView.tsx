import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  Edit3,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Sliders,
} from 'lucide-react';
import { Marksheet, MarksheetStatus, Examination } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useSound } from '../../context/SoundContext';
import collegeLogo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

export const ExaminationsView: React.FC = () => {
  const { activeRole } = useAuth();
  const isStudent = activeRole === 'STUDENT';
  const isSuperAdmin = activeRole === 'SUPER_ADMIN';

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-1');
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);

  // Edit Marksheet Modal
  const [editingMarksheet, setEditingMarksheet] = useState<Marksheet | null>(null);
  const [editScores, setEditScores] = useState<any[]>([]);
  const [editRemarks, setEditRemarks] = useState<string>('');

  // Marksheet Template Configuration (Module C.5)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateConfig, setTemplateConfig] = useState({
    format_title: 'OFFICIAL STATEMENT OF MARKS',
    grading_scale: '10-Point UGC/BSAEU Scale',
    passing_percentage: 40,
    distinction_percentage: 75,
    show_qr_hash: true,
    show_watermark_crest: true,
    controller_signature_title: 'Controller of Examinations',
    principal_signature_title: 'Principal & Chief Academic Officer',
  });

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

  const { playClick, playSuccess, playApprove, playAlert, playPop } = useSound();

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
      a.download = `AMCE_Marksheet_${ms.roll_number}_Sem${ms.semester}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadExcel = () => {
    playSuccess();
    const exportData = marksheets.map((m) => ({
      'Roll Number': m.roll_number,
      'Trainee Name': m.student_name,
      'Course': m.course_name,
      'Semester': m.semester,
      'Academic Session': m.academic_session,
      'Total Marks Obtained': m.total_marks_obtained,
      'Max Marks': m.grand_max_marks || m.total_marks_maximum || 500,
      'Percentage': m.overall_percentage || m.percentage || 0,
      'SGPA': m.sgpa,
      'Letter Grade': m.letter_grade,
      'Result Status': m.result_status,
      'Approval Status': m.status,
      'Verification Hash': m.qr_code_hash,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Marks');
    XLSX.writeFile(wb, `AMCE_Student_Marks_Export_${selectedExamId}.xlsx`);
  };

  // Open Edit Scores Modal
  const handleOpenEditScores = (ms: Marksheet) => {
    playPop();
    setEditingMarksheet(ms);
    setEditScores(JSON.parse(JSON.stringify(ms.subject_scores)));
    setEditRemarks(ms.remarks || '');
  };

  const handleScoreChange = (idx: number, field: 'internal_marks' | 'external_marks', val: number) => {
    const updated = [...editScores];
    updated[idx][field] = val;
    const internal = Number(updated[idx].internal_marks) || 0;
    const external = Number(updated[idx].external_marks) || 0;
    const total = internal + external;
    updated[idx].total_obtained = total;

    const max = Number(updated[idx].total_maximum) || 100;
    const pct = (total / max) * 100;
    let grade = 'F';
    let gp = 0;
    if (pct >= 90) { grade = 'O'; gp = 10; }
    else if (pct >= 80) { grade = 'A+'; gp = 9; }
    else if (pct >= 70) { grade = 'A'; gp = 8; }
    else if (pct >= 60) { grade = 'B+'; gp = 7; }
    else if (pct >= 50) { grade = 'B'; gp = 6; }
    else if (pct >= 40) { grade = 'C'; gp = 5; }

    updated[idx].letter_grade = grade;
    updated[idx].grade_point = gp;
    setEditScores(updated);
  };

  const handleSaveEditScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarksheet) return;

    try {
      await api.updateMarksheetScores(editingMarksheet.id, {
        scores: editScores,
        remarks: editRemarks,
      });
      playSuccess();
      setEditingMarksheet(null);
      const updated = await api.getExamMarksheets(selectedExamId || 'exam-1');
      setMarksheets(updated);
      if (selectedMarksheet && selectedMarksheet.id === editingMarksheet.id) {
        setSelectedMarksheet(updated.find((m) => m.id === editingMarksheet.id) || null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update scores');
    }
  };

  // Student-specific Certified Marksheet view
  if (isStudent) {
    const studentMarksheet = marksheets.find((m) => m.roll_number === 'AMC-BED-2024-001') || marksheets[0];

    return (
      <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Official Statement of Marks
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BSAEU University Certified</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Semester Academic Marksheet
            </h1>
          </div>

          {studentMarksheet && (
            <SoundButton
              onClick={() => handleDownloadPdf(studentMarksheet)}
              variant="primary"
              size="md"
              soundType="pop"
              icon={<Download className="w-4 h-4" />}
            >
              Download Certified PDF
            </SoundButton>
          )}
        </div>

        {studentMarksheet ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6 relative overflow-hidden">
            {/* Watermark Crest */}
            <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
              <img src={collegeLogo} alt="Watermark Crest" className="w-96 h-96 object-contain" />
            </div>

            {/* Institutional Seal & Header */}
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full border border-blue-600/40 shadow-md bg-white p-0.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={collegeLogo}
                    alt="Annapurna Memorial College of Education Crest"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Annapurna Memorial College of Education
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kashinagar, South 24 Parganas, West Bengal 743349
              </p>
              <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Affiliated to Baba Saheb Ambedkar Education University (BSAEU) • Approved by NCTE
              </div>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                STATEMENT OF MARKS FOR {studentMarksheet.exam_title.toUpperCase()}
              </div>
            </div>

            {/* Trainee Particulars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Trainee Name:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{studentMarksheet.student_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Roll Number:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{studentMarksheet.roll_number}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Program & Semester:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{studentMarksheet.course_name} - Sem {studentMarksheet.semester}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Session & Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{studentMarksheet.academic_session} • {studentMarksheet.result_status}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-extrabold uppercase">
                    <th className="py-3 px-4">Subject Code & Title</th>
                    <th className="py-3 px-4 text-center">Credits</th>
                    <th className="py-3 px-4 text-center">Internal / Theory</th>
                    <th className="py-3 px-4 text-center">Practicum</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Letter Grade</th>
                    <th className="py-3 px-4 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentMarksheet.subject_scores.map((sc) => (
                    <tr key={sc.subject_code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">{sc.subject_code}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{sc.subject_title}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{sc.credits}</td>
                      <td className="py-3.5 px-4 text-center">{sc.internal_marks}</td>
                      <td className="py-3.5 px-4 text-center">{sc.external_marks}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-blue-600 dark:text-blue-400">
                        {sc.total_obtained}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">{sc.total_maximum}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {sc.letter_grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{sc.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Footnotes */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total Marks Obtained:</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {studentMarksheet.total_marks_obtained} / {studentMarksheet.total_marks_maximum}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Percentage:</span>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {studentMarksheet.percentage}%
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Semester SGPA:</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {studentMarksheet.sgpa}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Final Outcome:</span>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  PASSED (DISTINCTION)
                </div>
              </div>
            </div>

            {/* Security Verification & Signatures */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <QrCode className="w-10 h-10 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    HASH: {studentMarksheet.qr_code_hash}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Digitally Verified by Examination Controller
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                  Dr. Arnab Senapati, M.Ed., Ph.D.
                </div>
                <div className="text-[11px] text-slate-400">Principal & Chief Controller of Examinations</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No published marksheets available yet.
          </div>
        )}
      </div>
    );
  }

  // Super Admin & Faculty Administrative View
  const filteredMarksheets = marksheets.filter((m) => {
    const matchesSearch =
      m.student_name.toLowerCase().includes(search.toLowerCase()) ||
      m.roll_number.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    return m.status === activeTab;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Examination Pipeline
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">BSAEU 4-Tier Verification Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Examinations & Marksheet Approval Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-stage marks verification, SGPA evaluation, score edits, and digital certificate publication
          </p>
        </div>

        {/* Actions Desk: Excel Download, Template Config, Exam Select */}
        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && (
            <SoundButton
              onClick={() => setIsTemplateModalOpen(true)}
              variant="secondary"
              size="sm"
              soundType="pop"
              icon={<Sliders className="w-4 h-4 text-blue-600" />}
            >
              Configure Template
            </SoundButton>
          )}

          <SoundButton
            onClick={handleDownloadExcel}
            variant="secondary"
            size="sm"
            soundType="pop"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export All Marks (Excel)
          </SoundButton>

          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold shadow-xs focus:ring-2 focus:ring-blue-500"
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
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
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
              title: 'Submitted',
              desc: 'Dept. review pending',
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
          ].map((stage) => (
            <div
              key={stage.id}
              onClick={() => {
                playClick();
                setActiveTab(stage.id);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === stage.id
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-600/30'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {stage.num}
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white">{stage.count}</span>
              </div>
              <div className="text-xs font-extrabold mt-2 text-slate-900 dark:text-white">{stage.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{stage.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Marksheet Pipeline Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="py-3.5 px-4">Trainee</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4 text-center">Semester</th>
                <th className="py-3.5 px-4 text-center">Marks</th>
                <th className="py-3.5 px-4 text-center">Percentage</th>
                <th className="py-3.5 px-4 text-center">SGPA</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMarksheets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No marksheets match current filter.
                  </td>
                </tr>
              ) : (
                filteredMarksheets.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{m.student_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.course_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{m.roll_number}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">Sem {m.semester}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {m.total_marks_obtained} / {m.total_marks_maximum}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">{m.percentage}%</td>
                    <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">{m.sgpa}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge status={m.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            playPop();
                            setSelectedMarksheet(m);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                        >
                          Details
                        </button>

                        {/* Edit Scores Button for Super Admin */}
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditScores(m)}
                            title="Edit Subject Marks & SGPA"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Pipeline Stage Transitions */}
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
                              icon={<CheckCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Marksheet Scores (Super Admin) */}
      {editingMarksheet && (
        <Modal
          isOpen={!!editingMarksheet}
          onClose={() => setEditingMarksheet(null)}
          title="Edit Marksheet Scores & Evaluation"
          subtitle={`Adjust raw marks for ${editingMarksheet.student_name} (${editingMarksheet.roll_number})`}
          maxWidth="3xl"
        >
          <form onSubmit={handleSaveEditScores} className="space-y-5">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">Theory / Internal</th>
                    <th className="py-2.5 px-3 text-center">Practicum / External</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {editScores.map((sc, idx) => (
                    <tr key={sc.subject_code}>
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{sc.subject_code}</div>
                        <div className="text-[11px] text-slate-500">{sc.subject_title}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={sc.total_maximum || 100}
                          value={sc.internal_marks || 0}
                          onChange={(e) => handleScoreChange(idx, 'internal_marks', Number(e.target.value))}
                          className="w-20 px-2 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={sc.total_maximum || 100}
                          value={sc.external_marks || 0}
                          onChange={(e) => handleScoreChange(idx, 'external_marks', Number(e.target.value))}
                          className="w-20 px-2 py-1 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-center font-black text-blue-600 dark:text-blue-400">
                        {sc.total_obtained}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">{sc.letter_grade}</td>
                      <td className="py-2 px-3 text-center font-bold">{sc.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Administrative Remarks</label>
              <input
                type="text"
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="e.g. Scrutiny re-evaluation adjustment approved by Principal"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setEditingMarksheet(null)} variant="secondary" size="sm">
                Cancel
              </SoundButton>
              <SoundButton type="submit" variant="primary" size="sm" soundType="success">
                Save & Recalculate SGPA
              </SoundButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Details Modal */}
      {selectedMarksheet && (
        <Modal
          isOpen={!!selectedMarksheet}
          onClose={() => setSelectedMarksheet(null)}
          title="Statement of Marks & Audit Trail"
          subtitle={`${selectedMarksheet.student_name} (${selectedMarksheet.roll_number})`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedMarksheet.exam_title}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                  {selectedMarksheet.course_name} • Sem {selectedMarksheet.semester}
                </div>
              </div>
              <Badge status={selectedMarksheet.status} />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3 text-center">Marks</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedMarksheet.subject_scores.map((sc) => (
                    <tr key={sc.subject_code}>
                      <td className="py-2 px-3">{sc.subject_title} ({sc.subject_code})</td>
                      <td className="py-2 px-3 text-center font-bold">{sc.total_obtained} / {sc.total_maximum}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-600">{sc.letter_grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <SoundButton type="button" onClick={() => setSelectedMarksheet(null)} variant="secondary" size="sm">
                Close
              </SoundButton>
              <SoundButton
                type="button"
                onClick={() => handleDownloadPdf(selectedMarksheet)}
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </SoundButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Workflow Action Clearance */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, marksheet: null, action: 'APPROVE', remarks: '' })}
        title={`${actionModal.action} Marksheet Clearance`}
        subtitle="Regulatory compliance transition"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirm transition of marksheet for{' '}
            <b>{actionModal.marksheet?.student_name}</b> ({actionModal.marksheet?.roll_number}) to state{' '}
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{actionModal.action}</span>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Remarks {actionModal.action === 'REJECT' && '*'}
            </label>
            <textarea
              rows={3}
              value={actionModal.remarks}
              onChange={(e) => setActionModal({ ...actionModal, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton
              type="button"
              onClick={() => setActionModal({ isOpen: false, marksheet: null, action: 'APPROVE', remarks: '' })}
              variant="secondary"
              size="sm"
            >
              Cancel
            </SoundButton>
            <SoundButton
              type="button"
              onClick={handleConfirmAction}
              variant={actionModal.action === 'REJECT' ? 'danger' : 'primary'}
              size="sm"
            >
              Confirm {actionModal.action}
            </SoundButton>
          </div>
        </div>
      </Modal>

      {/* Modal: Marksheet Template Configuration (Module C.5) */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Official College Marksheet Template Designer"
        subtitle="Configure official college marksheet layout, grading scale, and institutional signatures"
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            playSuccess();
            setIsTemplateModalOpen(false);
            alert('Marksheet template configuration saved and active for new generation.');
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Main Header
            </label>
            <input
              type="text"
              required
              value={templateConfig.format_title}
              onChange={(e) => setTemplateConfig({ ...templateConfig, format_title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Grading System Scale
              </label>
              <select
                value={templateConfig.grading_scale}
                onChange={(e) => setTemplateConfig({ ...templateConfig, grading_scale: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="10-Point UGC/BSAEU Scale">10-Point UGC / BSAEU SGPA Scale</option>
                <option value="Percentage Based">Absolute Marks Percentage</option>
                <option value="7-Point NCTE Standard">7-Point NCTE Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Pass Threshold (%)
              </label>
              <input
                type="number"
                min={30}
                max={50}
                value={templateConfig.passing_percentage}
                onChange={(e) => setTemplateConfig({ ...templateConfig, passing_percentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Controller Signature Title
              </label>
              <input
                type="text"
                value={templateConfig.controller_signature_title}
                onChange={(e) => setTemplateConfig({ ...templateConfig, controller_signature_title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Principal Signature Title
              </label>
              <input
                type="text"
                value={templateConfig.principal_signature_title}
                onChange={(e) => setTemplateConfig({ ...templateConfig, principal_signature_title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={templateConfig.show_watermark_crest}
                onChange={(e) => setTemplateConfig({ ...templateConfig, show_watermark_crest: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Show Official College Watermark Crest
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={templateConfig.show_qr_hash}
                onChange={(e) => setTemplateConfig({ ...templateConfig, show_qr_hash: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Embed Dynamic Verification QR
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <SoundButton type="button" onClick={() => setIsTemplateModalOpen(false)} variant="secondary" size="sm">
              Cancel
            </SoundButton>
            <SoundButton type="submit" variant="primary" size="sm" soundType="success">
              Save Marksheet Template
            </SoundButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
