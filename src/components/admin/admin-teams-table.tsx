'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TeamLeaderboardEntry } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Users } from 'lucide-react';

interface Props {
  teams: TeamLeaderboardEntry[];
}

export function AdminTeamsTable({ teams }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>দলসমূহ</CardTitle>
        <CardDescription>প্ল্যাটফর্মে থাকা সমস্ত দল এবং তাদের পরিসংখ্যান দেখুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border shadow-sm rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">র‍্যাঙ্ক</TableHead>
                <TableHead>দলের নাম</TableHead>
                <TableHead>সদস্য সংখ্যা</TableHead>
                <TableHead className="text-right">মোট পয়েন্ট</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <TableRow key={team.team_id}>
                    <TableCell className="font-bold">{team.rank}</TableCell>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Users size={16} />
                      {team.member_count}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                      <BcoinIcon />
                      {team.total_points}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    কোনো দল পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
