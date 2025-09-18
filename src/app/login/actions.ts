'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}
export async function login(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error);
    return { 
      error: true, 
      message: error.message === 'Invalid login credentials' 
        ? 'অবৈধ ইমেইল বা পাসওয়ার্ড' 
        : 'লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
    };
  }

  redirect('/dashboard');
}

export async function signInWithGithub() {
  const supabase = await createClient();
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
  console.log('GitHub OAuth redirect URL:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
    },
  });
  
  if (error) {
    console.error('GitHub OAuth error:', error);
    return { error: true };
  }
  
  if (data.url) {
    redirect(data.url);
  } else {
    console.error('No OAuth URL returned from Supabase');
    return { error: true };
  }
}
