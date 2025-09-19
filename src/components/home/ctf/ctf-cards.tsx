import { FeaturesList } from '@/components/home/pricing/features-list';
import { ChallengeTitle } from '@/components/home/ctf/challenge-title';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/gradients/featured-card-gradient';
import Link from 'next/link';
import type { Challenge } from '@/lib/database.types';

interface Props {
  difficulty: string;
  challenges: Challenge[];
}

export function CTFCards({ difficulty, challenges }: Props) {
  const filteredTiers = challenges.filter((tier) => tier.category === difficulty);

  if (filteredTiers.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm my-8 min-h-[300px] w-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">কোনো চ্যালেঞ্জ পাওয়া যায়নি</h3>
          <p className="text-sm text-muted-foreground">এই বিভাগের জন্য কোনো চ্যালেঞ্জ এখনো যোগ করা হয়নি।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none md:grid-cols-2 lg:grid-cols-3 w-full">
      {filteredTiers.map((tier) => (
        <div key={tier.id} className={cn('rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden')}>
          <div className={cn('flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border')}>
            {tier.featured && <FeaturedCardGradient />}
            <ChallengeTitle tier={tier} />
            <div className={'px-8'}>
              <Separator className={'bg-border'} />
            </div>
            <div className={'px-8 text-[16px] leading-[24px]'}>{tier.description}</div>
          </div>
          <div className={'px-8 mt-8'}>
            <Button className={'w-full'} variant={'secondary'} asChild>
              <Link href="/challenges">চ্যালেঞ্জ শুরু করুন</Link>
            </Button>
          </div>
          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}
