import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import collegeLogo from '../../assets/logo.png';
import { Modal } from '../common/Modal';
import { SoundButton } from '../common/SoundButton';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { playPop, playSuccess, playAlert } = useSound();

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

  // Quick credentials hint modal
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      playAlert();
      setErrorMessage('Please enter both your registered institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    playPop();

    try {
      await login(email.trim(), password.trim());
      playSuccess();
    } catch (err: any) {
      playAlert();
      setErrorMessage(
        err.message || 'Invalid institutional credentials. Please verify your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

      {/* Main Centered Floating Card Matching Screenshot */}
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

          {/* 3D Character at Desk Vector Illustration matching image */}
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
              {/* Left Leg */}
              <path d="M165 175 L155 210 L140 215" stroke="#1e3a8a" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Leg */}
              <path d="M195 175 L205 210 L220 215" stroke="#1e3a8a" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Shoes / Sneakers */}
              <ellipse cx="135" cy="216" rx="12" ry="7" fill="#ffffff" />
              <path d="M125 218 Q135 212 145 218" stroke="#3b82f6" strokeWidth="3" />
              <ellipse cx="225" cy="216" rx="12" ry="7" fill="#ffffff" />
              <path d="M215 218 Q225 212 235 218" stroke="#3b82f6" strokeWidth="3" />

              {/* Character Body (White Sweater) */}
              <rect x="155" y="125" width="50" height="55" rx="20" fill="#f8fafc" />
              <ellipse cx="180" cy="125" rx="15" ry="6" fill="#e2e8f0" />

              {/* Left Arm Resting near Laptop */}
              <path d="M160 135 Q145 155 140 165" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />

              {/* Right Arm Raised with Peace Sign */}
              <path d="M200 135 Q220 115 225 90" stroke="#f8fafc" strokeWidth="12" strokeLinecap="round" />
              {/* Hand with Peace Sign */}
              <circle cx="226" cy="85" r="9" fill="#fbcfe8" />
              <path d="M223 85 L220 72" stroke="#fbcfe8" strokeWidth="4" strokeLinecap="round" />
              <path d="M227 85 L229 70" stroke="#fbcfe8" strokeWidth="4" strokeLinecap="round" />
              {/* Radiating Joy Action Lines */}
              <path d="M216 63 L212 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <path d="M225 60 L225 50" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <path d="M234 63 L238 55" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

              {/* Character Head */}
              <circle cx="180" cy="100" r="22" fill="#fed7aa" />
              {/* Blush cheeks */}
              <ellipse cx="170" cy="106" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
              <ellipse cx="190" cy="106" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
              {/* Eyes */}
              <circle cx="172" cy="100" r="2.5" fill="#1e293b" />
              <circle cx="188" cy="100" r="2.5" fill="#1e293b" />
              {/* Smile */}
              <path d="M176 108 Q180 113 184 108" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Cute Hat / Beret */}
              <ellipse cx="180" cy="88" rx="28" ry="7" fill="#d97706" />
              <ellipse cx="180" cy="85" rx="18" ry="12" fill="#b45309" />
              <circle cx="180" cy="74" r="3" fill="#fef3c7" />

              {/* Modern Minimalist Workstation Desk */}
              {/* Table Top Surface */}
              <rect x="60" y="158" width="240" height="9" rx="4.5" fill="#e0e7ff" />
              {/* Desk Legs */}
              <rect x="75" y="167" width="7" height="75" rx="3.5" fill="#c7d2fe" />
              <rect x="278" y="167" width="7" height="75" rx="3.5" fill="#c7d2fe" />
              {/* Desk Base Support Feet */}
              <rect x="65" y="240" width="27" height="4" rx="2" fill="#a5b4fc" />
              <rect x="268" y="240" width="27" height="4" rx="2" fill="#a5b4fc" />

              {/* Desktop Monitor on Left */}
              <rect x="85" y="105" width="60" height="45" rx="4" fill="#334155" />
              <rect x="88" y="108" width="54" height="39" rx="2" fill="#1e293b" />
              {/* Stand */}
              <rect x="112" y="150" width="6" height="8" fill="#94a3b8" />
              <rect x="104" y="157" width="22" height="2" rx="1" fill="#64748b" />
              {/* Code / Content on screen */}
              <rect x="93" y="115" width="20" height="2.5" rx="1" fill="#38bdf8" />
              <rect x="93" y="122" width="34" height="2.5" rx="1" fill="#818cf8" />
              <rect x="93" y="129" width="28" height="2.5" rx="1" fill="#4ade80" />
              {/* Radiating lines from monitor */}
              <path d="M100 98 L98 90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M107 96 L108 88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M115 98 L117 90" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

              {/* Laptop on Right */}
              <polygon points="215,158 245,158 240,140 215,140" fill="#dc2626" />
              <rect x="217" y="142" width="22" height="15" fill="#fca5a5" />
              <path d="M210 158 L250 158" stroke="#b91c1c" strokeWidth="2" />

              {/* Cute Potted Plant next to Desk */}
              <ellipse cx="60" cy="242" rx="10" ry="3" fill="#1e293b" opacity="0.2" />
              <path d="M54 228 L66 228 L63 242 L57 242 Z" fill="#f97316" />
              {/* Leaves */}
              <ellipse cx="60" cy="222" rx="6" ry="10" fill="#22c55e" />
              <ellipse cx="56" cy="223" rx="5" ry="8" fill="#16a34a" transform="rotate(-20 56 223)" />
              <ellipse cx="64" cy="223" rx="5" ry="8" fill="#4ade80" transform="rotate(20 64 223)" />
            </svg>
          </div>

          {/* Bottom Trust Badge */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-blue-200/80 border-t border-white/15 relative z-10">
            <span>BSAEU Affiliated</span>
            <span>•</span>
            <span>NCTE Recognized</span>
            <span>•</span>
            <span>Code: AMCE-743349</span>
          </div>
        </div>

        {/* Right Column: Clean White Login Form matching image */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div>
            {/* Top Logo matching image */}
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

            {/* Welcome Back Header */}
            <div className="mt-7 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Please Login to your account
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Unified Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              {/* Password Input with Eye Toggle */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3.5 pr-11 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
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

                {/* Forgot Password Link */}
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors"
                  >
                    Forgot Password
                  </button>
                </div>
              </div>

              {/* Login Button matching image */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#4361ee] hover:bg-[#3451db] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Divider: or Login with */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                or Login with
              </span>
              <div className="flex-1 h-[1px] bg-slate-200" />
            </div>

            {/* Social / SSO Single Sign-on Buttons matching image */}
            <div className="grid grid-cols-2 gap-3">
              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => {
                  playPop();
                  alert('Facebook SSO integration active for institutional credentials.');
                }}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300"
              >
                {/* Facebook 'f' in blue circle SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path
                    d="M15.5 12.05H13V18H10.5V12.05H9V9.8H10.5V8.3C10.5 6.6 11.5 5.5 13.3 5.5C14.1 5.5 14.8 5.6 14.8 5.6V7.4H13.9C13 7.4 12.7 7.9 12.7 8.6V9.8H15.4L15.5 12.05Z"
                    fill="white"
                  />
                </svg>
                <span>Facebook</span>
              </button>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => {
                  playPop();
                  alert('Google Institutional Workspace SSO ready for @annapurnacollege.edu.in accounts.');
                }}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Institutional Credentials Directory Shortcut */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Secure 256-Bit SSL Encryption</span>
            <button
              type="button"
              onClick={() => {
                playPop();
                setIsCredentialsModalOpen(true);
              }}
              className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Institutional Accounts
            </button>
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
              If an account is registered with <b className="text-slate-800">{forgotEmail}</b>, temporary reset instructions have been sent via Resend.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered official email address. A temporary access password will be dispatched to your inbox.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. faculty.soumen@annapurnacollege.edu.in"
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

      {/* Modal: Institutional Accounts Directory Reference */}
      <Modal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        title="Institutional Account Credentials Reference"
        subtitle="Configured Role Credentials (Manual Entry Required)"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            As requested, inputs are not auto-filled. You can manually enter any of the generated institutional credentials below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Super Admin */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-900 uppercase text-[10px]">
                  Super Admin
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                  Executive
                </span>
              </div>
              <div className="font-bold text-slate-900">Dr. Arnab Senapati</div>
              <div className="text-[11px] font-mono text-slate-600 break-all">
                admin@annapurnacollege.edu.in
              </div>
              <div className="text-[11px] font-mono font-bold text-blue-700 bg-white/80 p-1 rounded border border-blue-100">
                Admin@Amce2024#
              </div>
            </div>

            {/* Faculty / Teacher */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-900 uppercase text-[10px]">
                  Faculty / Teacher
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-600 text-white">
                  Educator
                </span>
              </div>
              <div className="font-bold text-slate-900">Prof. Soumen Mukherjee</div>
              <div className="text-[11px] font-mono text-slate-600 break-all">
                faculty.soumen@annapurnacollege.edu.in
              </div>
              <div className="text-[11px] font-mono font-bold text-purple-700 bg-white/80 p-1 rounded border border-purple-100">
                Teacher@Amce2024#
              </div>
            </div>

            {/* Student */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-900 uppercase text-[10px]">
                  Student Trainee
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white">
                  Trainee
                </span>
              </div>
              <div className="font-bold text-slate-900">Ananya Das (Roll 001)</div>
              <div className="text-[11px] font-mono text-slate-600 break-all">
                ananya.das@student.annapurnacollege.org
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-700 bg-white/80 p-1 rounded border border-emerald-100">
                Student@Amce2024#
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
            <strong>Security Notice:</strong> When adding a new teacher in Faculty Management or a new student in Student Management, a secure random password is generated and dispatched to their email address via Resend. Users can change their password anytime via profile settings.
          </div>

          <div className="flex justify-end pt-1">
            <SoundButton
              onClick={() => setIsCredentialsModalOpen(false)}
              variant="primary"
              size="sm"
            >
              Close
            </SoundButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
