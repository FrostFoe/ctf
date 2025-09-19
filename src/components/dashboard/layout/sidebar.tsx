'use client';

import { Home, ShieldCheck, UserCog, User as UserIcon, Users, Swords, Trophy } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import type { JSX } from 'react';
import { ADMIN_EMAIL } from '@/constants';
import { SheetClose } from '@/components/ui/sheet';

interface SidebarItem {
  title: string;
  icon: JSX.Element;
  href: string;
  adminOnly?: boolean;
  authRequired?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'ড্যাশবোর্ড',
    icon: <Home className="h-6 w-6" />,
    href: '/dashboard',
  },
  {
    title: 'চ্যালেঞ্জসমূহ',
    icon: <ShieldCheck className="h-6 w-6" />,
    href: '/challenges',
  },
  {
    title: 'অনুশীলন ক্ষেত্র',
    icon: <Swords className="h-6 w-6" />,
    href: '/practice',
  },
  {
    title: 'হল অফ ফেইম',
    icon: <Trophy className="h-6 w-6" />,
    href: '/hall-of-fame',
  },
  {
    title: 'দল',
    icon: <Users className="h-6 w-6" />,
    href: '/teams',
    authRequired: true,
  },
  {
    title: 'প্রোফাইল',
    icon: <UserIcon className="h-6 w-6" />,
    href: '/profile',
    authRequired: true,
  },
  {
    title: 'অ্যাডমিন',
    icon: <UserCog className="h-6 w-6" />,
    href: '/admin',
    adminOnly: true,
  },
];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (item.adminOnly) {
      return user?.email === ADMIN_EMAIL;
    }
    if (item.authRequired) {
      return !!user;
    }
    return true;
  });

  return (
    <nav className="flex flex-col grow justify-between items-start px-2 text-sm font-medium lg:px-4">
      <div className={'w-full'}>
        {filteredSidebarItems.map((item) => (
          <SheetClose asChild key={item.title}>
            <Link
              href={item.href}
              className={cn('flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items', {
                'dashboard-sidebar-items-active':
                  item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href),
              })}
            >
              {item.icon}
              {item.title}
            </Link>
          </SheetClose>
        ))}
      </div>
    </nav>
  );
}
