
-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- Profiles Table
-- Stores public user data.
create table if not exists public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  spendable_points integer not null default 0,
  constraint username_length check (char_length(username) >= 3)
);
comment on table public.profiles is 'Public profile information for each user.';

-- Profiles RLS
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, spendable_points)
  values (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', 0);
  return new;
end;
$$;

-- Trigger to call the function on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Teams Table
-- Stores team information.
create table if not exists public.teams (
  id uuid not null primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null unique,
  created_by uuid not null references auth.users(id),
  points integer not null default 0,
  is_private boolean not null default false,
  join_token text unique
);
comment on table public.teams is 'Stores team information and their collective points.';

-- Generate join_token for private teams
create or replace function public.generate_join_token()
returns trigger
language plpgsql
as $$
begin
  if new.is_private and new.join_token is null then
    new.join_token := substring(extensions.uuid_generate_v4()::text, 1, 8);
  end if;
  return new;
end;
$$;

create trigger set_join_token
before insert on public.teams
for each row execute procedure public.generate_join_token();


-- Teams RLS
alter table public.teams enable row level security;
create policy "Teams are viewable by all authenticated users." on public.teams for select to authenticated using (true);
create policy "Authenticated users can create teams." on public.teams for insert to authenticated with check (true);
create policy "Team admins can update their team." on public.teams for update using (
  id in (
    select team_id from public.team_members where user_id = auth.uid() and role = 'admin'
  )
);
create policy "Last admin can delete the team if they are the only member." on public.teams for delete using (
  created_by = auth.uid() and 
  (select count(*) from public.team_members where team_id = id) <= 1
);

-- Team Members Table
-- Manages the relationship between users and teams.
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone not null default now(),
  primary key (team_id, user_id)
);
comment on table public.team_members is 'Stores which users belong to which teams.';

-- Team Members RLS
alter table public.team_members enable row level security;
create policy "Team members can view other members of their team." on public.team_members for select using (
  team_id in (select team_id from public.team_members where user_id = auth.uid())
);
create policy "Team admins can add new members." on public.team_members for insert with check (
  team_id in (select team_id from public.team_members where user_id = auth.uid() and role = 'admin')
);
create policy "Team admins can update member roles." on public.team_members for update using (
  team_id in (select team_id from public.team_members where user_id = auth.uid() and role = 'admin')
);
create policy "Members can leave a team, and admins can remove members." on public.team_members for delete using (
  user_id = auth.uid() or
  team_id in (select team_id from public.team_members where user_id = auth.uid() and role = 'admin')
);


-- Challenges Table
-- Stores all CTF challenges.
create table if not exists public.challenges (
  id text not null primary key,
  name text not null unique,
  description text not null,
  points integer not null,
  category text not null,
  difficulty text not null,
  flag text,
  url text,
  icon text not null default '/assets/icons/ctf-tiers/default-icon.svg',
  features text[] not null default '{}',
  featured boolean not null default false
);
comment on table public.challenges is 'Stores all CTF challenges.';

-- Challenges RLS
alter table public.challenges enable row level security;
create policy "Challenges are viewable by everyone." on public.challenges for select using (true);
create policy "Admins can manage challenges" on public.challenges for all using (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
) with check (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
);


-- Solved Challenges Table
-- Tracks which users have solved which challenges.
create table if not exists public.solved_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id text not null references public.challenges(id) on delete cascade,
  solved_at timestamp with time zone not null default now(),
  primary key (user_id, challenge_id)
);
comment on table public.solved_challenges is 'Tracks which users have solved which challenges.';

-- Solved Challenges RLS
alter table public.solved_challenges enable row level security;
create policy "Users can view their own solved challenges." on public.solved_challenges for select using (auth.uid() = user_id);
create policy "Users can insert their own solved records." on public.solved_challenges for insert with check (auth.uid() = user_id);

