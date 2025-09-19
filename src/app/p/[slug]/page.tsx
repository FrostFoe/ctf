import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { PublicProfile, SolvedChallenge } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle, Hash, Bitcoin } from 'lucide-react';
import { cn, getDifficultyBadge } from '@/lib/utils';
import Link from 'next/link';

async function getProfileData(slug: string): Promise<{
  profile: PublicProfile;
  solvedChallenges: SolvedChallenge[];
} | null> {
  const supabase = await createClient();

  const { data: profileBySlug, error: slugError } = await supabase
    .from('user_profile_overview')
    .select('*')
    .or(`username.eq.${slug},id.eq.${slug}`)
    .maybeSingle();

  if (slugError || !profileBySlug) {
    console.error('Error fetching profile by slug:', slugError);
    return null;
  }

  const userId = profileBySlug.id;

  const { data: solvedChallengesData, error: solvedChallengesError } = await supabase
    .from('solved_challenges_with_details')
    .select('*')
    .eq('user_id', userId)
    .order('solved_at', { ascending: false });

  if (solvedChallengesError) {
    console.error('Error fetching solved challenges:', solvedChallengesError);
    return null;
  }

  const profile: PublicProfile = {
    id: profileBySlug.id,
    username: profileBySlug.username,
    full_name: profileBySlug.full_name,
    total_points: profileBySlug.total_points,
    rank: profileBySlug.rank,
    solved_challenges_count: profileBySlug.solved_challenges_count,
  };

  const solvedChallenges: SolvedChallenge[] = (solvedChallengesData as SolvedChallenge[]) || [];

  return { profile, solvedChallenges };
}

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await getProfileData(slug);

  if (!data) {
    notFound();
  }

  const { profile, solvedChallenges } = data;

  return (
    <div className="flex-1 space-y-4 bg-background p-4 pt-6 text-foreground md:p-8 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <span className="text-4xl font-bold">{(profile.username || profile.full_name || 'U').charAt(0)}</span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            {profile.username || profile.full_name || 'অজানা ব্যবহারকারী'}
          </h1>
          {profile.username && profile.full_name && <p className="text-muted-foreground">{profile.full_name}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">র‍্যাঙ্ক</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{profile.rank || 'N/A'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বিটকয়েন</CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.total_points}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সমাধান করা হয়েছে</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.solved_challenges_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আইডি</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="truncate text-lg font-bold md:text-2xl">{profile.id.substring(0, 8)}...</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক সমাধানকৃত চ্যালেঞ্জ</CardTitle>
            <CardDescription>এই ব্যবহারকারীর দ্বারা সমাধান করা সর্বশেষ চ্যালেঞ্জগুলো দেখুন।</CardDescription>
          </CardHeader>
          <CardContent>
            {solvedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {solvedChallenges.map((challenge) => (
                  <Link href={`/challenges/${challenge.id}`} key={challenge.id}>
                    <Card className="flex h-full flex-col justify-between transition-transform hover:scale-105 hover:bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold',
                            challenge.difficulty === 'easy' && 'bg-green-900/80 text-green-300',
                            challenge.difficulty === 'medium' && 'bg-yellow-900/80 text-yellow-300',
                            challenge.difficulty === 'hard' && 'bg-red-900/80 text-red-300',
                          )}
                        >
                          {getDifficultyBadge(challenge.difficulty)}
                        </span>
                        <span className="text-xs capitalize text-slate-300">{challenge.category}</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <Bitcoin /> {challenge.points}
                        </span>
                        <p className="w-full pt-2 text-xs text-muted-foreground">
                          {new Date(challenge.solved_at).toLocaleDateString('bn-BD')}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">এখনও কোনো চ্যালেঞ্জ সমাধান করা হয়নি।</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
