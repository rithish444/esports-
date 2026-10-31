import React, { useState } from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Gamepad2, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  CheckCircle,
  KeyRound,
  Mail,
  User,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const EntryScreen = () => {
  const { login, signUp, loading, authError, isConfigured } = useAuth();

  // Auth mode for player portal: 'login' | 'signup'
  const [authMode, setAuthMode] = useState('login');
  
  // Admin login modal state (strictly LOGIN only, NO admin register)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Player form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Admin form fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(null);

  // Handle Player Login & Registration
  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name or gamer tag.');
        return;
      }
      const res = await signUp(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error);
      } else if (res.message) {
        setSuccessMessage(res.message);
      }
    } else {
      // Login - works for players, and also auto-redirects admin if admin credentials entered
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error);
      }
    }
  };

  // Handle Admin Login (Strictly Login Only - No Admin Registration)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError(null);

    const res = await login(adminEmail, adminPassword, 'admin');
    if (!res.success) {
      setAdminError(res.error);
    } else {
      setShowAdminModal(false);
      setAdminEmail('');
      setAdminPassword('');
    }
  };

  const handleCloseAdminModal = () => {
    setShowAdminModal(false);
    setAdminError(null);
    setAdminEmail('');
    setAdminPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Decorative Neon Grids & Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1f2b45_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-gaming text-2xl sm:text-3xl font-black tracking-wider text-white">
              ESPORTS<span className="text-cyan-400">ARENA</span>
            </span>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest block font-bold -mt-1">
              Free Fire Tournaments
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConfigured && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-[11px] text-amber-300 font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Setup Needed: Supabase Keys
            </div>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            {isConfigured ? 'System Online • v1.0' : 'Awaiting .env Configuration'}
          </div>
        </div>
      </header>

      {/* Main Content: Direct User Login Page */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-lg w-full mx-auto">
        
        {/* Main Card Container */}
        <div className="w-full bg-[#0f1422]/90 backdrop-blur-xl border border-[#1f2b45] hover:border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 relative">
          
          {/* Card Top Glow Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />

          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3 shadow-inner">
              <Gamepad2 className="w-4 h-4" />
              <span>Player Access Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase font-gaming tracking-wide">
              {authMode === 'login' ? 'Welcome Back, Champion' : 'Join The Arena'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
              {authMode === 'login'
                ? 'Sign in to access your squad, custom room credentials, and coin wallet.'
                : 'Create your player account to join Solo, Duo, and Squad tournaments.'
              }
            </p>
          </div>

          {/* Mode Switcher: Log In vs Create Account (Player Only) */}
          <div className="flex border-b border-[#1f2b45] mb-5">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 pb-2.5 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 pb-2.5 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>

          {/* Supabase Not Connected Warning */}
          {!isConfigured && (
            <div className="p-3.5 mb-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="flex-1">
                  <div className="font-bold text-amber-300">Supabase Connection Required</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    To log in and store data securely, connect your free Supabase project by adding your keys to <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">.env</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline block"
              >
                {showSetupGuide ? '▾ Hide setup steps' : '▸ View 3-step setup guide'}
              </button>
              {showSetupGuide && (
                <div className="pt-2 border-t border-amber-500/20 text-[11px] text-slate-300 space-y-1.5 leading-normal">
                  <p><strong>Step 1:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a>, create a free project.</p>
                  <p><strong>Step 2:</strong> In Project Settings → API, copy your <strong>URL</strong> and <strong>anon key</strong>, then paste into <code className="bg-black/50 px-1 rounded text-amber-300">.env</code>.</p>
                  <p><strong>Step 3:</strong> In Supabase SQL Editor, paste & run <code className="bg-black/50 px-1 rounded text-cyan-300">supabase_schema.sql</code>, then create your user.</p>
                </div>
              )}
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3 mb-4 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {(errorMessage || authError) && (
            <div className="p-3 mb-4 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePlayerSubmit} autoComplete="off" className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name / Captain Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name or gamer tag"
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0a0d14] border border-[#1f2b45] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0d14] border border-[#1f2b45] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0d14] border border-[#1f2b45] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold tracking-wide uppercase transition shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black shadow-neon-cyan flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : authMode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Player Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Battleground</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Features List */}
          <div className="mt-6 pt-5 border-t border-[#1f2b45]/60 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-cyan-400 font-bold">Free Fire</span>
              <span>Daily Tourneys</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-[#1f2b45]/60">
              <span className="text-amber-400 font-bold">200 Coins</span>
              <span>Welcome Bonus</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-emerald-400 font-bold">Instant</span>
              <span>Room Passwords</span>
            </div>
          </div>

        </div>

      </main>

      {/* Footer with Discreet Admin Login Portal (Strictly Login Only - No Register) */}
      <footer className="relative z-10 w-full py-4 px-6 text-xs text-slate-500 border-t border-[#1f2b45]/40 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div>
          Esports Arena • Designed for Free Fire Tournament Organizers & Players
        </div>
        
        {/* Subtle Admin Login Entry - Strictly Login Only */}
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-400 transition text-[11px] font-medium group"
        >
          <Lock className="w-3.5 h-3.5 group-hover:text-orange-400" />
          <span>Admin Portal</span>
        </button>
      </footer>

      {/* ADMIN AUTHENTICATION MODAL (STRICTLY LOGIN ONLY - NO REGISTER COLUMN) */}
      <Modal
        isOpen={showAdminModal}
        onClose={handleCloseAdminModal}
        title="Administrator Authentication"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          
          {/* Security Banner */}
          <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/30 text-xs text-orange-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
            <div>
              <strong>Restricted Access:</strong> Authorized tournament organizers only. Access is strictly validated against database administrator permissions.
            </div>
          </div>

          {/* Admin Error Alert */}
          {adminError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{adminError}</span>
            </div>
          )}

          {/* Admin Login Form - ONLY LOGIN IS PRESENT */}
          <form onSubmit={handleAdminSubmit} autoComplete="off" className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@esportsarena.com"
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Master Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wide uppercase transition shadow-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-neon-orange flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Login as Administrator</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-500">
              Not an administrator?{' '}
              <button
                type="button"
                onClick={handleCloseAdminModal}
                className="text-cyan-400 hover:underline"
              >
                Return to Player Login
              </button>
            </span>
          </div>

        </div>
      </Modal>

    </div>
  );
};
export default EntryScreen;
