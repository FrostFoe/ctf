import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { createClient } from '@/utils/supabase/server';
import type { LeaderboardEntry, TeamLeaderboardEntry, UserStats } from '@/lib/database.types';

async function getDashboardData(userId?: string): Promise<{
  stats: UserStats | null;
  totalChallenges: number;
}> {
  const supabase = await createClient();

  const totalChallengesPromise = supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .neq('category', 'practice');

  const userStatsPromise = userId
    ? supabase.rpc('get_user_stats_with_profile', { user_uuid: userId })
    : Promise.resolve({ data: null, error: null });

  const [totalChallengesRes, userStatsRes] = await Promise.all([totalChallengesPromise, userStatsPromise]);

  if (totalChallengesRes.error) {
    console.error('Error fetching total challenges count:', totalChallengesRes.error);
  }
  if (userStatsRes.error) {
    console.error('Error fetching user stats:', userStatsRes.error);
  }

  const statsData = userStatsRes.data?.[0];
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
    totalChallenges: totalChallengesRes.count ?? 0,
    stats: finalStats,
  };
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { stats, totalChallenges } = await getDashboardData(user?.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'ড্যাশবোর্ড'} user={user} />
      <DashboardLandingPage stats={stats} totalChallenges={totalChallenges} />
    </main>
  );
}
