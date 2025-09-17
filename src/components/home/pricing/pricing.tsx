'use client';

import { Toggle } from '@/components/shared/toggle/toggle';
import { CTFCards } from '@/components/home/ctf/ctf-cards';
import { Suspense, useState } from 'react';
import { ChallengeDifficulty, IChallengeDifficulty } from '@/constants/billing-frequency';
import { Skeleton } from '@/components/ui/skeleton';
import type { Challenge } from '@/lib/database.types';

interface Props {
  challenges: Challenge[];
}
export function Pricing({ challenges }: Props) {
  const [difficulty, setDifficulty] = useState<IChallengeDifficulty>(ChallengeDifficulty[0]);

  return (
    <div className="mx-auto max-w-7xl relative px-6 md:px-8 flex flex-col items-center justify-between">
      <Toggle difficulty={difficulty} setDifficulty={setDifficulty} />
      <Suspense
        fallback={
          <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        }
      >
        <CTFCards difficulty={difficulty} challenges={challenges} />
      </Suspense>
    </div>
  );
}
