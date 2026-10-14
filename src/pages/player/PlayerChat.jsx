import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Pin, 
  Lock, 
  ShieldCheck, 
  Megaphone, 
  Sparkles,
  User,
  ArrowRight,
  Smile,
  Reply,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';

const REACTION_EMOJIS = ['🔥', '🏆', '👍', '🎯', '❤️', '⚡', '👏', '🎮'];

export const PlayerChat = () => {
  const { currentUser, isAdmin } = useAuth();
  const { 
    messages, 
    sendMessage, 
    reactToMessage,
    togglePinMessage,
    deleteMessage,
    getUserTeam 
  } = useData();

  const [activeTab, setActiveTab] = useState('announcements'); // 'announcements' | 'team_admin'
  const [inputText, setInputText] = useState('');
  
  // Admin inline composer & reply state (for when Admin views this channel)
  const [adminBroadcastText, setAdminBroadcastText] = useState('');
  const [adminIsPinned, setAdminIsPinned] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // message object or null
  
  const chatBottomRef = useRef(null);

  const userTeam = currentUser ? getUserTeam(currentUser.id) : null;
  const isChatUnlocked = userTeam ? Boolean(userTeam.chat_unlocked) : false;

  // Auto scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Messages for Announcements
  const announcementMessages = messages.filter(m => m.channel_type === 'general');
  const pinnedAnnouncements = announcementMessages.filter(m => m.is_pinned);
  const normalAnnouncements = announcementMessages.filter(m => !m.is_pinned);

  // Messages for Private Team Chat
  const teamMessages = userTeam 
    ? messages.filter(m => m.channel_type === 'team' && m.team_id === userTeam.id)
    : [];

  const handleSendTeamMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !userTeam) return;

    sendMessage('team', userTeam.id, inputText);
    setInputText('');
  };

  const handleAdminBroadcast = (e) => {
    e.preventDefault();
    if (!adminBroadcastText.trim()) return;

    sendMessage(
      'general',
      null,
      adminBroadcastText,
      adminIsPinned,
      replyingTo ? replyingTo.id : null
    );

    setAdminBroadcastText('');
    setAdminIsPinned(false);
    setReplyingTo(null);
  };

  // Helper: check if a user has reacted with an emoji
  const hasUserReacted = (reactions, emoji) => {
    if (!reactions || !reactions[emoji] || !currentUser) return false;
    const list = reactions[emoji];
    return list.some(r => (typeof r === 'string' ? r === currentUser.id : r?.userId === currentUser.id));
  };

  // Helper: get tooltip string of user names who reacted
  const getReactionNames = (reactions, emoji) => {
    if (!reactions || !reactions[emoji]) return '';
    const list = reactions[emoji];
    const names = list.map(r => {
      if (typeof r === 'string') {
        return r === currentUser?.id ? 'You' : 'Player';
      }
      return r.userId === currentUser?.id ? 'You' : (r.userName || 'Player');
    });
    return names.join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-cyan-400" />
            General Chat & Communications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Live tournament updates, official broadcast notices, and direct admin assistance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#111726] p-1 rounded-xl border border-[#1f2b45] w-full sm:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
            General Chat
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">
              {announcementMessages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('team_admin')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'team_admin'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {!isChatUnlocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            Private Team Chat
          </button>
        </div>
      </div>

      {/* TAB 1: GENERAL CHAT (BROADCAST & REACTIONS) */}
      {activeTab === 'announcements' && (
        <div className="gaming-card flex flex-col h-[700px] overflow-hidden border border-[#1f2b45] shadow-2xl relative">
          
          {/* Header Banner */}
          <div className="px-6 py-4 bg-[#0d121e]/90 border-b border-[#1f2b45] flex items-center justify-between backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-neon-cyan/20">
                <Megaphone className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-gaming flex items-center gap-2">
                  General Information Stream
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Broadcast notices for all registered players & teams • Tap emojis below to react!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Live Feed
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            
            {announcementMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Megaphone className="w-7 h-7 text-cyan-400" />
                </div>
                <h4 className="text-sm font-bold text-white font-gaming">No Announcements Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Tournament organizers will post match schedules, room credentials, and alerts right here.
                </p>
              </div>
            ) : (
              <>
                {/* Pinned Messages Section */}
                {pinnedAnnouncements.length > 0 && (
                  <div className="space-y-3 pb-2">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      <Pin className="w-3.5 h-3.5" /> Pinned Announcements
                    </div>
                    {pinnedAnnouncements.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900/60 border border-amber-500/40 space-y-3 shadow-lg hover:border-amber-400/60 transition group"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                              🛡️
                            </span>
                            <span className="text-xs font-bold text-amber-300 font-gaming">
                              {msg.sender_name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Organizer
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>

                        {/* Quoted reply if replying */}
                        {msg.reply_snippet && (
                          <div className="p-2.5 rounded-lg bg-[#0d121e]/90 border-l-2 border-cyan-400 text-xs text-slate-300 space-y-0.5">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                              <Reply className="w-3 h-3" /> In reply to {msg.reply_snippet.sender_name}:
                            </span>
                            <p className="italic text-slate-400 line-clamp-2">"{msg.reply_snippet.body}"</p>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal whitespace-pre-wrap">
                          {msg.body}
                        </p>

                        {/* Reactions Bar */}
                        <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Existing Reactions */}
                            {Object.entries(msg.reactions || {}).map(([emoji, list]) => {
                              const count = Array.isArray(list) ? list.length : 0;
                              if (count === 0) return null;
                              const isReacted = hasUserReacted(msg.reactions, emoji);
                              const tooltip = getReactionNames(msg.reactions, emoji);

                              return (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(msg.id, emoji)}
                                  title={tooltip ? `Reacted by: ${tooltip}` : ''}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition transform active:scale-95 ${
                                    isReacted
                                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400 shadow-neon-amber ring-1 ring-amber-400/40'
                                      : 'bg-[#0d121e] text-slate-300 border border-[#1f2b45] hover:border-amber-400/50 hover:bg-amber-500/10'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[11px]">{count}</span>
                                </button>
                              );
                            })}

                            {/* Quick React Palette */}
                            <div className="flex items-center gap-0.5 bg-[#0a0d14]/70 p-1 rounded-full border border-amber-500/20">
                              {REACTION_EMOJIS.map((emoji) => {
                                const isReacted = hasUserReacted(msg.reactions, emoji);
                                return (
                                  <button
                                    key={emoji}
                                    onClick={() => reactToMessage(msg.id, emoji)}
                                    title={`React with ${emoji}`}
                                    className={`w-6 h-6 flex items-center justify-center rounded-full text-xs hover:scale-125 transition ${
                                      isReacted ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'hover:bg-amber-500/10'
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Admin Reply Action */}
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setReplyingTo(msg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold transition"
                              >
                                <Reply className="w-3 h-3" /> Reply
                              </button>
                              <button
                                onClick={() => togglePinMessage(msg.id)}
                                title="Unpin Announcement"
                                className="text-amber-400 hover:text-amber-300 text-xs p-1"
                              >
                                <Pin className="w-3.5 h-3.5 fill-amber-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Normal Announcements Section */}
                <div className="space-y-3">
                  {pinnedAnnouncements.length > 0 && normalAnnouncements.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-400 uppercase tracking-wider pt-2">
                      <Megaphone className="w-3.5 h-3.5" /> Recent Announcements
                    </div>
                  )}

                  {normalAnnouncements.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0d121e] border border-[#1f2b45] space-y-3 shadow-md hover:border-cyan-500/40 transition group"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#1f2b45]/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs font-bold">
                            🛡️
                          </span>
                          <span className="text-xs font-bold text-white font-gaming">
                            {msg.sender_name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Organizer
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(msg.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Quoted reply if replying */}
                      {msg.reply_snippet && (
                        <div className="p-2.5 rounded-lg bg-[#111726] border-l-2 border-cyan-400 text-xs text-slate-300 space-y-0.5">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1">
                            <Reply className="w-3 h-3" /> In reply to {msg.reply_snippet.sender_name}:
                          </span>
                          <p className="italic text-slate-400 line-clamp-2">"{msg.reply_snippet.body}"</p>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                        {msg.body}
                      </p>

                      {/* Reactions Bar */}
                      <div className="pt-2 border-t border-[#1f2b45]/50 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Existing Reactions */}
                          {Object.entries(msg.reactions || {}).map(([emoji, list]) => {
                            const count = Array.isArray(list) ? list.length : 0;
                            if (count === 0) return null;
                            const isReacted = hasUserReacted(msg.reactions, emoji);
                            const tooltip = getReactionNames(msg.reactions, emoji);

                            return (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg.id, emoji)}
                                title={tooltip ? `Reacted by: ${tooltip}` : ''}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition transform active:scale-95 ${
                                  isReacted
                                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-neon-cyan/40 ring-1 ring-cyan-400/50'
                                    : 'bg-[#111726] text-slate-300 border border-[#1f2b45] hover:border-cyan-400/50 hover:bg-cyan-500/10'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[11px]">{count}</span>
                              </button>
                            );
                          })}

                          {/* Quick React Palette */}
                          <div className="flex items-center gap-0.5 bg-[#070a10]/80 p-1 rounded-full border border-[#1f2b45]">
                            {REACTION_EMOJIS.map((emoji) => {
                              const isReacted = hasUserReacted(msg.reactions, emoji);
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(msg.id, emoji)}
                                  title={`React with ${emoji}`}
                                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs hover:scale-125 transition ${
                                    isReacted ? 'bg-cyan-500/30 ring-1 ring-cyan-400' : 'hover:bg-cyan-500/10'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Admin Action Bar */}
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold transition"
                            >
                              <Reply className="w-3 h-3" /> Reply
                            </button>
                            <button
                              onClick={() => togglePinMessage(msg.id)}
                              title="Pin to top"
                              className="text-slate-400 hover:text-amber-400 text-xs p-1"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              title="Delete message"
                              className="text-slate-400 hover:text-red-400 text-xs p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* FOOTER: STRICT PERMISSION ENFORCEMENT */}
          {isAdmin ? (
            /* Admin Composer (Only Admin can post or reply) */
            <div className="p-4 bg-[#0d121e] border-t border-[#1f2b45] space-y-3 z-10">
              {replyingTo && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Reply className="w-3.5 h-3.5" />
                    <span>Replying to <strong>{replyingTo.sender_name}</strong>: "{replyingTo.body.substring(0, 50)}..."</span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleAdminBroadcast} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={adminBroadcastText}
                    onChange={(e) => setAdminBroadcastText(e.target.value)}
                    placeholder={replyingTo ? "Type your official reply to this update..." : "Post official tournament announcement to all players..."}
                    className="flex-1 px-4 py-2.5 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={!adminBroadcastText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition shadow-neon-cyan flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {replyingTo ? 'Send Reply' : 'Broadcast'}
                  </button>
                </div>

                {!replyingTo && (
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer self-start pl-1">
                    <input
                      type="checkbox"
                      checked={adminIsPinned}
                      onChange={(e) => setAdminIsPinned(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Pin className="w-3 h-3" /> Pin this announcement to top
                    </span>
                  </label>
                )}
              </form>
            </div>
          ) : (
            /* Player Read-Only Notice Bar (Players can react with emoji, but CANNOT reply or type text) */
            <div className="px-6 py-4 bg-gradient-to-r from-[#0d121e] via-[#111726] to-[#0d121e] border-t border-[#1f2b45] flex items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Official General Announcement Channel
                    <span className="px-2 py-0.2 rounded-full text-[9px] bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                      Broadcast Only
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Only Tournament Organizers can send messages here. All team members can react to any update using the emoji buttons above!
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-400 text-[11px] font-semibold shrink-0">
                <Smile className="w-3.5 h-3.5 text-cyan-400" /> Tap emoji to react
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: PRIVATE TEAM CHAT */}
      {activeTab === 'team_admin' && (
        <div className="gaming-card flex flex-col h-[650px] overflow-hidden border border-[#1f2b45]">
          
          {/* Header */}
          <div className="px-6 py-4 bg-[#0d121e] border-b border-[#1f2b45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-sm text-white font-gaming">
                  Direct Line with Tournament Admin
                </h3>
                <p className="text-[11px] text-slate-400">
                  {userTeam ? `Team: ${userTeam.team_name}` : 'No team created'}
                </p>
              </div>
            </div>
            
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              isChatUnlocked 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isChatUnlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>

          {/* If NOT Unlocked: Show Lock Screen */}
          {!isChatUnlocked ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-neon-orange">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-white font-gaming">
                  Private Admin Chat is Locked
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  "Join a tournament to unlock chat with admin."
                </p>
                <p className="text-[11px] text-slate-500">
                  To prevent spam, teams unlock instant priority direct messaging with organizers immediately upon joining their first tournament using coin wallet.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase shadow-neon-cyan"
              >
                Browse Tournaments to Unlock <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Unlocked Chat Room */
            <>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {teamMessages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Your direct thread with Admin is open! Send any questions or verification queries below.
                  </div>
                ) : (
                  teamMessages.map((msg) => {
                    const isAdminMsg = msg.sender_role === 'admin';
                    const isMyMsg = msg.sender_id === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className={`text-[11px] font-bold ${
                            isAdminMsg ? 'text-orange-400' : 'text-cyan-400'
                          }`}>
                            {isAdminMsg ? '🛡️ Admin: ' + msg.sender_name : msg.sender_name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                            isAdminMsg
                              ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-orange-100 rounded-tl-sm'
                              : isMyMsg
                                ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-sm'
                                : 'bg-[#0d121e] border border-[#1f2b45] text-slate-200'
                          }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendTeamMessage} className="p-4 bg-[#0d121e] border-t border-[#1f2b45] flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to the Admin..."
                  className="flex-1 px-4 py-2.5 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-neon-cyan"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}

        </div>
      )}

    </div>
  );
};
