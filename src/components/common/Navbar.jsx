import React, { useState, useRef, useEffect } from 'react';
import { 
  Trophy, 
  Coins, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { getUserTeam, getTeamWallet, notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const coinBalance = userTeam ? getTeamWallet(userTeam.id) : (currentUser ? getTeamWallet(currentUser.id) : 0);

  // Filter notifications for current user (or admin)
  const myNotifications = notifications.filter(
    n => isAdmin || n.user_id === currentUser?.id
  );
  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d121e]/90 backdrop-blur-md border-b border-[#1f2b45] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-gaming text-2xl font-black tracking-wider text-white">
                ESPORTS<span className="text-cyan-400">ARENA</span>
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider -mt-1 uppercase hidden sm:block">
              Free Fire Competitive Hub
            </p>
          </div>
        </Link>

        {/* Right: Controls (Coins, Notifs, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Player Coin Balance */}
          {!isAdmin && (
            <Link 
              to="/wallet" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition group"
              title="Click to view Wallet"
            >
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="text-right">
                <span className="text-xs text-slate-400 hidden sm:inline mr-1">Wallet:</span>
                <span className="font-bold text-amber-400 text-sm">{coinBalance}</span>
                <span className="text-[10px] text-amber-400/80 ml-1">Coins</span>
              </div>
            </Link>
          )}


          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg bg-[#111726] border border-[#1f2b45] text-slate-300 hover:text-white hover:border-cyan-500/50 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111726] border border-[#1f2b45] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2b45] bg-[#0d121e]">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#1f2b45]/50">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    myNotifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/40 ${!n.is_read ? 'bg-cyan-950/20' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#111726] border border-[#1f2b45] hover:border-slate-600 transition"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-white leading-none">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111726] border border-[#1f2b45] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1f2b45]">
                <div className="p-3 bg-[#0d121e]">
                  <p className="text-xs font-bold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Role: {currentUser?.role}
                  </span>
                </div>

                <div className="p-1">
                  {!isAdmin && (
                    <>
                      <Link
                        to="/team"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        My Team Profile
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                      >
                        <Coins className="w-4 h-4 text-amber-400" />
                        Coin Wallet
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Platform Settings
                    </Link>
                  )}
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
