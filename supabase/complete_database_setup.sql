-- ===========================================
-- COMPLETE CTF DATABASE SETUP & FIXES
-- ===========================================
-- This file contains ALL necessary SQL commands to set up the CTF app database
-- Includes: schema, functions, triggers, fixes, and sample data
-- Run this in Supabase SQL Editor for complete setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Set permissive defaults for public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ===========================================
-- PROFILES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  spendable_points INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, spendable_points)
  VALUES (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ===========================================
-- TEAMS SYSTEM
-- ===========================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  points INTEGER NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT false,
  join_token TEXT UNIQUE
);
COMMENT ON TABLE public.teams IS 'Stores team information and their collective points.';

-- Generate join_token for private teams
CREATE OR REPLACE FUNCTION public.generate_join_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF new.is_private AND new.join_token IS NULL THEN
    new.join_token := substring(extensions.uuid_generate_v4()::text, 1, 8);
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS set_join_token ON public.teams;
CREATE TRIGGER set_join_token
BEFORE INSERT ON public.teams
FOR EACH ROW EXECUTE PROCEDURE public.generate_join_token();

-- TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);
COMMENT ON TABLE public.team_members IS 'Stores which users belong to which teams.';

-- TEAMS RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teams are viewable by all authenticated users." ON public.teams;
CREATE POLICY "Teams are viewable by all authenticated users." ON public.teams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can create teams." ON public.teams;
CREATE POLICY "Authenticated users can create teams." ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Team admins can update their team." ON public.teams;
CREATE POLICY "Team admins can update their team." ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Last admin can delete the team if they are the only member." ON public.teams;
CREATE POLICY "Last admin can delete the team if they are the only member." ON public.teams FOR DELETE USING (
  created_by = auth.uid() AND
  (SELECT count(*) FROM public.team_members WHERE team_id = id) <= 1
);

-- TEAM MEMBERS RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team members can view other members of their team." ON public.team_members;
CREATE POLICY "Team members can view other members of their team." ON public.team_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Team admins can add new members." ON public.team_members;
CREATE POLICY "Team admins can add new members." ON public.team_members FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Team admins can update member roles." ON public.team_members;
CREATE POLICY "Team admins can update member roles." ON public.team_members FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Members can leave a team, and admins can remove members." ON public.team_members;
CREATE POLICY "Members can leave a team, and admins can remove members." ON public.team_members FOR DELETE USING (
  user_id = auth.uid() OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Team business logic triggers
CREATE OR REPLACE FUNCTION public.check_user_not_in_team()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = new.user_id) THEN
    RAISE EXCEPTION 'user_already_in_team';
  END IF;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_team_membership_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT count(*) INTO member_count FROM public.team_members WHERE team_id = new.team_id;
  IF member_count >= 4 THEN
    RAISE EXCEPTION 'team_is_full';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_check_user ON public.team_members;
CREATE TRIGGER before_insert_check_user
BEFORE INSERT ON public.team_members
FOR EACH ROW EXECUTE PROCEDURE public.check_user_not_in_team();

DROP TRIGGER IF EXISTS before_insert_check_limit ON public.team_members;
CREATE TRIGGER before_insert_check_limit
BEFORE INSERT ON public.team_members
FOR EACH ROW EXECUTE PROCEDURE public.check_team_membership_limit();

-- ===========================================
-- CHALLENGES SYSTEM
-- ===========================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  flag TEXT,
  url TEXT,
  icon TEXT NOT NULL DEFAULT '/assets/icons/ctf-tiers/default-icon.svg',
  features TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false
);
COMMENT ON TABLE public.challenges IS 'Stores all CTF challenges.';

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Challenges are viewable by everyone." ON public.challenges;
CREATE POLICY "Challenges are viewable by everyone." ON public.challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage challenges" ON public.challenges;
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (
  (SELECT auth.jwt()->>'email') = 'frostfoe@gmail.com'
) WITH CHECK (
  (SELECT auth.jwt()->>'email') = 'frostfoe@gmail.com'
);

