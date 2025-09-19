'use server';

import { createClient } from '@/utils/supabase/server';

export async function requestPasswordReset(email: string) {
  const supabase = await createClient();
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error('Password reset request error:', error);
    return { error: true, message: 'পাসওয়ার্ড রিসেট অনুরোধ পাঠানো যায়নি। আবার চেষ্টা করুন।' };
  }

  return { success: true };
}
