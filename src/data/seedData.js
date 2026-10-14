// Realistic initial seed data for Esports Arena
// Contains 1 Admin, 3 Teams, 3 Tournaments, Matches, Results, Chat and Wallet data

export const INITIAL_PROFILES = [
  {
    id: 'usr-admin-01',
    name: 'Rithish',
    email: 'rithishmdu77@gmail.com',
    role: 'admin',
    is_banned: false,
    created_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 'usr-player-01',
    name: 'Rahul Sharma',
    email: 'skylord@esportsarena.com',
    role: 'player',
    is_banned: false,
    created_at: '2026-10-02T11:00:00Z'
  },
  {
    id: 'usr-player-02',
    name: 'Vikram Singh',
    email: 'shadowx@esportsarena.com',
    role: 'player',
    is_banned: false,
    created_at: '2026-10-03T12:00:00Z'
  },
  {
    id: 'usr-player-03',
    name: 'Aman Patel',
    email: 'toxic@esportsarena.com',
    role: 'player',
    is_banned: false,
    created_at: '2026-10-04T13:00:00Z'
  }
];

export const INITIAL_TEAMS = [
  {
    id: 'team-01',
    owner_id: 'usr-player-01',
    team_name: 'Team Hydra',
    phone: '+919876543210',
    chat_unlocked: true,
    created_at: '2026-10-02T11:30:00Z'
  },
  {
    id: 'team-02',
    owner_id: 'usr-player-02',
    team_name: 'Total Gaming Elite',
    phone: '+919812345678',
    chat_unlocked: true,
    created_at: '2026-10-03T12:30:00Z'
  },
  {
    id: 'team-03',
    owner_id: 'usr-player-03',
    team_name: 'Blind Esports',
    phone: '+919988776655',
    chat_unlocked: false,
    created_at: '2026-10-04T13:30:00Z'
  }
];

export const INITIAL_PLAYERS = [
  // Team Hydra (Squad)
  { id: 'p-1', team_id: 'team-01', player_name: 'Rahul Sharma', ff_name: 'HYD_SkyL0rd', ff_uid: '1092837461', is_captain: true, is_substitute: false },
  { id: 'p-2', team_id: 'team-01', player_name: 'Karan Mehra', ff_name: 'HYD_Venom', ff_uid: '2983746152', is_captain: false, is_substitute: false },
  { id: 'p-3', team_id: 'team-01', player_name: 'Samir Joshi', ff_name: 'HYD_SniperGod', ff_uid: '3847562910', is_captain: false, is_substitute: false },
  { id: 'p-4', team_id: 'team-01', player_name: 'Rohan Gupta', ff_name: 'HYD_Blaster', ff_uid: '4756291038', is_captain: false, is_substitute: false },
  
  // Total Gaming Elite (Squad)
  { id: 'p-5', team_id: 'team-02', player_name: 'Vikram Singh', ff_name: 'TG_ShadowX', ff_uid: '5847362910', is_captain: true, is_substitute: false },
  { id: 'p-6', team_id: 'team-02', player_name: 'Deepak Rao', ff_name: 'TG_Furious', ff_uid: '6958473821', is_captain: false, is_substitute: false },
  { id: 'p-7', team_id: 'team-02', player_name: 'Tarun Verma', ff_name: 'TG_Ghost', ff_uid: '7049382716', is_captain: false, is_substitute: false },
  { id: 'p-8', team_id: 'team-02', player_name: 'Nitin Kumar', ff_name: 'TG_Alpha', ff_uid: '8172635490', is_captain: false, is_substitute: false },

  // Blind Esports (Squad)
  { id: 'p-9', team_id: 'team-03', player_name: 'Aman Patel', ff_name: 'BLIND_Toxic', ff_uid: '9182736450', is_captain: true, is_substitute: false },
  { id: 'p-10', team_id: 'team-03', player_name: 'Sunil Nair', ff_name: 'BLIND_Reaper', ff_uid: '1293847561', is_captain: false, is_substitute: false },
  { id: 'p-11', team_id: 'team-03', player_name: 'Yash Das', ff_name: 'BLIND_Phantom', ff_uid: '2384950192', is_captain: false, is_substitute: false },
  { id: 'p-12', team_id: 'team-03', player_name: 'Mohit Sen', ff_name: 'BLIND_Striker', ff_uid: '3495867182', is_captain: false, is_substitute: false }
];