-- SOLVED CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.solved_challenges (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id)
);
COMMENT ON TABLE public.solved_challenges IS 'Tracks which users have solved which challenges.';

ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own solved challenges." ON public.solved_challenges;
CREATE POLICY "Users can view their own solved challenges." ON public.solved_challenges FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own solved records." ON public.solved_challenges;
CREATE POLICY "Users can insert their own solved records." ON public.solved_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- HINTS SYSTEM
-- ===========================================
CREATE TABLE IF NOT EXISTS public.hints (
  id BIGSERIAL PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE UNIQUE,
  hint_text TEXT NOT NULL,
  cost INTEGER NOT NULL DEFAULT 10 CHECK (cost >= 0)
);
COMMENT ON TABLE public.hints IS 'Stores hints for challenges.';

ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hints are public to view for cost." ON public.hints;
CREATE POLICY "Hints are public to view for cost." ON public.hints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage hints." ON public.hints;
CREATE POLICY "Admins can manage hints." ON public.hints FOR ALL USING (
  (SELECT auth.jwt()->>'email') = 'frostfoe@gmail.com'
);

-- USER HINTS TABLE
CREATE TABLE IF NOT EXISTS public.user_hints (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hint_id BIGINT NOT NULL REFERENCES public.hints(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, hint_id)
);
COMMENT ON TABLE public.user_hints IS 'Tracks which users have purchased which hints.';

ALTER TABLE public.user_hints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own purchased hints." ON public.user_hints;
CREATE POLICY "Users can view their own purchased hints." ON public.user_hints FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- TEAM FEATURES
-- ===========================================
CREATE TABLE IF NOT EXISTS public.team_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.team_chat_messages IS 'Stores chat messages for teams.';

ALTER TABLE public.team_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team members can view and create messages in their team chat." ON public.team_chat_messages;
CREATE POLICY "Team members can view and create messages in their team chat." ON public.team_chat_messages FOR ALL USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- TEAM MARKETPLACE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.team_marketplace_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  item_type TEXT NOT NULL,
  item_metadata JSONB
);
COMMENT ON TABLE public.team_marketplace_items IS 'Items available for purchase by teams.';

ALTER TABLE public.team_marketplace_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "All authenticated users can view marketplace items." ON public.team_marketplace_items;
CREATE POLICY "All authenticated users can view marketplace items." ON public.team_marketplace_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage marketplace items." ON public.team_marketplace_items;
CREATE POLICY "Admins can manage marketplace items." ON public.team_marketplace_items FOR ALL USING (
  (SELECT auth.jwt()->>'email') = 'frostfoe@gmail.com'
);

-- PURCHASED TEAM ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.purchased_team_items (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES public.team_marketplace_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purchased_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.purchased_team_items IS 'Tracks items purchased by teams.';

ALTER TABLE public.purchased_team_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team members can see their team's purchases." ON public.purchased_team_items;
CREATE POLICY "Team members can see their team's purchases." ON public.purchased_team_items FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- ===========================================
-- LEADERBOARD SYSTEM (FIXED VERSION)
-- ===========================================
-- Create user leaderboard table
DROP TABLE IF EXISTS public.user_leaderboard CASCADE;
CREATE TABLE public.user_leaderboard (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  solved_challenges INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  spendable_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS for user leaderboard
ALTER TABLE public.user_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User leaderboard is viewable by everyone" ON public.user_leaderboard FOR SELECT USING (true);

-- Create team leaderboard table
DROP TABLE IF EXISTS public.team_leaderboard_table CASCADE;
CREATE TABLE public.team_leaderboard_table (
  team_id UUID PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS for team leaderboard
ALTER TABLE public.team_leaderboard_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team leaderboard is viewable by everyone" ON public.team_leaderboard_table FOR SELECT USING (true);

-- Create function to refresh leaderboard data (FIXED VERSION)
CREATE OR REPLACE FUNCTION public.refresh_user_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Clear existing data using TRUNCATE (safer than DELETE without WHERE)
  TRUNCATE TABLE public.user_leaderboard RESTART IDENTITY;

  -- Insert updated leaderboard data
  INSERT INTO public.user_leaderboard (user_id, username, email, total_points, solved_challenges, rank, spendable_points)
  SELECT
    p.id AS user_id,
    p.username,
    u.email,
    COALESCE(SUM(c.points), 0)::INTEGER AS total_points,
    COUNT(sc.challenge_id)::INTEGER AS solved_challenges,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(c.points), 0) DESC, MIN(sc.solved_at) ASC) AS rank,
    p.spendable_points
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  LEFT JOIN public.solved_challenges sc ON p.id = sc.user_id
  LEFT JOIN public.challenges c ON sc.challenge_id = c.id
  GROUP BY p.id, p.username, u.email, p.spendable_points
  ORDER BY total_points DESC, MIN(sc.solved_at) ASC;
END;
$$;

-- Function to refresh team leaderboard
CREATE OR REPLACE FUNCTION public.refresh_team_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Clear existing data using TRUNCATE (safer than DELETE without WHERE)
  TRUNCATE TABLE public.team_leaderboard_table RESTART IDENTITY;

  -- Insert updated team leaderboard data
  INSERT INTO public.team_leaderboard_table (team_id, team_name, total_points, member_count, rank)
  SELECT
    t.id AS team_id,
    t.name AS team_name,
    COALESCE(SUM(c.points), 0)::INTEGER AS total_points,
    COUNT(DISTINCT tm.user_id)::INTEGER AS member_count,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(c.points), 0) DESC) AS rank
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  LEFT JOIN public.solved_challenges sc ON tm.user_id = sc.user_id
  LEFT JOIN public.challenges c ON sc.challenge_id = c.id
  GROUP BY t.id, t.name
  ORDER BY total_points DESC;
