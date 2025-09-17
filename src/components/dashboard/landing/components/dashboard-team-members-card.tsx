'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/lib/database.types';

interface DashboardTeamMembersCardProps {
  leaderboard: LeaderboardEntry[];
}

export function DashboardTeamMembersCard({ leaderboard }: DashboardTeamMembersCardProps) {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between gap-2 items-center pb-6 border-border border-b">
          <div className={'flex flex-col gap-2'}>
            <span className={'text-xl font-medium'}>লিডারবোর্ড</span>
            <span className={'text-base leading-4 text-secondary'}>শীর্ষস্থানীয় প্রতিযোগীদের দেখুন</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 pt-6 flex gap-6 flex-col'}>
        {leaderboard.length > 0 ? (
          leaderboard.map((player) => (
            <div key={player.user_id} className={'flex justify-between items-center gap-2'}>
              <div className={'flex gap-4 items-center'}>
                <div className={'text-sm font-bold w-6 text-center'}>{player.rank}</div>
                <div className={'flex items-center justify-center h-10 w-10 rounded-full bg-muted-foreground/20'}>
                  <span className={'text-white text-base'}>{player.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div className={'flex flex-col'}>
                  <span className={'text-base font-medium'}>{player.username || 'অজানা'}</span>
                </div>
              </div>
              <span className={'text-base font-bold text-primary'}>{player.total_points}</span>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">এখনো কোনো প্রতিযোগী নেই।</p>
        )}
      </CardContent>
    </Card>
  );
}
