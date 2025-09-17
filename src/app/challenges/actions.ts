'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkFlag(challengeId: string, submittedFlag: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to submit a flag.' };
  }

  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('flag')
    .eq('id', challengeId)
    .single();

  if (challengeError || !challenge) {
    return { error: 'Challenge not found.' };
  }

  if (challenge.flag === submittedFlag) {
    const { error: insertError } = await supabase.from('solved_challenges').insert({
      user_id: user.id,
      challenge_id: challengeId,
    });

    if (insertError && insertError.code !== '23505') {
      // 23505 is unique_violation, already solved
      return { error: 'Failed to save progress.' };
    }

    revalidatePath('/challenges');
    return { success: true, message: 'সঠিক ফ্ল্যাগ! চ্যালেঞ্জ সমাধান করা হয়েছে।' };
  } else {
    return { success: false, message: 'ভুল ফ্ল্যাগ। আবার চেষ্টা করুন।' };
  }
}
