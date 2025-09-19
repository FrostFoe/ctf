import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from '@/components/dashboard/layout/mobile-sidebar';
import { createClient } from '@/utils/supabase/server';

interface Props {
  user: User | null;
}

export default async function Header({ user }: Props) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <nav>
      <div className="mx-auto max-w-7xl relative px-6 md:px-8 py-[18px] flex items-center justify-between">
        <div className="flex flex-1 items-center justify-start md:hidden">
          <MobileSidebar user={data.user} />
        </div>
        <div className="flex flex-1 items-center justify-start">
          <Link className="flex items-center" href={'/'}>
            <Image
              className="w-auto block rounded-full"
              src="/logo.png"
              width={40}
              height={40}
              alt="ফ্রস্টফল লোগো"
              priority
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="flex space-x-4">
            {user?.id ? (
              <Button variant={'secondary'} asChild={true}>
                <Link href={'/dashboard'}>ড্যাশবোর্ড</Link>
              </Button>
            ) : (
              <Button asChild={true} variant={'secondary'}>
                <Link href={'/login'}>সাইন ইন</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
