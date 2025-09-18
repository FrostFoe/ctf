
-- Enable the required extensions
create extension if not exists "moddatetime" with schema "extensions";
create extension if not exists "pg_net" with schema "extensions";
create extension if not exists "uuid-ossp" with schema "extensions";

-- Create the Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category TEXT NOT NULL CHECK (category IN ('beginner', 'hacker', 'practice')),
    flag TEXT,
    featured BOOLEAN DEFAULT FALSE,
    icon TEXT DEFAULT '/assets/icons/ctf-tiers/default-icon.svg',
    features TEXT[] DEFAULT '{}',
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON COLUMN public.challenges.resources IS 'Stores an array of resource objects, e.g., [{"name": "Documentation", "url": "...", "icon": "Book"}]';

-- Create the Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    spendable_points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- Create the Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    points INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    join_token TEXT UNIQUE
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are viewable by everyone." ON public.teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams." ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Team admins can update their own team." ON public.teams FOR UPDATE USING (is_team_admin(id, auth.uid()));


-- Create the Team Members table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view their own team's members." ON public.team_members FOR SELECT USING (is_team_member(team_id, auth.uid()));
CREATE POLICY "Team admins can add new members." ON public.team_members FOR INSERT WITH CHECK (is_team_admin(team_id, auth.uid()));
CREATE POLICY "Team admins can update member roles." ON public.team_members FOR UPDATE USING (is_team_admin(team_id, auth.uid()));
CREATE POLICY "Team members can leave a team." ON public.team_members FOR DELETE USING (auth.uid() = user_id);


-- Create the Solved Challenges table
CREATE TABLE IF NOT EXISTS public.solved_challenges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE,
    solved_at TIMESTAMPTZ DEFAULT NOW(),
    points_awarded INTEGER,
    PRIMARY KEY (user_id, challenge_id)
);
ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own solved challenges." ON public.solved_challenges FOR SELECT USING (auth.uid() = user_id);

