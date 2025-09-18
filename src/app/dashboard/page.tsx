import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { createClient } from '@/utils/supabase/server';
import type { LeaderboardEntry, UserStats, TeamLeaderboardEntry } from '@/lib/database.types';

async function getDashboardData(userId?: string): Promise<{
  stats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
  totalChallenges: number;
}> {
  const supabase = await createClient();

  const leaderboardPromise = supabase.from('user_leaderboard').select('*').order('rank', { ascending: true }).limit(5);

  const teamLeaderboardPromise = supabase
    .from('team_leaderboard_table')
    .select('*')
    .order('rank', { ascending: true })
    .limit(5);

  const totalChallengesPromise = supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .neq('category', 'practice');

  // Use the new get_user_stats_with_profile function if user is logged in
  const userStatsPromise = userId
    ? supabase.rpc('get_user_stats_with_profile', { user_uuid: userId })
    : Promise.resolve({ data: null, error: null });

  const [leaderboardRes, teamLeaderboardRes, totalChallengesRes, userStatsRes] = await Promise.all([
    leaderboardPromise,
    teamLeaderboardPromise,
    totalChallengesPromise,
    userStatsPromise,
  ]);

  if (leaderboardRes.error) {
    console.error('Error fetching leaderboard:', leaderboardRes.error);
  }
  if (teamLeaderboardRes.error) {
    console.error('Error fetching team leaderboard:', teamLeaderboardRes.error);
  }
  if (totalChallengesRes.error) {
    console.error('Error fetching total challenges count:', totalChallengesRes.error);
  }
  if (userStatsRes.error) {
    console.error('Error fetching user stats:', userStatsRes.error);
  }

  // Process the user stats data from the RPC function
  const statsData = userStatsRes.data?.[0] || null;
  let finalStats: UserStats | null = null;

  if (statsData) {
    finalStats = {
      user_id: statsData.user_id,
      username: statsData.username,
      total_points: statsData.total_points,
      solved_challenges: statsData.solved_challenges,
      rank: statsData.rank,
      spendable_points: statsData.spendable_points,
      full_name: statsData.full_name,
    };
  }

  return {
    leaderboard: (leaderboardRes.data as LeaderboardEntry[]) || [],
    teamLeaderboard: (teamLeaderboardRes.data as TeamLeaderboardEntry[]) || [],
    totalChallenges: totalChallengesRes.count ?? 0,
    stats: finalStats as UserStats | null,
  };
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { stats, leaderboard, teamLeaderboard, totalChallenges } = await getDashboardData(user?.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'ড্যাশবোর্ড'} />
      <DashboardLandingPage
        stats={stats}
        leaderboard={leaderboard}
        teamLeaderboard={teamLeaderboard}
        totalChallenges={totalChallenges}
      />
    </main>
  );
}
