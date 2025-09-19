'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkFlag(challengeId: string, submittedFlag: string) {
  const supabase = await createClient();

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('flag, points')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challenge) {
    return { error: 'Challenge not found.' };
  }

  if (challenge.flag === submittedFlag) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if already solved to prevent duplicate point awards
      const { data: existingSolve, error: checkError } = await supabase
        .from('solved_challenges')
        .select('challenge_id')
        .match({ user_id: user.id, challenge_id: challengeId })
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { error: 'Error checking solve status.' };
      }

      if (!existingSolve) {
        // Award points and mark as solved
        const { error: rpcError } = await supabase.rpc('award_points', {
          p_user_id: user.id,
          p_challenge_id: challengeId,
          p_points: challenge.points,
        });

        if (rpcError) {
          return { error: 'Failed to save progress.' };
        }
      }

      revalidatePath(`/challenges/${challengeId}`);
      revalidatePath('/challenges');
      revalidatePath('/dashboard');
    }

    return { success: true, message: 'সঠিক ফ্ল্যাগ! চ্যালেঞ্জ সমাধান করা হয়েছে।' };
  } else {
    return { success: false, message: 'ভুল ফ্ল্যাগ। আবার চেষ্টা করুন।' };
  }
}
