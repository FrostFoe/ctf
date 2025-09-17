import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { ChallengesList } from '@/components/challenges/challenges-list';

export default function ChallengesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'চ্যালেঞ্জসমূহ'} />
      <ChallengesList />
    </main>
  );
}
