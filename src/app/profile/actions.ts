'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

interface UpdateProfileData {
  fullName: string;
  username: string;
}

export async function updateUserProfile(data: UpdateProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  // Update public.profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      username: data.username,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    if (profileError.code === '23505') {
      return { error: 'এই ব্যবহারকারীর নামটি ইতিমধ্যে ব্যবহৃত হচ্ছে।' };
    }
    return { error: 'প্রোফাইল আপডেট করা যায়নি।' };
  }

  // Also update user_metadata in auth.users
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: data.fullName,
    },
  });

  if (authError) {
    console.error('Error updating auth user metadata:', authError);
    // Note: You might want to decide how to handle a partial failure.
    // For now, we'll report the auth error if the profile update succeeded.
    return { error: 'Failed to update authentication profile. Please try again.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath(`/p/${data.username}`);

  return { success: true };
}