export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourney-01',
    title: 'Free Fire Champions Cup S4',
    game: 'Free Fire',
    mode: 'Squad',
    map: 'Bermuda',
    start_time: '2026-10-18T19:00:00Z',
    entry_fee: 100,
    prize_pool: '5,000 Coins',
    max_teams: 12,
    rules: '1. Emote spamming after knockout is allowed.\n2. Use of hacks, scripts or config edits results in immediate permanent ban.\n3. All players must be present in custom room 10 minutes prior to match time.\n4. Screen recording with in-game audio may be requested for anti-cheat verification.\n5. Points scoring: 1st=12pts, 2nd=9pts, 3rd=8pts, 4th=7pts, 5th=6pts + 1pt per Kill.',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    status: 'Open',
    created_at: '2026-10-10T10:00:00Z'
  },
  {
    id: 'tourney-02',
    title: 'Bermuda Clash Solo Showdown',
    game: 'Free Fire',
    mode: 'Solo',
    map: 'Purgatory',
    start_time: '2026-10-13T21:00:00Z',
    entry_fee: 50,
    prize_pool: '2,500 Coins',
    max_teams: 24,
    rules: '1. Solo battle royale. Teaming up will result in immediate disqualification.\n2. Room ID and password will be displayed 15 minutes before match start.\n3. Default character skill sets allowed.',
    banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    created_at: '2026-10-11T12:00:00Z'
  },
  {
    id: 'tourney-03',
    title: 'Free Fire Pro League Finale',
    game: 'Free Fire MAX',
    mode: 'Squad',
    map: 'Kalahari',
    start_time: '2026-10-08T18:00:00Z',
    entry_fee: 150,
    prize_pool: '10,000 Coins',
    max_teams: 12,
    rules: 'Official finals match. 3 rounds total points calculation.',
    banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    status: 'Completed',
    created_at: '2026-10-01T09:00:00Z'
  }
];

export const INITIAL_WALLETS = {
  'team-01': 450,
  'team-02': 200,
  'team-03': 0
};

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-01',
    team_id: 'team-01',
    amount: 500,
    reason: 'Initial onboarding reward by Admin',
    balance_after: 500,
    created_by: 'usr-admin-01',
    created_at: '2026-10-02T12:00:00Z'
  },
  {
    id: 'tx-02',
    team_id: 'team-01',
    amount: -100,
    reason: 'Entry fee for tournament: Free Fire Champions Cup S4',
    balance_after: 400,
    created_by: 'usr-player-01',
    created_at: '2026-10-10T14:30:00Z'
  },
  {
    id: 'tx-03',
    team_id: 'team-01',
    amount: 50,
    reason: 'Tournament placement bonus (Match 1)',
    balance_after: 450,
    created_by: 'usr-admin-01',
    created_at: '2026-10-12T16:00:00Z'
  },
  {
    id: 'tx-04',
    team_id: 'team-02',
    amount: 300,
    reason: 'Admin bonus grant',
    balance_after: 300,
    created_by: 'usr-admin-01',
    created_at: '2026-10-03T13:00:00Z'
  },
  {
    id: 'tx-05',
    team_id: 'team-02',
    amount: -100,
    reason: 'Entry fee for tournament: Free Fire Champions Cup S4',
    balance_after: 200,
    created_by: 'usr-player-02',
    created_at: '2026-10-11T10:15:00Z'
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: 'reg-01',
    tournament_id: 'tourney-01',
    team_id: 'team-01',
    status: 'Approved',
    payment_status: 'Paid',
    coins_paid: 100,
    created_at: '2026-10-10T14:30:00Z'
  },
  {
    id: 'reg-02',
    tournament_id: 'tourney-01',
    team_id: 'team-02',
    status: 'Pending',
    payment_status: 'Paid',
    coins_paid: 100,
    created_at: '2026-10-11T10:15:00Z'
  },
  {
    id: 'reg-03',
    tournament_id: 'tourney-02',
    team_id: 'team-01',
    status: 'Approved',
    payment_status: 'Paid',
    coins_paid: 50,
    created_at: '2026-10-12T09:00:00Z'
  },
  {
    id: 'reg-04',
    tournament_id: 'tourney-03',
    team_id: 'team-01',
    status: 'Approved',
    payment_status: 'Paid',
    coins_paid: 150,
    created_at: '2026-10-02T15:00:00Z'
  },
  {
    id: 'reg-05',
    tournament_id: 'tourney-03',
    team_id: 'team-02',
    status: 'Approved',
    payment_status: 'Paid',
    coins_paid: 150,
    created_at: '2026-10-02T16:00:00Z'
  }
];

