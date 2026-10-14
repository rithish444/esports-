import React, { useState } from 'react';
import { 
  Swords, 
  Plus, 
  Key, 
  Trophy, 
  Clock, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Crosshair,
  Save,
  BarChart2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Modal } from '../../components/common/Modal';

export const MatchManager = () => {
  const { 
    tournaments, 
    matches, 
    registrations, 
    teams, 
    createMatch, 
    updateMatch, 
    deleteMatch, 
    recordMatchResult, 
    getTournamentLeaderboard 
  } = useData();

  const [selectedTourneyId, setSelectedTourneyId] = useState(tournaments[0]?.id || '');
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  // Form states
  const [round, setRound] = useState('Match 1 - Bermuda');
  const [startTime, setStartTime] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  // Result entry modal
  const [scoreModalMatch, setScoreModalMatch] = useState(null);
  const [scoreEntries, setScoreEntries] = useState({});

  const tourneyMatches = matches.filter(m => m.tournament_id === selectedTourneyId);
  const approvedTeams = registrations
    .filter(r => r.tournament_id === selectedTourneyId && r.status === 'Approved')
    .map(r => teams.find(t => t.id === r.team_id))
    .filter(Boolean);

  const leaderboard = selectedTourneyId ? getTournamentLeaderboard(selectedTourneyId) : [];

  const handleOpenCreateMatch = () => {
    setEditingMatch(null);
    setRound(`Match ${tourneyMatches.length + 1} - Bermuda`);
    setStartTime(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    setRoomId(Math.floor(1000000 + Math.random() * 9000000).toString());
    setRoomPassword('FF' + Math.floor(100 + Math.random() * 900));
    setIsMatchModalOpen(true);
  };

  const handleOpenEditMatch = (m) => {
    setEditingMatch(m);
    setRound(m.round);
    setStartTime(new Date(m.start_time).toISOString().slice(0, 16));
    setRoomId(m.room_id || '');
    setRoomPassword(m.room_password || '');
    setIsMatchModalOpen(true);
  };

  const handleSaveMatch = (e) => {
    e.preventDefault();
    const data = {
      tournament_id: selectedTourneyId,
      round,
      start_time: new Date(startTime).toISOString(),
      room_id: roomId,
      room_password: roomPassword
    };

    if (editingMatch) {
      updateMatch(editingMatch.id, data);
    } else {
      createMatch(data);
    }
    setIsMatchModalOpen(false);
  };

  const handleOpenScoreModal = (match) => {
    setScoreModalMatch(match);
    // Initialize blank scores
    const initial = {};
    approvedTeams.forEach(t => {
      initial[t.id] = { placement: 1, kills: 0 };
    });
    setScoreEntries(initial);
  };

  const handleSaveScores = () => {
    if (!scoreModalMatch) return;
    Object.entries(scoreEntries).forEach(([teamId, stat]) => {
      recordMatchResult(scoreModalMatch.id, teamId, stat.placement, stat.kills);
    });
    setScoreModalMatch(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Swords className="w-7 h-7 text-cyan-400" />
            Matches, Room IDs & Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish custom room credentials, record match placements/kills, and auto-generate standings.
          </p>
        </div>

        {/* Tournament Selector & Add Match */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            className="flex-1 sm:w-56 px-3 py-2 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#111726] text-white">
                {t.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenCreateMatch}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-neon-orange flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> New Match
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Scheduled Match Rooms ({tourneyMatches.length})
        </h2>

        {tourneyMatches.length === 0 ? (
          <div className="gaming-card p-8 text-center text-xs text-slate-400">
            No matches created yet for this tournament. Click "+ New Match" above to set Room ID and password.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourneyMatches.map((m) => (
              <div key={m.id} className="gaming-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-base font-gaming">{m.round}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {new Date(m.start_time).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Credentials Box */}
                  <div className="p-3 rounded-lg bg-[#0d121e] border border-cyan-500/30 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 uppercase text-[10px]">Room ID:</span>
                      <span className="font-mono text-cyan-400 font-bold text-sm tracking-wider">
                        {m.room_id || 'Not Set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#1f2b45]">
                      <span className="text-slate-400 uppercase text-[10px]">Room Password:</span>
                      <span className="font-mono text-orange-400 font-bold text-sm tracking-wider">
                        {m.room_password || 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1f2b45]">
                  <button
                    onClick={() => handleOpenScoreModal(m)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Crosshair className="w-3.5 h-3.5" /> Enter Results
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditMatch(m)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="Edit Room"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMatch(m.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Generated Leaderboard Section */}
      <div className="gaming-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-gaming flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Live Auto-Calculated Leaderboard ({leaderboard.length} Ranked Teams)
          </h2>
          <span className="text-xs text-slate-400">Placement pts + 1pt/Kill</span>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No match scores submitted yet. Click "Enter Results" on any match card above to calculate points!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
                <tr>
                  <th className="py-2.5 px-4 w-16">Rank</th>
                  <th className="py-2.5 px-4">Team</th>
                  <th className="py-2.5 px-4 text-center">Matches</th>
                  <th className="py-2.5 px-4 text-center">Total Kills</th>
                  <th className="py-2.5 px-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2b45]/60">
                {leaderboard.map((st) => (
                  <tr key={st.team_id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-4 font-bold text-white">#{st.rank}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-200">{st.team_name}</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">{st.matches_played}</td>
                    <td className="py-2.5 px-4 text-center text-cyan-400 font-bold">{st.total_kills}</td>
                    <td className="py-2.5 px-4 text-right text-yellow-400 font-black text-sm">{st.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MATCH MODAL */}
      <Modal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title={editingMatch ? 'Edit Match Room' : 'Create Custom Match Room'}
      >
        <form onSubmit={handleSaveMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Match / Round Title
            </label>
            <input
              type="text"
              required
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="e.g. Round 1 - Bermuda"
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Match Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Room ID
              </label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 8492018"
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room Password
              </label>
              <input
                type="text"
                required
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="e.g. ARENA99"
                className="w-full px-3 py-2 bg-[#0d121e] border border-[#1f2b45] rounded-lg text-xs font-mono text-orange-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-[#0d121e] p-3 rounded-lg border border-[#1f2b45]">
            ⚡ <strong>Visibility Policy:</strong> These credentials will only be revealed to Approved teams, starting 15 minutes before match start.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsMatchModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs uppercase"
            >
              Save Match Room
            </button>
          </div>
        </form>
      </Modal>

      {/* SCORE ENTRY MODAL */}
      <Modal
        isOpen={Boolean(scoreModalMatch)}
        onClose={() => setScoreModalMatch(null)}
        title={`Enter Results: ${scoreModalMatch?.round}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter final placement rank (1st = 12pts, 2nd = 9pts, etc.) and kill count for each team. Points are calculated automatically.
          </p>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {approvedTeams.map((team) => (
              <div key={team.id} className="p-3 rounded-xl bg-[#0d121e] border border-[#1f2b45] flex items-center justify-between gap-4">
                <span className="font-bold text-white text-xs">{team.team_name}</span>
                
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase">Rank</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={scoreEntries[team.id]?.placement || 1}
                      onChange={(e) => setScoreEntries(prev => ({
                        ...prev,
                        [team.id]: { ...prev[team.id], placement: e.target.value }
                      }))}
                      className="w-16 px-2 py-1 bg-[#111726] border border-[#1f2b45] rounded text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block uppercase">Kills</label>
                    <input
                      type="number"
                      min="0"
                      value={scoreEntries[team.id]?.kills || 0}
                      onChange={(e) => setScoreEntries(prev => ({
                        ...prev,
                        [team.id]: { ...prev[team.id], kills: e.target.value }
                      }))}
                      className="w-16 px-2 py-1 bg-[#111726] border border-[#1f2b45] rounded text-xs text-cyan-300 font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setScoreModalMatch(null)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveScores}
              className="px-5 py-2 rounded-lg bg-cyan-400 text-black font-bold text-xs uppercase shadow-neon-cyan"
            >
              Calculate & Publish Scores
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
