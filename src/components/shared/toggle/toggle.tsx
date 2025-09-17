'use client';

import { ChallengeDifficulty, IChallengeDifficulty } from '@/constants/billing-frequency';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  difficulty?: IChallengeDifficulty;
  setDifficulty?: (difficulty: IChallengeDifficulty) => void;
}

export function Toggle({ setDifficulty, difficulty }: Props) {
  if (!setDifficulty || !difficulty) {
    return null;
  }

  return (
    <div className="flex justify-center mb-8">
      <Tabs
        value={difficulty.value}
        onValueChange={(value) =>
          setDifficulty(ChallengeDifficulty.find((challengeDifficulty) => value === challengeDifficulty.value)!)
        }
      >
        <TabsList>
          {ChallengeDifficulty.map((challengeDifficulty) => (
            <TabsTrigger key={challengeDifficulty.value} value={challengeDifficulty.value}>
              {challengeDifficulty.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