export const INITIAL_MATCHES = [
  {
    id: 'match-01',
    tournament_id: 'tourney-02',
    round: 'Round 1 - Bermuda Solo Clash',
    start_time: '2026-10-13T21:00:00Z',
    room_id: '8849102',
    room_password: 'FF99',
    created_at: '2026-10-12T10:00:00Z'
  },
  {
    id: 'match-02',
    tournament_id: 'tourney-01',
    round: 'Quarter Finals - Match A',
    start_time: '2026-10-18T19:00:00Z',
    room_id: '4938102',
    room_password: 'ARENA',
    created_at: '2026-10-10T12:00:00Z'
  },
  {
    id: 'match-03',
    tournament_id: 'tourney-03',
    round: 'Grand Finale - Round 1',
    start_time: '2026-10-08T18:00:00Z',
    room_id: '1209384',
    room_password: 'CHAMP',
    created_at: '2026-10-05T10:00:00Z'
  }
];

export const INITIAL_RESULTS = [
  {
    id: 'res-01',
    match_id: 'match-03',
    team_id: 'team-01',
    placement: 1,
    kills: 11,
    points: 23 // 12 + 11
  },
  {
    id: 'res-02',
    match_id: 'match-03',
    team_id: 'team-02',
    placement: 2,
    kills: 7,
    points: 16 // 9 + 7
  }
];

