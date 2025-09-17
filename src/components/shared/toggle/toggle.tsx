'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const difficulties = [
  { value: 'beginner', label: 'শিক্ষানবিস' },
  { value: 'hacker', label: 'হ্যাকার' },
];

interface Props {
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
}

export function Toggle({ setDifficulty, difficulty }: Props) {
  return (
    <div className="flex justify-center mb-8">
      <Tabs value={difficulty} onValueChange={setDifficulty}>
        <TabsList>
          {difficulties.map((d) => (
            <TabsTrigger key={d.value} value={d.value}>
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