-- Leaderboard View
-- A dynamically calculated view that ranks individual users.
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.username,
  u.email,
  coalesce(sum(c.points), 0)::integer as total_points,
  count(sc.challenge_id)::integer as solved_challenges,
  dense_rank() over (order by coalesce(sum(c.points), 0) desc, min(sc.solved_at) asc) as rank
from public.profiles p
left join auth.users u on p.id = u.id
left join public.solved_challenges sc on p.id = sc.user_id
left join public.challenges c on sc.challenge_id = c.id
group by p.id, u.email
order by total_points desc, min(sc.solved_at) asc;
comment on view public.leaderboard is 'Ranks users based on points and solve time.';

-- Team Leaderboard View
-- A dynamically calculated view that ranks teams.
create or replace view public.team_leaderboard as
select
  t.id as team_id,
  t.name as team_name,
  coalesce(sum(c.points), 0)::integer as total_points,
  count(distinct tm.user_id)::integer as member_count,
  dense_rank() over (order by coalesce(sum(c.points), 0) desc) as rank
from public.teams t
join public.team_members tm on t.id = tm.team_id
left join public.solved_challenges sc on tm.user_id = sc.user_id
left join public.challenges c on sc.challenge_id = c.id
group by t.id, t.name
order by total_points desc;
comment on view public.team_leaderboard is 'Ranks teams based on the total points of their members.';

