-- ====================================================================
-- ESPORTS ARENA - COMPLETE SUPABASE DATABASE SCHEMA
-- Free Fire Tournament Management System
-- Paste this entire file into your Supabase SQL Editor and click RUN
-- ====================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. DROP EXISTING OBJECTS (FOR CLEAN RE-RUN IF NEEDED)
-- drop table if exists activity_log cascade;
-- drop table if exists notifications cascade;
-- drop table if exists messages cascade;
-- drop table if exists match_results cascade;
-- drop table if exists matches cascade;
-- drop table if exists registrations cascade;
-- drop table if exists coin_transactions cascade;
-- drop table if exists wallets cascade;
-- drop table if exists team_players cascade;
-- drop table if exists teams cascade;
-- drop table if exists tournaments cascade;
-- drop table if exists settings cascade;
-- drop table if exists profiles cascade;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'player' check (role in ('admin', 'player')),
  is_banned boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TEAMS TABLE
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  team_name text unique not null,
  phone text not null,
  chat_unlocked boolean not null default false,
  created_at timestamptz default now()
);

-- 5. TEAM PLAYERS TABLE
create table if not exists public.team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  player_name text not null,
  ff_name text not null,
  ff_uid text not null check (ff_uid ~ '^[0-9]+$'),
  is_captain boolean not null default false,
  is_substitute boolean not null default false,
  created_at timestamptz default now()
);

-- 6. TOURNAMENTS TABLE
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  game text not null default 'Free Fire',
  mode text not null default 'Squad' check (mode in ('Solo', 'Duo', 'Squad')),
  map text not null default 'Bermuda',
  start_time timestamptz not null,
  entry_fee integer not null default 0 check (entry_fee >= 0),
  prize_pool text not null default '1,000 Coins',
  max_teams integer not null default 12 check (max_teams > 0),
  rules text,
  banner_url text,
  status text not null default 'Open' check (status in ('Open', 'Closed', 'Live', 'Completed')),
  created_at timestamptz default now()
);

-- 7. WALLETS TABLE (1 wallet per team)
create table if not exists public.wallets (
  team_id uuid references public.teams(id) on delete cascade primary key,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz default now()
);

-- 8. COIN TRANSACTIONS TABLE
create table if not exists public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  amount integer not null, -- positive for credits, negative for debits
  reason text not null,
  balance_after integer not null check (balance_after >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 9. REGISTRATIONS TABLE
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  payment_status text not null default 'Paid' check (payment_status in ('Paid', 'Pending', 'Refunded')),
  coins_paid integer not null default 0 check (coins_paid >= 0),
  created_at timestamptz default now(),
  unique (tournament_id, team_id)
);

-- 10. MATCHES TABLE
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  round text not null default 'Match 1',
  start_time timestamptz not null,
  room_id text,
  room_password text,
  created_at timestamptz default now()
);

-- 11. MATCH RESULTS TABLE
create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade not null,
  placement integer not null default 1 check (placement > 0),
  kills integer not null default 0 check (kills >= 0),
  points integer not null default 0 check (points >= 0),
  created_at timestamptz default now(),
  unique (match_id, team_id)
);

-- 12. MESSAGES TABLE (Realtime Chat)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null check (channel_type in ('general', 'team')),
  team_id uuid references public.teams(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_role text not null check (sender_role in ('admin', 'player')),
  body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz default now()
);

-- 13. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('approval', 'rejection', 'coin', 'match', 'info')),
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- 14. ACTIVITY LOG TABLE
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  description text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 15. SETTINGS TABLE
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Default system settings
insert into public.settings (key, value)
values 
  ('site_config', '{"site_name": "Esports Arena", "default_coins": 100, "games": ["Free Fire", "Free Fire MAX"], "scoring": {"1": 12, "2": 9, "3": 8, "4": 7, "5": 6, "6": 5, "7": 4, "8": 3, "9": 2, "10": 1, "kill": 1}}'::jsonb)
