-- =============================================================
-- FrostFoe CTF Platform - Unified Database Setup
-- Single authoritative schema & seed file
-- Safe to run on a fresh Supabase Postgres project
-- Idempotent where practical (ON CONFLICT / IF NOT EXISTS)
-- =============================================================
-- ORDER OF OPERATIONS
-- 1. Extensions
-- 2. Tables (no dependent views/functions yet)
-- 3. RLS enable + Policies
-- 4. Functions (that do NOT depend on views)
-- 5. Views (derived objects)
-- 6. Functions that depend on views (optional advanced)
-- 7. Triggers
-- 8. Realtime publication
-- 9. Storage bucket + policies
-- 10. Seed data
-- 11. Grants & final notices
-- =============================================================

-- 1. EXTENSIONS ------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES ----------------------------------------------------

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  spendable_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_length CHECK (username IS NULL OR char_length(username) >= 3)
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

-- Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beginner','hacker')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  points INTEGER NOT NULL CHECK (points > 0),
  flag TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  features TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL DEFAULT '/assets/icons/ctf-tiers/default-icon.svg',
  url TEXT,
  resources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON public.challenges(featured);
CREATE INDEX IF NOT EXISTS idx_challenges_points ON public.challenges(points);
CREATE INDEX IF NOT EXISTS idx_challenges_category_difficulty ON public.challenges(category,difficulty);

-- Solved Challenges (junction)
CREATE TABLE IF NOT EXISTS public.solved_challenges (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_solved_challenges_user ON public.solved_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_solved_challenges_challenge ON public.solved_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_solved_challenges_user_solved_at ON public.solved_challenges(user_id, solved_at DESC);

-- 3. RLS & POLICIES -------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone.' AND tablename='profiles') THEN
    CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile.' AND tablename='profiles') THEN
    CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile.' AND tablename='profiles') THEN
    CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Challenges Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Challenges are viewable by everyone.' AND tablename='challenges') THEN
    CREATE POLICY "Challenges are viewable by everyone." ON public.challenges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage challenges' AND tablename='challenges') THEN
    CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING ((select auth.jwt() ->> 'email') = 'frostfoe@gmail.com') WITH CHECK ((select auth.jwt() ->> 'email') = 'frostfoe@gmail.com');
  END IF;
END $$;

-- Solved Challenges Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own solved challenges.' AND tablename='solved_challenges') THEN
    CREATE POLICY "Users can view their own solved challenges." ON public.solved_challenges FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all solved challenges' AND tablename='solved_challenges') THEN
    CREATE POLICY "Admins can view all solved challenges" ON public.solved_challenges FOR SELECT USING ((select auth.jwt() ->> 'email') = 'frostfoe@gmail.com');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own solved challenges' AND tablename='solved_challenges') THEN
    CREATE POLICY "Users can insert their own solved challenges" ON public.solved_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own solved challenges' AND tablename='solved_challenges') THEN
    CREATE POLICY "Users can update their own solved challenges" ON public.solved_challenges FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. CORE FUNCTIONS (no view deps) -----------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, spendable_points)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'user_name', NEW.raw_user_meta_data ->> 'full_name', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$;

CREATE OR REPLACE FUNCTION public.award_points(p_user_id UUID, p_challenge_id TEXT, p_points INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_already_solved BOOLEAN; v_exists BOOLEAN; BEGIN
  SELECT EXISTS(SELECT 1 FROM public.challenges WHERE id = p_challenge_id) INTO v_exists;
  IF NOT v_exists THEN RAISE EXCEPTION 'Challenge does not exist'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.solved_challenges WHERE user_id=p_user_id AND challenge_id=p_challenge_id) INTO v_already_solved;
  IF v_already_solved THEN RAISE EXCEPTION 'Challenge already solved by this user'; END IF;
  INSERT INTO public.solved_challenges(user_id, challenge_id) VALUES (p_user_id, p_challenge_id);
  UPDATE public.profiles SET spendable_points = spendable_points + p_points WHERE id = p_user_id;
END;$$;