END;
$$;

-- Create a trigger function to automatically update leaderboard when challenges are solved
CREATE OR REPLACE FUNCTION public.update_leaderboard_on_solve()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Refresh both leaderboards
  PERFORM public.refresh_user_leaderboard();
  PERFORM public.refresh_team_leaderboard();
  RETURN NEW;
END;
$$;

-- Create triggers to update leaderboard
DROP TRIGGER IF EXISTS trigger_refresh_leaderboard_on_solve ON public.solved_challenges;
CREATE TRIGGER trigger_refresh_leaderboard_on_solve
  AFTER INSERT OR UPDATE OR DELETE ON public.solved_challenges
  FOR EACH STATEMENT EXECUTE PROCEDURE public.update_leaderboard_on_solve();

-- Also trigger on profile changes
DROP TRIGGER IF EXISTS trigger_refresh_leaderboard_on_profile ON public.profiles;
CREATE TRIGGER trigger_refresh_leaderboard_on_profile
  AFTER UPDATE ON public.profiles
  FOR EACH STATEMENT EXECUTE PROCEDURE public.update_leaderboard_on_solve();

-- Create a function to get user stats with proper relationships
CREATE OR REPLACE FUNCTION public.get_user_stats_with_profile(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  email TEXT,
  total_points INTEGER,
  solved_challenges INTEGER,
  rank INTEGER,
  spendable_points INTEGER,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.user_id,
    ul.username,
    ul.email,
    ul.total_points,
    ul.solved_challenges,
    ul.rank,
    ul.spendable_points,
    p.full_name
  FROM public.user_leaderboard ul
  LEFT JOIN public.profiles p ON ul.user_id = p.id
  WHERE ul.user_id = user_uuid;
END;
$$;

-- Create a function to get profile by slug
CREATE OR REPLACE FUNCTION public.get_profile_by_slug(profile_slug TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  spendable_points INTEGER,
  total_points INTEGER,
  solved_challenges INTEGER,
  rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.spendable_points,
    COALESCE(ul.total_points, 0) as total_points,
    COALESCE(ul.solved_challenges, 0) as solved_challenges,
    ul.rank
  FROM public.profiles p
  LEFT JOIN public.user_leaderboard ul ON p.id = ul.user_id
  WHERE p.username = profile_slug;
END;
$$;

-- Populate the leaderboard tables initially
SELECT public.refresh_user_leaderboard();
SELECT public.refresh_team_leaderboard();

-- Create views that reference the tables for backward compatibility
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard AS
SELECT
  user_id,
  username,
  email,
  total_points,
  solved_challenges,
  rank
FROM public.user_leaderboard;

COMMENT ON VIEW public.leaderboard IS 'User leaderboard view (references user_leaderboard table).';

DROP VIEW IF EXISTS public.team_leaderboard;
CREATE VIEW public.team_leaderboard AS
SELECT
  team_id,
  team_name,
  total_points,
  member_count,
  rank
FROM public.team_leaderboard_table;

COMMENT ON VIEW public.team_leaderboard IS 'Team leaderboard view (references team_leaderboard_table table).';

-- Add proper foreign key relationships to help PostgREST
ALTER TABLE public.user_leaderboard
ADD CONSTRAINT fk_user_leaderboard_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.team_leaderboard_table
ADD CONSTRAINT fk_team_leaderboard_teams
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_rank ON public.user_leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_user_leaderboard_points ON public.user_leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_team_leaderboard_rank ON public.team_leaderboard_table(rank);
CREATE INDEX IF NOT EXISTS idx_team_leaderboard_points ON public.team_leaderboard_table(total_points DESC);

-- Grant necessary permissions
GRANT SELECT ON public.user_leaderboard TO anon, authenticated;
GRANT SELECT ON public.team_leaderboard_table TO anon, authenticated;
GRANT ALL ON public.user_leaderboard TO service_role;
GRANT ALL ON public.team_leaderboard_table TO service_role;

-- ===========================================
-- CORE FUNCTIONS (FIXED VERSION)
-- ===========================================
CREATE OR REPLACE FUNCTION public.purchase_hint(p_challenge_id TEXT, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  hint_cost INT;
  hint_id_val BIGINT;
  user_points INT;
BEGIN
  SELECT cost, id INTO hint_cost, hint_id_val FROM public.hints WHERE challenge_id = p_challenge_id;
  SELECT spendable_points INTO user_points FROM public.profiles WHERE id = p_user_id;

  IF hint_id_val IS NULL THEN
    RAISE EXCEPTION 'Hint not found for this challenge.';
  END IF;

  IF user_points IS NULL OR user_points < hint_cost THEN
    RAISE EXCEPTION 'Not enough points to purchase hint.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_hints WHERE user_id = p_user_id AND hint_id = hint_id_val) THEN
    RAISE EXCEPTION 'Hint already purchased.';
  END IF;

  UPDATE public.profiles
  SET spendable_points = spendable_points - hint_cost
  WHERE id = p_user_id;

  INSERT INTO public.user_hints (user_id, hint_id)
  VALUES (p_user_id, hint_id_val);
END;
$$;

-- FIXED VERSION: award_points function
CREATE OR REPLACE FUNCTION public.award_points(p_user_id UUID, p_challenge_id TEXT, p_points INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.solved_challenges (user_id, challenge_id)
  VALUES (p_user_id, p_challenge_id)
  ON CONFLICT (user_id, challenge_id) DO NOTHING;

  UPDATE public.profiles
  SET spendable_points = spendable_points + p_points
  WHERE id = p_user_id;

  UPDATE public.teams
  SET points = points + p_points
  WHERE id = (SELECT team_id FROM public.team_members WHERE user_id = p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.join_team_with_token(p_team_id UUID, p_user_id UUID, p_join_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  target_team public.teams;
BEGIN
  SELECT * INTO target_team FROM public.teams WHERE id = p_team_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found.';
  END IF;

  IF target_team.is_private AND target_team.join_token IS DISTINCT FROM p_join_token THEN
    RAISE EXCEPTION 'invalid_join_token';
  END IF;

  INSERT INTO public.team_members(team_id, user_id, role)
  VALUES(p_team_id, p_user_id, 'member');
END;
$$;

CREATE OR REPLACE FUNCTION public.kick_team_member(p_team_id UUID, p_kicker_id UUID, p_member_to_kick_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  kicker_role TEXT;
BEGIN
  SELECT role INTO kicker_role FROM public.team_members
  WHERE team_id = p_team_id AND user_id = p_kicker_id;

  IF kicker_role IS NULL THEN
    RAISE EXCEPTION 'Kicker is not a member of the team.';
  END IF;

  IF kicker_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can kick members.';
  END IF;

  IF p_kicker_id = p_member_to_kick_id THEN
    RAISE EXCEPTION 'Admin cannot kick themselves.';
  END IF;

  DELETE FROM public.team_members
  WHERE team_id = p_team_id AND user_id = p_member_to_kick_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_team_item(p_team_id UUID, p_item_id BIGINT, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  item_cost INT;
  team_points INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'User is not a member of this team.';
  END IF;

  SELECT cost INTO item_cost FROM public.team_marketplace_items WHERE id = p_item_id;
  SELECT points INTO team_points FROM public.teams WHERE id = p_team_id;

  IF item_cost IS NULL THEN
    RAISE EXCEPTION 'Item not found.';
  END IF;

  IF team_points < item_cost THEN
    RAISE EXCEPTION 'Not enough team points.';
  END IF;

  UPDATE public.teams
  SET points = points - item_cost
  WHERE id = p_team_id;

  INSERT INTO public.purchased_team_items(team_id, item_id, purchased_by)
  VALUES (p_team_id, p_item_id, p_user_id);
END;
$$;

-- ===========================================
-- REALTIME SETUP
-- ===========================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ===========================================
-- SAMPLE DATA (idempotent seeding)
-- ===========================================
INSERT INTO public.challenges (id, name, description, points, category, difficulty, flag, url, icon, features, featured) VALUES
('crypto-intro', 'ক্রিপ্টো পরিচিতি', 'একটি সাধারণ সিজার সাইফার ডিক্রিপ্ট করুন। কী হলো ৩।', 10, 'beginner', 'easy', 'ff{simple_crypto_is_fun}', NULL, '/assets/icons/ctf-tiers/crypto.svg', '{"ক্লাসিক্যাল সাইফার", "বেসিক ক্রিপ্টোগ্রাফি"}', true),
('web-login', 'ওয়েব লগইন বাইপাস', 'একটি লগইন ফর্ম বাইপাস করার জন্য একটি সাধারণ SQL ইনজেকশন ব্যবহার করুন।', 20, 'beginner', 'easy', 'ff{sqli_for_the_win}', NULL, '/assets/icons/ctf-tiers/web.svg', '{"SQL ইনজেকশন", "ওয়েব নিরাপত্তা"}', false),
('forensics-img', 'ছবি বিশ্লেষণ', 'এই ছবির মেটাডেটা থেকে লুকানো ফ্ল্যাগটি খুঁজুন।', 30, 'hacker', 'medium', 'ff{metadata_holds_secrets}', NULL, '/assets/icons/ctf-tiers/forensics.svg', '{"ডিজিটাল ফরেনসিক", "মেটাডেটা বিশ্লেষণ"}', false),
('rev-basic', 'রিভার্স ইঞ্জিনিয়ারিং বেসিক', 'এই বাইনারি ফাইলটি রিভার্স ইঞ্জিনিয়ার করে লুকানো ফ্ল্যাগটি বের করুন।', 50, 'hacker', 'medium', 'ff{reversing_is_rewarding}', NULL, '/assets/icons/ctf-tiers/rev.svg', '{"অ্যাসেম্বলি ভাষা", "ডিবাগার ব্যবহার"}', true),
('practice-xss', 'অনুশীলন: XSS', 'এই ওয়েব পেজে একটি সাধারণ XSS দুর্বলতা খুঁজুন এবং কাজে লাগান।', 0, 'practice', 'easy', 'ff{practice_makes_perfect_xss}', NULL, '/assets/icons/ctf-tiers/default-icon.svg', '{"ক্রস-সাইট স্ক্রিপ্টিং", "নিরাপদ অনুশীলন"}', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  flag = EXCLUDED.flag,
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  features = EXCLUDED.features,
  featured = EXCLUDED.featured;

INSERT INTO public.hints (challenge_id, hint_text, cost) VALUES
('crypto-intro', 'সিজার সাইফারে প্রতিটি অক্ষর একটি নির্দিষ্ট সংখ্যক ধাপ এগিয়ে বা পিছিয়ে যায়।', 5),
('rev-basic', 'Ghidra বা IDA-এর মতো একটি ডিসঅ্যাসেম্বলার ব্যবহার করুন এবং স্ট্রিংগুলো খুঁজুন।', 20)
ON CONFLICT (challenge_id) DO UPDATE SET
  hint_text = EXCLUDED.hint_text,
  cost = EXCLUDED.cost;

INSERT INTO public.team_marketplace_items (id, name, description, cost, item_type, item_metadata) VALUES
(1, 'গ্লোবাল হিন্ট: ছবি বিশ্লেষণ', '`forensics-img` চ্যালেঞ্জের জন্য একটি অতিরিক্ত ইঙ্গিত আনলক করুন।', 50, 'global_hint', '{"challenge_id": "forensics-img"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  cost = EXCLUDED.cost,
  item_type = EXCLUDED.item_type,
  item_metadata = EXCLUDED.item_metadata;

-- ===========================================
-- FINAL SETUP
-- ===========================================
-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Final leaderboard refresh
SELECT public.refresh_user_leaderboard();
SELECT public.refresh_team_leaderboard();

-- ===========================================
-- SETUP COMPLETE
-- ===========================================
-- Your CTF database is now fully set up with all fixes applied!
-- The award_points function should work correctly without errors.