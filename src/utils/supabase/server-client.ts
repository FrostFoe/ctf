import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient(request?: Request) {
  if (!request) {
    const cookieStore = cookies();
    return createSupabaseServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cooks = new Map(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((c) => c.length === 2)
      .map(([name, value]) => [name, value]),
  );

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cooks.get(name);
      },
    },
  });
}
