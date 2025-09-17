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
  const supabase = createClient();

  const leaderboardPromise = supabase.from('leaderboard').select('*').limit(5);

  const teamLeaderboardPromise = supabase.from('team_leaderboard').select('*').limit(5);

  const totalChallengesPromise = supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .neq('category', 'practice');

  const userStatsPromise = userId
    ? supabase.from('leaderboard').select('*, profile:profiles(spendable_points)').eq('user_id', userId).maybeSingle()
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

  // Manually combine the profile data into the stats object
  const statsData = userStatsRes.data as any;
  const finalStats = statsData
    ? {
        ...statsData,
        spendable_points: statsData.profile?.spendable_points ?? 0,
      }
    : null;
  if (finalStats) {
    delete finalStats.profile;
  }

  return {
    leaderboard: (leaderboardRes.data as LeaderboardEntry[]) || [],
    teamLeaderboard: (teamLeaderboardRes.data as TeamLeaderboardEntry[]) || [],
    totalChallenges: totalChallengesRes.count ?? 0,
    stats: finalStats as UserStats | null,
  };
}

export default async function LandingPage() {
  const supabase = createClient();
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
