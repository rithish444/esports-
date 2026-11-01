-- ==============================================================================
-- SUPABASE MIGRATION / CHANGES SCRIPT
-- Esports Tournament Platform: Realtime, RLS Policies, and Safe Join RPC
-- ==============================================================================
-- INSTRUCTIONS FOR USER:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard).
-- 2. Navigate to "SQL Editor" on the left sidebar.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- BLOCK 1: SUPABASE REALTIME PUBLICATION
-- Enables realtime PostgreSQL Change Data Capture (CDC) broadcast for tables.
-- This allows user browsers and mobile devices to receive INSERT, UPDATE, and
-- DELETE events instantly without refreshing the page.
-- ------------------------------------------------------------------------------
do $$
begin
  -- Add tournaments table to realtime publication if not already added
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tournaments'
  ) then
    alter publication supabase_realtime add table public.tournaments;
  end if;

  -- Add registrations table to realtime publication if not already added
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'registrations'
  ) then
    alter publication supabase_realtime add table public.registrations;
  end if;
end $$;

-- ------------------------------------------------------------------------------
-- BLOCK 2: ADMIN CHECK HELPER FUNCTION
-- Defines a secure, reusable function to identify verified admins from profiles.
-- ------------------------------------------------------------------------------
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

grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------------------------------
-- BLOCK 3: ROW LEVEL SECURITY (RLS) FOR TOURNAMENTS
-- - Public Read: Anyone (guests and logged-in players) can view tournaments.
-- - Admin Write: Only verified administrators can insert, update, or delete.
-- ------------------------------------------------------------------------------
alter table public.tournaments enable row level security;

-- Drop existing policies if they exist to prevent duplication errors
drop policy if exists "Public read tournaments" on public.tournaments;
drop policy if exists "Admin insert tournaments" on public.tournaments;
drop policy if exists "Admin update tournaments" on public.tournaments;
drop policy if exists "Admin delete tournaments" on public.tournaments;
drop policy if exists "Allow public select on tournaments" on public.tournaments;
drop policy if exists "Allow admin full access on tournaments" on public.tournaments;

-- 1. Public Read (anon and authenticated users can view tournaments)
create policy "Public read tournaments"
on public.tournaments
for select
using (true);

-- 2. Admin Insert (Only admins can create tournaments)
create policy "Admin insert tournaments"
on public.tournaments
for insert
with check (public.is_admin());

-- 3. Admin Update (Only admins can update tournament details/status)
create policy "Admin update tournaments"
on public.tournaments
for update
using (public.is_admin());

-- 4. Admin Delete (Only admins can delete tournaments)
create policy "Admin delete tournaments"
on public.tournaments
for delete
using (public.is_admin());

-- ------------------------------------------------------------------------------
-- BLOCK 4: ROW LEVEL SECURITY (RLS) FOR REGISTRATIONS
-- - Public Read: Anyone can view active registrations so slot counters update live.
-- - Controlled Insert: Players can join via their owned team, or via join_tournament RPC.
-- ------------------------------------------------------------------------------
alter table public.registrations enable row level security;

drop policy if exists "Public read registrations" on public.registrations;
drop policy if exists "Player or admin insert registrations" on public.registrations;
drop policy if exists "Admin manage registrations" on public.registrations;

-- 1. Public Read (Enables real-time team slot counts on tournament cards)
create policy "Public read registrations"
on public.registrations
for select
using (true);

-- 2. Insert Policy (Players can register their team or admins can register teams)
create policy "Player or admin insert registrations"
on public.registrations
for insert
with check (
  public.is_admin() or 
  exists (
    select 1 from public.teams 
    where id = team_id and owner_id = auth.uid()
  )
);

-- 3. Admin full management on registrations
create policy "Admin manage registrations"
on public.registrations
for all
using (public.is_admin());

