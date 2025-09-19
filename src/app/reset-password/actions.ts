'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function updateUserPassword(code: string, newPassword: string) {
  const supabase = await createClient();

  // First, exchange the code for a session
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData.user) {
    console.error('Password reset code exchange error:', sessionError);
    return { error: true, message: 'পাসওয়ার্ড রিসেট লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ। আবার চেষ্টা করুন।' };
  }

  // With the user session, update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Password update error:', updateError);
    return { error: true, message: 'পাসওয়ার্ড আপডেট করা যায়নি। আবার চেষ্টা করুন।' };
  }

  // Invalidate the session after password update for security
  await supabase.auth.signOut();

  // Redirect to login page after a short delay
  redirect('/login?password_reset=true');
}
