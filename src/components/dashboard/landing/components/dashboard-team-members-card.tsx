'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry, TeamLeaderboardEntry } from '@/lib/database.types';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Crown, Medal, Award } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardTeamMembersCardProps {
  leaderboard: LeaderboardEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return <Trophy className="w-4 h-4 text-muted-foreground" />;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500 bg-yellow-500/10';
    case 2:
      return 'text-gray-400 bg-gray-400/10';
    case 3:
      return 'text-amber-600 bg-amber-600/10';
    default:
      return 'text-muted-foreground bg-muted/50';
  }
};

export function DashboardTeamMembersCard({ leaderboard, teamLeaderboard }: DashboardTeamMembersCardProps) {
  return (
    <Card className="group">
      <CardHeader>
        <div className="flex justify-between items-start pb-4 border-b border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">হল অফ ফেইম</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">শীর্ষ প্রতিযোগী ও দল</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            <Link href="/hall-of-fame">সব দেখুন</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-muted/50">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              ব্যক্তিগত
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              দলীয়
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-4 space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((player, index) => (
                <div key={player.user_id} className="group/item flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors",
                      getRankColor(player.rank)
                    )}>
                      {player.rank <= 3 ? getRankIcon(player.rank) : player.rank}
                    </div>
                    <Link
                      href={`/p/${player.username || player.user_id}`}
                      className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all duration-200 ring-2 ring-transparent hover:ring-primary/20"
                    >
                      <span className="text-foreground font-medium">
                        {player.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </Link>
                    <div>
                      <Link 
                        href={`/p/${player.username || player.user_id}`} 
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {player.username || 'অজানা'}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <BcoinIcon className="w-4 h-4" />
                    {player.total_points.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">এখনো কোনো প্রতিযোগী নেই।</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-4 space-y-3">
            {teamLeaderboard.length > 0 ? (
              teamLeaderboard.map((team) => (
                <div key={team.team_id} className="group/item flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex gap-3 items-center">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors",
                      getRankColor(team.rank)
                    )}>
                      {team.rank <= 3 ? getRankIcon(team.rank) : team.rank}
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">{team.team_name || 'অজানা দল'}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {team.member_count} জন সদস্য
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <BcoinIcon className="w-4 h-4" />
                    {team.total_points.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">এখনো কোনো দল তৈরি হয়নি।</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}