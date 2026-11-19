import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Sparkles,
} from 'lucide-react';
import { ExcelImporter, ExcelImportResult } from '../../utils/excelImporter';
import { Student } from '../../types';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

interface ExcelImportViewProps {
  onNavigate: (view: string) => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult<Partial<Student>> | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { playSuccess, playHaptic, playAlert } = useSound();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setIsSuccess(false);
    playHaptic();

    try {
      const result = await ExcelImporter.parseStudentFile(selectedFile);
      setImportResult(result);
      if (result.success) {
        playSuccess();
      } else {
        playAlert();
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        importedCount: 0,
        data: [],
        errors: [err.message || 'Error processing spreadsheet'],
      });
      playAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult || importResult.data.length === 0) return;

    setLoading(true);
    try {
      // Sequentially insert into api layer
      for (const st of importResult.data) {
        await api.createStudent(st);
      }

      playSuccess();
      setIsSuccess(true);
      alert(`Success: ${importResult.data.length} trainees successfully imported and enrolled!`);
    } catch (e: any) {
      alert(e.message || 'Import submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
              Automated Spreadsheet Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Excel & CSV Bulk Data Importer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk-enroll B.Ed. & D.El.Ed. teacher trainees, validate column schema, and import directly without errors
          </p>
        </div>

        <SoundButton
          onClick={() => ExcelImporter.downloadSampleStudentTemplate()}
          variant="outline"
          size="sm"
          soundType="haptic"
          icon={<Download className="w-4 h-4 text-emerald-600" />}
        >
          Download Excel Template (.xlsx)
        </SoundButton>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-blue-200 hover:border-blue-500 transition-colors shadow-xs text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-50 text-blue-600">
          <FileSpreadsheet className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Upload Trainee Spreadsheet (.xlsx, .xls, .csv)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Drag & drop your Excel file here or click below to browse. Automatic header matching resolves
            Roll Numbers, Trainee Names, Email, Phone, Course, and Category without manual mapping.
          </p>
        </div>

        <div>
          <label className="inline-flex">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95">
              <Upload className="w-4 h-4" />
              {file ? file.name : 'Choose Excel File'}
            </span>
          </label>
        </div>
      </div>

      {/* Import Preview Results */}
      {importResult && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Spreadsheet Validation: {importResult.importedCount} Trainees Detected
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data format verified. Ready for automatic database enrollment.
                </p>
              </div>
            </div>

            {importResult.success && !isSuccess && (
              <SoundButton
                onClick={handleConfirmImport}
                disabled={loading}
                variant="success"
                size="sm"
                soundType="approve"
                icon={<Sparkles className="w-4 h-4" />}
              >
                {loading ? 'Enrolling...' : 'Import Directly to Database'}
              </SoundButton>
            )}

            {isSuccess && (
              <SoundButton
                onClick={() => onNavigate('students')}
                variant="primary"
                size="sm"
                soundType="haptic"
                icon={<Users className="w-4 h-4" />}
              >
                View Trainee Roster
              </SoundButton>
            )}
          </div>

          {/* Errors list if any */}
          {importResult.errors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
              <div className="font-bold">Errors encountered during parsing:</div>
              {importResult.errors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {/* Data Preview Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Guardian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {importResult.data.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{st.roll_number}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.full_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{st.email}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{st.course_code}</td>
                    <td className="py-2.5 px-3 text-slate-600">{st.academic_session}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold text-slate-700">
                        {st.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{st.guardian_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
