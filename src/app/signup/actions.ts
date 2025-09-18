'use server';

import { createClient } from '@/utils/supabase/server';

interface FormData {
  email: string;
  password: string;
}

export async function signup(data: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('Signup error:', error);
    return { 
      error: true, 
      message: error.message.includes('already registered') 
        ? 'এই ইমেইল ঠিকানা ইতিমধ্যে ব্যবহৃত হচ্ছে' 
        : 'সাইন আপে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
    };
  }

  // For email confirmation flow
  return { 
    success: true, 
    message: 'আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করে একাউন্ট নিশ্চিত করুন।' 
  };
}
