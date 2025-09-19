'use client';

import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn, getDifficultyBadge } from '@/lib/utils';
import type { Challenge } from '@/lib/database.types';
import { useState } from 'react';
import Link from 'next/link';
import { Bitcoin } from 'lucide-react';

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
              className="overflow-hidden relative flex flex-col justify-end bg-background/50 backdrop-blur-[24px] border-border min-h-[400px]"
            >
              <Image
                src={`https://picsum.photos/seed/${index + 10}/600/800`}
                alt={challenge.name}
                fill
                className="object-cover z-0 opacity-20"
                data-ai-hint="cybersecurity abstract"
              />
              <div className="z-10 p-6 flex flex-col justify-end h-full">
                <div className="flex-grow"></div>
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">{challenge.name}</CardTitle>
                  <p className="text-secondary mb-4 line-clamp-2">{challenge.description}</p>
                </div>

                <div className="flex flex-col gap-4">
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
                      <Bitcoin className="w-4 h-4" /> {challenge.points} পয়েন্ট
                    </span>
                  </div>
                  <Button asChild className="w-full mt-2" variant={'secondary'} disabled={isSolved}>
                    <Link href={`/challenges/${challenge.id}`}>
                      {isSolved ? 'সমাধান করা হয়েছে' : 'চ্যালেঞ্জ দেখুন'}
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