on conflict (key) do nothing;

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
create index if not exists idx_teams_owner on public.teams(owner_id);
create index if not exists idx_team_players_team on public.team_players(team_id);
create index if not exists idx_team_players_uid on public.team_players(ff_uid);
create index if not exists idx_registrations_tournament on public.registrations(tournament_id);
create index if not exists idx_registrations_team on public.registrations(team_id);
create index if not exists idx_coin_transactions_team on public.coin_transactions(team_id);
create index if not exists idx_messages_channel on public.messages(channel_type, team_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_activity_created on public.activity_log(created_at desc);

-- ====================================================================
-- HELPER FUNCTIONS & ATOMIC PROCEDURES
-- ====================================================================

-- Function to check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Function: Atomic Tournament Join with Coin Deduction & Chat Unlock
create or replace function public.join_tournament_safe(
  p_tournament_id uuid,
  p_team_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_tourney record;
  v_wallet record;
  v_reg_count integer;
  v_existing_reg record;
  v_new_balance integer;
  v_reg_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'Authentication required');
  end if;

  -- 1. Verify caller owns this team or is admin
  if not exists (
    select 1 from public.teams where id = p_team_id and (owner_id = v_user_id or public.is_admin())
  ) then
    return jsonb_build_object('success', false, 'message', 'Unauthorized team access');
  end if;

  -- 2. Lock and retrieve tournament
  select * into v_tourney from public.tournaments where id = p_tournament_id for update;
  if not found then
    return jsonb_build_object('success', false, 'message', 'Tournament not found');
  end if;

  if v_tourney.status <> 'Open' then
    return jsonb_build_object('success', false, 'message', 'Tournament registrations are ' || v_tourney.status);
  end if;

  -- 3. Check already registered
  select * into v_existing_reg from public.registrations 
  where tournament_id = p_tournament_id and team_id = p_team_id;
  if found then
    return jsonb_build_object('success', false, 'message', 'Team is already registered for this tournament');
  end if;

  -- 4. Check available slots
  select count(*) into v_reg_count from public.registrations 
  where tournament_id = p_tournament_id and status in ('Pending', 'Approved');
  
  if v_reg_count >= v_tourney.max_teams then
    -- Auto-close if full
    update public.tournaments set status = 'Closed' where id = p_tournament_id;
    return jsonb_build_object('success', false, 'message', 'Tournament is already full');
  end if;

  -- 5. Lock and check wallet balance
  select * into v_wallet from public.wallets where team_id = p_team_id for update;
  if not found then
    -- Create wallet if missing
    insert into public.wallets (team_id, balance) values (p_team_id, 0)
    returning * into v_wallet;
  end if;

  if v_wallet.balance < v_tourney.entry_fee then
    return jsonb_build_object(
      'success', false, 
      'message', 'Insufficient coins. Required: ' || v_tourney.entry_fee || ', Your balance: ' || v_wallet.balance
    );
  end if;

  -- 6. Deduct coins if fee > 0
  v_new_balance := v_wallet.balance - v_tourney.entry_fee;
  update public.wallets 
  set balance = v_new_balance, updated_at = now() 
  where team_id = p_team_id;

  -- 7. Record transaction if entry fee > 0
  if v_tourney.entry_fee > 0 then
    insert into public.coin_transactions (
      team_id, amount, reason, balance_after, created_by
    ) values (
      p_team_id, 
      -v_tourney.entry_fee, 
      'Entry fee for tournament: ' || v_tourney.title, 
      v_new_balance, 
      v_user_id
    );
  end if;

  -- 8. Create registration
  insert into public.registrations (
    tournament_id, team_id, status, payment_status, coins_paid
  ) values (
    p_tournament_id, p_team_id, 'Pending', 'Paid', v_tourney.entry_fee
  ) returning id into v_reg_id;

  -- 9. Unlock team private chat with admin (Rule: chat unlocks on first tournament joined)
  update public.teams set chat_unlocked = true where id = p_team_id;

  -- 10. If max reached, auto-close tournament
  if (v_reg_count + 1) >= v_tourney.max_teams then
    update public.tournaments set status = 'Closed' where id = p_tournament_id;
  end if;

  -- 11. Activity log
  insert into public.activity_log (action, description, actor_id, metadata)
  values (
    'registration_created',
    'Team registered for tournament: ' || v_tourney.title,
    v_user_id,
    jsonb_build_object('tournament_id', p_tournament_id, 'team_id', p_team_id, 'fee', v_tourney.entry_fee)
  );

  -- 12. Send notification to team owner
  insert into public.notifications (user_id, title, message, type)
  values (
    v_user_id,
    'Tournament Registration Submitted',
    'Registration for ' || v_tourney.title || ' submitted successfully! Status: Pending approval.',
    'info'
  );

  return jsonb_build_object(
    'success', true, 
    'message', 'Registration submitted successfully!',
    'registration_id', v_reg_id,
    'new_balance', v_new_balance
  );
end;
$$;

-- Function: Admin One-Click Refund & Reject
create or replace function public.refund_registration_safe(
  p_registration_id uuid,
  p_reason text default 'Tournament cancelled or registration rejected'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_admin_id uuid;
  v_reg record;
  v_wallet record;
  v_new_balance integer;
  v_tourney record;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'message', 'Only admins can issue refunds');
  end if;

  select * into v_reg from public.registrations where id = p_registration_id for update;
  if not found then
    return jsonb_build_object('success', false, 'message', 'Registration not found');
  end if;

  select * into v_tourney from public.tournaments where id = v_reg.tournament_id;

  -- If coins were paid and not yet refunded, refund to wallet
  if v_reg.payment_status = 'Paid' and v_reg.coins_paid > 0 then
    select * into v_wallet from public.wallets where team_id = v_reg.team_id for update;
    v_new_balance := coalesce(v_wallet.balance, 0) + v_reg.coins_paid;

    update public.wallets 
    set balance = v_new_balance, updated_at = now() 
    where team_id = v_reg.team_id;

    insert into public.coin_transactions (
      team_id, amount, reason, balance_after, created_by
    ) values (
      v_reg.team_id, 
      v_reg.coins_paid, 
      'Refund for ' || coalesce(v_tourney.title, 'Tournament') || ' - ' || p_reason, 
      v_new_balance, 
      v_admin_id
    );
  end if;

  -- Update registration status
  update public.registrations 
  set status = 'Rejected', payment_status = 'Refunded'
  where id = p_registration_id;

  -- Send notification to team owner
  insert into public.notifications (
    user_id, title, message, type
  ) select 
    owner_id, 
    'Registration Refunded & Rejected', 
    'Your registration for ' || coalesce(v_tourney.title, 'Tournament') || ' was refunded (' || v_reg.coins_paid || ' coins returned).',
    'rejection'
  from public.teams where id = v_reg.team_id;

  return jsonb_build_object('success', true, 'message', 'Registration rejected and refunded successfully');
end;
$$;

-- Function: Admin Manual Coin Adjustment
create or replace function public.admin_adjust_coins(
  p_team_id uuid,
  p_amount integer,
  p_reason text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_admin_id uuid;
  v_wallet record;
  v_new_balance integer;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    return jsonb_build_object('success', false, 'message', 'Admin access required');
  end if;

  select * into v_wallet from public.wallets where team_id = p_team_id for update;
  if not found then
    insert into public.wallets (team_id, balance) values (p_team_id, 0)
    returning * into v_wallet;
  end if;

  v_new_balance := v_wallet.balance + p_amount;
  if v_new_balance < 0 then
    return jsonb_build_object('success', false, 'message', 'Balance cannot become negative');
  end if;

  update public.wallets 
  set balance = v_new_balance, updated_at = now() 
  where team_id = p_team_id;

  insert into public.coin_transactions (
    team_id, amount, reason, balance_after, created_by
  ) values (
    p_team_id, p_amount, p_reason, v_new_balance, v_admin_id
  );

  insert into public.notifications (user_id, title, message, type)
  select 
    owner_id, 
    case when p_amount >= 0 then 'Coins Received!' else 'Coins Deducted' end,
    'Admin adjusted your wallet: ' || (case when p_amount >= 0 then '+' else '' end) || p_amount || ' coins. Reason: ' || p_reason,
    'coin'
  from public.teams where id = p_team_id;

  return jsonb_build_object('success', true, 'new_balance', v_new_balance);
end;
$$;

-- ====================================================================
-- AUTOMATIC USER PROFILE TRIGGER
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  v_default_coins integer := 0;
begin
  -- Fetch default coins from settings if defined
  select coalesce((value->>'default_coins')::integer, 0) into v_default_coins
  from public.settings where key = 'site_config';

  insert into public.profiles (id, name, email, role, is_banned)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'player', -- Always player by default! Role can NEVER be chosen by user.
    false
  );

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- 🛡️ FIREWALL SHIELD: DATABASE DEFENSE TRIGGERS
-- ====================================================================

-- 1. Anti-Tamper: Block unauthorized privilege escalation & ban tampering
create or replace function public.protect_profile_security()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Prevent any regular authenticated user from upgrading their own role to 'admin' or unbanning themselves
  -- Allows direct database administrators / SQL editor where auth.uid() is null
  if (new.role <> old.role or new.is_banned <> old.is_banned) then
    if auth.uid() is not null and not public.is_admin() then
      raise exception '🚨 Security Violation: Unauthorized privilege escalation blocked. Only existing verified administrators can alter roles or ban status.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_security on public.profiles;
create trigger trg_protect_profile_security
  before update on public.profiles
  for each row execute procedure public.protect_profile_security();

-- 2. Anti-Cheat: Prevent cross-team Free Fire UID duplication
create or replace function public.check_unique_ff_uid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.team_players
    where ff_uid = new.ff_uid and team_id <> new.team_id
  ) then
    raise exception '🚨 Security Violation: Free Fire UID % is already registered under another team. Multi-team UID sharing is blocked.', new.ff_uid;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_unique_ff_uid on public.team_players;
