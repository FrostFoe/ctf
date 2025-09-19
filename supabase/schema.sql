
--
-- Create a table for public profiles
--
create table profiles (
  id uuid not null references auth.users on delete cascade,
  username text unique,
  full_name text,
  spendable_points integer not null default 0,
  constraint username_length check (char_length(username) >= 3)
);
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

--
-- Create a table for challenges
--
create table challenges (
  id text primary key,
  name text not null unique,
  description text not null,
  category text not null,
  difficulty text not null,
  points integer not null,
  flag text,
  featured boolean not null default false,
  features text[] not null default '{}',
  icon text not null default '/assets/icons/ctf-tiers/default-icon.svg',
  url text,
  resources jsonb
);
alter table challenges enable row level security;
create policy "Challenges are viewable by everyone." on challenges for select using (true);
create policy "Admins can manage challenges" on challenges for all using (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
) with check (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
);

--
-- Create a table for solved challenges
--
create table solved_challenges (
  user_id uuid not null references auth.users on delete cascade,
  challenge_id text not null references challenges on delete cascade,
  solved_at timestamp with time zone not null default now(),
  primary key (user_id, challenge_id)
);
alter table solved_challenges enable row level security;
create policy "Users can view their own solved challenges." on solved_challenges for select using (auth.uid() = user_id);
create policy "Admins can view all solved challenges" on solved_challenges for select using (
  (select auth.jwt() ->> 'email') = 'frostfoe@gmail.com'
);

--
-- Set up Realtime!
--
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles, challenges, solved_challenges;

--
-- Set up Storage!
--
insert into storage.buckets (id, name)
values ('avatars', 'avatars');
create policy "Avatar images are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');
create policy "Anyone can upload an avatar." on storage.objects for insert with check (bucket_id = 'avatars');

--
-- Functions and Triggers
--

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, spendable_points)
  values (new.id, new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'full_name', 0);
  return new;
end;
$$;

-- Trigger to call handle_new_user on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to award points
create or replace function public.award_points(p_user_id uuid, p_challenge_id text, p_points integer)
returns void
language plpgsql
as $$
begin
  -- Insert into solved_challenges
  insert into public.solved_challenges(user_id, challenge_id)
  values (p_user_id, p_challenge_id);

  -- Update spendable_points for the user
  update public.profiles
  set spendable_points = spendable_points + p_points
  where id = p_user_id;
end;
$$;

--
-- Views for Leaderboards and Stats
--

-- View for user total points and rank
create or replace view public.user_total_points as
select
  p.id as user_id,
  p.username,
  coalesce(sum(c.points), 0)::integer as total_points
from
  profiles p
left join
  solved_challenges sc on p.id = sc.user_id
left join
  challenges c on sc.challenge_id = c.id
group by
  p.id, p.username;

-- View for user leaderboard
create or replace view public.user_leaderboard as
select
  utp.user_id,
  utp.username,
  utp.total_points,
  u.email,
  rank() over (order by utp.total_points desc, min_solved_at asc) as rank
from
  user_total_points utp
join (
  select
    user_id,
    min(solved_at) as min_solved_at
  from solved_challenges
  group by user_id
) as sc_times on utp.user_id = sc_times.user_id
join auth.users u on utp.user_id = u.id
group by utp.user_id, utp.username, utp.total_points, u.email, sc_times.min_solved_at;

-- Function to get user stats
create or replace function public.get_user_stats_with_profile(user_uuid uuid)
returns table (
  user_id uuid,
  username text,
  full_name text,
  total_points integer,
  solved_challenges bigint,
  rank bigint,
  spendable_points integer
)
language sql
as $$
  select
    p.id as user_id,
    p.username,
    p.full_name,
    lb.total_points,
    (select count(*) from solved_challenges where user_id = user_uuid) as solved_challenges,
    lb.rank,
    p.spendable_points
  from
    profiles p
  left join
    user_leaderboard lb on p.id = lb.user_id
  where
    p.id = user_uuid;
$$;

-- View for public user profile overview
create or replace view public.user_profile_overview as
  select
    p.id,
    p.username,
    p.full_name,
    lb.total_points,
    lb.rank,
    (select count(*) from solved_challenges where user_id = p.id) as solved_challenges_count
  from profiles p
  left join user_leaderboard lb on p.id = lb.user_id;

-- View for solved challenges with details
create or replace view public.solved_challenges_with_details as
  select
    sc.user_id,
    sc.solved_at,
    c.id,
    c.name,
    c.description,
    c.category,
    c.difficulty,
    c.points
  from solved_challenges sc
  join challenges c on sc.challenge_id = c.id;
