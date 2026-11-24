import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { SoundButton } from '../common/SoundButton';

export const ResetPasswordView: React.FC<{ token: string }> = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setSaving(true);
    try {
      const res = await api.resetPassword(token, password);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Reset link is invalid or expired.');
    } finally {
      setSaving(false);
    }
  };

  const cls = 'w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb] p-4">
      <form onSubmit={submit} className="w-full max-w-sm p-8 rounded-3xl bg-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-lg font-black text-slate-900">
          <KeyRound className="w-5 h-5 text-blue-600" /> Set a new password
        </div>
        {message ? (
          <>
            <p className="text-sm text-emerald-700 font-bold">{message}</p>
            <SoundButton type="button" onClick={() => (window.location.href = '/')}>Go to login</SoundButton>
          </>
        ) : (
          <>
            <input type="password" className={cls} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="password" className={cls} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
            <SoundButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</SoundButton>
          </>
        )}
      </form>
    </div>
  );
};
