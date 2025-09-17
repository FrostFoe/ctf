-- Function to get a user's display name from auth.users
CREATE OR REPLACE FUNCTION get_user_display_name(user_id uuid)
RETURNS TEXT AS $$
  SELECT raw_user_meta_data->>'full_name'
  FROM auth.users
  WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- Points calculation based on difficulty
CREATE OR REPLACE FUNCTION get_challenge_points(difficulty text)
RETURNS INT AS $$
  SELECT CASE
    WHEN difficulty = 'easy' THEN 10
    WHEN difficulty = 'medium' THEN 50
    WHEN difficulty = 'hard' THEN 100
    ELSE 0
  END;
$$ LANGUAGE sql IMMUTABLE;


-- Leaderboard View
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  sc.user_id,
  get_user_display_name(sc.user_id) as username,
  COUNT(sc.challenge_id) as solved_challenges,
  SUM(get_challenge_points(c.difficulty)) as total_points,
  RANK() OVER (ORDER BY SUM(get_challenge_points(c.difficulty)) DESC, MAX(sc.solved_at) ASC) as rank
FROM
  public.solved_challenges sc
JOIN
  public.challenges c ON sc.challenge_id = c.id
GROUP BY
  sc.user_id
ORDER BY
  total_points DESC,
  MAX(sc.solved_at) ASC;
