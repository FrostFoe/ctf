import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Challenge, ChallengeResource } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { CircleCheck, Link as LinkIcon } from 'lucide-react';
import { cn, getDifficultyBadge } from '@/lib/utils';
import { ChallengeSubmissionForm } from '@/components/challenges/challenge-submission-form';
import { HintDisplay } from '@/components/challenges/hint-display';
import Image from 'next/image';

async function getChallenge(id: string): Promise<Challenge | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('challenges').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching challenge', error);
    return null;
  }
  return data;
}

async function getIsSolved(userId: string | undefined, challengeId: string): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createClient();
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
  const { id } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenge = await getChallenge(id);

  if (!challenge) {
    notFound();
  }

  const isSolved = await getIsSolved(user?.id, challenge.id);
  const imageSeed = stringToHash(challenge.id);

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative h-64 w-full md:h-80">
        <Image
          src={`https://picsum.photos/seed/${imageSeed}/1200/400`}
          alt={challenge.name}
          fill
          className="object-cover"
          data-ai-hint="cybersecurity abstract"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-8">
          <h1 className="mb-2 text-3xl font-bold text-white md:text-5xl">{challenge.name}</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <span
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold md:text-sm',
                challenge.difficulty === 'easy' && 'bg-green-900/80 text-green-300',
                challenge.difficulty === 'medium' && 'bg-yellow-900/80 text-yellow-300',
                challenge.difficulty === 'hard' && 'bg-red-900/80 text-red-300',
              )}
            >
              {getDifficultyBadge(challenge.difficulty)}
            </span>
            <span className="text-base font-semibold capitalize text-slate-300 md:text-lg">{challenge.category}</span>
            <span className="flex items-center gap-1 text-base font-bold text-primary text-yellow-400 md:text-lg">
              <BcoinIcon /> {challenge.points}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 p-4 md:grid-cols-3 md:p-8">
        <div className="space-y-6 md:col-span-2">
          <Card className="bg-background/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>চ্যালেঞ্জের বিবরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{challenge.description}</p>
            </CardContent>
          </Card>

          {challenge.resources && Array.isArray(challenge.resources) && challenge.resources.length > 0 && (
            <Card className="bg-background/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle>রিসোর্সসমূহ</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(challenge.resources as ChallengeResource[]).map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                      >
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{resource.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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
