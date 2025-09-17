import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { DashboardLandingPage } from '@/components/dashboard/landing/dashboard-landing-page';
import { createClient } from '@/utils/supabase/server';
import type { LeaderboardEntry, UserStats } from '@/lib/database.types';

async function getDashboardData(userId?: string): Promise<{
  stats: UserStats | null;
  leaderboard: LeaderboardEntry[];
  totalChallenges: number;
}> {
  const supabase = createClient();

  const leaderboardPromise = supabase.from('leaderboard').select('*').limit(5);

  const totalChallengesPromise = supabase.from('challenges').select('id', { count: 'exact', head: true });

  const userStatsPromise = userId
    ? supabase.from('leaderboard').select('*').eq('user_id', userId).maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [leaderboardRes, totalChallengesRes, userStatsRes] = await Promise.all([
    leaderboardPromise,
    totalChallengesPromise,
    userStatsPromise,
  ]);

  if (leaderboardRes.error) {
    console.error('Error fetching leaderboard:', leaderboardRes.error);
  }
  if (totalChallengesRes.error) {
    console.error('Error fetching total challenges count:', totalChallengesRes.error);
  }
  if (userStatsRes.error) {
    console.error('Error fetching user stats:', userStatsRes.error);
  }

  return {
    leaderboard: (leaderboardRes.data as LeaderboardEntry[]) || [],
    totalChallenges: totalChallengesRes.count ?? 0,
    stats: (userStatsRes.data as UserStats) || null,
  };
}

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { stats, leaderboard, totalChallenges } = await getDashboardData(user?.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'ড্যাশবোর্ড'} />
      <DashboardLandingPage stats={stats} leaderboard={leaderboard} totalChallenges={totalChallenges} />
    </main>
  );
}
