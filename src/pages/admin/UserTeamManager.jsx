import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  Coins, 
  MessageSquare, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Eye,
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { INITIAL_PROFILES } from '../../data/seedData';

export const UserTeamManager = () => {
  const { currentUser } = useAuth();
  const { 
    teams, 
    players, 
    wallets, 
    getTeamWallet, 
    toggleTeamChatLock 
  } = useData();

  const [usersList, setUsersList] = useState(INITIAL_PROFILES || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'users'
  const [inspectTeam, setInspectTeam] = useState(null);

  // Load verified user accounts from Supabase profiles table
  useEffect(() => {
    let isMounted = true;
    const loadProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, role, is_banned, created_at');
        if (!error && data && data.length > 0 && isMounted) {
          setUsersList(data);
        }
      } catch (e) {
        console.error('Error loading profiles:', e);
      }
    };
    loadProfiles();
    return () => { isMounted = false; };
  }, []);

  const banUser = async (userId, banned) => {
    try {
      await supabase.from('profiles').update({ is_banned: banned }).eq('id', userId);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_banned: banned } : u));
    } catch (e) {
      console.error('Error updating ban status:', e);
    }
  };

  const filteredTeams = (teams || []).filter(t => 
    (t.team_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.phone || '').includes(searchQuery)
  );

  const filteredUsers = (usersList || []).filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-400" />
            Teams & User Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View rosters, audit wallet balances, toggle chat permissions, or suspend bad actors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#111726] p-1 rounded-xl border border-[#1f2b45]">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'teams'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered Teams ({filteredTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'users'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Accounts ({filteredUsers.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by team name, player name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* TAB 1: TEAMS TABLE */}
      {activeTab === 'teams' && (
        <div className="gaming-card overflow-hidden">
          {filteredTeams.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-300">No Teams Found</p>
              <p className="text-xs text-slate-500 mt-1">Teams will show up here once players register their Free Fire squads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
                  <tr>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Captain Phone</th>
                    <th className="py-3 px-4">Players</th>
                    <th className="py-3 px-4">Wallet Balance</th>
                    <th className="py-3 px-4">Chat Lock Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2b45]/60">
                  {filteredTeams.map((team) => {
                    const teamPlayers = (players || []).filter(p => p.team_id === team.id);
                    const bal = getTeamWallet(team.id);

                    return (
                      <tr key={team.id} className="hover:bg-slate-800/20">
                        <td className="py-3.5 px-4 font-bold text-white text-sm">
                          {team.team_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {team.phone || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-semibold text-[11px]">
                            {teamPlayers.length} Members
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          {bal} Coins
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleTeamChatLock(team.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                              team.chat_unlocked
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                            }`}
                            title="Click to toggle chat lock for this team"
                          >
                            {team.chat_unlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {team.chat_unlocked ? 'Unlocked' : 'Locked'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setInspectTeam({ team, players: teamPlayers })}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            View Roster
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="gaming-card overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-300">No User Accounts Found</p>
              <p className="text-xs text-slate-500 mt-1">Registered players and administrators will show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2b45]/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20">
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        {u.name || u.email?.split('@')[0] || 'User'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {u.role || 'player'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_banned ? (
                          <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5" /> Suspended
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => banUser(u.id, !u.is_banned)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              u.is_banned
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                            }`}
                          >
                            {u.is_banned ? 'Unban Account' : 'Suspend / Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ROSTER MODAL */}
      <Modal
        isOpen={Boolean(inspectTeam)}
        onClose={() => setInspectTeam(null)}
        title={`Roster Details: ${inspectTeam?.team?.team_name}`}
      >
        {inspectTeam && (
          <div className="space-y-4 text-xs text-slate-300">
            <p className="text-slate-400">
              Captain Contact Phone: <strong className="text-white">{inspectTeam.team.phone}</strong>
            </p>
            <div className="space-y-2">
              {inspectTeam.players.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-[#0d121e] border border-[#1f2b45] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">
                      {p.player_name} {p.is_captain && '👑 (Captain)'} {p.is_substitute && '🔄 (Sub)'}
                    </span>
                    <p className="text-slate-400">IGN: <strong className="text-slate-200">{p.ff_name}</strong></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Free Fire UID</span>
                    <span className="font-mono text-cyan-400 font-bold">{p.ff_uid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
