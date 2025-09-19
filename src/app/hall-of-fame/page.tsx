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
  isTeam: boolean,
): Promise<{ data: any[]; count: number }> {
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

  return { data, count: count ?? 0 };
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
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'individual');

  const page = parseInt(searchParams.get('page') || '0', 10);
  const isTeamView = activeTab === 'team';

  const totalPages = Math.ceil((isTeamView ? teamCount : individualCount) / PAGE_SIZE);

  const fetchData = async (currentPage: number, tab: string) => {
    setIsLoading(true);
    const { data: individualData, count: individualDataCount } = await getLeaderboardData(
      supabase,
      tab === 'individual' ? currentPage : 0,
      false,
    );
    const { data: teamData, count: teamDataCount } = await getLeaderboardData(
      supabase,
      tab === 'team' ? currentPage : 0,
      true,
    );
    setIndividualLeaderboard(individualData);
    setTeamLeaderboard(teamData);
    setIndividualCount(individualDataCount);
    setTeamCount(teamDataCount);
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchData(page, activeTab);
  }, [page, activeTab]);

  useEffect(() => {
    const changes = supabase
      .channel('realtime-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        // Refetch data for the current view
        fetchData(page, activeTab);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(changes);
    };
  }, [supabase, page, activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      router.push(`/hall-of-fame?tab=${activeTab}&page=${newPage}`);
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.push(`/hall-of-fame?tab=${newTab}&page=0`);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <DashboardPageHeader pageTitle="হল অফ ফেইম" user={user} />
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="individual">ব্যক্তিগত</TabsTrigger>
          <TabsTrigger value="team">দলীয়</TabsTrigger>
        </TabsList>
        <TabsContent value="individual">
          <LeaderboardTable
            title="সেরা প্রতিযোগী"
            headers={['র‍্যাঙ্ক', 'ব্যবহারকারী', 'পয়েন্ট']}
            data={individualLeaderboard}
            isLoading={isLoading}
            renderRow={(player: LeaderboardEntry) => (
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
            )}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        <TabsContent value="team">
          <LeaderboardTable
            title="সেরা দল"
            headers={['র‍্যাঙ্ক', 'দল', 'সদস্য', 'পয়েন্ট']}
            data={teamLeaderboard}
            isLoading={isLoading}
            renderRow={(t: TeamLeaderboardEntry) => (
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
            )}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

interface LeaderboardTableProps {
  title: string;
  headers: string[];
  data: any[];
  isLoading: boolean;
  renderRow: (item: any) => React.ReactNode;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

function LeaderboardTable({
  title,
  headers,
  data,
  isLoading,
  renderRow,
  page,
  totalPages,
  onPageChange,
}: LeaderboardTableProps) {
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
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : (
                data.map(renderRow)
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            পূর্ববর্তী
          </Button>
          <span className="text-sm text-muted-foreground">
            পৃষ্ঠা {page + 1} এর {totalPages > 0 ? totalPages : 1}
          </span>
          <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            পরবর্তী
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
