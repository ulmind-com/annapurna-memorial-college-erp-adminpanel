import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, FileText, User, GraduationCap, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

export const VerifyMarksheetView: React.FC = () => {
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState(false);
  const { playSuccess, playPop } = useSound();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setError(false);
    setResult(null);

    try {
      const res = await api.verifyMarksheet(hash.trim());
      if (res.valid) {
        setResult(res.marksheet);
        playSuccess();
      } else {
        setError(true);
        playPop();
      }
    } catch {
      setError(true);
      playPop();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 mb-1">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Public Marksheet & Credential Verification Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Sundarban Ashutosh B.Ed. College & Annapurna Memorial College. Enter the 16-character
          tamper-evident cryptographic verification code printed on the official statement of marks.
        </p>
      </div>

      {/* Verification Input Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Cryptographic QR Hash Code
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                value={hash}
                onChange={(e) => setHash(e.target.value.toUpperCase())}
                placeholder="e.g. A9E271F08BD14C92"
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <SoundButton
                type="submit"
                variant="primary"
                disabled={loading}
                soundType="pop"
                icon={<Search className="w-4 h-4" />}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </SoundButton>
            </div>
          </div>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  BSAEU Tamper-Evident Marksheet Validated
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {result.student_name}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
              {result.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="text-slate-400 font-medium">Roll Number</div>
              <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{result.roll_number}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="text-slate-400 font-medium">Course & Sem</div>
              <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                {result.course} (Sem {result.semester})
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="text-slate-400 font-medium">SGPA / CGPA</div>
              <div className="font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {result.sgpa?.toFixed(2)} ({result.letter_grade})
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="text-slate-400 font-medium">Total Marks</div>
              <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                {result.total_marks_obtained} / {result.total_marks_maximum}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">Record Verification Failed</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            No approved or published marksheet was found matching this hash. Please contact the college examination controller.
          </p>
        </div>
      )}
    </div>
  );
};
