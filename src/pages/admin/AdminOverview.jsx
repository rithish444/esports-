import React from 'react';
import { 
  Trophy, 
  Users, 
  FileCheck2, 
  Coins, 
  Swords, 
  Activity, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';

export const AdminOverview = () => {
  const { 
    tournaments, 
    teams, 
    players, 
    registrations, 
    transactions, 
    activityLog, 
    matches 
  } = useData();
  const navigate = useNavigate();

  // Statistics
  const upcomingCount = tournaments.filter(t => t.status === 'Open').length;
  const liveCount = tournaments.filter(t => t.status === 'Live').length;
  const completedCount = tournaments.filter(t => t.status === 'Completed').length;
  
  const pendingApprovals = registrations.filter(r => r.status === 'Pending').length;

  // Total revenue collected (only entry fee debits)
  const totalRevenueCoins = registrations
    .filter(r => r.payment_status === 'Paid')
    .reduce((acc, r) => acc + (Number(r.coins_paid) || 0), 0);

  // Today's matches
  const today = new Date().toDateString();
  const todayMatchesCount = matches.filter(m => new Date(m.start_time).toDateString() === today).length;

  // Chart 1: Registrations per tournament
  const regChartData = tournaments.map(t => {
    const count = registrations.filter(r => r.tournament_id === t.id && ['Pending', 'Approved'].includes(r.status)).length;
    return {
      name: t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title,
      teams: count,
      max: t.max_teams
    };
  });

  // Chart 2: Coins collected over recent registrations
  const revenueChartData = registrations
    .filter(r => r.coins_paid > 0)
    .slice(-7)
    .map((r, i) => ({
      index: `Reg #${i + 1}`,
      coins: r.coins_paid
    }));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Admin Command Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-gaming tracking-wide uppercase">
            Overview & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time tournament metrics, player registrations, revenue coins, and match activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/tournaments"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-neon-orange flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Tournament
          </Link>
          <Link
            to="/admin/coins"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs uppercase transition border border-amber-500/30 flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4" /> Manage Coins
          </Link>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Tournaments */}
        <div className="gaming-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tournaments</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-gaming leading-none">
              {tournaments.length}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
              <span className="text-emerald-400">{upcomingCount} Open</span> • 
              <span className="text-rose-400">{liveCount} Live</span> • 
              <span className="text-blue-400">{completedCount} Done</span>
            </div>
          </div>
        </div>

        {/* Card 2: Registered Teams & Players */}
        <div className="gaming-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teams & Players</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-gaming leading-none">
              {teams.length} <span className="text-xs text-slate-400 font-normal font-sans">Teams</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {players.length} Total Verified Players
            </p>
          </div>
        </div>

        {/* Card 3: Pending Approvals (CLICKABLE) */}
        <div 
          onClick={() => navigate('/admin/registrations')}
          className="gaming-card p-5 space-y-3 cursor-pointer hover:border-amber-500/80 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Approvals</span>
            <FileCheck2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-3xl font-black text-amber-400 font-gaming leading-none">
              {pendingApprovals}
            </p>
            <p className="text-[11px] text-slate-400 mt-2 group-hover:text-amber-300 transition flex items-center gap-1">
              Click to review teams <ArrowRight className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Card 4: Total Revenue Coins */}
        <div className="gaming-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue (Coins)</span>
            <Coins className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-yellow-400 font-gaming leading-none">
              {totalRevenueCoins}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Collected from entry fees
            </p>
          </div>
        </div>

        {/* Card 5: Today's Matches */}
        <div className="gaming-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Matches</span>
            <Swords className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white font-gaming leading-none">
              {todayMatchesCount || matches.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {matches.length} Total custom rooms
            </p>
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Registrations per tournament */}
        <div className="gaming-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-gaming">
                Teams Registered Per Tournament
              </h3>
              <p className="text-[11px] text-slate-400">Slots taken vs capacity</p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1f2b45', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="teams" fill="#00f2fe" radius={[4, 4, 0, 0]} name="Registered Teams" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Coins collected */}
        <div className="gaming-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-gaming">
                Coin Entry Fee Stream
              </h3>
              <p className="text-[11px] text-slate-400">Coins collected from recent registrations</p>
            </div>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData.length > 0 ? revenueChartData : [{ index: 'Demo', coins: 100 }]}>
                <defs>
                  <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7700" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ff7700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111726', borderColor: '#1f2b45', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="coins" stroke="#ff7700" fillOpacity={1} fill="url(#colorCoins)" name="Coins Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY LOG FEED */}
      <div className="gaming-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-gaming">
              Live Activity Audit Feed
            </h3>
          </div>
          <span className="text-xs text-slate-400">Auto-logging all actions</span>
        </div>

        <div className="divide-y divide-[#1f2b45]/60 max-h-80 overflow-y-auto">
          {activityLog.slice(0, 8).map((act) => (
            <div key={act.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                <div>
                  <p className="text-slate-200 font-medium">{act.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono capitalize">Action: {act.action}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
