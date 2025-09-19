'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LeaderboardEntry } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import Link from 'next/link';

interface Props {
  users: LeaderboardEntry[];
}

export function AdminUsersTable({ users }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ব্যবহারকারীগণ</CardTitle>
        <CardDescription>প্ল্যাটফর্মে থাকা সমস্ত ব্যবহারকারী এবং তাদের পরিসংখ্যান দেখুন।</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border shadow-sm rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">র‍্যাঙ্ক</TableHead>
                <TableHead>ব্যবহারকারীর নাম</TableHead>
                <TableHead className="hidden md:table-cell">ইমেইল</TableHead>
                <TableHead className="text-right">মোট পয়েন্ট</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-bold">{user.rank}</TableCell>
                    <TableCell>
                      <Link href={`/p/${user.username || user.user_id}`} className="hover:underline">
                        {user.username || 'অজানা'}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email || 'N/A'}</TableCell>
                    <TableCell className="text-right font-bold text-primary flex items-center justify-end gap-1">
                      <BcoinIcon />
                      {user.total_points}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
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