-- Create the Hints table
CREATE TABLE IF NOT EXISTS public.hints (
    id SERIAL PRIMARY KEY,
    challenge_id TEXT REFERENCES public.challenges(id) ON DELETE CASCADE,
    hint_text TEXT NOT NULL,
    cost INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hints are viewable by everyone." ON public.hints FOR SELECT USING (true);
CREATE POLICY "Admins can manage hints." ON public.hints FOR ALL USING (is_admin(auth.email()));


-- Create the User Hints table
CREATE TABLE IF NOT EXISTS public.user_hints (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    hint_id INTEGER REFERENCES public.hints(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, hint_id)
);
ALTER TABLE public.user_hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own purchased hints." ON public.user_hints FOR SELECT USING (auth.uid() = user_id);

-- Create the Team Marketplace Items table
CREATE TABLE IF NOT EXISTS public.team_marketplace_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cost INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    item_metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.team_marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketplace items are viewable by everyone." ON public.team_marketplace_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage marketplace items." ON public.team_marketplace_items FOR ALL USING (is_admin(auth.email()));

-- Create the Team Chat Messages table
CREATE TABLE IF NOT EXISTS public.team_chat_messages (
    id BIGSERIAL PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.team_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view chat messages." ON public.team_chat_messages FOR SELECT USING (is_team_member(team_id, auth.uid()));
CREATE POLICY "Team members can send messages." ON public.team_chat_messages FOR INSERT WITH CHECK (is_team_member(team_id, auth.uid()));

-- Security definer functions
CREATE OR REPLACE FUNCTION is_admin(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email = 'frostfoe@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO is_member;
  RETURN is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_admin(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_user_id AND role = 'admin'
  ) INTO is_admin;
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to handle new user signup and create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, spendable_points)
  VALUES (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  
-- Function to handle team points updates
CREATE OR REPLACE FUNCTION update_team_points()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.teams
    SET points = points + NEW.points_awarded
    WHERE id = (SELECT team_id FROM public.team_members WHERE user_id = NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
     UPDATE public.teams
    SET points = points - OLD.points_awarded
    WHERE id = (SELECT team_id FROM public.team_members WHERE user_id = OLD.user_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for team points
CREATE TRIGGER solved_challenge_team_points_trigger
AFTER INSERT OR DELETE ON public.solved_challenges
FOR EACH ROW EXECUTE FUNCTION update_team_points();


-- Function to award points
CREATE OR REPLACE FUNCTION award_points(p_user_id UUID, p_challenge_id TEXT, p_points INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Insert into solved_challenges
  INSERT INTO public.solved_challenges (user_id, challenge_id, points_awarded)
  VALUES (p_user_id, p_challenge_id, p_points);

  -- Update spendable_points in profiles
  UPDATE public.profiles
  SET spendable_points = spendable_points + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to purchase a hint
CREATE OR REPLACE FUNCTION purchase_hint(p_user_id UUID, p_challenge_id TEXT)
RETURNS VOID AS $$
DECLARE
  hint_cost INTEGER;
  hint_id INTEGER;
BEGIN
  -- Get hint cost and id
  SELECT cost, id INTO hint_cost, hint_id
  FROM public.hints
  WHERE challenge_id = p_challenge_id
  LIMIT 1;

  -- Check if user has enough points
  IF (SELECT spendable_points FROM public.profiles WHERE id = p_user_id) >= hint_cost THEN
    -- Deduct points
    UPDATE public.profiles
    SET spendable_points = spendable_points - hint_cost
    WHERE id = p_user_id;

    -- Record the purchase
    INSERT INTO public.user_hints (user_id, hint_id)
    VALUES (p_user_id, hint_id);
  ELSE
    RAISE EXCEPTION 'Not enough points to purchase hint.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to join a team
CREATE OR REPLACE FUNCTION join_team_with_token(p_team_id UUID, p_user_id UUID, p_join_token TEXT)
RETURNS VOID AS $$
DECLARE
  v_team RECORD;
  v_member_count INTEGER;
BEGIN
  -- Check if user is already in any team
  IF EXISTS(SELECT 1 FROM public.team_members WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'user_already_in_team';
  END IF;

  -- Get team details
  SELECT * INTO v_team FROM public.teams WHERE id = p_team_id;

  -- Check member count (assuming a max of 5 members)
  SELECT count(*) INTO v_member_count FROM public.team_members WHERE team_id = p_team_id;
  IF v_member_count >= 5 THEN
    RAISE EXCEPTION 'team_is_full';
  END IF;

  -- Validate token for private teams
  IF v_team.is_private AND v_team.join_token IS DISTINCT FROM p_join_token THEN
    RAISE EXCEPTION 'invalid_join_token';
  END IF;

  -- Add user to team
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (p_team_id, p_user_id, 'member');
END;
$$ LANGUAGE plpgsql;

-- Function to kick a team member
CREATE OR REPLACE FUNCTION kick_team_member(p_team_id UUID, p_kicker_id UUID, p_member_to_kick_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if the kicker is an admin of the team
  IF NOT is_team_admin(p_team_id, p_kicker_id) THEN
    RAISE EXCEPTION 'Only team admins can kick members.';
  END IF;
  
  -- Prevent kicking oneself
  IF p_kicker_id = p_member_to_kick_id THEN
    RAISE EXCEPTION 'You cannot kick yourself.';
  END IF;

  -- Delete the member
  DELETE FROM public.team_members
  WHERE team_id = p_team_id AND user_id = p_member_to_kick_id;
END;
$$ LANGUAGE plpgsql;


-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats_with_profile(user_uuid UUID)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    total_points BIGINT,
    solved_challenges BIGINT,
    rank BIGINT,
    spendable_points INTEGER,
    full_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_points AS (
        SELECT 
            sc.user_id,
            SUM(sc.points_awarded) AS total_points,
            COUNT(sc.challenge_id) AS solved_challenges
        FROM public.solved_challenges sc
        GROUP BY sc.user_id
    ),
    user_ranks AS (
        SELECT 
            up.user_id,
            up.total_points,
            RANK() OVER (ORDER BY up.total_points DESC) as rank
        FROM user_points up
    )
    SELECT
        u.id,
        p.username,
        COALESCE(ur.total_points, 0),
        COALESCE(up.solved_challenges, 0),
        ur.rank,
        p.spendable_points,
        p.full_name
    FROM
        auth.users u
    LEFT JOIN
        public.profiles p ON u.id = p.id
    LEFT JOIN
        user_points up ON u.id = up.user_id
    LEFT JOIN
        user_ranks ur ON u.id = ur.user_id
    WHERE
        u.id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get a public profile by slug (username or ID)
CREATE OR REPLACE FUNCTION get_profile_by_slug(profile_slug TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    total_points BIGINT,
    rank BIGINT,
    solved_challenges_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_base AS (
        SELECT p.id, p.username, p.full_name
        FROM public.profiles p
        WHERE p.username = profile_slug OR p.id::text = profile_slug
    ),
    user_points AS (
        SELECT
            sc.user_id,
            SUM(sc.points_awarded) AS total_points,
            COUNT(sc.challenge_id) AS solved_challenges_count
        FROM public.solved_challenges sc
        WHERE sc.user_id = (SELECT ub.id FROM user_base ub)
        GROUP BY sc.user_id
    ),
    all_ranks AS (
        SELECT
            s.user_id,
            RANK() OVER (ORDER BY SUM(s.points_awarded) DESC) as rank
        FROM public.solved_challenges s
        GROUP BY s.user_id
    )
    SELECT
        ub.id,
        ub.username,
        ub.full_name,
        COALESCE(up.total_points, 0),
        ar.rank,
        COALESCE(up.solved_challenges_count, 0)
    FROM user_base ub
    LEFT JOIN user_points up ON ub.id = up.user_id
    LEFT JOIN all_ranks ar ON ub.id = ar.user_id;
END;
$$ LANGUAGE plpgsql;

-- User Leaderboard View
CREATE OR REPLACE VIEW public.user_leaderboard AS
SELECT
    p.id AS user_id,
    p.username,
    u.email,
    COALESCE(SUM(sc.points_awarded), 0) AS total_points,
    RANK() OVER (ORDER BY COALESCE(SUM(sc.points_awarded), 0) DESC) as rank
FROM
    public.profiles p
JOIN
    auth.users u ON p.id = u.id
LEFT JOIN
    public.solved_challenges sc ON p.id = sc.user_id
GROUP BY
    p.id, p.username, u.email
ORDER BY
    rank;

-- Team Leaderboard View
CREATE OR REPLACE VIEW public.team_leaderboard_table AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.points AS total_points,
    (SELECT COUNT(*) FROM public.team_members tm WHERE tm.team_id = t.id) AS member_count,
    RANK() OVER (ORDER BY t.points DESC) as rank
FROM
    public.teams t
ORDER BY
    rank;

-- Insert sample data
INSERT INTO public.challenges (id, name, description, points, difficulty, category, featured, icon, features, resources) VALUES
('web-injection-101', 'Web Injection 101', 'Find the vulnerability in the login form.', 50, 'easy', 'beginner', TRUE, '/assets/icons/ctf-tiers/injection.svg', '{"SQL Injection","Authentication Bypass"}', '[{"name": "SQL Injection Guide", "url": "https://owasp.org/www-community/attacks/SQL_Injection", "icon": "Book"}, {"name": "Video Tutorial", "url": "https://youtube.com", "icon": "Play"}]'),
('crypto-basics', 'Crypto Basics', 'Decrypt the given ciphertext.', 75, 'easy', 'beginner', FALSE, '/assets/icons/ctf-tiers/crypto.svg', '{"Caesar Cipher","Frequency Analysis"}', '[{"name": "Caesar Cipher Info", "url": "https://en.wikipedia.org/wiki/Caesar_cipher", "icon": "Bookmark"}]'),
('reverse-engineering-crackme', 'Reverse Engineering Crackme', 'Reverse engineer the binary to find the flag.', 150, 'medium', 'hacker', TRUE, '/assets/icons/ctf-tiers/rev-eng.svg', '{"x86 Assembly","Debugging with GDB"}', '[]'),
('forensics-disk-image', 'Forensics Disk Image', 'Analyze the disk image to find hidden files.', 125, 'medium', 'hacker', FALSE, '/assets/icons/ctf-tiers/forensics.svg', '{"File Carving","Steganography"}', '[]'),
('pwn-overflow', 'Pwn Overflow', 'Exploit the buffer overflow to get a shell.', 250, 'hard', 'hacker', TRUE, '/assets/icons/ctf-tiers/pwn.svg', '{"Buffer Overflow","ROP Chains"}', '[]'),
('practice-challenge', 'Practice Challenge', 'A simple challenge to get you started.', 0, 'easy', 'practice', FALSE, '/assets/icons/ctf-tiers/default-icon.svg', '{"Basic Concepts"}', '[]');

    