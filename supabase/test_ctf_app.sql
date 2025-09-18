-- ===========================================
-- COMPREHENSIVE CTF APP TEST SUITE
-- ===========================================
-- This file tests ALL functionality of the CTF app
-- Run this in Supabase SQL Editor after running complete_database_setup.sql
-- Each test section is clearly marked with expected results

-- ===========================================
-- TEST 1: BASIC SETUP VERIFICATION
-- ===========================================
DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 TESTING BASIC SETUP...';

  -- Check if all tables exist
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'challenges', 'solved_challenges', 'teams', 'user_leaderboard', 'hints');

  IF table_count = 6 THEN
    RAISE NOTICE '✅ All required tables exist (% tables)', table_count;
  ELSE
    RAISE NOTICE '❌ Missing tables. Found: %', table_count;
  END IF;

  -- Check if key functions exist
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('award_points', 'refresh_user_leaderboard', 'get_user_stats_with_profile', 'get_profile_by_slug');

  IF function_count = 4 THEN
    RAISE NOTICE '✅ All required functions exist (% functions)', function_count;
  ELSE
    RAISE NOTICE '❌ Missing functions. Found: %', function_count;
  END IF;
END $$;

-- ===========================================
-- TEST 2: AWARD_POINTS FUNCTION TEST
-- ===========================================
DO $$
DECLARE
  test_user_id UUID;
  initial_points INTEGER;
  test_challenge_id TEXT := 'crypto-intro';
  test_points INTEGER := 10;
  final_points INTEGER;
BEGIN
  RAISE NOTICE '🎯 TESTING AWARD_POINTS FUNCTION...';

  -- Get a test user
  SELECT id, spendable_points INTO test_user_id, initial_points
  FROM public.profiles
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ No test user found. Please create a user first.';
    RETURN;
  END IF;

  RAISE NOTICE '   Test user: %, Initial points: %', test_user_id, initial_points;

  -- Test the award_points function
  BEGIN
    PERFORM public.award_points(test_user_id, test_challenge_id, test_points);
    RAISE NOTICE '✅ award_points function executed successfully';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ award_points function failed: %', SQLERRM;
    RETURN;
  END;

  -- Verify points were updated
  SELECT spendable_points INTO final_points
  FROM public.profiles
  WHERE id = test_user_id;

  IF final_points = initial_points + test_points THEN
    RAISE NOTICE '✅ Points updated correctly: % -> % (+%)', initial_points, final_points, test_points;
  ELSE
    RAISE NOTICE '❌ Points not updated correctly: % -> % (expected: %)', initial_points, final_points, initial_points + test_points;
  END IF;

  -- Verify challenge was marked as solved
  IF EXISTS (SELECT 1 FROM public.solved_challenges WHERE user_id = test_user_id AND challenge_id = test_challenge_id) THEN
    RAISE NOTICE '✅ Challenge marked as solved';
  ELSE
    RAISE NOTICE '❌ Challenge not marked as solved';
  END IF;
END $$;

-- ===========================================
-- TEST 3: LEADERBOARD FUNCTIONALITY TEST
-- ===========================================
DO $$
DECLARE
  leaderboard_count INTEGER;
BEGIN
  RAISE NOTICE '🏆 TESTING LEADERBOARD FUNCTIONALITY...';

  -- Test user leaderboard refresh
  BEGIN
    PERFORM public.refresh_user_leaderboard();
    RAISE NOTICE '✅ User leaderboard refresh successful';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ User leaderboard refresh failed: %', SQLERRM;
  END;

  -- Test team leaderboard refresh
  BEGIN
    PERFORM public.refresh_team_leaderboard();
    RAISE NOTICE '✅ Team leaderboard refresh successful';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Team leaderboard refresh failed: %', SQLERRM;
  END;

  -- Check if leaderboard has data
  SELECT COUNT(*) INTO leaderboard_count FROM public.user_leaderboard;
  RAISE NOTICE '   User leaderboard entries: %', leaderboard_count;

  IF leaderboard_count > 0 THEN
    RAISE NOTICE '✅ Leaderboard populated with data';
  ELSE
    RAISE NOTICE '⚠️  Leaderboard is empty (this is normal if no users have solved challenges)';
  END IF;
