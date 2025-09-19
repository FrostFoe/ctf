import { Separator } from '@/components/ui/separator';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';
import type { User } from '@supabase/supabase-js';

interface Props {
  pageTitle: string;
  user: User | null;
}

export function DashboardPageHeader({ pageTitle, user }: Props) {
  return (
    <div>
      <div className={'flex items-center gap-6'}>
        <div className="md:hidden">
          <MobileSidebar user={user} />
        </div>
        <h1 className="text-lg font-semibold md:text-4xl">{pageTitle}</h1>
      </div>
      <Separator className={'relative bg-border my-8 dashboard-header-highlight'} />
    </div>
  );
}
