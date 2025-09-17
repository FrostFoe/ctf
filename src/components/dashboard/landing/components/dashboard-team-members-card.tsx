'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/lib/database.types';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardTeamMembersCardProps {
  leaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
}

export function DashboardTeamMembersCard({ leaderboard, teamLeaderboard }: DashboardTeamMembersCardProps) {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between gap-2 items-center pb-6 border-border border-b">
          <div className={'flex flex-col gap-2'}>
            <span className={'text-xl font-medium'}>হল অফ ফেইম</span>
            <span className={'text-base leading-4 text-secondary'}>শীর্ষ প্রতিযোগী ও দল</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/hall-of-fame">সব দেখুন</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6 flex gap-6 flex-col'}>
        <Tabs defaultValue="individual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">ব্যক্তিগত</TabsTrigger>
            <TabsTrigger value="team">দলীয়</TabsTrigger>
          </TabsList>
          <TabsContent value="individual" className="mt-4 space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((player) => (
                <div key={player.user_id} className={'flex justify-between items-center gap-2'}>
                  <div className={'flex gap-4 items-center'}>
                    <div className={'text-sm font-bold w-6 text-center'}>{player.rank}</div>
                    <Link
                      href={`/p/${player.username || player.user_id}`}
                      className={'flex items-center justify-center h-10 w-10 rounded-full bg-muted-foreground/20'}
                    >
                      <span className={'text-white text-base'}>{player.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </Link>
                    <div className={'flex flex-col'}>
                      <Link href={`/p/${player.username || player.user_id}`} className={'text-base font-medium'}>
                        {player.username || 'অজানা'}
                      </Link>
                    </div>
                  </div>
                  <span className={'text-base font-bold text-primary flex items-center gap-1'}>
                    <BcoinIcon />
                    {player.total_points}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">এখনো কোনো প্রতিযোগী নেই।</p>
            )}
          </TabsContent>
          <TabsContent value="team" className="mt-4 space-y-4">
            {teamLeaderboard.length > 0 ? (
              teamLeaderboard.map((team) => (
                <div key={team.team_id} className={'flex justify-between items-center gap-2'}>
                  <div className={'flex gap-4 items-center'}>
                    <div className={'text-sm font-bold w-6 text-center'}>{team.rank}</div>
                    <div className={'flex items-center justify-center h-10 w-10 rounded-full bg-muted-foreground/20'}>
                      <Users size={20} />
                    </div>
                    <div className={'flex flex-col'}>
                      <span className={'text-base font-medium'}>{team.team_name || 'অজানা দল'}</span>
                      <span className="text-xs text-muted-foreground">{team.member_count} জন সদস্য</span>
                    </div>
                  </div>
                  <span className={'text-base font-bold text-primary flex items-center gap-1'}>
                    <BcoinIcon />
                    {team.total_points}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">এখনো কোনো দল তৈরি হয়নি।</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
