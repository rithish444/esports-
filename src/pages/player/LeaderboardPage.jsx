import React, { useState } from 'react';
import { 
  Trophy, 
  BarChart3, 
  Medal, 
  Crosshair, 
  Flame, 
  HelpCircle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const LeaderboardPage = () => {
  const { tournaments, getTournamentLeaderboard } = useData();

  const [selectedTourneyId, setSelectedTourneyId] = useState(
    tournaments[0]?.id || ''
  );

  const selectedTourney = tournaments.find(t => t.id === selectedTourneyId);
  const standings = selectedTourneyId ? getTournamentLeaderboard(selectedTourneyId) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header with Tournament Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Tournament Standings & Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time Free Fire match placement and kill point calculations.
          </p>
        </div>

        {/* Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#111726] text-white">
                {t.title} ({t.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scoring Legend Card */}
      <div className="p-4 rounded-xl bg-[#111726] border border-[#1f2b45] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-white">Free Fire Official Scoring:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-yellow-300">1st: 12 pts</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">2nd: 9 pts</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-500">3rd: 8 pts</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">4th: 7 pts</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800">
            +1 Point per Kill
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {standings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standings.slice(0, 3).map((team, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            return (
              <div
                key={team.team_id}
                className={`gaming-card p-5 text-center relative overflow-hidden ${
                  isFirst 
                    ? 'border-yellow-500/50 bg-gradient-to-b from-[#1a1c22] to-[#111726]' 
                    : isSecond 
                      ? 'border-slate-400/30' 
                      : 'border-amber-700/30'
                }`}
              >
                <div className="text-3xl mb-2">
                  {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                </div>
                <h3 className="font-bold text-base text-white font-gaming tracking-wide">
                  {team.team_name}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Rank #{team.rank}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#1f2b45]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Kills</span>
                    <span className="font-bold text-cyan-400 text-sm flex items-center justify-center gap-1">
                      <Crosshair className="w-3 h-3" /> {team.total_kills}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Points</span>
                    <span className="font-bold text-yellow-400 text-sm">
                      {team.total_points} PTS
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standings Table */}
      <div className="gaming-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-gaming">
            Overall Standings ({standings.length} Teams)
          </h2>
        </div>

        {standings.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No match results recorded yet for this tournament.
            <br />
            Once matches finish and Admin enters placements & kills, the leaderboard will update automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0d121e] text-[10px] uppercase font-bold text-slate-400 border-b border-[#1f2b45]">
                <tr>
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-center">Matches</th>
                  <th className="py-3 px-4 text-center">Best Rank</th>
                  <th className="py-3 px-4 text-center">Total Kills</th>
                  <th className="py-3 px-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2b45]/60">
                {standings.map((st) => (
                  <tr key={st.team_id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 font-bold font-gaming text-sm">
                      {st.rank === 1 ? '🥇 #1' : st.rank === 2 ? '🥈 #2' : st.rank === 3 ? '🥉 #3' : `#${st.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {st.team_name}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {st.matches_played}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-semibold">
                      #{st.best_placement}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-cyan-400">
                      {st.total_kills}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-sm text-yellow-400">
                      {st.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
