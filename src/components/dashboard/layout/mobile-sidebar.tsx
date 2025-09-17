'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/layout/sidebar';
import { SidebarUserInfo } from '@/components/dashboard/layout/sidebar-user-info';
import { useUserInfo } from '@/hooks/useUserInfo';
import { createClient } from '@/utils/supabase/client';

export function MobileSidebar() {
  const supabase = createClient();
  const { user } = useUserInfo(supabase);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <Sidebar />
        <SidebarUserInfo user={user} />
      </SheetContent>
    </Sheet>
  );
}
