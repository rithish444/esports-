import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Phone, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Gamepad2,
  Sparkles,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const MyTeam = () => {
  const { currentUser } = useAuth();
  const { 
    getUserTeam, 
    getTeamPlayers, 
    saveTeamWithPlayers 
  } = useData();

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const existingPlayers = userTeam ? getTeamPlayers(userTeam.id) : [];

  // Form states
  const [mode, setMode] = useState('Squad'); // Solo | Duo | Squad
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState('');
  const [playersList, setPlayersList] = useState([]);
  const [includeSubstitute, setIncludeSubstitute] = useState(false);

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from existing team if any
  useEffect(() => {
    if (userTeam) {
      setTeamName(userTeam.team_name);
      setPhone(userTeam.phone);

      if (existingPlayers.length > 0) {
        if (existingPlayers.length === 1) setMode('Solo');
        else if (existingPlayers.length === 2) setMode('Duo');
        else setMode('Squad');

        const hasSub = existingPlayers.some(p => p.is_substitute);
        setIncludeSubstitute(hasSub);
        setPlayersList(existingPlayers);
      }
    } else {
      // Default blank squad for new team
      resetPlayerFields('Squad', false);
    }
  }, [userTeam]);

  // Helper to construct player slots based on mode
  const resetPlayerFields = (selectedMode, hasSub) => {
    let count = 4;
    if (selectedMode === 'Solo') count = 1;
    if (selectedMode === 'Duo') count = 2;

    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: 'p-temp-' + i,
        player_name: i === 0 && currentUser ? currentUser.name : '',
        ff_name: '',
        ff_uid: '',
        is_captain: i === 0,
        is_substitute: false
      });
    }

    if (selectedMode === 'Squad' && hasSub) {
      list.push({
        id: 'p-temp-sub',
        player_name: '',
        ff_name: '',
        ff_uid: '',
        is_captain: false,
        is_substitute: true
      });
    }

    setPlayersList(list);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const hasSub = newMode === 'Squad' ? includeSubstitute : false;
    resetPlayerFields(newMode, hasSub);
  };

  const handleToggleSub = () => {
    const nextSub = !includeSubstitute;
    setIncludeSubstitute(nextSub);
    resetPlayerFields(mode, nextSub);
  };

  const updatePlayerField = (index, field, value) => {
    setPlayersList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      if (!teamName.trim()) {
        throw new Error('Please enter a unique Team Name');
      }

      if (!phone.trim()) {
        throw new Error('Please enter Captain contact / WhatsApp number for tournament coordination');
      }

      // Check all player fields
      playersList.forEach((p, idx) => {
        const label = p.is_captain 
          ? 'Captain (Player 1)' 
          : p.is_substitute 
            ? 'Substitute Player' 
            : `Player ${idx + 1}`;

        if (!p.player_name.trim()) throw new Error(`${label}: Real name is required.`);
        if (!p.ff_name.trim()) throw new Error(`${label}: Free Fire in-game name is required.`);
        if (!p.ff_uid.trim()) throw new Error(`${label}: Free Fire numeric UID is required.`);
        if (!/^\d+$/.test(p.ff_uid.trim())) {
          throw new Error(`${label}: Free Fire UID must be numbers only (e.g. 1092837461).`);
        }
      });

      saveTeamWithPlayers({
        teamName,
        phone,
        playerList: playersList,
        existingTeamId: userTeam?.id
      });

      setFormSuccess('Team details and player roster saved successfully!');
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            {userTeam ? 'Manage Team Roster' : 'Register Free Fire Team'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your squad names, captain details, and Free Fire numeric UIDs.
          </p>
        </div>

        {userTeam && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Team Active
          </span>
        )}
      </div>

      {formSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs sm:text-sm text-rose-300 flex items-center gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Team Info */}
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
            <span className="w-2 h-4 bg-cyan-400 rounded-sm"></span>
            1. Team Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Team Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Total Gaming Elite, Team Hydra"
                className="w-full px-3.5 py-2.5 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">Must be unique across all tournaments.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Captain Phone / WhatsApp <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Used by organizers for match callouts.</p>
            </div>
          </div>
        </div>

        {/* Step 2: Mode Selector */}
        <div className="gaming-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
              <span className="w-2 h-4 bg-cyan-400 rounded-sm"></span>
              2. Tournament Mode & Roster Size
            </h2>
            <span className="text-xs text-slate-400">Player fields adjust automatically</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Solo', 'Duo', 'Squad'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeChange(m)}
                className={`py-3 px-4 rounded-xl border text-center font-gaming text-base sm:text-lg font-bold transition ${
                  mode === m
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan/50'
                    : 'bg-[#0d121e] border-[#1f2b45] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {m}
                <span className="block text-[10px] font-sans font-normal text-slate-400">
                  {m === 'Solo' ? '1 Player' : m === 'Duo' ? '2 Players' : '4 Players'}
                </span>
              </button>
            ))}
          </div>

          {mode === 'Squad' && (
            <div className="pt-2 flex items-center justify-between border-t border-[#1f2b45]/50">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Include Substitute Player (5th Player)?</span>
                <p className="text-[11px] text-slate-400">Optional substitute player for emergency rotation</p>
              </div>
              <button
                type="button"
                onClick={handleToggleSub}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  includeSubstitute
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {includeSubstitute ? '✓ Substitute Enabled' : '+ Add Substitute'}
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Players Dynamic List */}
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
            <span className="w-2 h-4 bg-cyan-400 rounded-sm"></span>
            3. Player Roster & Free Fire In-Game Details
          </h2>

          <div className="space-y-4">
            {playersList.map((player, idx) => (
              <div
                key={player.id || idx}
                className={`p-4 rounded-xl border space-y-3 transition ${
                  player.is_captain
                    ? 'bg-[#141b2c] border-cyan-500/40'
                    : player.is_substitute
                      ? 'bg-[#181524] border-purple-500/40'
                      : 'bg-[#0d121e] border-[#1f2b45]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                    {player.is_captain ? (
                      <span className="text-cyan-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" /> Player 1 (Captain)
                      </span>
                    ) : player.is_substitute ? (
                      <span className="text-purple-400 flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Substitute Player
                      </span>
                    ) : (
                      <span className="text-slate-300">Player {idx + 1}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Full Real Name
                    </label>
                    <input
                      type="text"
                      required
                      value={player.player_name}
                      onChange={(e) => updatePlayerField(idx, 'player_name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-[#090d16] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Free Fire In-Game Name (IGN)
                    </label>
                    <input
                      type="text"
                      required
                      value={player.ff_name}
                      onChange={(e) => updatePlayerField(idx, 'ff_name', e.target.value)}
                      placeholder="e.g. HYD_SkyL0rd"
                      className="w-full px-3 py-2 bg-[#090d16] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Free Fire UID (Numeric Only)
                    </label>
                    <input
                      type="text"
                      required
                      value={player.ff_uid}
                      onChange={(e) => updatePlayerField(idx, 'ff_uid', e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1092837461"
                      className="w-full px-3 py-2 bg-[#090d16] border border-[#1f2b45] rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold text-sm tracking-wide uppercase transition shadow-neon-cyan flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {userTeam ? 'Update Team & Players' : 'Save & Register Team'}
          </button>
        </div>

      </form>
    </div>
  );
};
