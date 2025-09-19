'use client';

import { Toggle } from '@/components/shared/toggle/toggle';
import { Suspense, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Challenge } from '@/lib/database.types';
import dynamic from 'next/dynamic';

const CTFCards = dynamic(() => import('@/components/home/ctf/ctf-cards').then((mod) => mod.CTFCards), {
  ssr: false,
  loading: () => (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3 w-full">
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  ),
});

interface Props {
  challenges: Challenge[];
}
export function ChallengesSection({ challenges }: Props) {
  const [difficulty, setDifficulty] = useState('beginner');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="mx-auto max-w-7xl relative px-6 md:px-8 flex flex-col items-center justify-between">
      {isClient ? (
        <div className="w-full flex flex-col items-center">
          <Toggle difficulty={difficulty} setDifficulty={setDifficulty} />
          <Suspense
            fallback={
              <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 w-full">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            }
          >
            <CTFCards difficulty={difficulty} challenges={challenges} />
          </Suspense>
        </div>
      ) : (
        <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3 w-full mt-20">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      )}
    </div>
  );
}
