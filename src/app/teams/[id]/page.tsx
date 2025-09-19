import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { TeamDetails, TeamMember } from '@/lib/database.types';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { TeamBase } from '@/components/teams/team-base';

async function getTeamDetails(teamId: string): Promise<TeamDetails | null> {
  const supabase = await createClient();
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

  type RawMember = {
    user_id: string;
    role: 'admin' | 'member';
    profile: { username: string | null } | null;
  };
  const rawMembers = teamData.members as unknown as RawMember[];
  const transformedMembers: TeamMember[] = (rawMembers || []).map((m) => ({
    team_id: teamData.id,
    user_id: m.user_id,
    role: m.role ?? 'member',
    username: m.profile?.username ?? 'অজানা',
  }));

  return { ...teamData, members: transformedMembers } as TeamDetails;
}

export default async function TeamBasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const team = await getTeamDetails(id);

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
      <DashboardPageHeader pageTitle={team.name} user={user} />
      <TeamBase initialTeam={team} currentUser={user} />
    </main>
  );
}
