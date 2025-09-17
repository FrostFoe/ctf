import { IChallengeDifficulty } from '@/constants/billing-frequency';
import { FeaturesList } from '@/components/home/pricing/features-list';
import { ChallengeTitle } from '@/components/home/ctf/challenge-title';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FeaturedCardGradient } from '@/components/gradients/featured-card-gradient';
import Link from 'next/link';
import type { Challenge } from '@/lib/database.types';

interface Props {
  difficulty: IChallengeDifficulty;
  challenges: Challenge[];
}

export function CTFCards({ difficulty, challenges }: Props) {
  const filteredTiers = challenges.filter((tier) => {
    if (difficulty.value === 'beginner') return tier.category === 'beginner';
    if (difficulty.value === 'hacker') return tier.category === 'hacker';
    return true;
  });

  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