END $$;

-- ===========================================
-- TEST 4: PROFILE LOOKUP TEST
-- ===========================================
DO $$
DECLARE
  test_username TEXT;
  profile_result RECORD;
BEGIN
  RAISE NOTICE '👤 TESTING PROFILE LOOKUP FUNCTIONALITY...';

  -- Get a test username
  SELECT username INTO test_username
  FROM public.profiles
  WHERE username IS NOT NULL
  LIMIT 1;

  IF test_username IS NULL THEN
    RAISE NOTICE '❌ No user with username found for profile test';
    RETURN;
  END IF;

  RAISE NOTICE '   Testing profile lookup for: %', test_username;

  -- Test get_profile_by_slug function
  BEGIN
    SELECT * INTO profile_result FROM public.get_profile_by_slug(test_username);
    RAISE NOTICE '✅ get_profile_by_slug function works';
    RAISE NOTICE '   Profile found - ID: %, Points: %', profile_result.id, profile_result.spendable_points;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ get_profile_by_slug function failed: %', SQLERRM;
  END;

  -- Test get_user_stats_with_profile function
  BEGIN
    SELECT * INTO profile_result FROM public.get_user_stats_with_profile(
      (SELECT id FROM public.profiles WHERE username = test_username)
    );
    RAISE NOTICE '✅ get_user_stats_with_profile function works';
    RAISE NOTICE '   Stats found - Total points: %, Solved: %, Rank: %',
      profile_result.total_points, profile_result.solved_challenges, profile_result.rank;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ get_user_stats_with_profile function failed: %', SQLERRM;
  END;
END $$;

-- ===========================================
-- TEST 5: CHALLENGE SYSTEM TEST
-- ===========================================
DO $$
DECLARE
  challenge_count INTEGER;
  solved_count INTEGER;
  challenge_record RECORD;
BEGIN
  RAISE NOTICE '🎯 TESTING CHALLENGE SYSTEM...';

  -- Check challenges exist
  SELECT COUNT(*) INTO challenge_count FROM public.challenges;
  RAISE NOTICE '   Total challenges: %', challenge_count;

  IF challenge_count > 0 THEN
    RAISE NOTICE '✅ Challenges loaded successfully';
  ELSE
    RAISE NOTICE '❌ No challenges found';
  END IF;

  -- Check solved challenges
  SELECT COUNT(*) INTO solved_count FROM public.solved_challenges;
  RAISE NOTICE '   Solved challenges: %', solved_count;

  -- Show challenge details
  RAISE NOTICE '   Sample challenges:';
  FOR challenge_record IN
    SELECT id, name, points, difficulty FROM public.challenges LIMIT 3
  LOOP
    RAISE NOTICE '     - % (% points, %)', challenge_record.name, challenge_record.points, challenge_record.difficulty;
  END LOOP;
END $$;

-- ===========================================
-- TEST 6: HINT SYSTEM TEST
-- ===========================================
DO $$
DECLARE
  hint_count INTEGER;
  hint_record RECORD;
BEGIN
  RAISE NOTICE '💡 TESTING HINT SYSTEM...';

  -- Check hints exist
  SELECT COUNT(*) INTO hint_count FROM public.hints;
  RAISE NOTICE '   Total hints: %', hint_count;

  IF hint_count > 0 THEN
    RAISE NOTICE '✅ Hints loaded successfully';
  ELSE
    RAISE NOTICE '⚠️  No hints found (this is normal)';
  END IF;

  -- Show hint details
  FOR hint_record IN
    SELECT challenge_id, cost FROM public.hints LIMIT 3
  LOOP
    RAISE NOTICE '   Hint for % costs % points', hint_record.challenge_id, hint_record.cost;
  END LOOP;
