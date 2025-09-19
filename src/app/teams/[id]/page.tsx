import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import type { TeamDetails, TeamMember } from '@/lib/database.types';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { TeamBase } from '@/components/teams/team-base';

async function getTeamDetails(teamId: string, userId: string): Promise<TeamDetails | null> {
  const supabase = await createClient();

  // First, verify if the user is a member of the team
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .match({ user_id: userId, team_id: teamId })
    .single();

  // If there's an error or the user is not a member, return null
  if (memberError || !memberData) {
    if (memberError && memberError.code !== 'PGRST116') {
      console.error('Error checking team membership:', memberError);
    }
    return null;
  }

  // If the user is a member, fetch the full team details
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

  const team = await getTeamDetails(id, user.id);

  // If the user is not a member of the team, getTeamDetails returns null
  if (!team) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle={team.name} user={user} />
      <TeamBase initialTeam={team} currentUser={user} />
    </main>
  );
}