-- 5. VIEWS ------------------------------------------------------
CREATE OR REPLACE VIEW public.user_total_points AS
SELECT p.id AS user_id, p.username, COALESCE(SUM(c.points),0)::INT AS total_points
FROM public.profiles p
LEFT JOIN public.solved_challenges sc ON p.id = sc.user_id
LEFT JOIN public.challenges c ON sc.challenge_id = c.id
GROUP BY p.id, p.username;

CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT utp.user_id, utp.username, utp.total_points, u.email,
       RANK() OVER (ORDER BY utp.total_points DESC, COALESCE(first_solved_at, 'infinity')) AS rank
FROM public.user_total_points utp
LEFT JOIN (
  SELECT user_id, MIN(solved_at) AS first_solved_at
  FROM public.solved_challenges GROUP BY user_id
) t ON utp.user_id = t.user_id
JOIN auth.users u ON utp.user_id = u.id;

CREATE OR REPLACE VIEW public.user_profile_overview AS
SELECT p.id, p.username, p.full_name,
       COALESCE(lb.total_points,0) AS total_points,
       lb.rank,
       (SELECT COUNT(*) FROM public.solved_challenges sc WHERE sc.user_id = p.id) AS solved_challenges_count
FROM public.profiles p
LEFT JOIN public.user_leaderboard lb ON p.id = lb.user_id;

CREATE OR REPLACE VIEW public.solved_challenges_with_details AS
SELECT sc.user_id, sc.solved_at, c.id, c.name, c.description, c.category, c.difficulty, c.points
FROM public.solved_challenges sc
JOIN public.challenges c ON sc.challenge_id = c.id;

-- 6. ADVANCED FUNCTION (depends on views) ----------------------
CREATE OR REPLACE FUNCTION public.get_user_stats_with_profile(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  total_points INTEGER,
  solved_challenges BIGINT,
  rank BIGINT,
  spendable_points INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT p.id, p.username, p.full_name,
         COALESCE(lb.total_points,0) AS total_points,
         (SELECT COUNT(*) FROM public.solved_challenges WHERE user_id = user_uuid) AS solved_challenges,
         lb.rank,
         p.spendable_points
  FROM public.profiles p
  LEFT JOIN public.user_leaderboard lb ON p.id = lb.user_id
  WHERE p.id = user_uuid;
$$;

-- Lightweight alternative (no view dependency)
CREATE OR REPLACE FUNCTION public.get_user_stats_simple(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  total_points INTEGER,
  solved_challenges BIGINT,
  rank BIGINT,
  spendable_points INTEGER
) LANGUAGE sql SECURITY DEFINER AS $$
  WITH pts AS (
    SELECT p.id, p.username, p.full_name,
           COALESCE(SUM(c.points),0)::INT AS total_points,
           COUNT(sc.challenge_id) AS solved_count,
           p.spendable_points
    FROM public.profiles p
    LEFT JOIN public.solved_challenges sc ON p.id = sc.user_id
    LEFT JOIN public.challenges c ON sc.challenge_id = c.id
    WHERE p.id = user_uuid
    GROUP BY p.id, p.username, p.full_name, p.spendable_points
  ), ranks AS (
    SELECT p.id,
           RANK() OVER (ORDER BY COALESCE(SUM(c.points),0) DESC, MIN(sc.solved_at) ASC) AS rank
    FROM public.profiles p
    LEFT JOIN public.solved_challenges sc ON p.id = sc.user_id
    LEFT JOIN public.challenges c ON sc.challenge_id = c.id
    GROUP BY p.id
  )
  SELECT pts.id, pts.username, pts.full_name, pts.total_points, pts.solved_count, ranks.rank, pts.spendable_points
  FROM pts LEFT JOIN ranks ON pts.id = ranks.id;
$$;

-- 7. TRIGGERS ---------------------------------------------------
-- Create trigger on auth.users only if the auth.users table exists (Safer for non-Supabase Postgres)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
      CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
  ELSE
    RAISE NOTICE 'Skipping creation of on_auth_user_created trigger: auth.users table not found.';
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 8. REALTIME ---------------------------------------------------
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles, public.challenges, public.solved_challenges;

-- 9. STORAGE ----------------------------------------------------
-- Storage: only attempt to create bucket and policies if storage schema is present
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- create bucket if storage.buckets table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='buckets') THEN
      INSERT INTO storage.buckets (id, name) VALUES ('avatars','avatars') ON CONFLICT (id) DO NOTHING;
    ELSE
      RAISE NOTICE 'Skipping insertion into storage.buckets: storage.buckets table not found.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='storage' AND table_name='objects') THEN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Avatar images are publicly accessible.') THEN
        CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id='avatars');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Anyone can upload an avatar.') THEN
        CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id='avatars');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can update their own avatar.') THEN
        CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can delete their own avatar.') THEN
        CREATE POLICY "Users can delete their own avatar." ON storage.objects FOR DELETE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
      END IF;
    ELSE
      RAISE NOTICE 'Skipping creation of storage policies: storage.objects table not found.';
    END IF;
  ELSE
    RAISE NOTICE 'Skipping storage setup: storage schema not found.';
  END IF;
