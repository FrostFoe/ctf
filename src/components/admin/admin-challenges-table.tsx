'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditChallengeDialog } from './edit-challenge-dialog';
import { useState } from 'react';
import type { Challenge } from '@/constants/ctf-tiers';

interface Props {
  challenges: Challenge[];
}

export function AdminChallengesTable({ challenges: initialChallenges }: Props) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const handleUpdate = (updatedChallenge: Challenge) => {
    setChallenges((prev) => prev.map((c) => (c.id === updatedChallenge.id ? updatedChallenge : c)));
  };

  return (
    <>
      <div className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>নাম</TableHead>
              <TableHead>বিভাগ</TableHead>
              <TableHead>কঠিনতা</TableHead>
              <TableHead>ফ্ল্যাগ</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-right">ক্রিয়াকলাপ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell className="font-medium">{challenge.name}</TableCell>
                <TableCell>{challenge.category}</TableCell>
                <TableCell>{challenge.difficulty}</TableCell>
                <TableCell>{challenge.flag || 'সেট করা নেই'}</TableCell>
                <TableCell>{challenge.url || 'সেট করা নেই'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedChallenge(challenge)}>
                    সম্পাদনা
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedChallenge && (
        <EditChallengeDialog
          challenge={selectedChallenge}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onChallengeUpdate={handleUpdate}
        />
      )}
    </>
  );
}
