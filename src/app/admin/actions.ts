'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Challenge } from '@/constants/ctf-tiers';

export async function updateChallenge(challenge: Challenge) {
  const supabase = await createClient();

  const { error } = await supabase.from('challenges').update(challenge).eq('id', challenge.id);

  if (error) {
    console.error('Error updating challenge:', error);
    return { error: 'Failed to update challenge.' };
  }

  revalidatePath('/admin');
  revalidatePath('/challenges');

  return { success: true };
}
