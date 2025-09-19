'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createClient } from '@/utils/supabase/client';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Users, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const PAGE_SIZE = 20;

async function getLeaderboardData(
  supabase: ReturnType<typeof createClient>,
  page: number,
): Promise<{
  individual: LeaderboardEntry[];
  team: TeamLeaderboardEntry[];
  individualCount: number;
  teamCount: number;
}> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const individualPromise = supabase
    .from('user_leaderboard')
    .select('*', { count: 'exact' })
    .order('rank', { ascending: true })
    .range(from, to);

  const teamPromise = supabase
    .from('team_leaderboard_table')
    .select('*', { count: 'exact' })
    .order('rank', { ascending: true })
    .range(from, to);

  const [individualRes, teamRes] = await Promise.all([individualPromise, teamPromise]);

  if (individualRes.error) {
    console.error('Error fetching individual leaderboard:', individualRes.error);
  }
  if (teamRes.error) {
    console.error('Error fetching team leaderboard:', teamRes.error);
  }

  return {
    individual: (individualRes.data as LeaderboardEntry[]) || [],
    team: (teamRes.data as TeamLeaderboardEntry[]) || [],
    individualCount: individualRes.count ?? 0,
    teamCount: teamRes.count ?? 0,
  };
}

export default function HallOfFamePage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [individualLeaderboard, setIndividualLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [individualCount, setIndividualCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '0', 10);
  const individualTotalPages = Math.ceil(individualCount / PAGE_SIZE);
  const teamTotalPages = Math.ceil(teamCount / PAGE_SIZE);

  const fetchData = async (currentPage: number) => {
    setIsLoading(true);
    const { individual, team, individualCount, teamCount } = await getLeaderboardData(supabase, currentPage);
    setIndividualLeaderboard(individual);
    setTeamLeaderboard(team);
    setIndividualCount(individualCount);
    setTeamCount(teamCount);
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchData(page);
  }, [page]);

  useEffect(() => {
    const changes = supabase
      .channel('realtime-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Change received!', payload);
        fetchData(page);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, [supabase, page]);

  const handlePageChange = (newPage: number, totalPages: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      router.push(`/hall-of-fame?page=${newPage}`);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle="হল অফ ফেইম" user={user} />
      <Tabs defaultValue="individual">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="individual">ব্যক্তিগত</TabsTrigger>
          <TabsTrigger value="team">দলীয়</TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>সেরা প্রতিযোগী</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">র‍্যাঙ্ক</TableHead>
                      <TableHead>ব্যবহারকারী</TableHead>
                      <TableHead className="text-right">পয়েন্ট</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      individualLeaderboard.map((player) => (
                        <TableRow key={player.user_id}>
                          <TableCell className="font-bold">{player.rank}</TableCell>
                          <TableCell>
                            <Link href={`/p/${player.username || player.user_id}`} className="hover:underline">
                              {player.username || 'অজানা'}
                            </Link>
                          </TableCell>
                          <TableCell className="flex items-center justify-end gap-1 text-right font-bold text-primary">
                            <BcoinIcon />
                            {player.total_points}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1, individualTotalPages)}
                  disabled={page === 0}
                >
                  পূর্ববর্তী
                </Button>
                <span className="text-sm text-muted-foreground">
                  পৃষ্ঠা {page + 1} এর {individualTotalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1, individualTotalPages)}
                  disabled={page >= individualTotalPages - 1}
                >
                  পরবর্তী
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>সেরা দল</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">র‍্যাঙ্ক</TableHead>
                      <TableHead>দল</TableHead>
                      <TableHead>সদস্য</TableHead>
                      <TableHead className="text-right">পয়েন্ট</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      teamLeaderboard.map((t) => (
                        <TableRow key={t.team_id}>
                          <TableCell className="font-bold">{t.rank}</TableCell>
                          <TableCell>{t.team_name}</TableCell>
                          <TableCell className="flex items-center gap-1">
                            <Users size={16} />
                            {t.member_count}
                          </TableCell>
                          <TableCell className="flex items-center justify-end gap-1 text-right font-bold text-primary">
                            <BcoinIcon />
                            {t.total_points}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1, teamTotalPages)}
                  disabled={page === 0}
                >
                  পূর্ববর্তী
                </Button>
                <span className="text-sm text-muted-foreground">
                  পৃষ্ঠা {page + 1} এর {teamTotalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1, teamTotalPages)}
                  disabled={page >= teamTotalPages - 1}
                >
                  পরবর্তী
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