create trigger trg_check_unique_ff_uid
  before insert or update on public.team_players
  for each row execute procedure public.check_unique_ff_uid();

-- 3. Secure Room Credential Access Barrier
create or replace function public.get_secure_match_room(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_match record;
  v_diff_mins numeric;
  v_is_approved boolean := false;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'message', 'Authentication required');
  end if;

  select * into v_match from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('success', false, 'message', 'Match not found');
  end if;

  -- Admin always has access
  if public.is_admin() then
    return jsonb_build_object(
      'success', true,
      'room_id', v_match.room_id,
      'room_password', v_match.room_password
    );
  end if;

  -- Check if user owns an APPROVED team in this tournament
  select exists (
    select 1 from public.registrations r
    join public.teams t on t.id = r.team_id
    where r.tournament_id = v_match.tournament_id 
      and t.owner_id = v_user_id 
      and r.status = 'Approved'
  ) into v_is_approved;

  if not v_is_approved then
    return jsonb_build_object('success', false, 'message', 'Access denied: Team not approved for this tournament');
  end if;

  -- Check 15-minute countdown barrier
  v_diff_mins := extract(epoch from (v_match.start_time - now())) / 60.0;
  if v_diff_mins > 15 then
    return jsonb_build_object(
      'success', false, 
      'message', 'Room locked: Credentials reveal 15 minutes prior to match start'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'room_id', v_match.room_id,
    'room_password', v_match.room_password
  );
