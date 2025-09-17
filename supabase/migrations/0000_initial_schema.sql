-- Drop existing objects if they exist to ensure a clean slate.
DROP VIEW IF EXISTS public.leaderboard;
DROP TABLE IF EXISTS public.solved_challenges;
DROP TABLE IF EXISTS public.challenges;

-- Create the challenges table
CREATE TABLE public.challenges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '/assets/icons/ctf-tiers/default-icon.svg',
  features TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL CHECK (category IN ('beginner', 'hacker')),
  flag TEXT,
  url TEXT,
  points INTEGER NOT NULL DEFAULT 10
);

-- Add comments to the challenges table
COMMENT ON TABLE public.challenges IS 'Stores all CTF challenges.';

-- Create the solved_challenges table
CREATE TABLE public.solved_challenges (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Add comments to the solved_challenges table
COMMENT ON TABLE public.solved_challenges IS 'Tracks which users have solved which challenges.';

-- Create the leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
WITH user_scores AS (
  SELECT
    sc.user_id,
    COALESCE(SUM(c.points), 0) AS total_points,
    COUNT(sc.challenge_id) AS solved_challenges
  FROM
    public.solved_challenges sc
  JOIN
    public.challenges c ON sc.challenge_id = c.id
  GROUP BY
    sc.user_id
),
ranked_users AS (
  SELECT
    u.id AS user_id,
    u.raw_user_meta_data->>'full_name' as username,
    us.total_points,
    us.solved_challenges,
    RANK() OVER (ORDER BY us.total_points DESC) as rank
  FROM
    auth.users u
  LEFT JOIN
    user_scores us ON u.id = us.user_id
  WHERE us.total_points IS NOT NULL AND us.total_points > 0
)
SELECT * FROM ranked_users;


-- Add comments to the leaderboard view
COMMENT ON VIEW public.leaderboard IS 'Calculates user scores, challenge counts, and ranks.';

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solved_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for challenges table
CREATE POLICY "Allow all read access to challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to challenges" ON public.challenges FOR ALL USING (auth.jwt()->>'email' = 'frostfoe@gmail.com') WITH CHECK (auth.jwt()->>'email' = 'frostfoe@gmail.com');


-- Create RLS policies for solved_challenges table
CREATE POLICY "Allow users to read all solved challenges" ON public.solved_challenges FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own solved challenges" ON public.solved_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin full access to solved_challenges" ON public.solved_challenges FOR ALL USING (auth.jwt()->>'email' = 'frostfoe@gmail.com') WITH CHECK (auth.jwt()->>'email' = 'frostfoe@gmail.com');
