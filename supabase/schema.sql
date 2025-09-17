-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  spendable_points INT DEFAULT 0 NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user' || substr(new.id::text, 1, 8)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function upon new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Challenges table
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points >= 0),
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  flag TEXT,
  url TEXT,
  icon TEXT DEFAULT '/assets/icons/ctf-tiers/default-icon.svg',
  features TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE
);

-- Solved challenges table (join table)
CREATE TABLE solved_challenges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  points INT DEFAULT 0 NOT NULL
);

-- Team members table (join table)
CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id),
  UNIQUE (user_id) -- Ensures a user can only be in one team
);

-- Check function to ensure a user is not in another team before insertion
CREATE OR REPLACE FUNCTION check_user_not_in_team()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM team_members WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'user_already_in_team: This user is already in a team.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check function to ensure team does not exceed member limit
CREATE OR REPLACE FUNCTION check_team_membership_limit()
RETURNS TRIGGER AS $$
DECLARE
  member_count INT;
BEGIN
  SELECT count(*) INTO member_count FROM team_members WHERE team_id = NEW.team_id;
  IF member_count >= 4 THEN
    RAISE EXCEPTION 'team_is_full: This team has reached the maximum number of members (4).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check user's team status before adding them to a new team
CREATE TRIGGER before_insert_team_member_check_user
  BEFORE INSERT ON team_members
  FOR EACH ROW EXECUTE PROCEDURE check_user_not_in_team();

-- Trigger to check team size before adding a new member
CREATE TRIGGER before_insert_team_member_check_limit
  BEFORE INSERT ON team_members
  FOR EACH ROW EXECUTE PROCEDURE check_team_membership_limit();


-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  COALESCE(SUM(c.points), 0) AS total_points,
  COUNT(sc.challenge_id) AS solved_challenges,
  RANK() OVER (ORDER BY COALESCE(SUM(c.points), 0) DESC) AS rank
FROM profiles p
LEFT JOIN solved_challenges sc ON p.id = sc.user_id
LEFT JOIN challenges c ON sc.challenge_id = c.id
WHERE c.category <> 'practice' OR c.id IS NULL
GROUP BY p.id
ORDER BY total_points DESC;

-- Team leaderboard view
CREATE OR REPLACE VIEW team_leaderboard AS
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.points AS total_points,
    (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count,
    RANK() OVER (ORDER BY t.points DESC) AS rank
FROM teams t
ORDER BY total_points DESC;

-- Function to award points and mark challenge as solved
CREATE OR REPLACE FUNCTION award_points(p_user_id UUID, p_challenge_id TEXT, p_points INT)
RETURNS void AS $$
BEGIN
  -- Use a transaction to ensure both operations succeed or fail together
  -- Add points to the profile's spendable_points
  UPDATE profiles
  SET spendable_points = spendable_points + p_points
  WHERE id = p_user_id;

  -- Insert into solved_challenges
  INSERT INTO solved_challenges (user_id, challenge_id)
  VALUES (p_user_id, p_challenge_id);
END;
$$ LANGUAGE plpgsql;

-- Hints table
CREATE TABLE hints (
  id SERIAL PRIMARY KEY,
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  hint_text TEXT NOT NULL,
  cost INT NOT NULL CHECK (cost >= 0)
);

-- User hints table (tracks purchased hints)
CREATE TABLE user_hints (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hint_id INT REFERENCES hints(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, hint_id)
);

-- Function to purchase a hint
CREATE OR REPLACE FUNCTION purchase_hint(p_challenge_id TEXT, p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_hint_id INT;
  v_hint_cost INT;
  user_points INT;
BEGIN
  -- Get hint id and cost
  SELECT id, cost INTO v_hint_id, v_hint_cost
  FROM hints
  WHERE challenge_id = p_challenge_id;

  -- If no hint exists, do nothing
  IF v_hint_id IS NULL THEN
    RAISE EXCEPTION 'Hint not found for challenge %', p_challenge_id;
  END IF;

  -- Get user's current spendable points
  SELECT spendable_points INTO user_points
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user has enough points
  IF user_points < v_hint_cost THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Start transaction
  -- Deduct points from user
  UPDATE profiles
  SET spendable_points = spendable_points - v_hint_cost
  WHERE id = p_user_id;

  -- Add to user_hints table
  INSERT INTO user_hints (user_id, hint_id)
  VALUES (p_user_id, v_hint_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Team chat messages table
CREATE TABLE team_chat_messages (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team marketplace items table
CREATE TABLE team_marketplace_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cost INTEGER NOT NULL CHECK (cost >= 0),
    item_type TEXT NOT NULL, -- e.g., 'global_hint', 'profile_badge'
    item_metadata JSONB -- e.g., {"challenge_id": "crypto-101"}
);


-- Purchased team items table
CREATE TABLE purchased_team_items (
    id BIGSERIAL PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES team_marketplace_items(id) ON DELETE CASCADE,
    purchased_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to purchase a team item
CREATE OR REPLACE FUNCTION purchase_team_item(p_team_id UUID, p_item_id INT, p_user_id UUID)
RETURNS void AS $$
DECLARE
  item_cost INT;
  team_points INT;
BEGIN
  -- Verify the user is a member of the team
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = p_team_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'User is not a member of this team';
  END IF;

  -- Get the item's cost
  SELECT cost INTO item_cost FROM team_marketplace_items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  -- Get the team's current points
  SELECT points INTO team_points FROM teams WHERE id = p_team_id;

  -- Check if team has enough points
  IF team_points < item_cost THEN
    RAISE EXCEPTION 'Insufficient team points';
  END IF;

  -- Perform the transaction
  UPDATE teams SET points = points - item_cost WHERE id = p_team_id;
  INSERT INTO purchased_team_items (team_id, item_id, purchased_by)
  VALUES (p_team_id, p_item_id, p_user_id);

  -- Here you could add logic to apply the item's effect,
  -- for example, granting a hint to all team members.
  -- For now, we just record the purchase.

END;
$$ LANGUAGE plpgsql;


-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE solved_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchased_team_items ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for challenges
CREATE POLICY "Challenges are viewable by everyone." ON challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON challenges FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' -- Assuming you have a role in profiles
);
-- Note: A simpler check for a specific admin email can't be done directly in RLS without a function.
-- For a start-up, often application-level security for admin actions is sufficient.

-- Policies for solved_challenges
CREATE POLICY "Users can view their own solved challenges." ON solved_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own solved records." ON solved_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Disallow updates/deletes for integrity
CREATE POLICY "Solved challenges cannot be updated or deleted by users." ON solved_challenges FOR UPDATE USING (false);
CREATE POLICY "Solved challenges cannot be deleted by users." ON solved_challenges FOR DELETE USING (false);

-- Policies for teams
CREATE POLICY "Teams are viewable by everyone." ON teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams." ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Only team admins or a super admin should be able to update/delete teams
CREATE POLICY "Team admins can update their team." ON teams FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid() AND team_members.role = 'admin'
  )
);
CREATE POLICY "Team admins can delete their team." ON teams FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id AND team_members.user_id = auth.uid() AND team_members.role = 'admin'
  )
);