END $$;

-- ===========================================
-- TEST 7: TEAM SYSTEM TEST
-- ===========================================
DO $$
DECLARE
  team_count INTEGER;
  member_count INTEGER;
BEGIN
  RAISE NOTICE '👥 TESTING TEAM SYSTEM...';

  -- Check teams exist
  SELECT COUNT(*) INTO team_count FROM public.teams;
  RAISE NOTICE '   Total teams: %', team_count;

  -- Check team members
  SELECT COUNT(*) INTO member_count FROM public.team_members;
  RAISE NOTICE '   Team members: %', member_count;

  IF team_count > 0 THEN
    RAISE NOTICE '✅ Team system initialized';
  ELSE
    RAISE NOTICE '⚠️  No teams found (this is normal if no teams created yet)';
  END IF;
END $$;

-- ===========================================
-- TEST 8: DATA INTEGRITY TEST
-- ===========================================
DO $$
DECLARE
  orphan_solves INTEGER;
  invalid_references INTEGER;
BEGIN
  RAISE NOTICE '🔒 TESTING DATA INTEGRITY...';

  -- Check for orphan solved_challenges (no matching user)
  SELECT COUNT(*) INTO orphan_solves
  FROM public.solved_challenges sc
  LEFT JOIN public.profiles p ON sc.user_id = p.id
  WHERE p.id IS NULL;

  IF orphan_solves = 0 THEN
    RAISE NOTICE '✅ No orphan solved_challenges found';
  ELSE
    RAISE NOTICE '❌ Found % orphan solved_challenges', orphan_solves;
  END IF;

  -- Check for invalid challenge references
  SELECT COUNT(*) INTO invalid_references
  FROM public.solved_challenges sc
  LEFT JOIN public.challenges c ON sc.challenge_id = c.id
  WHERE c.id IS NULL;

  IF invalid_references = 0 THEN
    RAISE NOTICE '✅ No invalid challenge references found';
  ELSE
    RAISE NOTICE '❌ Found % invalid challenge references', invalid_references;
  END IF;
END $$;

-- ===========================================
-- TEST 9: PERFORMANCE TEST
-- ===========================================
DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  execution_time INTERVAL;
BEGIN
  RAISE NOTICE '⚡ TESTING PERFORMANCE...';

  -- Test leaderboard refresh performance
  start_time := clock_timestamp();
  PERFORM public.refresh_user_leaderboard();
  end_time := clock_timestamp();
  execution_time := end_time - start_time;

  RAISE NOTICE '   User leaderboard refresh time: %', execution_time;

  IF execution_time < interval '1 second' THEN
    RAISE NOTICE '✅ Leaderboard refresh performance is good';
  ELSE
    RAISE NOTICE '⚠️  Leaderboard refresh is slow (consider adding indexes)';
  END IF;
END $$;

-- ===========================================
-- FINAL TEST SUMMARY
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CTF APP TEST SUITE COMPLETED!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 SUMMARY:';
  RAISE NOTICE '   ✅ If you see mostly green checkmarks above, your CTF app is working correctly!';
  RAISE NOTICE '   ⚠️  Yellow warnings are usually normal for new installations';
  RAISE NOTICE '   ❌ Red errors indicate issues that need to be fixed';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 NEXT STEPS:';
  RAISE NOTICE '   1. Start your Next.js app: npm run dev or pnpm dev';
  RAISE NOTICE '   2. Visit http://localhost:3000';
  RAISE NOTICE '   3. Try solving a challenge and check if points update!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 COMMON ISSUES:';
  RAISE NOTICE '   - If award_points fails: Check user permissions and RLS policies';
  RAISE NOTICE '   - If leaderboard is empty: Normal for new installations';
  RAISE NOTICE '   - If profile lookups fail: Check function definitions';
  RAISE NOTICE '';
END $$;