import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createServerClient } from '@/utils/supabase/server';
import { ProfileForm } from '@/components/profile/profile-form';
import type { User } from '@supabase/supabase-js';

async function getProfile(): Promise<User | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function ProfilePage() {
  const user = await getProfile();

  if (!user) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'প্রোফাইল'} />
      <ProfileForm user={user} />
    </main>
  );
}
