import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import { EntryScreen } from './components/entry/EntryScreen';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';

// Player Pages
import { PlayerHome } from './pages/player/PlayerHome';
import { MyRegistrations } from './pages/player/MyRegistrations';
import { LeaderboardPage } from './pages/player/LeaderboardPage';
import { MyTeam } from './pages/player/MyTeam';
import { WalletPage } from './pages/player/WalletPage';
import { PlayerChat } from './pages/player/PlayerChat';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { TournamentManager } from './pages/admin/TournamentManager';
import { RegistrationManager } from './pages/admin/RegistrationManager';
import { MatchManager } from './pages/admin/MatchManager';
import { UserTeamManager } from './pages/admin/UserTeamManager';
import { CoinManager } from './pages/admin/CoinManager';
import { AdminChat } from './pages/admin/AdminChat';
import { SettingsManager } from './pages/admin/SettingsManager';

export const App = () => {
  const { currentUser, session, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show dark gaming spinner while checking Supabase auth session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-neon-cyan"></div>
          <span className="text-xs uppercase font-gaming tracking-widest text-slate-400">Verifying Security Session...</span>
        </div>
      </div>
    );
  }

  // 1. REQUIREMENT 5: If no session exists, redirect directly to Login/Entry screen
  if (!session || !currentUser) {
    return <EntryScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Routes>
            {/* Player Routes */}
            {!isAdmin ? (
              <>
                <Route path="/" element={<PlayerHome />} />
                <Route path="/registrations" element={<MyRegistrations />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/team" element={<MyTeam />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/chat" element={<PlayerChat />} />
                {/* Fallback & Protect Admin routes */}
                <Route path="/admin/*" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              /* Admin Routes */
              <>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/tournaments" element={<TournamentManager />} />
                <Route path="/admin/registrations" element={<RegistrationManager />} />
                <Route path="/admin/matches" element={<MatchManager />} />
                <Route path="/admin/teams" element={<UserTeamManager />} />
                <Route path="/admin/coins" element={<CoinManager />} />
                <Route path="/admin/chat" element={<AdminChat />} />
                <Route path="/admin/settings" element={<SettingsManager />} />
                {/* Fallback to admin home */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
export default App;
