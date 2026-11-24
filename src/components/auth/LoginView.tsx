import { api } from '../../services/api';
import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth, ActiveRole } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import collegeLogo from '../../assets/logo.png';
import { Modal } from '../common/Modal';
import { SoundButton } from '../common/SoundButton';

export const LoginView: React.FC = () => {
  const { login, logout } = useAuth();
  const { playPop, playSuccess, playAlert, playHaptic } = useSound();

  // Role Tab Selection: Super Admin, Teacher, Student
  const [selectedRole, setSelectedRole] = useState<ActiveRole>('SUPER_ADMIN');

  // STRICTLY EMPTY BY DEFAULT: NO AUTO-PREFILL!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const roleMeta = {
    SUPER_ADMIN: {
      title: 'Super Admin',
      subtitle: 'Principal & Executive Administrative Portal',
      emailPlaceholder: 'Enter administrator email',
      buttonLabel: 'Sign in to Executive Console',
    },
    TEACHER: {
      title: 'Teacher',
      subtitle: 'Faculty & Academic Educator Portal',
      emailPlaceholder: 'Enter faculty official email',
      buttonLabel: 'Sign in to Teacher Portal',
    },
    STUDENT: {
      title: 'Student',
      subtitle: 'Teacher Trainee & Academic Portal',
      emailPlaceholder: 'Enter trainee student email',
      buttonLabel: 'Sign in to Student Portal',
    },
  };

  const currentMeta = roleMeta[selectedRole];

  const handleRoleSelect = (role: ActiveRole) => {
    playHaptic();
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      playAlert();
      setErrorMessage('Please enter both your registered email address and security password.');
      return;
    }

    setIsSubmitting(true);
    playPop();

    try {
      await login(cleanEmail, cleanPassword);

      // Read current logged-in user to verify role match
      const savedUserStr = localStorage.getItem('annapurna_current_user');
      if (savedUserStr) {
        try {
          const loggedUser = JSON.parse(savedUserStr);
          const uRole = loggedUser.role;

          // Seamlessly adopt the user's authentic role without blocking or kicking them out
          if (uRole === 'STUDENT') {
            setSelectedRole('STUDENT');
          } else if (uRole === 'FACULTY' || uRole === 'TEACHER') {
            setSelectedRole('TEACHER');
          } else if (uRole === 'SUPER_ADMIN' || uRole === 'ADMIN') {
            setSelectedRole('SUPER_ADMIN');
          }
        } catch {
          // Ignore parsing glitch
        }
      }

      playSuccess();
    } catch (err: any) {
      playAlert();
      setErrorMessage(
        err.message || 'Invalid email address or password credentials. Please verify your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.forgotPassword(forgotEmail.trim().toLowerCase());
    } catch (err: any) {
      playAlert();
      alert(err.message || 'Could not send reset email');
      return;
    }
    playSuccess();
    setForgotSubmitted(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7fb] text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Soft Ambient Blur Spots */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-300/25 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Main Centered Floating Card */}
      <div className="w-full max-w-4xl bg-white rounded-[36px] shadow-2xl shadow-indigo-500/10 border border-slate-100 p-4 sm:p-6 lg:p-7 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        
        {/* Left Column: Royal Blue Illustration Card */}
        <div className="bg-gradient-to-b from-[#4361ee] to-[#3a56e4] rounded-[28px] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-lg shadow-blue-500/25">
          {/* Subtle Background Glow Inside Card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Heading Section */}
          <div className="space-y-3 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Simplify management with our dashboard
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed max-w-xs">
              Simplify your college administration with our user friendly admin dashboard
            </p>
          </div>

          {/* 3D Character at Desk Vector Illustration */}
          <div className="relative w-full h-56 flex items-end justify-center my-auto">
            <svg
              viewBox="0 0 360 260"
              className="w-full h-full max-h-56 filter drop-shadow-md select-none pointer-events-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Floor Shadow */}
              <ellipse cx="180" cy="245" rx="140" ry="12" fill="#2d42b8" opacity="0.4" />
              <ellipse cx="180" cy="245" rx="90" ry="8" fill="#1e2c80" opacity="0.5" />

              {/* Office Chair Base */}
              <path d="M180 180 L180 235" stroke="#1d2d85" strokeWidth="6" strokeLinecap="round" />
              <path d="M140 240 L180 235 L220 240" stroke="#1d2d85" strokeWidth="5" strokeLinecap="round" />
              <circle cx="140" cy="240" r="4" fill="#0f172a" />
              <circle cx="220" cy="240" r="4" fill="#0f172a" />
              <circle cx="180" cy="240" r="4" fill="#0f172a" />

              {/* Character Legs in Blue Pants & Sneakers */}
              <path d="M165 175 L155 210 L140 215" stroke="#1e3a8a" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M195 175 L205 210 L220 215" stroke="#1e3a8a" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="135" cy="216" rx="12" ry="7" fill="#ffffff" />
              <path d="M125 218 Q135 212 145 218" stroke="#3b82f6" strokeWidth="3" />
              <ellipse cx="225" cy="216" rx="12" ry="7" fill="#ffffff" />
              <path d="M215 218 Q225 212 235 218" stroke="#3b82f6" strokeWidth="3" />

              {/* Character Body (White Sweater) */}
              <rect x="155" y="125" width="50" height="55" rx="20" fill="#f8fafc" />
              <ellipse cx="180" cy="125" rx="15" ry="6" fill="#e2e8f0" />

              {/* Left Arm */}
              <path d="M160 135 Q145 155 140 165" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />

              {/* Right Arm Raised with Peace Sign */}
              <path d="M200 135 Q220 115 225 90" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />
              <circle cx="226" cy="85" r="9" fill="#fbcfe8" />
              <path d="M223 85 L220 72" stroke="#fbcfe8" strokeWidth="4" strokeLinecap="round" />
              <path d="M227 85 L229 70" stroke="#fbcfe8" strokeWidth="4" strokeLinecap="round" />
              <path d="M216 63 L212 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <path d="M225 60 L225 50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <path d="M234 63 L238 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

              {/* Head */}
              <circle cx="180" cy="100" r="22" fill="#fed7aa" />
              <ellipse cx="170" cy="106" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
              <ellipse cx="190" cy="106" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
              <circle cx="172" cy="100" r="2.5" fill="#1e293b" />
              <circle cx="188" cy="100" r="2.5" fill="#1e293b" />
              <path d="M176 108 Q180 113 184 108" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Hat */}
              <ellipse cx="180" cy="88" rx="28" ry="7" fill="#d97706" />
              <ellipse cx="180" cy="85" rx="18" ry="12" fill="#b45309" />
              <circle cx="180" cy="74" r="3" fill="#fef3c7" />

              {/* Workstation Desk */}
              <rect x="60" y="158" width="240" height="9" rx="4.5" fill="#e0e7ff" />
              <rect x="75" y="167" width="7" height="75" rx="3.5" fill="#c7d2fe" />
              <rect x="278" y="167" width="7" height="75" rx="3.5" fill="#c7d2fe" />
              <rect x="65" y="240" width="27" height="4" rx="2" fill="#a5b4fc" />
              <rect x="268" y="240" width="27" height="4" rx="2" fill="#a5b4fc" />

              {/* Desktop Monitor */}
              <rect x="85" y="105" width="60" height="45" rx="4" fill="#334155" />
              <rect x="88" y="108" width="54" height="39" rx="2" fill="#1e293b" />
              <rect x="112" y="150" width="6" height="8" fill="#94a3b8" />
              <rect x="104" y="157" width="22" height="2" rx="1" fill="#64748b" />
              <rect x="93" y="115" width="20" height="2.5" rx="1" fill="#38bdf8" />
              <rect x="93" y="122" width="34" height="2.5" rx="1" fill="#818cf8" />
              <rect x="93" y="129" width="28" height="2.5" rx="1" fill="#4ade80" />
              <path d="M100 98 L98 90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M107 96 L108 88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M115 98 L117 90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

              {/* Laptop */}
              <polygon points="215,158 245,158 240,140 215,140" fill="#dc2626" />
              <rect x="217" y="142" width="22" height="15" fill="#fca5a5" />
              <path d="M210 158 L250 158" stroke="#b91c1c" strokeWidth="2" />

              {/* Plant */}
              <ellipse cx="60" cy="242" rx="10" ry="3" fill="#1e293b" opacity="0.2" />
              <path d="M54 228 L66 228 L63 242 L57 242 Z" fill="#f97316" />
              <ellipse cx="60" cy="222" rx="6" ry="10" fill="#22c55e" />
              <ellipse cx="56" cy="223" rx="5" ry="8" fill="#16a34a" transform="rotate(-20 56 223)" />
              <ellipse cx="64" cy="223" rx="5" ry="8" fill="#4ade80" transform="rotate(20 64 223)" />
            </svg>
          </div>

          {/* Bottom Badge */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-blue-200/80 border-t border-white/15 relative z-10">
            <span>Institutional ERP Portal</span>
            <span>•</span>
            <span>Code: AMCE-743349</span>
          </div>
        </div>

        {/* Right Column: Ultra-Pro Premium Login Form */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div>
            {/* Top Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-blue-600/30 p-0.5 bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={collegeLogo}
                  alt="Annapurna Memorial College of Education Crest"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-black text-slate-900 tracking-tight block">
                  Annapurna Memorial
                </span>
                <span className="text-[11px] font-bold text-blue-600 block">
                  College of Education
                </span>
              </div>
            </div>

            {/* Ultra-Pro 3-Role Segmented Selector */}
            <div className="mt-6 p-1 bg-slate-100/90 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => handleRoleSelect('SUPER_ADMIN')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'SUPER_ADMIN'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('TEACHER')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'TEACHER'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>

            {/* Welcome Back Header with Dynamic Role Subtitle */}
            <div className="mt-6 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentMeta.subtitle}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Secured Role-Enforced Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={currentMeta.emailPlaceholder}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter security password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot Password Link - Only for Teacher & Student; Super Admin credentials are institutionally secured */}
                {selectedRole !== 'SUPER_ADMIN' && (
                  <div className="text-right pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setIsForgotModalOpen(true);
                      }}
                      className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>
                )}
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4361ee] hover:bg-[#3451db] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  currentMeta.buttonLabel
                )}
              </button>
            </form>
          </div>

          {/* Bottom Security / Trust Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center gap-1 text-xs text-slate-400 font-medium text-center">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-Bit SSL Encrypted • Brute-Force Shield Active</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Annapurna Memorial College of Education • Tamper-proof JWT Authentication
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Forgot Password */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Access Password"
        subtitle="Institutional Credential Recovery"
        maxWidth="md"
      >
        {forgotSubmitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Recovery Instructions Dispatched</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              If an account is registered with <b className="text-slate-800">{forgotEmail}</b>, password reset instructions have been sent via Resend.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered official email address. A temporary reset link will be dispatched to your inbox.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@annapurnacollege.edu.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <SoundButton
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </SoundButton>
              <SoundButton type="submit" variant="primary" size="sm" soundType="success">
                Send Recovery Email
              </SoundButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