export const INITIAL_MESSAGES = [
  // General Channel
  {
    id: 'msg-01',
    channel_type: 'general',
    team_id: null,
    sender_id: 'usr-admin-01',
    sender_name: 'Apex Admin',
    sender_role: 'admin',
    body: '🏆 Welcome to Esports Arena Season 4! Registrations are now OPEN for Free Fire Champions Cup. Make sure your Free Fire UIDs are entered correctly!',
    is_pinned: true,
    reactions: {
      '🔥': [{ userId: 'usr-player-01', userName: 'Rahul Sharma' }, { userId: 'usr-player-02', userName: 'Vikram Singh' }],
      '🏆': [{ userId: 'usr-player-01', userName: 'Rahul Sharma' }],
      '👍': [{ userId: 'usr-player-02', userName: 'Vikram Singh' }, { userId: 'usr-admin-01', userName: 'Apex Admin' }]
    },
    created_at: '2026-10-12T09:00:00Z'
  },
  {
    id: 'msg-02',
    channel_type: 'general',
    team_id: null,
    sender_id: 'usr-admin-01',
    sender_name: 'Apex Admin',
    sender_role: 'admin',
    body: '⚡ Notice: Custom room IDs and passwords will be automatically visible on your "My Registrations" page 15 minutes prior to game time.',
    is_pinned: false,
    reactions: {
      '🎯': [{ userId: 'usr-player-01', userName: 'Rahul Sharma' }],
      '⚡': [{ userId: 'usr-player-02', userName: 'Vikram Singh' }],
      '👍': [{ userId: 'usr-player-01', userName: 'Rahul Sharma' }]
    },
    created_at: '2026-10-13T10:30:00Z'
  },
  // Team 01 Private Chat
  {
    id: 'msg-03',
    channel_type: 'team',
    team_id: 'team-01',
    sender_id: 'usr-player-01',
    sender_name: 'Rahul Sharma (Team Hydra)',
    sender_role: 'player',
    body: 'Hi Admin, we registered for Champions Cup. Can we swap our substitute before tomorrow?',
    is_pinned: false,
    created_at: '2026-10-12T14:00:00Z'
  },
  {
    id: 'msg-04',
    channel_type: 'team',
    team_id: 'team-01',
    sender_id: 'usr-admin-01',
    sender_name: 'Apex Admin',
    sender_role: 'admin',
    body: 'Yes Rahul! You can edit your player roster anytime under "My Team" before the tournament status moves to Live.',
    is_pinned: false,
    created_at: '2026-10-12T14:15:00Z'
  },
  // Team 02 Private Chat
  {
    id: 'msg-05',
    channel_type: 'team',
    team_id: 'team-02',
    sender_id: 'usr-player-02',
    sender_name: 'Vikram Singh (Total Gaming Elite)',
    sender_role: 'player',
    body: 'Hello Admin, our registration is still showing Pending. Could you please check?',
    is_pinned: false,
    created_at: '2026-10-13T11:20:00Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-01',
    user_id: 'usr-player-01',
    title: 'Registration Approved!',
    message: 'Your team "Team Hydra" has been approved for Free Fire Champions Cup S4.',
    type: 'approval',
    is_read: false,
    created_at: '2026-10-12T11:00:00Z'
  },
  {
    id: 'notif-02',
    user_id: 'usr-player-01',
    title: 'Coins Credited',
    message: '50 coins bonus awarded to your wallet by Admin.',
    type: 'coin',
    is_read: true,
    created_at: '2026-10-12T16:00:00Z'
  },
  {
    id: 'notif-03',
    user_id: 'usr-player-02',
    title: 'Registration Submitted',
    message: 'Your registration is awaiting Admin review.',
    type: 'info',
    is_read: false,
    created_at: '2026-10-11T10:15:00Z'
  }
];

export const INITIAL_ACTIVITY = [
  {
    id: 'act-01',
    action: 'registration_approved',
    description: 'Admin approved Team Hydra for Free Fire Champions Cup S4',
    actor_id: 'usr-admin-01',
    created_at: '2026-10-12T11:00:00Z'
  },
  {
    id: 'act-02',
    action: 'coins_adjusted',
    description: 'Admin added +50 coins to Team Hydra (Bonus)',
    actor_id: 'usr-admin-01',
    created_at: '2026-10-12T16:00:00Z'
  },
  {
    id: 'act-03',
    action: 'registration_created',
    description: 'Total Gaming Elite joined Free Fire Champions Cup S4 (100 coins deducted)',
    actor_id: 'usr-player-02',
    created_at: '2026-10-11T10:15:00Z'
  },
  {
    id: 'act-04',
    action: 'tournament_created',
    description: 'Admin created tournament "Bermuda Clash Solo Showdown"',
    actor_id: 'usr-admin-01',
    created_at: '2026-10-11T12:00:00Z'
  }
];

export const DEFAULT_SETTINGS = {
  site_name: 'Esports Arena',
  default_coins: 100,
  chat_unlock_requirement: 'joined_tournament', // 'joined_tournament' or 'always_open'
  room_visibility_minutes: 15,
  games: ['Free Fire', 'Free Fire MAX'],
  scoring: {
    1: 12,
    2: 9,
    3: 8,
    4: 7,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
    9: 2,
    10: 1,
    kill: 1
  }
};
