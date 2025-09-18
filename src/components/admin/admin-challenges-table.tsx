'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Challenge } from '@/lib/database.types';
import { deleteChallenge } from '@/app/admin/actions';
import { useToast } from '../ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import dynamic from 'next/dynamic';

const ChallengeFormDialog = dynamic(() =>
  import('@/app/admin/challenge-form-dialog').then((mod) => mod.ChallengeFormDialog),
);
const Confirmation = dynamic(() => import('../shared/confirmation/confirmation').then((mod) => mod.Confirmation));

interface Props {
  initialChallenges: Challenge[];
}

export function AdminChallengesTable({ initialChallenges }: Props) {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null);

  const handleEditClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedChallenge(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedChallenge(null);
  };

  const handleSave = (savedChallenge: Challenge) => {
    if (selectedChallenge) {
      setChallenges((prev) =>
        prev.map((c) => (c.id === savedChallenge.id ? savedChallenge : c)).sort((a, b) => a.name.localeCompare(b.name)),
      );
    } else {
      setChallenges((prev) => [...prev, savedChallenge].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!challengeToDelete) return;
    const result = await deleteChallenge(challengeToDelete.id);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: 'চ্যালেঞ্জ সফলভাবে মুছে ফেলা হয়েছে।' });
      setChallenges((prev) => prev.filter((c) => c.id !== challengeToDelete.id));
    }
    setChallengeToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>চ্যালেঞ্জসমূহ</CardTitle>
            <CardDescription>এখানে চ্যালেঞ্জ যোগ, সম্পাদনা বা মুছে ফেলুন।</CardDescription>
          </div>
          <Button onClick={handleAddClick}>নতুন চ্যালেঞ্জ যোগ করুন</Button>
        </CardHeader>
        <CardContent>
          <div className="border shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>বিভাগ</TableHead>
                  <TableHead>কঠিনতা</TableHead>
                  <TableHead>বিটকয়েন</TableHead>
                  <TableHead className="hidden md:table-cell">ফ্ল্যাগ</TableHead>
                  <TableHead className="text-right">ক্রিয়াকলাপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-medium">{challenge.name}</TableCell>
                      <TableCell>{challenge.category}</TableCell>
                      <TableCell>{challenge.difficulty}</TableCell>
                      <TableCell>{challenge.points}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        {challenge.flag || 'সেট করা নেই'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(challenge)}>
                            সম্পাদনা
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setChallengeToDelete(challenge)}>
                            মুছুন
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      কোনো চ্যালেঞ্জ পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <ChallengeFormDialog
          challenge={selectedChallenge}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {challengeToDelete && (
        <Confirmation
          isOpen={!!challengeToDelete}
          onClose={() => setChallengeToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="আপনি কি নিশ্চিত?"
          description={`আপনি "${challengeToDelete?.name}" চ্যালেঞ্জটি মুছে ফেলতে চলেছেন। এই ক্রিয়াটি ফিরিয়ে আনা যাবে না।`}
          confirmText="নিশ্চিত করুন"
          cancelText="বন্ধ করুন"
        />
      )}
    </>
  );
}
