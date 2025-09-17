import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { TeamDetails } from '@/lib/database.types';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { TeamBase } from '@/components/teams/team-base';

async function getTeamDetails(teamId: string): Promise<TeamDetails | null> {
  const supabase = createClient();
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(
      `
      id,
      name,
      created_at,
      created_by,
      points,
      members:team_members (
        user_id,
        role,
        profile:profiles(username)
      )
    `,
    )
    .eq('id', teamId)
    .single();

  if (teamError) {
    console.error('Error fetching team details:', teamError);
    return null;
  }

  const transformedMembers =
    teamData.members.map((m: any) => ({
      user_id: m.user_id,
      role: m.role,
      username: m.profile?.username || 'অজানা',
    })) || [];

  return { ...teamData, members: transformedMembers };
}

export default async function TeamBasePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const team = await getTeamDetails(params.id);

  if (!team) {
    notFound();
  }

  const isUserMember = team.members.some((member) => member.user_id === user.id);
  if (!isUserMember) {
    // Or show an "unauthorized" page
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={team.name} />
      <TeamBase initialTeam={team} currentUser={user} />
    </main>
  );
}
