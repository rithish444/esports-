import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  Key, 
  Copy, 
  Check, 
  Clock, 
  ShieldAlert, 
  Coins, 
  ExternalLink,
  Lock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { RegStatusBadge, ModeBadge } from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const MyRegistrations = () => {
  const { currentUser } = useAuth();
  const { registrations, tournaments, matches, getUserTeam, settings } = useData();

  const [copiedKey, setCopiedKey] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every 10 seconds for 15-minute room reveal checking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const myRegistrations = userTeam 
    ? registrations.filter(r => r.team_id === userTeam.id)
    : [];

  const handleCopy = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const roomVisibilityMinutes = settings?.room_visibility_minutes || 15;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-cyan-400" />
            My Registrations & Match Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your tournament review status, view room credentials, and check match schedules.
          </p>
        </div>

        {userTeam && (
          <div className="px-3.5 py-1.5 rounded-xl bg-[#111726] border border-[#1f2b45] text-xs">
            <span className="text-slate-400">Team: </span>
            <span className="font-bold text-cyan-400">{userTeam.team_name}</span>
          </div>
        )}
      </div>

      {!userTeam ? (
        <div className="p-8 rounded-2xl bg-[#111726] border border-[#1f2b45] text-center space-y-3">
          <p className="text-slate-300 font-semibold">You have not registered a team yet.</p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black font-bold text-xs uppercase"
          >
            Create Team Profile First
          </Link>
        </div>
      ) : myRegistrations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111726] border border-[#1f2b45] text-center space-y-3">
          <CalendarCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-gaming">No Registered Tournaments</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You haven't registered your team for any tournaments yet. Check out open tournaments on the home page to join!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-black font-bold text-xs uppercase transition shadow-neon-cyan"
          >
            Browse Open Tournaments
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myRegistrations.map((reg) => {
            const tourney = tournaments.find(t => t.id === reg.tournament_id);
            const tourneyMatches = matches.filter(m => m.tournament_id === reg.tournament_id);

            return (
              <div
                key={reg.id}
                className="gaming-card p-5 sm:p-6 space-y-4"
              >
                {/* Top Row: Tournament info & status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1f2b45] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white font-gaming">
                        {tourney?.title || 'Tournament'}
                      </h3>
                      {tourney && <ModeBadge mode={tourney.mode} />}
                    </div>
                    <p className="text-xs text-slate-400">
                      Map: <span className="text-slate-200">{tourney?.map}</span> • Registered on {new Date(reg.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Fee Paid:</span>
                      <span className="font-bold text-amber-400">{reg.coins_paid} Coins</span>
                    </div>
                    <RegStatusBadge status={reg.status} />
                  </div>
                </div>

                {/* Status Specific Notice */}
                {reg.status === 'Pending' && (
                  <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold text-amber-300 text-sm">⏳ Awaiting Permission from Administrator</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Your registration has been received! The tournament admin must review and grant permission for your squad before you can enter the match. Once approved, you will be cleared to play and match rooms will unlock below.
                      </p>
                    </div>
                  </div>
                )}

                {reg.status === 'Approved' && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-300 text-sm">✅ Approved by Admin — You Are Cleared to Play!</p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Your squad registration has been verified and approved by the administrator. Check the match schedule below to copy your custom Room ID and Password before match start!
                      </p>
                    </div>
                  </div>
                )}

                {reg.status === 'Rejected' && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Registration Declined by Admin</p>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">
                        Payment status: <strong className="uppercase">{reg.payment_status}</strong>. {reg.payment_status === 'Refunded' ? `${reg.coins_paid} coins were refunded back to your wallet.` : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Match Room Details (Visible for Approved teams) */}
                {reg.status === 'Approved' && (
                  <div className="space-y-3 pt-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-cyan-400" /> Custom Match Rooms
                    </h4>

                    {tourneyMatches.length === 0 ? (
                      <p className="text-xs text-slate-500 italic bg-[#0d121e] p-3 rounded-lg">
                        Admin has not created the match room yet. Check back closer to tournament time.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tourneyMatches.map((match) => {
                          const matchTime = new Date(match.start_time);
                          const diffMinutes = (matchTime.getTime() - currentTime.getTime()) / (1000 * 60);
                          
                          // Rule: room ID & password visible 15 minutes prior to match or if match is past/live
                          const isTimeUnlocked = diffMinutes <= roomVisibilityMinutes;

                          return (
                            <div
                              key={match.id}
                              className="p-4 rounded-xl bg-[#0d121e] border border-[#1f2b45] space-y-3"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white font-gaming text-sm">{match.round}</span>
                                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                                  <Clock className="w-3 h-3" />
                                  {matchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {isTimeUnlocked ? (
                                <div className="space-y-2 bg-[#111726] p-3 rounded-lg border border-cyan-500/30">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-[10px] text-slate-400 uppercase">Room ID</p>
                                      <p className="font-mono text-base font-bold text-cyan-400 tracking-wider">
                                        {match.room_id || 'Generating...'}
                                      </p>
                                    </div>
                                    {match.room_id && (
                                      <button
                                        onClick={() => handleCopy(match.room_id, `room-${match.id}`)}
                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                                        title="Copy Room ID"
                                      >
                                        {copiedKey === `room-${match.id}` ? (
                                          <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-[#1f2b45]">
                                    <div>
                                      <p className="text-[10px] text-slate-400 uppercase">Room Password</p>
                                      <p className="font-mono text-base font-bold text-orange-400 tracking-wider">
                                        {match.room_password || 'Pending'}
                                      </p>
                                    </div>
                                    {match.room_password && (
                                      <button
                                        onClick={() => handleCopy(match.room_password, `pass-${match.id}`)}
                                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                                        title="Copy Password"
                                      >
                                        {copiedKey === `pass-${match.id}` ? (
                                          <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                                  <Lock className="w-4 h-4 text-slate-500 mx-auto" />
                                  <p className="text-xs font-semibold text-slate-300">Room Credentials Locked</p>
                                  <p className="text-[11px] text-slate-500">
                                    Will unlock automatically {roomVisibilityMinutes} minutes before match start (~{Math.max(1, Math.round(diffMinutes))} mins remaining).
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
