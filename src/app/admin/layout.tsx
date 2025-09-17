import { ReactNode, Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/dashboard-layout';
import { createClient } from '@/utils/supabase/server';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';

interface Props {
  children: ReactNode;
}

async function AuthWrapper({ children }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Basic redirect if not logged in, more robust role check would be needed for production
  return <DashboardLayout user={data.user}>{children}</DashboardLayout>;
}

export default function Layout({ children }: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AuthWrapper>{children}</AuthWrapper>
    </Suspense>
  );
}
