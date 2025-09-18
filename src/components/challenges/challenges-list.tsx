'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Challenge } from '@/lib/database.types';
import { useState } from 'react';
import Link from 'next/link';
import { BcoinIcon } from '../shared/bcoin-icon';

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

export function ChallengesList({ challenges, solvedChallengeIds: initialSolvedIds }: ChallengesListProps) {
  const [solvedChallengeIds] = useState<string[]>(initialSolvedIds);

  if (challenges.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">কোনো চ্যালেঞ্জ পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground">শীঘ্রই নতুন চ্যালেঞ্জ যোগ করা হবে।</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge, index) => {
          const isSolved = solvedChallengeIds.includes(challenge.id);
          return (
            <Card
              key={challenge.id}
              className="overflow-hidden relative flex flex-col justify-end bg-background/50 backdrop-blur-[24px] border-border"
            >
              <Image
                src={`https://picsum.photos/seed/${index + 10}/600/800`}
                alt={challenge.name}
                fill
                className="object-cover -z-10"
                data-ai-hint="cybersecurity abstract"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent -z-10" />

              <div className="p-6 text-white flex flex-col gap-4">
                <CardTitle className="text-2xl font-bold">{challenge.name}</CardTitle>
                <CardDescription className="text-secondary">{challenge.description}</CardDescription>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full whitespace-nowrap backdrop-blur-sm',
                      challenge.difficulty === 'easy' && 'bg-green-700/30 text-green-300',
                      challenge.difficulty === 'medium' && 'bg-yellow-700/30 text-yellow-300',
                      challenge.difficulty === 'hard' && 'bg-red-700/30 text-red-300',
                    )}
                  >
                    {getDifficultyBadge(challenge.difficulty)}
                  </span>
                  <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full whitespace-nowrap backdrop-blur-sm bg-white/10">
                    <BcoinIcon className="w-4 h-4" /> {challenge.points} পয়েন্ট
                  </span>
                </div>
                <Button asChild className="w-full mt-4" variant={'secondary'} disabled={isSolved}>
                  <Link href={`/challenges/${challenge.id}`}>{isSolved ? 'সমাধান করা হয়েছে' : 'চ্যালেঞ্জ দেখুন'}</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
