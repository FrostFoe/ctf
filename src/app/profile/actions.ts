'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

interface UpdateProfileData {
  fullName: string;
}

export async function updateUserProfile(data: UpdateProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: data.fullName,
    },
  });

  if (error) {
    console.error('Error updating user profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');

  return { success: true };
}