end;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_players enable row level security;
alter table public.tournaments enable row level security;
alter table public.wallets enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.registrations enable row level security;
alter table public.matches enable row level security;
alter table public.match_results enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.settings enable row level security;

-- PROFILES POLICIES
create policy "Public profiles read" on public.profiles
  for select using (true);
create policy "User can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- TEAMS POLICIES
create policy "Teams are viewable by everyone" on public.teams
  for select using (true);
create policy "User can create team" on public.teams
  for insert with check (auth.uid() = owner_id or public.is_admin());
create policy "User can update own team or admin" on public.teams
  for update using (auth.uid() = owner_id or public.is_admin());
create policy "Admin can delete team" on public.teams
  for delete using (public.is_admin());

-- TEAM PLAYERS POLICIES
create policy "Team players viewable by everyone" on public.team_players
  for select using (true);
create policy "Team owner can insert players" on public.team_players
  for insert with check (
    exists (select 1 from public.teams where id = team_id and (owner_id = auth.uid() or public.is_admin()))
  );
create policy "Team owner can update players" on public.team_players
  for update using (
    exists (select 1 from public.teams where id = team_id and (owner_id = auth.uid() or public.is_admin()))
  );
create policy "Team owner can delete players" on public.team_players
  for delete using (
    exists (select 1 from public.teams where id = team_id and (owner_id = auth.uid() or public.is_admin()))
  );

