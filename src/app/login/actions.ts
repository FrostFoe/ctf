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
    return { error: true };
  }

  redirect('/');
}

export async function signInWithGithub() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });
  if (data.url) {
    redirect(data.url);
  }
}