-- ------------------------------------------------------------------------------
-- BLOCK 5: ATOMIC join_tournament POSTGRES FUNCTION (RPC)
-- Executes an atomic database transaction with row-level locks (FOR UPDATE):
--  1. Validates that the caller is authenticated.
--  2. Validates team ownership or admin rights.
--  3. Locks the tournament row to eliminate race conditions for the last slot.
--  4. Checks if status is 'Open'.
--  5. Checks if the team is already registered.
--  6. Checks remaining slots.
--  7. Locks wallet row and checks coin balance.
--  8. Deducts coins and inserts a transaction log entry.
--  9. Inserts the registration record.
-- 10. Automatically closes the tournament if maximum slots are reached.
-- ------------------------------------------------------------------------------
create or replace function public.join_tournament(
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
  -- 1. Check user is authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object(
      'success', false, 
      'code', 'AUTH_REQUIRED', 
      'message', 'Authentication required. Please sign in to join.'
    );
  end if;

  -- 2. Verify caller owns this team or is an admin
  if not exists (
    select 1 from public.teams 
    where id = p_team_id and (owner_id = v_user_id or public.is_admin())
  ) then
    return jsonb_build_object(
      'success', false, 
      'code', 'UNAUTHORIZED_TEAM', 
      'message', 'Unauthorized: You can only register your own team.'
    );
  end if;

  -- 3. Lock and retrieve tournament row (Prevents race condition on slots)
  select * into v_tourney 
  from public.tournaments 
  where id = p_tournament_id 
  for update;

  if not found then
    return jsonb_build_object(
      'success', false, 
      'code', 'NOT_FOUND', 
      'message', 'Tournament not found.'
    );
  end if;

  -- 4. Check tournament status
  if v_tourney.status <> 'Open' then
    return jsonb_build_object(
      'success', false, 
      'code', 'NOT_OPEN', 
      'message', 'Tournament registrations are currently ' || v_tourney.status || '.'
    );
  end if;

  -- 5. Check if already registered
  select * into v_existing_reg 
  from public.registrations 
  where tournament_id = p_tournament_id and team_id = p_team_id;

  if found then
    return jsonb_build_object(
      'success', false, 
      'code', 'ALREADY_JOINED', 
      'message', 'Your team is already registered for this tournament.'
    );
  end if;

  -- 6. Check available slots
  select count(*) into v_reg_count 
  from public.registrations 
  where tournament_id = p_tournament_id and status in ('Pending', 'Approved');

  if v_reg_count >= v_tourney.max_teams then
    -- Auto-close if full
    update public.tournaments set status = 'Closed' where id = p_tournament_id;
    return jsonb_build_object(
      'success', false, 
      'code', 'TOURNAMENT_FULL', 
      'message', 'Tournament is completely full! All slots have been taken.'
    );
  end if;

  -- 7. Lock and check team wallet
  select * into v_wallet 
  from public.wallets 
  where team_id = p_team_id 
  for update;

  if not found then
    insert into public.wallets (team_id, balance) 
    values (p_team_id, 0)
    returning * into v_wallet;
  end if;

  if v_wallet.balance < v_tourney.entry_fee then
    return jsonb_build_object(
      'success', false, 
      'code', 'INSUFFICIENT_COINS', 
      'message', 'Insufficient coins! Required: ' || v_tourney.entry_fee || ' Coins, but your balance is ' || v_wallet.balance || ' Coins.'
    );
  end if;

  -- 8. Deduct entry fee
  v_new_balance := v_wallet.balance - v_tourney.entry_fee;
  update public.wallets 
  set balance = v_new_balance, updated_at = now() 
  where team_id = p_team_id;

  -- 9. Record wallet transaction log if fee > 0
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

  -- 10. Insert registration
  insert into public.registrations (
    tournament_id, team_id, status, payment_status, coins_paid
  ) values (
    p_tournament_id, 
    p_team_id, 
    'Pending', 
    case when v_tourney.entry_fee > 0 then 'Paid' else 'Free Entry' end, 
    v_tourney.entry_fee
  ) returning id into v_reg_id;

  -- 11. Unlock team private chat
  update public.teams 
  set chat_unlocked = true 
  where id = p_team_id;

  -- 12. If max slots now reached, auto-close tournament
  if (v_reg_count + 1) >= v_tourney.max_teams then
    update public.tournaments 
    set status = 'Closed' 
    where id = p_tournament_id;
  end if;

  return jsonb_build_object(
    'success', true, 
    'registration_id', v_reg_id, 
    'new_balance', v_new_balance, 
    'message', 'Registration submitted successfully!'
  );
end;
$$;

-- Grant execution permission to authenticated users
grant execute on function public.join_tournament(uuid, uuid) to authenticated;

-- Alias join_tournament_safe for backward compatibility
create or replace function public.join_tournament_safe(
  p_tournament_id uuid,
  p_team_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
begin
  return public.join_tournament(p_tournament_id, p_team_id);
end;
$$;

grant execute on function public.join_tournament_safe(uuid, uuid) to authenticated;

