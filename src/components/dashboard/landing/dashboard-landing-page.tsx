import { DashboardUsageCardGroup } from '@/components/dashboard/landing/components/dashboard-usage-card-group';
import { DashboardTutorialCard } from '@/components/dashboard/landing/components/dashboard-tutorial-card';
import type { UserStats } from '@/lib/database.types';

interface DashboardLandingPageProps {
  stats: UserStats | null;
  totalChallenges: number;
}

export function DashboardLandingPage({ stats, totalChallenges }: DashboardLandingPageProps) {
  return (
    <div className={'grid flex-1 items-start gap-6 p-0 md:grid-cols-1 lg:grid-cols-2'}>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <DashboardUsageCardGroup stats={stats} totalChallenges={totalChallenges} />
      </div>
      <div className={'grid auto-rows-max items-start gap-6'}>
        <DashboardTutorialCard />
      </div>
    </div>
  );
}
