import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type');

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password?code=${code}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      console.log('User authenticated successfully:', data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Auth callback error:', error);
    }
  } else {
    console.error('No code provided in auth callback');
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
