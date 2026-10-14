import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  Gamepad2, 
  Coins, 
  Trophy, 
  CheckCircle,
  Clock 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const SettingsManager = () => {
  const { settings, setSettings, logActivity } = useData();

  const [siteName, setSiteName] = useState(settings?.site_name || 'Esports Arena');
  const [defaultCoins, setDefaultCoins] = useState(settings?.default_coins || 100);
  const [chatUnlockPolicy, setChatUnlockPolicy] = useState(settings?.chat_unlock_requirement || 'joined_tournament');
  const [roomMinutes, setRoomMinutes] = useState(settings?.room_visibility_minutes || 15);
  
  // Scoring points
  const [firstPts, setFirstPts] = useState(settings?.scoring?.[1] || 12);
  const [secondPts, setSecondPts] = useState(settings?.scoring?.[2] || 9);
  const [thirdPts, setThirdPts] = useState(settings?.scoring?.[3] || 8);
  const [killPts, setKillPts] = useState(settings?.scoring?.kill || 1);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...settings,
      site_name: siteName,
      default_coins: Number(defaultCoins),
      chat_unlock_requirement: chatUnlockPolicy,
      room_visibility_minutes: Number(roomMinutes),
      scoring: {
        ...settings?.scoring,
        1: Number(firstPts),
        2: Number(secondPts),
        3: Number(thirdPts),
        kill: Number(killPts)
      }
    };

    setSettings(updated);
    logActivity('settings_updated', 'Admin updated platform settings');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Settings className="w-7 h-7 text-cyan-400" />
            Platform & Tournament Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure default team coin grants, room unlock countdowns, and tournament point matrices.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Platform settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: General Branding & Economy */}
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-gaming flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            1. Brand Identity & Coin Economy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Portal Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Welcome Bonus Coins for New Teams
              </label>
              <input
                type="number"
                min="0"
                value={defaultCoins}
                onChange={(e) => setDefaultCoins(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Every newly created team automatically starts with this coin balance.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Match Security & Chat Policy */}
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-gaming flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            2. Match Credentials & Chat Security Policies
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room ID/Password Reveal Countdown (Minutes Prior)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={roomMinutes}
                onChange={(e) => setRoomMinutes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Currently set to {roomMinutes} minutes before scheduled match start.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Team Chat Unlock Requirement
              </label>
              <select
                value={chatUnlockPolicy}
                onChange={(e) => setChatUnlockPolicy(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="joined_tournament">Requires at least 1 tournament joined with coins</option>
                <option value="always_open">Always open for all teams</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Free Fire Scoring Matrix */}
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-base font-bold text-white font-gaming flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            3. Free Fire Official Scoring System
          </h2>

          <p className="text-xs text-slate-400">
            Define point allocations for placements and kills. Live leaderboard calculations will follow this table.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45]">
              <label className="block text-[10px] text-yellow-400 font-bold uppercase mb-1">1st Place (Booyah)</label>
              <input
                type="number"
                min="0"
                value={firstPts}
                onChange={(e) => setFirstPts(e.target.value)}
                className="w-full px-2 py-1 bg-[#111726] border border-[#1f2b45] rounded text-xs text-white font-bold"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45]">
              <label className="block text-[10px] text-slate-300 font-bold uppercase mb-1">2nd Place</label>
              <input
                type="number"
                min="0"
                value={secondPts}
                onChange={(e) => setSecondPts(e.target.value)}
                className="w-full px-2 py-1 bg-[#111726] border border-[#1f2b45] rounded text-xs text-white font-bold"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45]">
              <label className="block text-[10px] text-amber-500 font-bold uppercase mb-1">3rd Place</label>
              <input
                type="number"
                min="0"
                value={thirdPts}
                onChange={(e) => setThirdPts(e.target.value)}
                className="w-full px-2 py-1 bg-[#111726] border border-[#1f2b45] rounded text-xs text-white font-bold"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#0d121e] border border-cyan-500/30">
              <label className="block text-[10px] text-cyan-400 font-bold uppercase mb-1">Kill Points (Per Kill)</label>
              <input
                type="number"
                min="0"
                value={killPts}
                onChange={(e) => setKillPts(e.target.value)}
                className="w-full px-2 py-1 bg-[#111726] border border-cyan-500/40 rounded text-xs text-cyan-300 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold text-xs uppercase tracking-wider transition shadow-neon-cyan flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};
