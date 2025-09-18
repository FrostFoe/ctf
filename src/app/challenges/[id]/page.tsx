import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Challenge } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChallengeSubmissionForm } from '@/components/challenges/challenge-submission-form';
import { HintDisplay } from '@/components/challenges/hint-display';
import Image from 'next/image';

async function getChallenge(id: string): Promise<Challenge | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('challenges').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching challenge', error);
    return null;
  }
  return data;
}

async function getIsSolved(userId: string | undefined, challengeId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('solved_challenges')
    .select('challenge_id')
    .match({ user_id: userId, challenge_id: challengeId })
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116: "exact-one" row not found
    console.error('Error fetching solved status', error);
  }

  return !!data;
}

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

function stringToHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default async function ChallengePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenge = await getChallenge(params.id);

  if (!challenge) {
    notFound();
  }

  const isSolved = await getIsSolved(user?.id, challenge.id);
  const imageSeed = stringToHash(challenge.id);

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative h-80 w-full">
        <Image
          src={`https://picsum.photos/seed/${imageSeed}/1200/400`}
          alt={challenge.name}
          fill
          className="object-cover"
          data-ai-hint="cybersecurity abstract"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 md:p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{challenge.name}</h1>
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'text-sm px-3 py-1.5 rounded-full whitespace-nowrap font-semibold',
                challenge.difficulty === 'easy' && 'bg-green-900/80 text-green-300',
                challenge.difficulty === 'medium' && 'bg-yellow-900/80 text-yellow-300',
                challenge.difficulty === 'hard' && 'bg-red-900/80 text-red-300',
              )}
            >
              {getDifficultyBadge(challenge.difficulty)}
            </span>
            <span className="font-semibold capitalize text-lg text-slate-300">{challenge.category}</span>
            <span className="font-bold text-primary flex items-center gap-1 text-lg text-yellow-400">
              <BcoinIcon /> {challenge.points}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-8 p-4 md:p-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-background/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>চ্যালেঞ্জের বিবরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{challenge.description}</p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>বৈশিষ্ট্য</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {challenge.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CircleCheck className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-background/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>ফ্ল্যাগ জমা দিন</CardTitle>
              <CardDescription>সঠিক ফ্ল্যাগ জমা দিয়ে চ্যালেঞ্জটি সমাধান করুন।</CardDescription>
            </CardHeader>
            <CardContent>
              <ChallengeSubmissionForm challenge={challenge} isSolved={isSolved} />
            </CardContent>
          </Card>
          {!isSolved && user && <HintDisplay challengeId={challenge.id} userId={user.id} />}
        </div>
      </div>
    </main>
  );
}
