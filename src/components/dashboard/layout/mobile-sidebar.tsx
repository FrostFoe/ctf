'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/layout/sidebar';
import { SidebarUserInfo } from '@/components/dashboard/layout/sidebar-user-info';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
  user: User | null;
}

export function MobileSidebar({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold" onClick={closeSheet}>
              <Image src="/logo.png" width={32} height={32} alt="Logo" className="rounded-full" />
              <span className="">ফ্রস্টফল CTF</span>
            </Link>
          </div>
          <div className="flex-1">
            <Sidebar user={user} onLinkClick={closeSheet} />
          </div>
          <SidebarUserInfo user={user} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
