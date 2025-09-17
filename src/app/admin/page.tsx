import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AdminChallengesTable } from '@/components/admin/admin-challenges-table';
import { createServerClient } from '@/utils/supabase/server';
import type { Challenge } from '@/lib/database.types';

async function getChallenges(): Promise<Challenge[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('challenges').select('*').order('name', { ascending: true });

  if (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
  return data as Challenge[];
}

export default async function AdminPage() {
  const challenges = await getChallenges();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'অ্যাডমিন প্যানেল'} />
      <AdminChallengesTable challenges={challenges} />
    </main>
  );
}
