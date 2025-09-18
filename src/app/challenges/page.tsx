import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { ChallengesList } from '@/components/challenges/challenges-list';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/lib/database.types';

async function getChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('challenges').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Error fetching challenges', error);
    return [];
  }
  return data as Challenge[];
}

async function getSolvedChallenges(userId: string | undefined): Promise<string[]> {
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from('solved_challenges').select('challenge_id').eq('user_id', userId);

  if (error) {
    console.error('Error fetching solved challenges', error);
    return [];
  }

  return data.map((item) => item.challenge_id);
}

export default async function ChallengesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenges = await getChallenges();
  const solvedChallengeIds = await getSolvedChallenges(user?.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'চ্যালেঞ্জসমূহ'} user={user} />
      <ChallengesList challenges={challenges} solvedChallengeIds={solvedChallengeIds} />
    </main>
  );
}
