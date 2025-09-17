import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { ChallengesList } from '@/components/challenges/challenges-list';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/constants/ctf-tiers';

async function getChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('challenges').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Error fetching challenges', error);
    return [];
  }
  return data as Challenge[];
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'চ্যালেঞ্জসমূহ'} />
      <ChallengesList challenges={challenges} />
    </main>
  );
}
