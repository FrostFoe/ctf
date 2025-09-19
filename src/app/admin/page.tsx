import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AdminChallengesTable } from '@/components/admin/admin-challenges-table';
import { getAdminDashboardData } from '@/app/admin/actions';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { createClient } from '@/utils/supabase/server';
import { Separator } from '@/components/ui/separator';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { challenges, users } = await getAdminDashboardData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'অ্যাডমিন প্যানেল'} user={user} />
      <div className="flex flex-col gap-8">
        <AdminChallengesTable initialChallenges={challenges} />
        <Separator />
        <AdminUsersTable users={users} />
      </div>
    </main>
  );
}
