import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Trophy, 
  CalendarCheck2, 
  Users, 
  Wallet, 
  MessageSquare,
  LayoutDashboard,
  FileCheck2,
  Swords
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const BottomNav = () => {
  const { isAdmin } = useAuth();
  const { registrations } = useData();

  const pendingCount = registrations.filter(r => r.status === 'Pending').length;

  const playerItems = [
    { label: 'Tourneys', to: '/', icon: Trophy, end: true },
    { label: 'My Regs', to: '/registrations', icon: CalendarCheck2 },
    { label: 'Team', to: '/team', icon: Users },
    { label: 'Wallet', to: '/wallet', icon: Wallet },
    { label: 'Chat', to: '/chat', icon: MessageSquare },
  ];

  const adminItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Tourneys', to: '/admin/tournaments', icon: Trophy },
    { label: 'Review', to: '/admin/registrations', icon: FileCheck2, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Matches', to: '/admin/matches', icon: Swords },
    { label: 'Chat', to: '/admin/chat', icon: MessageSquare },
  ];

  const items = isAdmin ? adminItems : playerItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d121e]/95 backdrop-blur-md border-t border-[#1f2b45] px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-semibold transition ${
                  isActive
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
