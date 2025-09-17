import { Toggle } from '@/components/shared/toggle/toggle';
import { CTFCards } from '@/components/home/ctf/ctf-cards';
import { useState } from 'react';
import { ChallengeDifficulty, IChallengeDifficulty } from '@/constants/billing-frequency';

export function Pricing() {
  const [difficulty, setDifficulty] = useState<IChallengeDifficulty>(ChallengeDifficulty[0]);

  return (
    <div className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
      <Toggle difficulty={difficulty} setDifficulty={setDifficulty} />
      <CTFCards difficulty={difficulty} />
    </div>
  );
}
