'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/constants/ctf-tiers';

const ADMIN_EMAIL = 'frostfoe@gmail.com';

export async function updateChallenge(challenge: Challenge) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return { error: 'Unauthorized: You do not have permission to perform this action.' };
  }

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
