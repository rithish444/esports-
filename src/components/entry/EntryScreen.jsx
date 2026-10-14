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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export const EntryScreen = () => {
  const { login, signUp, loading, authError, isConfigured } = useAuth();

  const [selectedRoleGate, setSelectedRoleGate] = useState(null); // 'admin' | 'player' | null
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleOpenGate = (gate) => {
    setSelectedRoleGate(gate);
    setAuthMode('login');
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleClose = () => {
    setSelectedRoleGate(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSetupGuide(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      const res = await signUp(name, email, password);
      if (!res.success) {
        setErrorMessage(res.error);
      } else if (res.message) {
        setSuccessMessage(res.message);
      } else {
        handleClose();
      }
    } else {
      // Login using strictly Supabase Auth
      const res = await login(email, password, selectedRoleGate);
      if (!res.success) {
        setErrorMessage(res.error);
      } else {
        handleClose();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Decorative Neon Grids & Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1f2b45_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
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

      {/* Main Content: Role Selection */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Select Your Access Portal
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-wide text-white uppercase font-gaming mb-4">
          Enter The <span className="text-cyan-400 text-glow-cyan">Battleground</span>
        </h1>
        
        <p className="text-slate-400 max-w-2xl text-sm sm:text-base mb-10 leading-relaxed">
          Welcome to Esports Arena, the competitive tournament platform for Free Fire. 
          Choose your role below to manage tournaments or compete with your squad for cash coins.
        </p>

        {/* The Two Entry Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Card 1: Enter as Admin */}
          <div 
            onClick={() => handleOpenGate('admin')}
            className="group relative cursor-pointer text-left p-8 rounded-2xl bg-gradient-to-b from-[#161c2d] to-[#0f1422] border-2 border-[#1f2b45] hover:border-orange-500/80 transition-all duration-300 hover:shadow-neon-orange hover:-translate-y-1"
          >
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Restricted
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-6 shadow-neon-orange group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white font-gaming mb-2 group-hover:text-orange-400 transition-colors">
              Enter As Admin
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Create and manage tournaments, verify team UIDs, approve entries, dispense coin rewards, and run live matches.
            </p>

            <div className="flex items-center text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform">
              Admin Login Portal <ArrowRight className="w-4 h-4 ml-1.5" />
            </div>
          </div>

          {/* Card 2: Enter as Player */}
          <div 
            onClick={() => handleOpenGate('player')}
            className="group relative cursor-pointer text-left p-8 rounded-2xl bg-gradient-to-b from-[#161c2d] to-[#0f1422] border-2 border-[#1f2b45] hover:border-cyan-400/80 transition-all duration-300 hover:shadow-neon-cyan hover:-translate-y-1"
          >
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Open to All
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-neon-cyan group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-7 h-7 text-black" />
            </div>

            <h2 className="text-2xl font-bold text-white font-gaming mb-2 group-hover:text-cyan-400 transition-colors">
              Enter As Player
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Register your Free Fire squad, join Solo/Duo/Squad tournaments using coins, receive custom room passwords, and climb the leaderboard.
            </p>

            <div className="flex items-center text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              Player Login & Register <ArrowRight className="w-4 h-4 ml-1.5" />
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-500 border-t border-[#1f2b45]/40">
        Esports Arena • Designed for Free Fire Tournament Organizers & Players • Powered by React & Supabase
      </footer>

      {/* AUTH MODAL */}
      <Modal
        isOpen={Boolean(selectedRoleGate)}
        onClose={handleClose}
        title={selectedRoleGate === 'admin' ? 'Administrator Authentication' : 'Player Authentication'}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          
          {/* Supabase Not Connected Warning */}
          {!isConfigured && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
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
                {showSetupGuide ? '▲ Hide setup steps' : '▼ View 3-step setup guide'}
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

          {/* Security Banner */}
          {selectedRoleGate === 'admin' && (
            <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/30 text-xs text-orange-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
              <span>
                <strong>Admin Security:</strong> Access is validated against the database <code className="text-white">profiles</code> table.
              </span>
            </div>
          )}

          {/* Mode Switcher: Log In vs Create / Register */}
          <div className="flex border-b border-[#1f2b45] mb-2">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
              className={`flex-1 pb-2 text-xs font-bold uppercase transition ${
                authMode === 'login'
                  ? selectedRoleGate === 'admin'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
              className={`flex-1 pb-2 text-xs font-bold uppercase transition ${
                authMode === 'signup'
                  ? selectedRoleGate === 'admin'
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedRoleGate === 'admin' ? 'Register Admin' : 'Create Account'}
            </button>
          </div>

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {(errorMessage || authError) && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedRoleGate === 'admin' ? 'Administrator Name' : 'Full Name / Captain Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRoleGate === 'admin' ? 'e.g. Rithish (Admin)' : 'Enter your full name'}
                    autoComplete="off"
                    className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-bold tracking-wide uppercase transition shadow-lg ${
                selectedRoleGate === 'admin'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-neon-orange'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black shadow-neon-cyan'
              }`}
            >
              {loading 
                ? 'Validating Credentials...' 
                : authMode === 'signup' 
                  ? (selectedRoleGate === 'admin' ? 'Register Admin Account' : 'Create Player Account')
                  : selectedRoleGate === 'admin' 
                    ? 'Login as Administrator' 
                    : 'Login as Player'
              }
            </button>
          </form>

        </div>
      </Modal>

    </div>
  );
};
