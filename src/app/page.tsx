import { HomePage } from '@/components/home/home-page';
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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenges = await getChallenges();

  return <HomePage user={user} challenges={challenges} />;
}
