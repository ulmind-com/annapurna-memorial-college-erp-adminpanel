import React, { useState } from 'react';
import {
  Shield,
  Users,
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth, ActiveRole } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { getCurrentLiveIST } from '../../utils/date';

export const LoginView: React.FC = () => {
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, playHaptic, playPop, playSuccess, playAlert } = useSound();

  // Selected role tab
  const [selectedRole, setSelectedRole] = useState<ActiveRole>('SUPER_ADMIN');

  // STRICTLY EMPTY BY DEFAULT: NO AUTO-PREFILL!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const istInfo = getCurrentLiveIST();

  const roleDefinitions = {
    SUPER_ADMIN: {
      role: 'SUPER_ADMIN' as ActiveRole,
      title: 'Principal & Super Admin Console',
      badge: 'Executive Clearance',
      description: 'Centralized institutional command, marksheet approvals & college operations',
      icon: Shield,
      demoEmail: 'admin@annapurnacollege.org',
      demoPass: 'Admin@123456',
      color: 'from-blue-600 to-indigo-700',
      tag: 'Principal / Admin',
    },
    TEACHER: {
      role: 'TEACHER' as ActiveRole,
      title: 'Faculty & Teacher Portal',
      badge: 'Academic Educator',
      description: 'Class timetables, daily attendance, lesson plans, assignments & marks entry',
      icon: Users,
      demoEmail: 'teacher@annapurnacollege.org',
      demoPass: 'Teacher@123456',
      color: 'from-indigo-600 to-purple-700',
      tag: 'B.Ed. & D.El.Ed. Faculty',
    },
    STUDENT: {
      role: 'STUDENT' as ActiveRole,
      title: 'Student Trainee Portal',
      badge: 'Teacher Trainee',
      description: '75% attendance meter, certified marksheets, study notes & leave applications',
      icon: GraduationCap,
      demoEmail: 'student@annapurnacollege.org',
      demoPass: 'Student@123456',
      color: 'from-teal-600 to-emerald-700',
      tag: 'Enrolled Trainee',
    },
  };

  const currentRole = roleDefinitions[selectedRole];
  const ActiveIcon = currentRole.icon;

  const handleRoleChange = (role: ActiveRole) => {
    playHaptic();
    setSelectedRole(role);
    setErrorMessage(null);
    // Inputs remain empty on role change!
  };

  // Optional manual fill upon user click
  const handleUseDemoCredentials = () => {
    playPop();
    setEmail(currentRole.demoEmail);
    setPassword(currentRole.demoPass);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      playAlert();
      setErrorMessage('Please enter both your registered email address and security password.');
      return;
    }

    setIsSubmitting(true);
    playPop();

    try {
      await login(email.trim(), password);
      playSuccess();
    } catch (err: any) {
      playAlert();
      setErrorMessage(err.message || 'Invalid institutional credentials. Please check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Security & Utility Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="Annapurna Memorial College of Education Crest"
            className="w-12 h-12 rounded-full border-2 border-blue-500/40 shadow-lg object-contain bg-white p-0.5 flex-shrink-0"
          />
          <div>
            <div className="text-base font-black tracking-tight text-white leading-tight">
              Annapurna Memorial College of Education
            </div>
            <div className="text-[11px] font-semibold text-slate-400">
              Kashinagar, South 24 Parganas • Affiliated to BSAEU & Recognized by NCTE
            </div>
          </div>
        </div>

        {/* Right Tools: IST Clock, Sound FX, Dark Mode */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{istInfo.full}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleSound();
              playHaptic();
            }}
            title={soundEnabled ? 'Mute Haptic Audio' : 'Enable Haptic Audio'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 transition-all shadow-xs"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleTheme();
              playHaptic();
            }}
            title={isDark ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all shadow-xs"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center relative z-10">
        {/* Security Shield Banner */}
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Enterprise ERP Security Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Institutional Account Authentication
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please select your authorization domain and enter your institutional credentials.
          </p>
        </div>

        {/* Role Selection Switcher */}
        <div className="grid grid-cols-3 gap-3 p-1.5 mb-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          {(['SUPER_ADMIN', 'TEACHER', 'STUDENT'] as ActiveRole[]).map((role) => {
            const def = roleDefinitions[role];
            const Icon = def.icon;
            const isSelected = selectedRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">
                  {role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'TEACHER' ? 'Teacher / Faculty' : 'Student Trainee'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Security Login Card */}
        <div className="rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800/90 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <ActiveIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-snug">
                  {currentRole.title}
                </h2>
                <p className="text-xs text-slate-400">{currentRole.description}</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 border border-slate-700 text-blue-300">
              {currentRole.badge}
            </span>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Institutional Email Address</span>
                <span className="text-[10px] text-slate-500 font-normal">Registered with College ERP</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`Enter your ${selectedRole.toLowerCase()} email...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Access Password</span>
                <span className="text-[10px] text-slate-500 font-normal">Case-sensitive</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials & Session...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access {currentRole.tag}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Assistant (Click to fill manually) */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Demo Access for Testing:
            </div>
            <button
              type="button"
              onClick={handleUseDemoCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-blue-400 font-mono text-[11px] font-bold border border-slate-700 transition-colors"
              title="Click to populate demo login credentials"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill {currentRole.demoEmail}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 relative z-10">
        <div>
          Official ERP Portal • <b>Annapurna Memorial College of Education</b> • Kashinagar, South 24 Parganas, West Bengal 743349
        </div>
        <div className="text-[10px] text-slate-600 mt-0.5">
          NCTE Recognized & BSAEU University Approved Teacher Training Institution
        </div>
      </footer>
    </div>
  );
};
