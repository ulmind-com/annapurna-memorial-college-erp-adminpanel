import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle, Award, Building } from 'lucide-react';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';
import { useSound } from '../../context/SoundContext';

export const VerifyMarksheetView: React.FC = () => {
  const [hash, setHash] = useState('A9E271F08BD14C92');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { playSuccess, playAlert } = useSound();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyMarksheet(hash.trim().toUpperCase());
      playSuccess();
      setResult(data);
    } catch (err: any) {
      playAlert();
      setError(err.message || 'Verification hash not found in official institutional records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Public Marksheet & Credential Verification Portal
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Sundarban Ashutosh B.Ed. College & Annapurna Memorial College. Enter the 16-character
          tamper-evident cryptographic verification code printed on the official statement of marks.
        </p>
      </div>

      {/* Verification Input Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Cryptographic QR Hash Code
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                value={hash}
                onChange={(e) => setHash(e.target.value.toUpperCase())}
                placeholder="e.g. A9E271F08BD14C92"
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase tracking-widest focus:outline-none focus:border-indigo-500"
              />
              <SoundButton
                type="submit"
                variant="primary"
                disabled={loading}
                soundType="approve"
                icon={<Search className="w-4 h-4" />}
              >
                {loading ? 'Verifying...' : 'Verify Authenticity'}
              </SoundButton>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Sample published hashes: <code className="text-indigo-400 cursor-pointer" onClick={() => setHash('A9E271F08BD14C92')}>A9E271F08BD14C92</code>
            </div>
          </div>
        </form>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Official College Document Verified
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">
                    {result.student_name}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Roll Number</div>
                  <div className="font-mono font-bold text-indigo-400 mt-0.5">{result.roll_number}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Program & Semester</div>
                  <div className="font-semibold text-white mt-0.5">{result.course} (Sem {result.semester})</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Academic Session</div>
                  <div className="font-semibold text-white mt-0.5">{result.session}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Semester SGPA</div>
                  <div className="font-extrabold text-base text-indigo-400 mt-0.5">{result.sgpa}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
                  <div className="text-slate-400 text-[10px] uppercase">Classification</div>
                  <div className="font-bold text-amber-400 mt-0.5">{result.result_status}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Affiliated to: <b>BSAEU (WBUTTEPA) & Recognized by NCTE</b></span>
                <span>Institution: <b>{result.college}</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 text-center space-y-2 animate-in zoom-in-95 duration-200">
          <XCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Record Verification Failed</h3>
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}
    </div>
  );
};