-- TOURNAMENTS POLICIES
create policy "Tournaments viewable by everyone" on public.tournaments
  for select using (true);
create policy "Only admin can insert tournaments" on public.tournaments
  for insert with check (public.is_admin());
create policy "Only admin can update tournaments" on public.tournaments
  for update using (public.is_admin());
create policy "Only admin can delete tournaments" on public.tournaments
  for delete using (public.is_admin());

-- WALLETS POLICIES
create policy "Team owner or admin can view wallet" on public.wallets
  for select using (
    public.is_admin() or exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "Only admin or system functions can update wallet" on public.wallets
  for update using (public.is_admin());
create policy "Insert wallet" on public.wallets
  for insert with check (
    public.is_admin() or exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );

-- COIN TRANSACTIONS POLICIES
create policy "Team owner or admin can view transactions" on public.coin_transactions
  for select using (
    public.is_admin() or exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "Only admin can insert direct transactions" on public.coin_transactions
  for insert with check (public.is_admin());

-- REGISTRATIONS POLICIES
create policy "Registrations viewable by team owner or admin" on public.registrations
  for select using (
    public.is_admin() 
    or status = 'Approved' 
    or exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "Join tournament via procedure or admin" on public.registrations
  for insert with check (
    public.is_admin() or exists (select 1 from public.teams where id = team_id and owner_id = auth.uid())
  );
create policy "Only admin can update registration status" on public.registrations
  for update using (public.is_admin());

-- MATCHES POLICIES
create policy "Matches are viewable by authenticated users" on public.matches
  for select using (auth.role() = 'authenticated');
create policy "Only admin can manage matches" on public.matches
  for all using (public.is_admin());

-- MATCH RESULTS POLICIES
create policy "Match results viewable by everyone" on public.match_results
  for select using (true);
create policy "Only admin can manage match results" on public.match_results
  for all using (public.is_admin());

-- MESSAGES POLICIES (Realtime Chat Rules)
-- 1. General announcement channel: anyone can read, only admin can write
-- 2. Team channel: only admin OR that specific team owner can read and write
create policy "Messages select policy" on public.messages
  for select using (
    channel_type = 'general'
    or public.is_admin()
    or (channel_type = 'team' and exists (select 1 from public.teams where id = team_id and owner_id = auth.uid()))
  );

create policy "Messages insert policy" on public.messages
  for insert with check (
    (channel_type = 'general' and public.is_admin())
    or (channel_type = 'team' and (
      public.is_admin() 
      or (
        exists (select 1 from public.teams where id = team_id and owner_id = auth.uid() and chat_unlocked = true)
      )
    ))
  );

-- NOTIFICATIONS POLICIES
create policy "User can view own notifications" on public.notifications
  for select using (auth.uid() = user_id or public.is_admin());
create policy "User can update own notifications" on public.notifications
  for update using (auth.uid() = user_id or public.is_admin());
create policy "Insert notifications" on public.notifications
  for insert with check (true);

-- ACTIVITY LOG POLICIES
create policy "Only admin can view activity log" on public.activity_log
  for select using (public.is_admin());
create policy "Insert activity log" on public.activity_log
  for insert with check (true);

-- SETTINGS POLICIES
create policy "Settings viewable by authenticated" on public.settings
  for select using (auth.role() = 'authenticated');
create policy "Only admin can update settings" on public.settings
  for all using (public.is_admin());

-- ====================================================================
-- REALTIME SETUP
-- ====================================================================
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tournaments;
exception when others then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.registrations;
exception when others then null;
end $$;

-- ====================================================================
-- DEMO SEED DATA (Can be executed cleanly)
-- ====================================================================
-- Note: Replace demo admin email/id with your own after signing up.