-- Function to award points
create or replace function public.award_points(p_user_id uuid, p_challenge_id text, p_points integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert into solved_challenges
  insert into public.solved_challenges (user_id, challenge_id)
  values (p_user_id, p_challenge_id);
  
  -- Update spendable_points in profiles
  update public.profiles
  set spendable_points = spendable_points + p_points
  where id = p_user_id;

  -- Update team points if the user is in a team
  update public.teams
  set points = points + p_points
  where id = (select team_id from public.team_members where user_id = p_user_id);
end;
$$;


-- Hints Table
create table if not exists public.hints (
    id bigserial primary key,
    challenge_id text not null references public.challenges(id) on delete cascade unique,
    hint_text text not null,
    cost integer not null default 10 check (cost >= 0)
);
comment on table public.hints is 'Stores hints for challenges.';

-- Hints RLS
alter table public.hints enable row level security;
create policy "Hints are public to view for cost." on public.hints for select using (true);
create policy "Admins can manage hints." on public.hints for all using (
    (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
);

-- User Hints Table
create table if not exists public.user_hints (
    user_id uuid not null references auth.users(id) on delete cascade,
    hint_id bigint not null references public.hints(id) on delete cascade,
    purchased_at timestamp with time zone not null default now(),
    primary key (user_id, hint_id)
);
comment on table public.user_hints is 'Tracks which users have purchased which hints.';

-- User Hints RLS
alter table public.user_hints enable row level security;
create policy "Users can view their own purchased hints." on public.user_hints for select using (auth.uid() = user_id);

-- Function to purchase a hint
create or replace function public.purchase_hint(p_challenge_id text, p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  hint_cost int;
  hint_id_val bigint;
  user_points int;
begin
  select cost, id into hint_cost, hint_id_val from public.hints where challenge_id = p_challenge_id;
  select spendable_points into user_points from public.profiles where id = p_user_id;

  if hint_id_val is null then
    raise exception 'Hint not found for this challenge.';
  end if;

  if user_points is null or user_points < hint_cost then
    raise exception 'Not enough points to purchase hint.';
  end if;

  if exists (select 1 from public.user_hints where user_id = p_user_id and hint_id = hint_id_val) then
    raise exception 'Hint already purchased.';
  end if;

  update public.profiles
  set spendable_points = spendable_points - hint_cost
  where id = p_user_id;

  insert into public.user_hints (user_id, hint_id)
  values (p_user_id, hint_id_val);
end;
$$;


-- Team Chat Messages Table
create table if not exists public.team_chat_messages (
  id bigserial primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete set null,
  message text not null,
  created_at timestamp with time zone not null default now()
);
comment on table public.team_chat_messages is 'Stores chat messages for teams.';

-- Team Chat RLS
alter table public.team_chat_messages enable row level security;
create policy "Team members can view and create messages in their team chat." on public.team_chat_messages for all using (
  team_id in (select team_id from public.team_members where user_id = auth.uid())
);


-- Team Marketplace Items Table
create table if not exists public.team_marketplace_items (
  id bigserial primary key,
  name text not null,
  description text not null,
  cost integer not null check (cost >= 0),
  item_type text not null,
  item_metadata jsonb
);
comment on table public.team_marketplace_items is 'Items available for purchase by teams.';

-- Team Marketplace RLS
alter table public.team_marketplace_items enable row level security;
create policy "All authenticated users can view marketplace items." on public.team_marketplace_items for select to authenticated using (true);
create policy "Admins can manage marketplace items." on public.team_marketplace_items for all using (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
);

-- Purchased Team Items Table (Example - can be expanded)
create table if not exists public.purchased_team_items (
    id bigserial primary key,
    team_id uuid not null references public.teams(id) on delete cascade,
    item_id bigint not null references public.team_marketplace_items(id) on delete cascade,
    purchased_at timestamp with time zone not null default now(),
    purchased_by uuid not null references auth.users(id) on delete set null
);
comment on table public.purchased_team_items is 'Tracks items purchased by teams.';

-- Purchased Team Items RLS
alter table public.purchased_team_items enable row level security;
create policy "Team members can see their team''s purchases." on public.purchased_team_items for select using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
);

-- Function to purchase a team item
create or replace function public.purchase_team_item(p_team_id uuid, p_item_id bigint, p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  item_cost int;
  team_points int;
begin
  if not exists (select 1 from public.team_members where team_id = p_team_id and user_id = p_user_id) then
    raise exception 'User is not a member of this team.';
  end if;

  select cost into item_cost from public.team_marketplace_items where id = p_item_id;
  select points into team_points from public.teams where id = p_team_id;

  if item_cost is null then
    raise exception 'Item not found.';
  end if;

  if team_points < item_cost then
    raise exception 'Not enough team points.';
  end if;

  update public.teams
  set points = points - item_cost
  where id = p_team_id;

  insert into public.purchased_team_items(team_id, item_id, purchased_by)
  values (p_team_id, p_item_id, p_user_id);
end;
$$;


-- Helper functions for team logic
create or replace function public.check_user_not_in_team()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.team_members where user_id = new.user_id) then
    raise exception 'user_already_in_team';
  end if;
  return new;
end;
$$;

create or replace function public.check_team_membership_limit()
returns trigger
language plpgsql
as $$
declare
  member_count integer;
begin
  select count(*) into member_count from public.team_members where team_id = new.team_id;
  if member_count >= 4 then
    raise exception 'team_is_full';
  end if;
  return new;
end;
$$;

-- Triggers for team logic
create trigger before_insert_check_user
before insert on public.team_members
for each row execute procedure public.check_user_not_in_team();

create trigger before_insert_check_limit
before insert on public.team_members
for each row execute procedure public.check_team_membership_limit();


-- Function to join a team with a token
create or replace function public.join_team_with_token(p_team_id uuid, p_user_id uuid, p_join_token text)
returns void
language plpgsql
as $$
declare
  target_team public.teams;
begin
  select * into target_team from public.teams where id = p_team_id;

  if not found then
    raise exception 'Team not found.';
  end if;

  if target_team.is_private and target_team.join_token is distinct from p_join_token then
    raise exception 'invalid_join_token';
  end if;

  insert into public.team_members(team_id, user_id, role)
  values(p_team_id, p_user_id, 'member');
end;
$$;

-- Function to kick a team member
create or replace function public.kick_team_member(p_team_id uuid, p_kicker_id uuid, p_member_to_kick_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  kicker_role text;
begin
  -- Check if the kicker is an admin of the team
  select role into kicker_role from public.team_members
  where team_id = p_team_id and user_id = p_kicker_id;

  if kicker_role is null then
    raise exception 'Kicker is not a member of the team.';
  end if;

  if kicker_role != 'admin' then
    raise exception 'Only admins can kick members.';
  end if;

  if p_kicker_id = p_member_to_kick_id then
    raise exception 'Admin cannot kick themselves.';
  end if;

  -- Delete the member
  delete from public.team_members
  where team_id = p_team_id and user_id = p_member_to_kick_id;
end;
$$;


-- Enable realtime for relevant tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.team_chat_messages;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.team_members;
alter publication supabase_realtime add table public.profiles;


-- Sample Data (Optional)

-- Sample Challenges
INSERT INTO public.challenges (id, name, description, points, category, difficulty, flag, url, icon, features, featured) VALUES
('crypto-intro', 'ক্রিপ্টো পরিচিতি', 'একটি সাধারণ সিজার সাইফার ডিক্রিপ্ট করুন। কী হলো ৩।', 10, 'beginner', 'easy', 'ff{simple_crypto_is_fun}', null, '/assets/icons/ctf-tiers/crypto.svg', '{"ক্লাসিক্যাল সাইফার", "বেসিক ক্রিপ্টোগ্রাফি"}', true),
('web-login', 'ওয়েব লগইন বাইপাস', 'একটি লগইন ফর্ম বাইপাস করার জন্য একটি সাধারণ SQL ইনজেকশন ব্যবহার করুন।', 20, 'beginner', 'easy', 'ff{sqli_for_the_win}', null, '/assets/icons/ctf-tiers/web.svg', '{"SQL ইনজেকশন", "ওয়েব নিরাপত্তা"}', false),
('forensics-img', 'ছবি বিশ্লেষণ', 'এই ছবির মেটাডেটা থেকে লুকানো ফ্ল্যাগটি খুঁজুন।', 30, 'hacker', 'medium', 'ff{metadata_holds_secrets}', null, '/assets/icons/ctf-tiers/forensics.svg', '{"ডিজিটাল ফরেনসিক", "মেটাডেটা বিশ্লেষণ"}', false),
('rev-basic', 'রিভার্স ইঞ্জিনিয়ারিং বেসিক', 'এই বাইনারি ফাইলটি রিভার্স ইঞ্জিনিয়ার করে লুকানো ফ্ল্যাগটি বের করুন।', 50, 'hacker', 'medium', 'ff{reversing_is_rewarding}', null, '/assets/icons/ctf-tiers/rev.svg', '{"অ্যাসেম্বলি ভাষা", "ডিবাগার ব্যবহার"}', true),
('practice-xss', 'অনুশীলন: XSS', 'এই ওয়েব পেজে একটি সাধারণ XSS দুর্বলতা খুঁজুন এবং কাজে লাগান।', 0, 'practice', 'easy', 'ff{practice_makes_perfect_xss}', null, '/assets/icons/ctf-tiers/default-icon.svg', '{"ক্রস-সাইট স্ক্রিপ্টিং", "নিরাপদ অনুশীলন"}', false);

-- Sample Hints
INSERT INTO public.hints (challenge_id, hint_text, cost) VALUES
('crypto-intro', 'সিজার সাইফারে প্রতিটি অক্ষর একটি নির্দিষ্ট সংখ্যক ধাপ এগিয়ে বা পিছিয়ে যায়।', 5),
('rev-basic', 'Ghidra বা IDA-এর মতো একটি ডিসঅ্যাসেম্বলার ব্যবহার করুন এবং স্ট্রিংগুলো খুঁজুন।', 20);

-- Sample Marketplace Item
INSERT INTO public.team_marketplace_items (name, description, cost, item_type, item_metadata) VALUES
('গ্লোবাল হিন্ট: ছবি বিশ্লেষণ', '`forensics-img` চ্যালেঞ্জের জন্য একটি অতিরিক্ত ইঙ্গিত আনলক করুন।', 50, 'global_hint', '{"challenge_id": "forensics-img"}');
