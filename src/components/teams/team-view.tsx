'use client';

import type { TeamDetails } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, User, Trash2, Copy, Check } from 'lucide-react';
import { Confirmation } from '../shared/confirmation/confirmation';
import { useState } from 'react';
import { leaveTeam, kickMember } from '@/app/teams/actions';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface TeamViewProps {
  team: TeamDetails;
  currentUserId: string;
}

export function TeamView({ team, currentUserId }: TeamViewProps) {
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<TeamDetails['members'][0] | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleLeaveTeam = async () => {
    const result = await leaveTeam(team.id);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: 'আপনি সফলভাবে দল ছেড়ে দিয়েছেন।' });
    }
    setIsLeaveConfirmOpen(false);
  };

  const handleKickMember = async () => {
    if (!memberToKick) return;
    const result = await kickMember(team.id, memberToKick.user_id);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: `${memberToKick.username}-কে দল থেকে বাদ দেওয়া হয়েছে।` });
    }
    setMemberToKick(null);
  };

  const handleCopyToken = () => {
    if (team.join_token) {
      navigator.clipboard.writeText(team.join_token);
      setHasCopied(true);
      toast({ description: 'যোগদান টোকেন কপি করা হয়েছে!' });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const isCurrentUserAdmin = team.members.some((m) => m.user_id === currentUserId && m.role === 'admin');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription>আপনার দলের সদস্য এবং তথ্য দেখুন।</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/teams/${team.id}`}>টিম বেস এ যান</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCurrentUserAdmin && team.is_private && team.join_token && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">প্রাইভেট দলের টোকেন</h4>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <p className="font-mono text-sm bg-background p-2 rounded-md flex-grow break-all sm:break-normal">
                  {team.join_token}
                </p>
                <Button variant="outline" onClick={handleCopyToken} className="w-full sm:w-auto">
                  {hasCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {hasCopied ? 'কপি হয়েছে' : 'টোকেন কপি করুন'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                এই টোকেনটি অন্যদের সাথে শেয়ার করে আপনার দলে যোগদানের জন্য আমন্ত্রণ জানান।
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">সদস্যরা</h3>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>ভূমিকা</TableHead>
                    {isCurrentUserAdmin && <TableHead className="text-right">ক্রিয়াকলাপ</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.members.map((member) => (
                    <TableRow key={member.user_id}>
                      <TableCell className="flex items-center gap-2">
                        <User size={16} />
                        {member.username}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {member.role === 'admin' && <Crown size={16} className="text-yellow-500" />}
                          {member.role === 'admin' ? 'অ্যাডমিন' : 'সদস্য'}
                        </span>
                      </TableCell>
                      {isCurrentUserAdmin && (
                        <TableCell className="text-right">
                          {member.user_id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToKick(member)}
                              aria-label={`Kick ${member.username}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button variant="destructive" className="ml-4" onClick={() => setIsLeaveConfirmOpen(true)}>
            দল ছাড়ুন
          </Button>
        </CardFooter>
      </Card>

      <Confirmation
        isOpen={isLeaveConfirmOpen}
        onClose={() => setIsLeaveConfirmOpen(false)}
        onConfirm={handleLeaveTeam}
        title="আপনি কি নিশ্চিত?"
        description={`আপনি "${team.name}" দলটি ছেড়ে দিতে চলেছেন।`}
        confirmText="নিশ্চিত করুন"
        cancelText="বন্ধ করুন"
      />

      <Confirmation
        isOpen={!!memberToKick}
        onClose={() => setMemberToKick(null)}
        onConfirm={handleKickMember}
        title="সদস্যকে বাদ দেবেন?"
        description={`আপনি কি নিশ্চিত যে আপনি ${memberToKick?.username}-কে দল থেকে বাদ দিতে চান? এই ক্রিয়াটি ফিরিয়ে আনা যাবে না।`}
        confirmText="নিশ্চিত করুন"
        cancelText="বন্ধ করুন"
      />
    </>
  );
}