-- Policies for team_members
CREATE POLICY "Team members are viewable by everyone." ON team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join teams." ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can leave teams, or admins can remove members." ON team_members FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM team_members AS admins
    WHERE admins.team_id = team_members.team_id AND admins.user_id = auth.uid() AND admins.role = 'admin'
  )
);
CREATE POLICY "Admins can update member roles." ON team_members FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM team_members AS admins
    WHERE admins.team_id = team_members.team_id AND admins.user_id = auth.uid() AND admins.role = 'admin'
  )
);

-- Policies for hints
CREATE POLICY "Hints are viewable by authenticated users" ON hints FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for user_hints
CREATE POLICY "Users can view their own purchased hints" ON user_hints FOR SELECT USING (auth.uid() = user_id);

-- Policies for team_chat_messages
CREATE POLICY "Team members can view their team's chat." ON team_chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM team_members WHERE team_members.team_id = team_chat_messages.team_id AND team_members.user_id = auth.uid()
  ));
CREATE POLICY "Team members can post messages in their team's chat." ON team_chat_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM team_members WHERE team_members.team_id = team_chat_messages.team_id AND team_members.user_id = auth.uid()
  ));

-- Policies for team_marketplace_items
CREATE POLICY "Marketplace items are viewable by authenticated users." ON team_marketplace_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for purchased_team_items
CREATE POLICY "Team members can see their team's purchases." ON purchased_team_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM team_members WHERE team_members.team_id = purchased_team_items.team_id AND team_members.user_id = auth.uid()
  ));


-- Publications for realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE solved_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- Dummy data (optional)

-- Challenges
INSERT INTO challenges (id, name, description, points, difficulty, category, flag, features) VALUES
('web-101', 'Baby Web', 'A simple web challenge to get you started.', 10, 'easy', 'beginner', 'ff{w3lc0me_t0_w3b}', '{"HTML", "CSS"}'),
('crypto-101', 'Caesar Cipher', 'Can you decrypt this ancient message?', 20, 'easy', 'hacker', 'ff{brut3_f0rc3_is_k3y}', '{"Classical Cipher", "Frequency Analysis"}'),
('rev-101', 'Simple Crackme', 'Reverse engineer this binary to find the flag.', 50, 'medium', 'hacker', 'ff{r3v3rs1ng_is_fun}', '{"x86 Assembly", "Debugging"}'),
('pwn-101', 'Buffer Overflow', 'Exploit a simple buffer overflow to get a shell.', 100, 'hard', 'hacker', 'ff{st4ck_sm4sh1ng_pr0}', '{"C Programming", "GDB"}'),
('practice-web-1', 'Practice SQLi', 'A safe environment to practice SQL injection.', 0, 'easy', 'practice', 'ff{pr4ct1c3_m4k3s_p3rf3ct}', '{"SQL Injection", "Web Security"}');

-- Hints
INSERT INTO hints (challenge_id, hint_text, cost) VALUES
('rev-101', 'The flag is checked character by character in a loop.', 10),
('pwn-101', 'You will need a lot of As to overwrite the return address.', 20);

-- Marketplace Items
INSERT INTO team_marketplace_items (name, description, cost, item_type, item_metadata) VALUES
('Global Hint: Crypto 101', 'A hint for all team members for the Caesar Cipher challenge.', 50, 'global_hint', '{"challenge_id": "crypto-101"}');
