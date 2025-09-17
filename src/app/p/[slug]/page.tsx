import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import type { Challenge } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle, Hash, BarChart } from 'lucide-react';
import { BcoinIcon } from '@/components/shared/bcoin-icon';

interface PublicProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  total_points: number;
  rank: number;
  solved_challenges_count: number;
}

interface SolvedChallenge extends Pick<Challenge, 'id' | 'name' | 'category' | 'difficulty' | 'points'> {
  solved_at: string;
}

async function getProfileData(slug: string): Promise<{
  profile: PublicProfile;
  solvedChallenges: SolvedChallenge[];
} | null> {
  const supabase = await createClient();

  // Try to fetch by username first
  let { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', slug)
    .single();

  // If not found by username, try by ID
  if (profileError || !profileData) {
    const { data: byIdData, error: byIdError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('id', slug)
      .single();

    if (byIdError || !byIdData) {
      console.error('Error fetching profile by username or id:', profileError || byIdError);
      return null;
    }
    profileData = byIdData;
  }

  const userId = profileData.id;

  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from('leaderboard')
    .select('total_points, rank, solved_challenges')
    .eq('user_id', userId)
    .single();

  const { data: solvedChallengesData, error: solvedChallengesError } = await supabase
    .from('solved_challenges')
    .select(
      `
      solved_at,
      challenge:challenges(id, name, category, difficulty, points)
    `,
    )
    .eq('user_id', userId)
    .order('solved_at', { ascending: false });

  if (leaderboardError || solvedChallengesError) {
    console.error('Error fetching profile details:', leaderboardError || solvedChallengesError);
    return null;
  }

  const profile: PublicProfile = {
    id: profileData.id,
    username: profileData.username,
    full_name: profileData.full_name,
    total_points: leaderboardData?.total_points || 0,
    rank: leaderboardData?.rank || 0,
    solved_challenges_count: leaderboardData?.solved_challenges || 0,
  };

  const solvedChallenges: SolvedChallenge[] =
    (solvedChallengesData?.map((item: any) => ({
      ...item.challenge,
      solved_at: item.solved_at,
    })) as SolvedChallenge[]) || [];

  return { profile, solvedChallenges };
}

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const data = await getProfileData(params.slug);

  if (!data) {
    notFound();
  }

  const { profile, solvedChallenges } = data;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-4xl font-bold">{(profile.username || profile.full_name || 'U').charAt(0)}</span>
          </div>
          <h1 className="text-4xl font-bold">{profile.username || profile.full_name || 'অজানা ব্যবহারকারী'}</h1>
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
              <BcoinIcon className="h-4 w-4 text-muted-foreground" />
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
              <div className="text-2xl font-bold truncate">{profile.id.substring(0, 8)}...</div>
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
              <ul className="space-y-4">
                {solvedChallenges.map((challenge) => (
                  <li key={challenge.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{challenge.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ক্যাটাগরি: {challenge.category} | কঠিনতা: {challenge.difficulty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary flex items-center gap-1">
                        <BcoinIcon /> {challenge.points}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(challenge.solved_at).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center">এখনও কোনো চ্যালেঞ্জ সমাধান করা হয়নি।</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