END $$;

-- 10. SEED DATA -------------------------------------------------
INSERT INTO public.challenges (id,name,description,category,difficulty,points,flag,featured,features,icon,url,resources) VALUES
  ('web-101','Web Exploitation 101','A beginner-friendly web challenge that introduces basic web security concepts.','beginner','easy',10,'ff{web_is_fun}',false,ARRAY['HTML','JavaScript','XSS'],'/assets/icons/ctf-tiers/web-icon.svg','https://example.com/web-101','[{"name":"OWASP Web Security","url":"https://owasp.org/www-project-top-ten/"}]'::jsonb),
  ('crypto-basics','Crypto Basics','Learn the fundamentals of cryptography with this introductory challenge.','beginner','easy',15,'ff{crypto_is_cool}',true,ARRAY['Caesar Cipher','Basic Encryption'],'/assets/icons/ctf-tiers/crypto-icon.svg',NULL,NULL),
  ('re-for-dummies','Reverse Engineering for Dummies','An easy reverse engineering task to get you started with binary analysis.','hacker','medium',50,'ff{re_is_awesome}',false,ARRAY['Assembly','Debugging','Ghidra'],'/assets/icons/ctf-tiers/re-icon.svg','https://example.com/re-guide','[{"name":"Ghidra Tutorial","url":"https://ghidra-sre.org/"}]'::jsonb),
  ('pwn-the-kernel','Pwn the Kernel','A challenging kernel exploitation challenge for advanced users.','hacker','hard',100,'ff{kernel_master}',true,ARRAY['Linux Kernel','C','Exploit Development'],'/assets/icons/ctf-tiers/pwn-icon.svg',NULL,NULL),
  ('sql-injection-101','SQL Injection Basics','Learn about SQL injection vulnerabilities and how to prevent them.','beginner','easy',20,'ff{sql_injection_fixed}',true,ARRAY['SQL','Database Security'],'/assets/icons/ctf-tiers/sql-icon.svg',NULL,NULL),
  ('buffer-overflow','Buffer Overflow Challenge','Exploit a buffer overflow vulnerability in this classic challenge.','hacker','medium',75,'ff{buffer_overflow_master}',false,ARRAY['C','Assembly','Memory Management'],'/assets/icons/ctf-tiers/pwn-icon.svg','https://example.com/buffer-overflow',NULL)
ON CONFLICT (id) DO NOTHING;

-- 11. GRANTS & SUMMARY -----------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

DO $$ BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE ' FrostFoe CTF unified database setup complete';
  RAISE NOTICE ' Tables      : profiles, challenges, solved_challenges';
  RAISE NOTICE ' Views       : user_total_points, user_leaderboard, user_profile_overview, solved_challenges_with_details';
  RAISE NOTICE ' Functions   : handle_new_user, award_points, get_user_stats_with_profile, get_user_stats_simple';
  RAISE NOTICE ' Triggers    : on_auth_user_created, updated_at triggers';
  RAISE NOTICE ' Realtime    : publication configured';
  RAISE NOTICE ' Storage     : avatars bucket & policies';
  RAISE NOTICE ' Seed        : sample challenges inserted';
  RAISE NOTICE '================================================';
END $$;
