import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { ChallengesList } from '@/components/challenges/challenges-list';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/lib/database.types';

async function getPracticeChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('category', 'practice')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching practice challenges', error);
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

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenges = await getPracticeChallenges();
  const solvedChallengeIds = await getSolvedChallenges(user?.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'অনুশীলন ক্ষেত্র'} />
      <p className="text-muted-foreground">
        এখানে আপনি র‍্যাঙ্কিংয়ের চাপ ছাড়াই আপনার দক্ষতা পরীক্ষা করতে পারেন। এই চ্যালেঞ্জগুলো আপনার অগ্রগতির উপর কোনো প্রভাব ফেলবে না।
      </p>
      <ChallengesList challenges={challenges} solvedChallengeIds={solvedChallengeIds} />
    </main>
  );
}
