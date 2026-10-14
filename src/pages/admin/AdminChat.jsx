import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Pin, 
  Lock, 
  Unlock, 
  Search, 
  Megaphone, 
  ShieldCheck, 
  CheckCircle,
  Users,
  Reply,
  X,
  Smile,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const REACTION_EMOJIS = ['🔥', '🏆', '👍', '🎯', '❤️', '⚡', '👏', '🎮'];

export const AdminChat = () => {
  const { currentUser } = useAuth();
  const { 
    teams, 
    messages, 
    sendMessage, 
    reactToMessage,
    togglePinMessage,
    deleteMessage,
    toggleTeamChatLock 
  } = useData();

  const [activeTab, setActiveTab] = useState('announcements'); // Default to announcements/general chat
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [searchTeam, setSearchTeam] = useState('');
  
  // Message inputs
  const [teamInput, setTeamInput] = useState('');
  const [announceInput, setAnnounceInput] = useState('');
  const [isPinnedAnnounce, setIsPinnedAnnounce] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const chatBottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTeamId, activeTab]);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  // Filter team threads
  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes(searchTeam.toLowerCase())
  );

  // Active thread messages
  const activeTeamMessages = selectedTeamId 
    ? messages.filter(m => m.channel_type === 'team' && m.team_id === selectedTeamId)
    : [];

  // General announcement messages
  const announcementMessages = messages.filter(m => m.channel_type === 'general');
  const pinnedAnnouncements = announcementMessages.filter(m => m.is_pinned);
  const normalAnnouncements = announcementMessages.filter(m => !m.is_pinned);

  const handleSendTeamMsg = (e) => {
    e.preventDefault();
    if (!teamInput.trim() || !selectedTeamId) return;

    sendMessage('team', selectedTeamId, teamInput);
    setTeamInput('');
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announceInput.trim()) return;

    sendMessage(
      'general',
      null,
      announceInput,
      isPinnedAnnounce,
      replyingTo ? replyingTo.id : null
    );

    setAnnounceInput('');
    setIsPinnedAnnounce(false);
    setReplyingTo(null);
  };

  // Helper: check if currentUser reacted
  const hasUserReacted = (reactions, emoji) => {
    if (!reactions || !reactions[emoji] || !currentUser) return false;
    const list = reactions[emoji];
    return list.some(r => (typeof r === 'string' ? r === currentUser.id : r?.userId === currentUser.id));
  };

  // Helper: get names of reactors
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
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-gaming tracking-wide uppercase flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-cyan-400" />
            Tournament Communications Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Post public announcements to all players, view reactions, and manage individual team threads.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#111726] p-1 rounded-xl border border-[#1f2b45] w-full sm:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'announcements'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-neon-cyan/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> General Chat Session ({announcementMessages.length})
          </button>

          <button
            onClick={() => setActiveTab('team_inbox')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'team_inbox'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-neon-orange/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Team Inboxes ({teams.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GENERAL CHAT BROADCAST & REACTION MONITOR */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          
          {/* Broadcaster / Reply Composer Card */}
          <div className="gaming-card p-5 sm:p-6 border border-[#1f2b45] space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-gaming flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  {replyingTo ? 'Reply to Announcement' : 'Broadcast to General Chat Channel'}
                </h3>
                <p className="text-xs text-slate-400">
                  {replyingTo 
                    ? `Sending an official admin reply linked to ${replyingTo.sender_name}'s post.`
                    : 'Messages posted here will appear live to all players and team members. They can react with emojis.'}
                </p>
              </div>

              {replyingTo && (
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Reply
                </button>
              )}
            </div>

            {/* Replying quote badge */}
            {replyingTo && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border-l-4 border-cyan-400 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-cyan-400 uppercase text-[10px] flex items-center gap-1">
                  <Reply className="w-3 h-3" /> Replying to: {replyingTo.sender_name} ({new Date(replyingTo.created_at).toLocaleTimeString()})
                </span>
                <p className="italic text-slate-300">"{replyingTo.body}"</p>
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <textarea
                  rows={3}
                  required
                  value={announceInput}
                  onChange={(e) => setAnnounceInput(e.target.value)}
                  placeholder={
                    replyingTo
                      ? "Write your official admin reply to this message..."
                      : "Type your official announcement here (e.g. Schedule updates, Room ID & Password notice, Tournament rules)..."
                  }
                  className="w-full p-3 bg-[#0d121e] border border-[#1f2b45] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {!replyingTo ? (
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinnedAnnounce}
                      onChange={(e) => setIsPinnedAnnounce(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Pin className="w-3.5 h-3.5" /> Pin this announcement to top
                    </span>
                  </label>
                ) : (
                  <div className="text-[11px] text-cyan-400 font-semibold">
                    Admin Reply Mode
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!announceInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black font-bold text-xs uppercase tracking-wider transition shadow-neon-cyan flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {replyingTo ? 'Send Admin Reply' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>

          {/* Live General Chat Stream with Reactions & Admin Controls */}
          <div className="gaming-card p-5 sm:p-6 border border-[#1f2b45] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2b45] pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-gaming flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Live General Chat Feed ({announcementMessages.length} Messages)
              </h4>
              <span className="text-xs text-slate-400">
                All team members see these updates & react with emojis
              </span>
            </div>

            {announcementMessages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No announcements broadcasted yet. Send your first message above!
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pinned section */}
                {pinnedAnnouncements.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5" /> Pinned Announcements ({pinnedAnnouncements.length})
                    </div>
                    {pinnedAnnouncements.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-[#0d121e] border border-amber-500/40 space-y-2.5 shadow-md"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              🛡️ {m.sender_name}
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Pinned
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(m.created_at).toLocaleString()}
                          </span>
                        </div>

                        {m.reply_snippet && (
                          <div className="p-2 rounded bg-[#0d121e] border-l-2 border-cyan-400 text-xs text-slate-300">
                            <span className="text-[10px] text-cyan-400 font-bold">Replying to {m.reply_snippet.sender_name}:</span>
                            <p className="italic text-slate-400">"{m.reply_snippet.body}"</p>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap">{m.body}</p>

                        {/* Reactions and Controls */}
                        <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {Object.entries(m.reactions || {}).map(([emoji, list]) => {
                              const count = Array.isArray(list) ? list.length : 0;
                              if (count === 0) return null;
                              const isReacted = hasUserReacted(m.reactions, emoji);
                              const tooltip = getReactionNames(m.reactions, emoji);

                              return (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(m.id, emoji)}
                                  title={tooltip ? `Reacted by: ${tooltip}` : ''}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                                    isReacted
                                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400 ring-1 ring-amber-400/50'
                                      : 'bg-[#0d121e] text-slate-300 border border-[#1f2b45] hover:border-amber-400/50'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span className="text-[11px]">{count}</span>
                                </button>
                              );
                            })}

                            {/* Quick React Palette */}
                            <div className="flex items-center gap-0.5 bg-[#0a0d14]/70 p-1 rounded-full border border-amber-500/20">
                              {REACTION_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(m.id, emoji)}
                                  title={`React with ${emoji}`}
                                  className="w-5 h-5 flex items-center justify-center rounded-full text-xs hover:scale-125 transition"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Admin message controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(m);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold transition"
                            >
                              <Reply className="w-3 h-3" /> Reply
                            </button>
                            <button
                              onClick={() => togglePinMessage(m.id)}
                              title="Unpin message"
                              className="text-amber-400 hover:text-amber-300 text-xs p-1"
                            >
                              <Pin className="w-3.5 h-3.5 fill-amber-400" />
                            </button>
                            <button
                              onClick={() => deleteMessage(m.id)}
                              title="Delete broadcast"
                              className="text-slate-400 hover:text-red-400 text-xs p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Normal announcements */}
                <div className="space-y-3">
                  {pinnedAnnouncements.length > 0 && normalAnnouncements.length > 0 && (
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                      <Megaphone className="w-3.5 h-3.5" /> General Announcements ({normalAnnouncements.length})
                    </div>
                  )}

                  {normalAnnouncements.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[#0d121e] border border-[#1f2b45] space-y-2.5 shadow-sm hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          🛡️ {m.sender_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>

                      {m.reply_snippet && (
                        <div className="p-2 rounded bg-[#111726] border-l-2 border-cyan-400 text-xs text-slate-300">
                          <span className="text-[10px] text-cyan-400 font-bold">Replying to {m.reply_snippet.sender_name}:</span>
                          <p className="italic text-slate-400">"{m.reply_snippet.body}"</p>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap">{m.body}</p>

                      {/* Reactions and Controls */}
                      <div className="pt-2 border-t border-[#1f2b45]/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(m.reactions || {}).map(([emoji, list]) => {
                            const count = Array.isArray(list) ? list.length : 0;
                            if (count === 0) return null;
                            const isReacted = hasUserReacted(m.reactions, emoji);
                            const tooltip = getReactionNames(m.reactions, emoji);

                            return (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(m.id, emoji)}
                                title={tooltip ? `Reacted by: ${tooltip}` : ''}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                                  isReacted
                                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 ring-1 ring-cyan-400/50'
                                    : 'bg-[#111726] text-slate-300 border border-[#1f2b45] hover:border-cyan-400/50'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[11px]">{count}</span>
                              </button>
                            );
                          })}

                          {/* Quick React Palette */}
                          <div className="flex items-center gap-0.5 bg-[#0a0d14]/70 p-1 rounded-full border border-[#1f2b45]">
                            {REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(m.id, emoji)}
                                title={`React with ${emoji}`}
                                className="w-5 h-5 flex items-center justify-center rounded-full text-xs hover:scale-125 transition"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Admin message controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(m);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold transition"
                          >
                            <Reply className="w-3 h-3" /> Reply
                          </button>
                          <button
                            onClick={() => togglePinMessage(m.id)}
                            title="Pin to top"
                            className="text-slate-400 hover:text-amber-400 text-xs p-1"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            title="Delete broadcast"
                            className="text-slate-400 hover:text-red-400 text-xs p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: TEAM INBOX SPLIT VIEW */}
      {activeTab === 'team_inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">
          
          {/* Left Column: Team List */}
          <div className="gaming-card flex flex-col overflow-hidden">
            <div className="p-4 bg-[#0d121e] border-b border-[#1f2b45] space-y-3">
              <h3 className="text-sm font-bold text-white font-gaming">Team Channels</h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by team..."
                  value={searchTeam}
                  onChange={(e) => setSearchTeam(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#111726] border border-[#1f2b45] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1f2b45]/50">
              {filteredTeams.map((t) => {
                const teamMsgs = messages.filter(m => m.channel_type === 'team' && m.team_id === t.id);
                const lastMsg = teamMsgs[teamMsgs.length - 1];
                const isSelected = t.id === selectedTeamId;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-2 ${
                      isSelected ? 'bg-orange-500/10 border-l-2 border-orange-500' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-xs text-white truncate">{t.team_name}</span>
                        {!t.chat_unlocked && (
                          <Lock className="w-3 h-3 text-amber-400 shrink-0" title="Chat Locked for player" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {lastMsg ? lastMsg.body : 'No messages yet'}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Conversation Stream */}
          <div className="lg:col-span-2 gaming-card flex flex-col overflow-hidden">
            {selectedTeam ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 bg-[#0d121e] border-b border-[#1f2b45] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white font-gaming flex items-center gap-2">
                      {selectedTeam.team_name}
                      <span className="text-xs text-slate-400 font-normal">({selectedTeam.phone || 'No phone'})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Direct support thread with team captain</p>
                  </div>

                  {/* Lock/Unlock Toggle Button */}
                  <button
                    onClick={() => toggleTeamChatLock(selectedTeam.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                      selectedTeam.chat_unlocked
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {selectedTeam.chat_unlocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Player Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Player Locked
                      </>
                    )}
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {activeTeamMessages.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No messages yet in this team thread. Send a greeting below!
                    </div>
                  ) : (
                    activeTeamMessages.map((msg) => {
                      const isAdminMsg = msg.sender_role === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className={`text-[11px] font-bold ${
                              isAdminMsg ? 'text-orange-400' : 'text-cyan-400'
                            }`}>
                              {isAdminMsg ? '🛡️ Admin' : msg.sender_name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                              isAdminMsg
                                ? 'bg-orange-500/20 border border-orange-500/40 text-white rounded-tr-sm'
                                : 'bg-[#0d121e] border border-[#1f2b45] text-slate-200 rounded-tl-sm'
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
                <form onSubmit={handleSendTeamMsg} className="p-4 bg-[#0d121e] border-t border-[#1f2b45] flex items-center gap-2">
                  <input
                    type="text"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    placeholder={`Reply to ${selectedTeam.team_name}...`}
                    className="flex-1 px-4 py-2.5 bg-[#111726] border border-[#1f2b45] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={!teamInput.trim()}
                    className="p-2.5 rounded-xl bg-orange-400 hover:bg-orange-500 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-neon-orange"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a team from the left to view thread.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
