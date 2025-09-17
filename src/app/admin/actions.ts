'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/constants/ctf-tiers';
import { validateUserSession } from '@/utils/supabase/server';

export async function updateChallenge(challenge: Challenge) {
  const { user } = await validateUserSession();
  const supabase = await createClient();

  // Ensure we only update specific, editable fields.
  const { id, flag, url } = challenge;

  if (!id) {
    return { error: 'Challenge ID is missing.' };
  }

  const { error } = await supabase
    .from('challenges')
    .update({
      flag: flag || null,
      url: url || null,
      // You can add other fields here if they become editable in the future
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating challenge:', error);
    return { error: `Failed to update challenge: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/challenges');
  revalidatePath('/');

  return { success: true };
}
