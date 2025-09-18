import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createClient } from '@/utils/supabase/server';
import type { Team, TeamDetails, TeamMember } from '@/lib/database.types';
import { TeamsList } from '@/components/teams/teams-list';
import { TeamView } from '@/components/teams/team-view';
import { CreateTeamCard } from '@/components/teams/create-team-card';
import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';

const PAGE_SIZE = 10;

async function getTeams(page: number): Promise<{ teams: Team[]; count: number }> {
  const supabase = await createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('teams')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching teams:', error);
    return { teams: [], count: 0 };
  }

  return { teams: data || [], count: count || 0 };
}

async function getUserTeam(userId: string): Promise<TeamDetails | null> {
  const supabase = await createClient();
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError || !memberData) {
    return null;
  }

  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(
      `
      id,
      name,
      created_at,
      created_by,
      points,
      is_private,
      join_token,
      members:team_members (
        user_id,
        role,
        profile:profiles(username)
      )
    `,
    )
    .eq('id', memberData.team_id)
    .single();

  if (teamError) {
    console.error('Error fetching team details:', teamError);
    return null;
  }

  type RawMember = {
    user_id: string;
    role: 'admin' | 'member';
    profile: { username: string | null } | { username: string | null }[] | null;
  };
  const rawMembers = teamData.members as unknown as RawMember[];
  const transformedMembers: TeamMember[] = (rawMembers || []).map((m) => {
    const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile;
    return {
      team_id: teamData.id,
      user_id: m.user_id,
      role: m.role,
      username: profile?.username || 'অজানা',
    };
  });

  return { ...teamData, members: transformedMembers } as TeamDetails;
}

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const page = parseInt(pageParam || '0', 10);
  const { teams, count } = await getTeams(page);
  const userTeam = await getUserTeam(user.id);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle="দলসমূহ" />
      <div className="grid gap-8">
        {userTeam ? (
          <TeamView team={userTeam} currentUserId={user.id} />
        ) : (
          <div>
            <CreateTeamCard />
            <Separator className="my-8" />
            <TeamsList teams={teams} currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  );
}
