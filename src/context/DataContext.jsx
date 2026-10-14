import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_WALLETS,
  INITIAL_TRANSACTIONS,
  INITIAL_REGISTRATIONS,
  INITIAL_MATCHES,
  INITIAL_RESULTS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY,
  DEFAULT_SETTINGS
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { 
  sanitizeInput, 
  validateFFUid, 
  validatePhone, 
  validateTeamName 
} from '../lib/security';

const DataContext = createContext();

const LOCAL_STORAGE_PREFIX = 'esports_arena_';

export const DataProvider = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  // Helper for localStorage state initialization
  const loadState = (key, fallback) => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return fallback;
  };

  const [tournaments, setTournaments] = useState(() => loadState('tournaments', INITIAL_TOURNAMENTS));
  const [teams, setTeams] = useState(() => loadState('teams', INITIAL_TEAMS));
  const [players, setPlayers] = useState(() => loadState('players', INITIAL_PLAYERS));
  const [wallets, setWallets] = useState(() => loadState('wallets', INITIAL_WALLETS));
  const [transactions, setTransactions] = useState(() => loadState('transactions', INITIAL_TRANSACTIONS));
  const [registrations, setRegistrations] = useState(() => loadState('registrations', INITIAL_REGISTRATIONS));
  const [matches, setMatches] = useState(() => loadState('matches', INITIAL_MATCHES));
  const [results, setResults] = useState(() => loadState('results', INITIAL_RESULTS));
  const [messages, setMessages] = useState(() => loadState('messages', INITIAL_MESSAGES));
  const [notifications, setNotifications] = useState(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [activityLog, setActivityLog] = useState(() => loadState('activity', INITIAL_ACTIVITY));
  const [settings, setSettings] = useState(() => loadState('settings', DEFAULT_SETTINGS));

  // Sync states to localStorage
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'tournaments', JSON.stringify(tournaments)); }, [tournaments]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'players', JSON.stringify(players)); }, [players]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'wallets', JSON.stringify(wallets)); }, [wallets]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'registrations', JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'matches', JSON.stringify(matches)); }, [matches]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'results', JSON.stringify(results)); }, [results]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'activity', JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_PREFIX + 'settings', JSON.stringify(settings)); }, [settings]);

  // Helper: Log activity
  const logActivity = (action, description, actorId = currentUser?.id) => {
    const newEntry = {
      id: 'act-' + Date.now(),
      action,
      description,
      actor_id: actorId || 'system',
      created_at: new Date().toISOString()
    };
    setActivityLog(prev => [newEntry, ...prev]);
  };

  // Helper: Send notification
  const sendNotification = (userId, title, message, type = 'info') => {
    const newNotif = {
      id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Wallet helpers
  const getTeamWallet = (teamId) => {
    return wallets[teamId] !== undefined ? wallets[teamId] : 0;
  };

  // -------------------------------------------------------------
  // TOURNAMENT CRUD
  // -------------------------------------------------------------
  const createTournament = (data) => {
    const newTourney = {
      id: 'tourney-' + Date.now(),
      title: data.title,
      game: data.game || 'Free Fire',
      mode: data.mode || 'Squad',
      map: data.map || 'Bermuda',
      start_time: data.start_time,
      entry_fee: Number(data.entry_fee) || 0,
      prize_pool: data.prize_pool || '1,000 Coins',
      max_teams: Number(data.max_teams) || 12,
      rules: data.rules || '',
      banner_url: data.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      status: 'Open',
      created_at: new Date().toISOString()
    };

    setTournaments(prev => [newTourney, ...prev]);
    logActivity('tournament_created', `Admin created tournament "${newTourney.title}"`);
    return newTourney;
  };

  const updateTournament = (id, data) => {
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    logActivity('tournament_updated', `Admin updated tournament "${data.title || id}"`);
  };

  const deleteTournament = (id) => {
    const tourney = tournaments.find(t => t.id === id);
    setTournaments(prev => prev.filter(t => t.id !== id));
    setRegistrations(prev => prev.filter(r => r.tournament_id !== id));
    setMatches(prev => prev.filter(m => m.tournament_id !== id));
    logActivity('tournament_deleted', `Admin deleted tournament "${tourney?.title || id}"`);
  };

  const setTournamentStatus = (id, newStatus) => {
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    logActivity('tournament_status_changed', `Tournament status changed to ${newStatus}`);
  };

  // -------------------------------------------------------------
  // TEAM MANAGEMENT & PLAYER ROSTER
  // -------------------------------------------------------------
  const getUserTeam = (userId = currentUser?.id) => {
    return teams.find(t => t.owner_id === userId);
  };

  const getTeamPlayers = (teamId) => {
    return players.filter(p => p.team_id === teamId);
  };

  const saveTeamWithPlayers = ({ teamName, phone, playerList, existingTeamId }) => {
    // 🛡️ Security Check: Sanitize and validate team name
    const cleanTeamName = validateTeamName(teamName);

    // 🛡️ Security Check: Validate phone format
    if (!validatePhone(phone)) {
      throw new Error('Please enter a valid phone number (10-15 digits) for match coordination.');
    }
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // 1. Check duplicate team name across other teams
    const duplicateTeam = teams.find(t => 
      t.team_name.toLowerCase().trim() === cleanTeamName.toLowerCase().trim() && 
      t.id !== existingTeamId
    );
    if (duplicateTeam) {
      throw new Error(`Team name "${cleanTeamName}" is already taken. Please choose another name.`);
    }

    // 2. Validate player inputs & enforce numeric UID rules
    for (const p of playerList) {
      const pName = sanitizeInput(p.player_name);
      const ffName = sanitizeInput(p.ff_name);
      const uid = String(p.ff_uid || '').trim();

      if (!pName) throw new Error('Player real name cannot be empty.');
      if (!ffName) throw new Error('Free Fire in-game name cannot be empty.');
      if (!validateFFUid(uid)) {
        throw new Error(`Invalid Free Fire UID "${uid}". Free Fire UIDs must be numeric and between 8 to 12 digits.`);
      }
    }

    // 3. Check duplicate UIDs within the squad
    const uidSet = new Set();
    for (const p of playerList) {
      const uid = String(p.ff_uid).trim();
      if (uidSet.has(uid)) {
        throw new Error(`Duplicate Free Fire UID ${uid} entered within your own squad roster.`);
      }
      uidSet.add(uid);
    }

    // 🛡️ FIREWALL DEFENSE: Block cross-team duplicate UIDs
    const otherTeamsPlayers = players.filter(p => p.team_id !== existingTeamId);
    for (const p of playerList) {
      const uid = String(p.ff_uid).trim();
      const crossTeamMatch = otherTeamsPlayers.find(op => op.ff_uid === uid);
      if (crossTeamMatch) {
        const ownerTeam = teams.find(t => t.id === crossTeamMatch.team_id);
        throw new Error(`🚨 Security Alert: Free Fire UID ${uid} is already registered under "${ownerTeam?.team_name || 'another team'}". A player UID cannot be in multiple teams!`);
      }
    }

    let teamId = existingTeamId;

    if (existingTeamId) {
      // Update team details
      setTeams(prev => prev.map(t => t.id === existingTeamId ? {
        ...t,
        team_name: cleanTeamName,
        phone: cleanPhone
      } : t));

      // Replace players
      setPlayers(prev => {
        const withoutOld = prev.filter(p => p.team_id !== existingTeamId);
        const newPlayers = playerList.map((p, idx) => ({
          id: p.id || 'p-' + Date.now() + '-' + idx,
          team_id: existingTeamId,
          player_name: sanitizeInput(p.player_name),
          ff_name: sanitizeInput(p.ff_name),
          ff_uid: String(p.ff_uid).trim(),
          is_captain: idx === 0,
          is_substitute: Boolean(p.is_substitute)
        }));
        return [...withoutOld, ...newPlayers];
      });

      logActivity('team_updated', `Team "${cleanTeamName}" roster updated`);
    } else {
      // Create new team
      teamId = 'team-' + Date.now();
      const newTeam = {
        id: teamId,
        owner_id: currentUser?.id,
        team_name: cleanTeamName,
        phone: cleanPhone,
        chat_unlocked: false,
        created_at: new Date().toISOString()
      };

      const newPlayers = playerList.map((p, idx) => ({
        id: 'p-' + Date.now() + '-' + idx,
        team_id: teamId,
        player_name: sanitizeInput(p.player_name),
        ff_name: sanitizeInput(p.ff_name),
        ff_uid: String(p.ff_uid).trim(),
        is_captain: idx === 0,
        is_substitute: Boolean(p.is_substitute)
      }));

      // Initialize team wallet with default coins if setting is enabled
      const defaultCoins = settings?.default_coins || 0;
      setWallets(prev => ({ ...prev, [teamId]: defaultCoins }));
      if (defaultCoins > 0) {
        setTransactions(prev => [{
          id: 'tx-' + Date.now(),
          team_id: teamId,
          amount: defaultCoins,
          reason: 'Welcome bonus on team registration',
          balance_after: defaultCoins,
          created_by: 'system',
          created_at: new Date().toISOString()
        }, ...prev]);
      }

      setTeams(prev => [newTeam, ...prev]);
      setPlayers(prev => [...prev, ...newPlayers]);
      logActivity('team_created', `New team registered: "${teamName}"`);
    }

    return teamId;
  };

  // -------------------------------------------------------------
  // TOURNAMENT JOIN (EASY REGISTRATION & PENDING ADMIN APPROVAL)
  // -------------------------------------------------------------
  const joinTournament = (tournamentId, teamId, quickTeamData = null) => {
    const tourney = tournaments.find(t => t.id === tournamentId);
    if (!tourney) throw new Error('Tournament not found.');

    if (tourney.status !== 'Open') {
      throw new Error(`Tournament registrations are currently ${tourney.status}.`);
    }

    let actualTeamId = teamId;

    // If player does not have a team yet, auto-create team seamlessly from quick inputs
    if (!actualTeamId && quickTeamData) {
      const generatedTeamId = 'team-' + Date.now();
      const generatedTeam = {
        id: generatedTeamId,
        owner_id: currentUser?.id || 'guest',
        team_name: quickTeamData.teamName.trim(),
        phone: quickTeamData.phone?.trim() || '+919876543210',
        chat_unlocked: true,
        created_at: new Date().toISOString()
      };

      const generatedPlayer = {
        id: 'p-' + Date.now(),
        team_id: generatedTeamId,
        player_name: currentUser?.name || quickTeamData.captainName || 'Player 1',
        ff_name: quickTeamData.ffName || quickTeamData.teamName,
        ff_uid: String(quickTeamData.ffUid || '123456789').trim(),
        is_captain: true,
        is_substitute: false
      };

      setTeams(prev => [generatedTeam, ...prev]);
      setPlayers(prev => [generatedPlayer, ...prev]);
      setWallets(prev => ({ ...prev, [generatedTeamId]: 200 })); // Give 200 welcome bonus coins
      actualTeamId = generatedTeamId;
    }

    if (!actualTeamId) {
      throw new Error('Please enter your Team Name and Free Fire UID to register.');
    }

    const team = teams.find(t => t.id === actualTeamId) || {
      id: actualTeamId,
      team_name: quickTeamData?.teamName || 'My Team',
      owner_id: currentUser?.id
    };

    // Check if already registered
    const alreadyRegistered = registrations.some(
      r => r.tournament_id === tournamentId && r.team_id === actualTeamId
    );
    if (alreadyRegistered) {
      throw new Error('Your team is already registered for this tournament.');
    }

    // Check available slots
    const activeRegCount = registrations.filter(
      r => r.tournament_id === tournamentId && ['Pending', 'Approved'].includes(r.status)
    ).length;

    if (activeRegCount >= tourney.max_teams) {
      setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, status: 'Closed' } : t));
      throw new Error('Tournament is completely full!');
    }

    // Check coin balance smoothly
    const currentBalance = getTeamWallet(actualTeamId);
    const fee = tourney.entry_fee || 0;
    const canPay = currentBalance >= fee;
    const coinsDeducted = canPay ? fee : 0;
    const newBalance = canPay ? currentBalance - fee : currentBalance;

    if (canPay && fee > 0) {
      setWallets(prev => ({ ...prev, [actualTeamId]: newBalance }));
      setTransactions(prev => [{
        id: 'tx-' + Date.now(),
        team_id: actualTeamId,
        amount: -fee,
        reason: `Entry fee for tournament: ${tourney.title}`,
        balance_after: newBalance,
        created_by: currentUser?.id,
        created_at: new Date().toISOString()
      }, ...prev]);
    }

    // 3. Create registration with status 'Pending' (REQUIRES ADMIN PERMISSION TO PLAY)
    const newReg = {
      id: 'reg-' + Date.now(),
      tournament_id: tournamentId,
      team_id: actualTeamId,
      status: 'Pending',
      payment_status: canPay ? 'Paid' : 'Free Entry',
      coins_paid: coinsDeducted,
      created_at: new Date().toISOString()
    };
    setRegistrations(prev => [newReg, ...prev]);

    // 4. Unlock team chat
    setTeams(prev => prev.map(t => t.id === actualTeamId ? { ...t, chat_unlocked: true } : t));

    // 5. Check if max slots reached now -> auto close
    if (activeRegCount + 1 >= tourney.max_teams) {
      setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, status: 'Closed' } : t));
    }

    // 6. Log activity & notifications
    logActivity('registration_created', `${team.team_name} requested entry for "${tourney.title}". Pending Admin Permission.`);
    sendNotification(
      currentUser?.id,
      'Registration Submitted (Pending Approval)',
      `Your registration for "${tourney.title}" has been submitted and is awaiting Admin permission. You will be able to play once approved!`,
      'info'
    );

    return { success: true, newBalance };
  };

  // -------------------------------------------------------------
  // REGISTRATION APPROVAL & REFUND
  // -------------------------------------------------------------
  const approveRegistration = (regId) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: 'Approved' } : r));

    const team = teams.find(t => t.id === reg.team_id);
    const tourney = tournaments.find(t => t.id === reg.tournament_id);

    if (team) {
      sendNotification(
        team.owner_id,
        'Registration Approved! 🎉',
        `Great news! "${team.team_name}" has been approved for "${tourney?.title}". Check room details before match time.`,
        'approval'
      );
      logActivity('registration_approved', `Admin approved ${team.team_name} for ${tourney?.title}`);
    }
  };

  const rejectRegistration = (regId, shouldRefund = true, reason = 'Registration declined by Admin') => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    const team = teams.find(t => t.id === reg.team_id);
    const tourney = tournaments.find(t => t.id === reg.tournament_id);

    let updatedPaymentStatus = reg.payment_status;

    // Refund coins if paid and requested
    if (shouldRefund && reg.coins_paid > 0 && reg.payment_status === 'Paid') {
      const currentBal = getTeamWallet(reg.team_id);
      const newBal = currentBal + reg.coins_paid;

      setWallets(prev => ({ ...prev, [reg.team_id]: newBal }));

      const refundTx = {
        id: 'tx-' + Date.now(),
        team_id: reg.team_id,
        amount: reg.coins_paid,
        reason: `Refund: ${tourney?.title || 'Tournament'} (${reason})`,
        balance_after: newBal,
        created_by: currentUser?.id,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [refundTx, ...prev]);
      updatedPaymentStatus = 'Refunded';
    }

    setRegistrations(prev => prev.map(r => r.id === regId ? {
      ...r,
      status: 'Rejected',
      payment_status: updatedPaymentStatus
    } : r));

    if (team) {
      sendNotification(
        team.owner_id,
        'Registration Rejected',
        `Your registration for "${tourney?.title}" was rejected. ${shouldRefund && reg.coins_paid > 0 ? `Your ${reg.coins_paid} coins have been refunded.` : ''}`,
        'rejection'
      );
      logActivity('registration_rejected', `Admin rejected ${team.team_name} (${shouldRefund ? 'Refunded' : 'No refund'})`);
    }
  };

  const bulkApprove = (regIds) => {
    regIds.forEach(id => approveRegistration(id));
  };

  const bulkReject = (regIds, shouldRefund = true) => {
    regIds.forEach(id => rejectRegistration(id, shouldRefund));
  };

  // -------------------------------------------------------------
  // COIN MANAGEMENT
  // -------------------------------------------------------------
  const adjustCoins = (teamId, amount, reason) => {
    const current = getTeamWallet(teamId);
    const newBal = current + amount;
    if (newBal < 0) {
      throw new Error(`Cannot deduct ${Math.abs(amount)} coins. Wallet only has ${current} coins.`);
    }

    setWallets(prev => ({ ...prev, [teamId]: newBal }));

    const tx = {
      id: 'tx-' + Date.now(),
      team_id: teamId,
      amount,
      reason,
      balance_after: newBal,
      created_by: currentUser?.id,
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [tx, ...prev]);

    const team = teams.find(t => t.id === teamId);
    if (team) {
      sendNotification(
        team.owner_id,
        amount >= 0 ? 'Coins Received!' : 'Coins Deducted',
        `Admin adjusted your wallet: ${amount >= 0 ? '+' : ''}${amount} coins. Reason: ${reason}`,
        'coin'
      );
      logActivity('coins_adjusted', `Admin adjusted coins for ${team.team_name}: ${amount >= 0 ? '+' : ''}${amount} (${reason})`);
    }
    return newBal;
  };

  const bulkCreditCoins = (teamIds, amount, reason) => {
    teamIds.forEach(id => adjustCoins(id, amount, reason));
  };

  // -------------------------------------------------------------
  // MATCHES, ROOMS & RESULTS
  // -------------------------------------------------------------
  const createMatch = (data) => {
    const newMatch = {
      id: 'match-' + Date.now(),
      tournament_id: data.tournament_id,
      round: data.round || 'Round 1',
      start_time: data.start_time,
      room_id: data.room_id || '',
      room_password: data.room_password || '',
      created_at: new Date().toISOString()
    };
    setMatches(prev => [newMatch, ...prev]);
    logActivity('match_created', `Match created for tournament`);
    return newMatch;
  };

  const updateMatch = (id, data) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    logActivity('match_updated', `Match details updated`);
  };

  const deleteMatch = (id) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    setResults(prev => prev.filter(r => r.match_id !== id));
  };

  const recordMatchResult = (matchId, teamId, placement, kills) => {
    const scoring = settings.scoring || DEFAULT_SETTINGS.scoring;
    const placementPoints = scoring[placement] || 0;
    const killPoints = (scoring.kill || 1) * Number(kills);
    const totalPoints = placementPoints + killPoints;

    setResults(prev => {
      const existingIdx = prev.findIndex(r => r.match_id === matchId && r.team_id === teamId);
      const entry = {
        id: existingIdx >= 0 ? prev[existingIdx].id : 'res-' + Date.now() + '-' + teamId,
        match_id: matchId,
        team_id: teamId,
        placement: Number(placement),
        kills: Number(kills),
        points: totalPoints
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = entry;
        return copy;
      }
      return [...prev, entry];
    });

    logActivity('result_recorded', `Result recorded: Placement ${placement}, Kills ${kills}`);
  };

  const getTournamentLeaderboard = (tournamentId) => {
    // Collect all matches of tournament
    const tourneyMatches = matches.filter(m => m.tournament_id === tournamentId);
    const matchIds = new Set(tourneyMatches.map(m => m.id));

    // Collect all results for these matches
    const tourneyResults = results.filter(r => matchIds.has(r.match_id));

    // Aggregate by team
    const teamStats = {};
    tourneyResults.forEach(r => {
      if (!teamStats[r.team_id]) {
        teamStats[r.team_id] = {
          team_id: r.team_id,
          total_points: 0,
          total_kills: 0,
          matches_played: 0,
          best_placement: 99
        };
      }
      teamStats[r.team_id].total_points += r.points;
      teamStats[r.team_id].total_kills += r.kills;
      teamStats[r.team_id].matches_played += 1;
      if (r.placement < teamStats[r.team_id].best_placement) {
        teamStats[r.team_id].best_placement = r.placement;
      }
    });

    // Sort by total points desc, then total kills desc
    const sorted = Object.values(teamStats).sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      return b.total_kills - a.total_kills;
    });

    return sorted.map((stat, idx) => {
      const teamObj = teams.find(t => t.id === stat.team_id);
      return {
        rank: idx + 1,
        team_name: teamObj?.team_name || 'Unknown Team',
        ...stat
      };
    });
  };

  // -------------------------------------------------------------
  // CHAT SYSTEM
  // -------------------------------------------------------------
  const sendMessage = (channelType, teamId, body, isPinned = false, replyToId = null) => {
    if (!body?.trim()) return;

    // 🛡️ Security Check: In general announcements, only Admin can broadcast or reply!
    if (channelType === 'general' && !isAdmin) {
      throw new Error('Security Violation: Only verified administrators can post or reply to the General Chat channel.');
    }

    const cleanBody = sanitizeInput(body);

    let replySnippet = null;
    if (replyToId) {
      const parent = messages.find(m => m.id === replyToId);
      if (parent) {
        replySnippet = {
          id: parent.id,
          sender_name: parent.sender_name,
          body: parent.body.length > 80 ? parent.body.substring(0, 80) + '...' : parent.body
        };
      }
    }

    const newMsg = {
      id: 'msg-' + Date.now(),
      channel_type: channelType,
      team_id: channelType === 'team' ? teamId : null,
      sender_id: currentUser?.id,
      sender_name: currentUser?.name || (isAdmin ? 'Apex Admin' : 'Anonymous Player'),
      sender_role: currentUser?.role || (isAdmin ? 'admin' : 'player'),
      body: cleanBody,
      is_pinned: Boolean(isPinned && isAdmin),
      reply_to_id: replyToId || null,
      reply_snippet: replySnippet,
      reactions: {},
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const reactToMessage = (messageId, emoji) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const userName = currentUser.name || (isAdmin ? 'Apex Admin' : 'Player');

    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const currentReactions = { ...(msg.reactions || {}) };
      const currentList = Array.isArray(currentReactions[emoji]) ? [...currentReactions[emoji]] : [];

      // Check if user has already reacted with this emoji
      const existingIndex = currentList.findIndex(item => 
        typeof item === 'string' ? item === userId : item?.userId === userId
      );

      if (existingIndex >= 0) {
        // Toggle off: remove user reaction
        currentList.splice(existingIndex, 1);
      } else {
        // Toggle on: add user reaction
        currentList.push({ userId, userName });
      }

      if (currentList.length === 0) {
        delete currentReactions[emoji];
      } else {
        currentReactions[emoji] = currentList;
      }

      return {
        ...msg,
        reactions: currentReactions
      };
    }));
  };

  const togglePinMessage = (messageId) => {
    if (!isAdmin) return;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: !m.is_pinned } : m));
  };

  const deleteMessage = (messageId) => {
    if (!isAdmin) return;
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const toggleTeamChatLock = (teamId, forceState) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const nextState = forceState !== undefined ? forceState : !t.chat_unlocked;
        return { ...t, chat_unlocked: nextState };
      }
      return t;
    }));
  };

  // -------------------------------------------------------------
  // DUPLICATE & SUSPICIOUS ENTRY DETECTOR
  // -------------------------------------------------------------
  const detectDuplicates = (tournamentId) => {
    const regList = tournamentId 
      ? registrations.filter(r => r.tournament_id === tournamentId)
      : registrations;

    const registeredTeamIds = new Set(regList.map(r => r.team_id));
    const relevantPlayers = players.filter(p => registeredTeamIds.has(p.team_id));
    const relevantTeams = teams.filter(t => registeredTeamIds.has(t.id));

    const uidMap = {}; // uid -> [teamNames]
    const phoneMap = {}; // phone -> [teamNames]
    const flags = [];

    relevantPlayers.forEach(p => {
      const t = teams.find(x => x.id === p.team_id);
      if (!uidMap[p.ff_uid]) uidMap[p.ff_uid] = [];
      uidMap[p.ff_uid].push({ teamName: t?.team_name, playerName: p.player_name, teamId: p.team_id });
    });

    relevantTeams.forEach(t => {
      const phoneClean = t.phone.replace(/\D/g, '');
      if (phoneClean) {
        if (!phoneMap[phoneClean]) phoneMap[phoneClean] = [];
        phoneMap[phoneClean].push(t);
      }
    });

    // Check UIDs appearing across multiple teams
    Object.entries(uidMap).forEach(([uid, occurrences]) => {
      const uniqueTeams = new Set(occurrences.map(o => o.teamId));
      if (uniqueTeams.size > 1) {
        flags.push({
          type: 'duplicate_uid',
          severity: 'high',
          value: uid,
          details: `Free Fire UID ${uid} is registered in multiple teams: ${occurrences.map(o => `${o.teamName} (${o.playerName})`).join(', ')}`
        });
      }
    });

    // Check phones appearing across multiple teams
    Object.entries(phoneMap).forEach(([phone, occTeams]) => {
      if (occTeams.length > 1) {
        flags.push({
          type: 'duplicate_phone',
          severity: 'medium',
          value: phone,
          details: `Phone number ${phone} is shared across: ${occTeams.map(t => t.team_name).join(', ')}`
        });
      }
    });

    return flags;
  };

  // -------------------------------------------------------------
  // EXPORT TO CSV / EXCEL (.XLSX)
  // -------------------------------------------------------------
  const exportRegistrations = (tournamentId, format = 'csv') => {
    const tourney = tournaments.find(t => t.id === tournamentId);
    const regs = registrations.filter(r => r.tournament_id === tournamentId);

    const exportData = regs.map(r => {
      const team = teams.find(t => t.id === r.team_id);
      const teamPls = players.filter(p => p.team_id === r.team_id);
      const captain = teamPls.find(p => p.is_captain) || teamPls[0];

      return {
        'Registration ID': r.id,
        'Tournament': tourney?.title || 'Unknown',
        'Team Name': team?.team_name || 'N/A',
        'Captain Name': captain?.player_name || 'N/A',
        'Captain FF IGN': captain?.ff_name || 'N/A',
        'Captain FF UID': captain?.ff_uid || 'N/A',
        'Phone / WhatsApp': team?.phone || 'N/A',
        'Players Count': teamPls.length,
        'Roster UIDs': teamPls.map(p => `${p.ff_name} (${p.ff_uid})`).join(', '),
        'Registration Status': r.status,
        'Payment Status': r.payment_status,
        'Coins Paid': r.coins_paid,
        'Registered At': new Date(r.created_at).toLocaleString()
      };
    });

    const filename = `${(tourney?.title || 'tournament').replace(/[^a-z0-9]/gi, '_')}_registrations`;

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS HELPERS
  // -------------------------------------------------------------
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <DataContext.Provider
      value={{
        tournaments,
        teams,
        players,
        wallets,
        transactions,
        registrations,
        matches,
        results,
        messages,
        notifications,
        activityLog,
        settings,
        setSettings,
        // Methods
        createTournament,
        updateTournament,
        deleteTournament,
        setTournamentStatus,
        getUserTeam,
        getTeamPlayers,
        saveTeamWithPlayers,
        getTeamWallet,
        joinTournament,
        approveRegistration,
        rejectRegistration,
        bulkApprove,
        bulkReject,
        adjustCoins,
        bulkCreditCoins,
        createMatch,
        updateMatch,
        deleteMatch,
        recordMatchResult,
        getTournamentLeaderboard,
        sendMessage,
        reactToMessage,
        togglePinMessage,
        deleteMessage,
        toggleTeamChatLock,
        detectDuplicates,
        exportRegistrations,
        markNotificationRead,
        markAllNotificationsRead,
        logActivity,
        sendNotification
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
