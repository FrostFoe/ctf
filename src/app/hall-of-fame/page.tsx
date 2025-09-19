import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { createClient } from '@/utils/supabase/server';
import type { LeaderboardEntry, TeamLeaderboardEntry, User } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Bitcoin, Users } from 'lucide-react';
import { notFound } from 'next/navigation';

const PAGE_SIZE = 20;

interface LeaderboardTableProps {
  title: string;
  headers: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
  page: number;
  totalPages: number;
  activeTab: 'individual' | 'team';
}

async function getLeaderboardData(
  page: number,
  isTeam: boolean,
): Promise<{ data: LeaderboardEntry[] | TeamLeaderboardEntry[]; count: number }> {
  const supabase = createClient();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const query = isTeam
    ? supabase.from('team_leaderboard_table').select('*', { count: 'exact' })
    : supabase.from('user_leaderboard').select('*', { count: 'exact' });

  const { data, error, count } = await query.order('rank', { ascending: true }).range(from, to);

  if (error) {
    console.error(`Error fetching ${isTeam ? 'team' : 'individual'} leaderboard:`, error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count ?? 0 };
}

function LeaderboardTable({ title, headers, data, renderRow, page, totalPages, activeTab }: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className={index === headers.length - 1 ? 'text-right' : ''}>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{data.map(renderRow)}</TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button variant="outline" disabled={page === 0} asChild>
            <Link href={`/hall-of-fame?tab=${activeTab}&page=${page - 1}`}>পূর্ববর্তী</Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            পৃষ্ঠা {page + 1} এর {totalPages > 0 ? totalPages : 1}
          </span>
          <Button variant="outline" disabled={page >= totalPages - 1} asChild>
            <Link href={`/hall-of-fame?tab=${activeTab}&page=${page + 1}`}>পরবর্তী</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function HallOfFamePage({ searchParams }: { searchParams: { tab?: string; page?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activeTab = searchParams.tab === 'team' ? 'team' : 'individual';
  const page = parseInt(searchParams.page || '0', 10);

  if (page < 0) {
    notFound();
  }

  const { data, count } = await getLeaderboardData(page, activeTab === 'team');
  const totalPages = Math.ceil(count / PAGE_SIZE);

  if (page >= totalPages && totalPages > 0) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle="হল অফ ফেইম" user={user} />
      <Tabs defaultValue={activeTab}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="individual" asChild>
            <Link href="/hall-of-fame?tab=individual&page=0">ব্যক্তিগত</Link>
          </TabsTrigger>
          <TabsTrigger value="team" asChild>
            <Link href="/hall-of-fame?tab=team&page=0">দলীয়</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <LeaderboardTable
            title="সেরা প্রতিযোগী"
            headers={['র‍্যাঙ্ক', 'ব্যবহারকারী', 'পয়েন্ট']}
            data={data as LeaderboardEntry[]}
            renderRow={(player: LeaderboardEntry) => (
              <TableRow key={player.user_id}>
                <TableCell className="font-bold">{player.rank}</TableCell>
                <TableCell>
                  <Link href={`/p/${player.username || player.user_id}`} className="hover:underline">
                    {player.username || 'অজানা'}
                  </Link>
                </TableCell>
                <TableCell className="flex items-center justify-end gap-1 text-right font-bold text-primary">
                  <Bitcoin />
                  {player.total_points}
                </TableCell>
              </TableRow>
            )}
            page={page}
            totalPages={totalPages}
            activeTab={activeTab}
          />
        </TabsContent>
        <TabsContent value="team">
          <LeaderboardTable
            title="সেরা দল"
            headers={['র‍্যাঙ্ক', 'দল', 'সদস্য', 'পয়েন্ট']}
            data={data as TeamLeaderboardEntry[]}
            renderRow={(t: TeamLeaderboardEntry) => (
              <TableRow key={t.team_id}>
                <TableCell className="font-bold">{t.rank}</TableCell>
                <TableCell>{t.team_name}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <Users size={16} />
                  {t.member_count}
                </TableCell>
                <TableCell className="flex items-center justify-end gap-1 text-right font-bold text-primary">
                  <Bitcoin />
                  {t.total_points}
                </TableCell>
              </TableRow>
            )}
            page={page}
            totalPages={totalPages}
            activeTab={activeTab}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
