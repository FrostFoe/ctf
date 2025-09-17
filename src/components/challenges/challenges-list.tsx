import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Challenge } from '@/constants/ctf-tiers';
import { createClient } from '@/utils/supabase/server';

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

async function getChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('challenges').select('*').order('name', { ascending: true });
  if (error) {
    console.error('Error fetching challenges', error);
    return [];
  }
  return data as Challenge[];
}

export async function ChallengesList() {
  const challenges = await getChallenges();
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge) => (
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
            <Button asChild className="w-full mt-6">
              <Link href={challenge.url || '#'}>চ্যালেঞ্জ শুরু করুন</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
