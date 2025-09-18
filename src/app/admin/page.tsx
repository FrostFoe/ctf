import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { AdminChallengesTable } from '@/components/admin/admin-challenges-table';
import { getAdminDashboardData } from '@/app/admin/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTable } from '@/components/admin/admin-users-table';
import { AdminTeamsTable } from '@/components/admin/admin-teams-table';
import { createClient } from '@/utils/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { challenges, users, teams } = await getAdminDashboardData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={'অ্যাডমিন প্যানেল'} user={user} />
      <Tabs defaultValue="challenges">
        <TabsList className="grid w-full grid-cols-3 md:w-[500px]">
          <TabsTrigger value="challenges">চ্যালেঞ্জসমূহ</TabsTrigger>
          <TabsTrigger value="users">ব্যবহারকারীগণ</TabsTrigger>
          <TabsTrigger value="teams">দলসমূহ</TabsTrigger>
        </TabsList>
        <TabsContent value="challenges">
          <AdminChallengesTable initialChallenges={challenges} />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersTable users={users} />
        </TabsContent>
        <TabsContent value="teams">
          <AdminTeamsTable teams={teams} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
