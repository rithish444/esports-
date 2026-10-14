import React, { useState } from 'react';
import { 
  Trophy, 
  Coins, 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge, ModeBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';

export const PlayerHome = () => {
  const { currentUser } = useAuth();
  const { 
    tournaments, 
    registrations, 
    getUserTeam, 
    getTeamWallet, 
    joinTournament 
  } = useData();
  const navigate = useNavigate();

  const [selectedTourney, setSelectedTourney] = useState(null);
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Join confirmation modal state
  const [joinModalTourney, setJoinModalTourney] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [joinSuccess, setJoinSuccess] = useState(null);
  const [quickTeamName, setQuickTeamName] = useState('');
  const [quickFFUid, setQuickFFUid] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const currentWalletBalance = userTeam ? getTeamWallet(userTeam.id) : 0;

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.map.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'All' || t.mode === filterMode;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesMode && matchesStatus;
  });

  const handleJoinClick = (tourney) => {
    setJoinError(null);
    setJoinSuccess(null);
    setQuickTeamName(userTeam ? userTeam.team_name : `${currentUser?.name || 'My'}'s Squad`);
    setQuickFFUid('');
    setQuickPhone(userTeam ? userTeam.phone : '+91');
    setJoinModalTourney(tourney);
  };

  const handleConfirmJoin = () => {
    setJoinError(null);
    setJoinSuccess(null);

    // If no team profile created yet, validate quick inputs
    if (!userTeam) {
      if (!quickTeamName.trim()) {
        setJoinError('Please enter a squad or team name.');
        return;
      }
      if (!quickFFUid.trim()) {
        setJoinError('Please enter your captain Free Fire UID (numbers only).');
        return;
      }
    }

    try {
      joinTournament(
        joinModalTourney.id, 
        userTeam ? userTeam.id : null,
        !userTeam ? {
          teamName: quickTeamName,
          ffUid: quickFFUid,
          phone: quickPhone,
          captainName: currentUser?.name
        } : null
      );

      setJoinSuccess(`Registration submitted! Your entry is now pending review. The Admin will verify and grant permission for your squad to play.`);
      setTimeout(() => {
        setJoinModalTourney(null);
        setJoinSuccess(null);
        navigate('/registrations');
      }, 2200);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#111726] via-[#16213b] to-[#0f1523] border border-[#1f2b45] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Season 4 Now Live
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-gaming tracking-wide uppercase mb-3">
            Dominate The <span className="text-cyan-400 text-glow-cyan">Free Fire</span> Arena
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Join custom rooms, compete in Solo, Duo, and Squad battles, and earn coin prizes.
            All rooms verified with anti-cheat monitoring.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!userTeam ? (
              <button
                onClick={() => navigate('/team')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold text-sm tracking-wide transition shadow-neon-cyan flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Register Your Team
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
                <span className="text-slate-400">Your Team:</span>
                <span className="font-bold text-cyan-400">{userTeam.team_name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{currentWalletBalance} Coins</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111726]/60 p-4 rounded-xl border border-[#1f2b45]">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournament title or map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Mode */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Modes</option>
            <option value="Solo">Solo</option>
            <option value="Duo">Duo</option>
            <option value="Squad">Squad</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Live">Live</option>
            <option value="Closed">Closed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tourney) => {
          // Check registration count
          const tourneyRegs = registrations.filter(r => r.tournament_id === tourney.id);
          const activeRegs = tourneyRegs.filter(r => ['Pending', 'Approved'].includes(r.status));
          const slotsLeft = Math.max(0, tourney.max_teams - activeRegs.length);
          const percentFilled = Math.min(100, Math.round((activeRegs.length / tourney.max_teams) * 100));

          // Check if current team already registered
          const isUserRegistered = userTeam && tourneyRegs.some(r => r.team_id === userTeam.id);

          return (
            <div
              key={tourney.id}
              className="group gaming-card flex flex-col justify-between overflow-hidden"
            >
              {/* Card Banner Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={tourney.banner_url}
                  alt={tourney.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111726] via-black/40 to-transparent" />
                
                {/* Badges on Banner */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <StatusBadge status={tourney.status} />
                  <ModeBadge mode={tourney.mode} />
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {tourney.map}
                    </span>
                    <h3 className="text-lg font-bold text-white font-gaming leading-tight truncate">
                      {tourney.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0d121e] border border-[#1f2b45]/50">
                    <p className="text-slate-400 text-[10px] uppercase">Entry Fee</p>
                    <p className="text-sm font-bold text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {tourney.entry_fee === 0 ? 'FREE' : `${tourney.entry_fee} Coins`}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0d121e] border border-[#1f2b45]/50">
                    <p className="text-slate-400 text-[10px] uppercase">Prize Pool</p>
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      {tourney.prize_pool}
                    </p>
                  </div>
                </div>

                {/* Slots Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Slots:</span>
                    <span className="font-semibold text-slate-200">
                      {activeRegs.length} / {tourney.max_teams} Teams ({slotsLeft} Left)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentFilled >= 90 ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>

                {/* Match Time */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(tourney.start_time).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-[#1f2b45]/60">
                  <button
                    onClick={() => setSelectedTourney(tourney)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    Details & Rules
                  </button>

                  {isUserRegistered ? (
                    <button
                      onClick={() => navigate('/registrations')}
                      className="py-2 px-4 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition hover:bg-emerald-500/30"
                    >
                      ✓ Registered
                    </button>
                  ) : tourney.status === 'Open' && slotsLeft > 0 ? (
                    <button
                      onClick={() => handleJoinClick(tourney)}
                      className="py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black text-xs font-bold uppercase tracking-wider transition shadow-neon-cyan"
                    >
                      Join Tournament
                    </button>
                  ) : (
                    <button
                      disabled
                      className="py-2 px-4 rounded-lg bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                    >
                      {slotsLeft === 0 ? 'Full' : tourney.status}
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* TOURNAMENT DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTourney)}
        onClose={() => setSelectedTourney(null)}
        title={selectedTourney?.title || 'Tournament Details'}
      >
        {selectedTourney && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="relative h-48 rounded-xl overflow-hidden mb-4">
              <img
                src={selectedTourney.banner_url}
                alt={selectedTourney.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111726] to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#0d121e]">
                <p className="text-slate-500">Mode</p>
                <p className="font-bold text-white text-sm">{selectedTourney.mode}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d121e]">
                <p className="text-slate-500">Map</p>
                <p className="font-bold text-white text-sm">{selectedTourney.map}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d121e]">
                <p className="text-slate-500">Entry Fee</p>
                <p className="font-bold text-amber-400 text-sm">{selectedTourney.entry_fee} Coins</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d121e]">
                <p className="text-slate-500">Prize Pool</p>
                <p className="font-bold text-emerald-400 text-sm">{selectedTourney.prize_pool}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-gaming mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> Match Schedule & Timing
              </h4>
              <p className="text-xs text-slate-300 bg-[#0d121e] p-3 rounded-lg border border-[#1f2b45]">
                Starts at: {new Date(selectedTourney.start_time).toLocaleString()}
                <br />
                <span className="text-cyan-400 font-semibold">
                  Custom Room ID and Password will appear 15 minutes before match start in "My Registrations".
                </span>
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-gaming mb-2">Rules & Regulations</h4>
              <div className="bg-[#0d121e] p-3 rounded-lg border border-[#1f2b45] text-xs text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {selectedTourney.rules || 'Standard Free Fire competitive rules apply.'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* JOIN CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(joinModalTourney)}
        onClose={() => setJoinModalTourney(null)}
        title="Tournament Registration (Admin Approval Required)"
        maxWidth="max-w-md"
      >
        {joinModalTourney && (
          <div className="space-y-4">
            
            {joinSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
                  Registration Submitted!
                </div>
                <p className="leading-relaxed">
                  {joinSuccess}
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                  Redirecting to your registrations page...
                </div>
              </div>
            )}

            {joinError && (
              <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <p>{joinError}</p>
              </div>
            )}

            {!joinSuccess && (
              <>
                <div className="p-4 rounded-xl bg-[#0d121e] border border-[#1f2b45] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tournament:</span>
                    <span className="font-bold text-white">{joinModalTourney.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Game Mode:</span>
                    <span className="font-semibold text-cyan-400">{joinModalTourney.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Map:</span>
                    <span className="font-semibold text-slate-300">{joinModalTourney.map}</span>
                  </div>
                  <div className="border-t border-[#1f2b45] pt-2 flex justify-between">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="font-bold text-amber-400">{joinModalTourney.entry_fee} Coins</span>
                  </div>
                </div>

                {/* If user does not have a team yet, show quick 1-step team inputs */}
                {!userTeam ? (
                  <div className="p-4 rounded-xl bg-[#111726] border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Quick Squad Entry (Takes 10 Seconds)
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Squad / Team Name *
                      </label>
                      <input
                        type="text"
                        value={quickTeamName}
                        onChange={(e) => setQuickTeamName(e.target.value)}
                        placeholder="e.g. Total Gaming Elite"
                        className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Captain Free Fire UID (Numbers only) *
                      </label>
                      <input
                        type="text"
                        value={quickFFUid}
                        onChange={(e) => setQuickFFUid(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 198273645"
                        className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        WhatsApp / Contact Phone
                      </label>
                      <input
                        type="text"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#111726] border border-slate-700/60 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Registering Team:</span>
                      <strong className="text-white text-sm">{userTeam.team_name}</strong>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">
                      Ready
                    </span>
                  </div>
                )}

                {/* Important Admin Approval Notice */}
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Admin Permission Required:
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    Once you submit, your request goes directly to the Tournament Administrator. When the Admin approves your squad, you are cleared to play and match room credentials will unlock for you!
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setJoinModalTourney(null)}
                    className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmJoin}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black text-xs font-bold uppercase transition shadow-neon-cyan"
                  >
                    Submit for Approval
                  </button>
                </div>
              </>
            )}

          </div>
        )}
      </Modal>

    </div>
  );
};
