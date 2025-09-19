'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Challenge, LeaderboardEntry } from '@/lib/database.types';
import { ADMIN_EMAIL } from '@/constants';

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized: You do not have permission to perform this action.');
  }
  return supabase;
}

export interface AdminData {
  challenges: Challenge[];
  users: LeaderboardEntry[];
}

export async function getAdminDashboardData(): Promise<AdminData> {
  const supabase = await verifyAdmin();

  const challengesPromise = supabase.from('challenges').select('*').order('name', { ascending: true });
  const usersPromise = supabase.from('user_leaderboard').select('*').order('rank', { ascending: true });

  const [challengesRes, usersRes] = await Promise.all([challengesPromise, usersPromise]);

  if (challengesRes.error) console.error('Error fetching challenges:', challengesRes.error);
  if (usersRes.error) console.error('Error fetching users:', usersRes.error);

  return {
    challenges: (challengesRes.data as Challenge[]) || [],
    users: (usersRes.data as LeaderboardEntry[]) || [],
  };
}

export async function addChallenge(challenge: Omit<Challenge, 'id'>) {
  const supabase = await verifyAdmin();

  // Create a URL-friendly slug for the ID
  const id = challenge.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newChallenge: Challenge = { ...challenge, id };

  const { error } = await supabase.from('challenges').insert(newChallenge);

  if (error) {
    console.error('Error adding challenge:', error);
    if (error.code === '23505') {
      return { error: 'Failed to add challenge: A challenge with this name already exists.' };
    }
    return { error: `Failed to add challenge: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/challenges');
  revalidatePath('/');

  return { success: true, data: newChallenge };
}

export async function updateChallenge(challenge: Challenge) {
  const supabase = await verifyAdmin();

  const { id, ...updateData } = challenge;

  if (!id) {
    return { error: 'Challenge ID is missing.' };
  }

  const { error } = await supabase.from('challenges').update(updateData).eq('id', id);

  if (error) {
    console.error('Error updating challenge:', error);
    return { error: `Failed to update challenge: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/challenges');
  revalidatePath('/');

  return { success: true };
}

export async function deleteChallenge(challengeId: string) {
  const supabase = await verifyAdmin();

  if (!challengeId) {
    return { error: 'Challenge ID is missing.' };
  }

  const { error } = await supabase.from('challenges').delete().eq('id', challengeId);

  if (error) {
    console.error('Error deleting challenge:', error);
    return { error: `Failed to delete challenge: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/challenges');
  revalidatePath('/');

  return { success: true };
}
