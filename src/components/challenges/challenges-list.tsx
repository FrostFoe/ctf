'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Challenge } from '@/constants/ctf-tiers';
import { useState } from 'react';
import { ChallengeDetailDialog } from './challenge-detail-dialog';

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'সহজ';
    case 'medium':
      return 'মাঝারি';
    case 'hard':
      return 'কঠিন';
    default:
      return '';
  }
};

interface ChallengesListProps {
  challenges: Challenge[];
  solvedChallengeIds: string[];
}

export function ChallengesList({ challenges, solvedChallengeIds }: ChallengesListProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const handleChallengeUpdate = (updatedChallengeId: string) => {
    // This is a simple way to reflect the change without a full re-fetch.
    // In a real app, you might re-fetch or use a more robust state management.
    if (!solvedChallengeIds.includes(updatedChallengeId)) {
      solvedChallengeIds.push(updatedChallengeId);
    }
    // Force a re-render to show the updated solved state
    setSelectedChallenge(null);
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const isSolved = solvedChallengeIds.includes(challenge.id);
          return (
            <Card key={challenge.id} className="bg-background/50 backdrop-blur-[24px] border-border p-6 flex flex-col">
              <CardHeader className="p-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Image src={challenge.icon} width={40} height={40} alt={challenge.name} />
                    <CardTitle className="text-xl font-medium">{challenge.name}</CardTitle>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full whitespace-nowrap',
                      challenge.difficulty === 'easy' && 'bg-green-100/10 text-green-400',
                      challenge.difficulty === 'medium' && 'bg-yellow-100/10 text-yellow-400',
                      challenge.difficulty === 'hard' && 'bg-red-100/10 text-red-400',
                    )}
                  >
                    {getDifficultyBadge(challenge.difficulty)}
                  </span>
                </div>
                <CardDescription className="pt-4 text-secondary">{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-6 flex-grow flex flex-col justify-between">
                <ul className="text-sm text-secondary space-y-2">
                  {challenge.features.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => setSelectedChallenge(challenge)} className="w-full mt-6" disabled={isSolved}>
                  {isSolved ? 'সমাধান করা হয়েছে' : 'চ্যালেঞ্জ দেখুন'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {selectedChallenge && (
        <ChallengeDetailDialog
          challenge={selectedChallenge}
          isOpen={!!selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onChallengeSolved={handleChallengeUpdate}
        />
      )}
    </>
  );
}
