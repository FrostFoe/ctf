'use server';

import { redirect } from 'next/navigation';

import { createServerClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = createServerClient();
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: true };
  }

  redirect('/');
}
