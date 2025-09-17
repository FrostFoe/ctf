'use client';

import { Home, ShieldCheck, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface SidebarItem {
  title: string;
  icon: JSX.Element;
  href: string;
  adminOnly?: boolean;
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
    title: 'অ্যাডমিন',
    icon: <UserCog className="h-6 w-6" />,
    href: '/admin',
    adminOnly: true,
  },
];

const ADMIN_EMAIL = 'frostfoe@gmail.com';

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (item.adminOnly) {
      return user?.email === ADMIN_EMAIL;
    }
    return true;
  });

  return (
    <nav className="flex flex-col grow justify-between items-start px-2 text-sm font-medium lg:px-4">
      <div className={'w-full'}>
        {filteredSidebarItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn('flex items-center text-base gap-3 px-4 py-3 rounded-xxs dashboard-sidebar-items', {
              'dashboard-sidebar-items-active':
                item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href),
            })}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
