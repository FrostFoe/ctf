import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import type { UserStats } from '@/lib/database.types';

interface Props {
  stats: UserStats | null;
}

export function DashboardWelcomeHero({ stats }: Props) {
  const welcomeMessage = stats?.full_name ? `${stats.full_name}, আপনাকে স্বাগতম!` : 'ফ্রস্টফলে আপনাকে স্বাগতম!';

  return (
    <Card className={'bg-transparent border-0 relative min-h-[220px] flex flex-col justify-end'}>
      <Image
        src={'https://picsum.photos/seed/dashboard-hero/1200/400'}
        alt={'ড্যাশবোর্ড হিরো ইমেজ'}
        fill
        className={'object-cover rounded-lg -z-10 brightness-50'}
        data-ai-hint="abstract digital"
      />
      <CardContent className={'p-6'}>
        <div className={'text-4xl text-primary font-bold'}>{welcomeMessage}</div>
        <div className={'text-base leading-6 text-secondary mt-2'}>
          আপনার সাইবার নিরাপত্তার যাত্রা এখান থেকে শুরু করুন।
        </div>
      </CardContent>
    </Card>
  );
}
