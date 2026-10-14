import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  FileCheck2, 
  Swords, 
  Coins, 
  MessageSquare, 
  Settings, 
  Wallet, 
  BarChart3,
  CalendarCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { registrations, messages } = useData();

  // Pending registrations count for Admin badge
  const pendingCount = registrations.filter(r => r.status === 'Pending').length;

  const adminNav = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Tournaments', to: '/admin/tournaments', icon: Trophy },
    { 
      label: 'Registrations', 
      to: '/admin/registrations', 
      icon: FileCheck2, 
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { label: 'Matches & Results', to: '/admin/matches', icon: Swords },
    { label: 'Teams & Users', to: '/admin/teams', icon: Users },
    { label: 'Coin Management', to: '/admin/coins', icon: Coins },
    { label: 'General Chat & Inbox', to: '/admin/chat', icon: MessageSquare },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const playerNav = [
    { label: 'Tournaments', to: '/', icon: Trophy, end: true },
    { label: 'My Registrations', to: '/registrations', icon: CalendarCheck2 },
    { label: 'Leaderboard', to: '/leaderboard', icon: BarChart3 },
    { label: 'My Team', to: '/team', icon: Users },
    { label: 'Coin Wallet', to: '/wallet', icon: Wallet },
    { label: 'General Chat', to: '/chat', icon: MessageSquare },
  ];

  const items = isAdmin ? adminNav : playerNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0d121e]/80 border-r border-[#1f2b45] p-4 min-h-[calc(100vh-65px)]">
      <div className="mb-4 px-3 py-2">
        <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
          {isAdmin ? 'Administration Portal' : 'Player Navigation'}
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-neon-cyan/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Helpful Free Fire Notice */}
      <div className="p-3.5 rounded-xl bg-[#111726] border border-[#1f2b45] text-xs text-slate-400">
        <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Esports Arena v1.0
        </p>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Official Free Fire competitive platform. Instant rooms, verified teams & live leaderboards.
        </p>
      </div>
    </aside>
  );
};
