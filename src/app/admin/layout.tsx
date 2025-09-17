import { ReactNode, Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { createClient } from '@/utils/supabase/server';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface Props {
  children: ReactNode;
}

const ADMIN_EMAIL = 'frostfoe@gmail.com';

async function AuthWrapper({ children }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}

export default function Layout({ children }: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthWrapper>{children}</AuthWrapper>
    </Suspense>
  );
}
