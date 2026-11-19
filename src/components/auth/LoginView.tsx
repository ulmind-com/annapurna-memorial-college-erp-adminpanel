import React, { useState } from 'react';
import {
  Shield,
  Users,
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, ActiveRole } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { getCurrentLiveIST } from '../../utils/date';

export const LoginView: React.FC = () => {
  const { login, loginAsDemo, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, playHaptic, playPop, playSuccess } = useSound();

  const [selectedRole, setSelectedRole] = useState<ActiveRole>('SUPER_ADMIN');
  const [email, setEmail] = useState('admin@annapurnacollege.org');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const istInfo = getCurrentLiveIST();

  const roleConfigs = {
    SUPER_ADMIN: {
      title: 'Super Admin Console',
      subtitle: 'Institutional Command, Clearances & Regulatory Compliance',
      defaultEmail: 'admin@annapurnacollege.org',
      defaultPass: 'Admin@123456',
      icon: Shield,
      accentColor: 'from-blue-600 to-indigo-700',
      badge: 'Principal / Management',
      demoLabel: 'Quick Login as Principal Arnab Senapati',
      features: [
        'Multi-stage Marksheet Authorization Desk',
        'Regional Trainee Distribution Map (S. 24 Parganas)',
        'Full Student & Faculty Lifecycle Management',
        'BSAEU & NCTE Institutional Audit Trail',
      ],
    },
    TEACHER: {
      title: 'Faculty & Teacher Portal',
      subtitle: 'Curriculum Delivery, Micro-Teaching & Trainee Mentorship',
      defaultEmail: 'teacher@annapurnacollege.org',
      defaultPass: 'Teacher@123456',
      icon: Users,
      accentColor: 'from-sky-600 to-blue-700',
      badge: 'B.Ed. & D.El.Ed. Educators',
      demoLabel: 'Quick Login as Ms. Ria Sharma (Faculty)',
      features: [
        'Interactive Homework & Submissions Dynamic Charts',
        'Lesson Pedagogy Planning & Practicum Tracking',
        'Daily Trainee Attendance Submission',
        'Continuous & Comprehensive Evaluation (CCE)',
      ],
    },
    STUDENT: {
      title: 'Student Trainee Portal',
      subtitle: 'Academic Ledger, Attendance Meter & Certified Marksheets',
      defaultEmail: 'student@annapurnacollege.org',
      defaultPass: 'Student@123456',
      icon: GraduationCap,
      accentColor: 'from-emerald-600 to-teal-700',
      badge: 'Enrolled Teacher Trainees',
      demoLabel: 'Quick Login as Ananya Das (B.Ed. Trainee)',
      features: [
        'Mandatory NCTE 75% Physical Attendance Meter',
        'Official Verified Semester Marksheets with QR Download',
        'Course Syllabi, Lecture Materials & Lesson Aids',
        'Semester Fee Invoices & Payment Receipts',
      ],
    },
  };

  const handleRoleSelect = (role: ActiveRole) => {
    playHaptic();
    setSelectedRole(role);
    setEmail(roleConfigs[role].defaultEmail);
    setPassword(roleConfigs[role].defaultPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    playPop();

    try {
      await login(email.trim(), password);
      playSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoQuickLogin = async () => {
    playPop();
    setErrorMessage(null);
    try {
      await loginAsDemo(selectedRole);
      playSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize session.');
    }
  };

  const activeConfig = roleConfigs[selectedRole];
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Top Floating Utility Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="Annapurna Memorial College of Education Crest"
            className="w-12 h-12 rounded-full border-2 border-blue-600/30 shadow-md object-contain bg-white p-0.5"
          />
          <div>
            <div className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Annapurna Memorial College of Education
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Kashinagar, South 24 Parganas • Affiliated to BSAEU (WBUTTEPA) & Recognized by NCTE
            </div>
          </div>
        </div>

        {/* Right Tools: IST Clock, Sound FX, Dark Mode */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{istInfo.full}</span>
          </div>

          <button
            onClick={() => {
              toggleSound();
              playHaptic();
            }}
            title={soundEnabled ? 'Mute Haptic Audio' : 'Enable Haptic Audio'}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              toggleTheme();
              playHaptic();
            }}
            title={isDark ? 'Switch to Day Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 shadow-xs transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto w-full">
          {(['SUPER_ADMIN', 'TEACHER', 'STUDENT'] as ActiveRole[]).map((role) => {
            const config = roleConfigs[role];
            const Icon = config.icon;
            const isSelected = selectedRole === role;

            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'TEACHER' ? 'Teacher' : 'Student'}</span>
              </button>
            );
          })}
        </div>

        {/* Split Grid Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Left Hero Sidebar: Features & Role Badge */}
          <div className="lg:col-span-5 p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <ActiveIcon className="w-3.5 h-3.5" />
                  <span>{activeConfig.badge}</span>
                </div>

                <img
                  src="/logo.png"
                  alt="AMCE Logo"
                  className="w-12 h-12 rounded-full border-2 border-white/30 shadow-md object-contain bg-white p-0.5"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight leading-snug">{activeConfig.title}</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeConfig.subtitle}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Role Capabilities & Workflows:
                </div>
                {activeConfig.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-normal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="relative z-10 pt-6 mt-6 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleDemoQuickLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{activeConfig.demoLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Form: Login Credentials */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sign In to Your Workspace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your institutional credentials to access your college dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Email / ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@annapurnacollege.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact College IT Administration: it@annapurnacollege.org')}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <span>Sign In as {selectedRole === 'SUPER_ADMIN' ? 'Super Admin' : selectedRole === 'TEACHER' ? 'Teacher' : 'Student'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <div>
          Annapurna Memorial College of Education • Kashinagar, South 24 Parganas, West Bengal 743349 • Affiliated to BSAEU (WBUTTEPA) & Recognized by NCTE
        </div>
      </footer>
    </div>
  );
};
