import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createClient } from '@/utils/supabase/server';
import { ProfileForm } from '@/components/profile/profile-form';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/database.types';

async function getProfile(): Promise<{ user: User; profile: Profile } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return { user, profile: profile as Profile };
}

export default async function ProfilePage() {
  const data = await getProfile();

  if (!data) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'প্রোফাইল'} />
      <ProfileForm user={data.user} profile={data.profile} />
    </main>
  );
}
