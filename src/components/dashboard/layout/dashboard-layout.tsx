import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { DashboardGradient } from '@/components/gradients/dashboard-gradient';
import { Sidebar } from '@/components/dashboard/layout/sidebar';
import { SidebarUserInfo } from '@/components/dashboard/layout/sidebar-user-info';
import type { User } from '@supabase/supabase-js';

interface Props {
  children: ReactNode;
  user: User | null;
}

export function DashboardLayout({ children, user }: Props) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative overflow-hidden">
      <DashboardGradient />
      <div className="hidden border-r md:block relative">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center pt-8 pl-6 pb-10">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src={'/logo.png'} alt={'ফ্রস্টফল লোগো'} width={41} height={41} className="rounded-full" />
            </Link>
          </div>
          <div className="flex flex-col grow">
            <Sidebar user={user} />
            <SidebarUserInfo user={user} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
