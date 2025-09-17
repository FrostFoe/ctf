import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createClient } from '@/utils/supabase/server';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Users } from 'lucide-react';

async function getLeaderboardData(): Promise<{
  individual: LeaderboardEntry[];
  team: TeamLeaderboardEntry[];
}> {
  const supabase = createClient();
  const individualPromise = supabase.from('leaderboard').select('*');
  const teamPromise = supabase.from('team_leaderboard').select('*');

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
  };
}

export default async function HallOfFamePage() {
  const { individual, team } = await getLeaderboardData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle="হল অফ ফেইম" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">র‍্যাঙ্ক</TableHead>
                    <TableHead>ব্যবহারকারী</TableHead>
                    <TableHead className="text-right">পয়েন্ট</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individual.map((player) => (
                    <TableRow key={player.user_id}>
                      <TableCell className="font-bold">{player.rank}</TableCell>
                      <TableCell>
                        <Link href={`/p/${player.username || player.user_id}`} className="hover:underline">
                          {player.username || 'অজানা'}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                        <BcoinIcon />
                        {player.total_points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>সেরা দল</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {team.map((t) => (
                    <TableRow key={t.team_id}>
                      <TableCell className="font-bold">{t.rank}</TableCell>
                      <TableCell>{t.team_name}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Users size={16} />
                        {t.member_count}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                        <BcoinIcon />
                        {t.total_points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
