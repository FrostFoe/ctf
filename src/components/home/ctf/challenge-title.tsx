import { CTFTier } from '@/constants/ctf-tiers';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  tier: CTFTier;
}

export function ChallengeTitle({ tier }: Props) {
  const { name, featured, icon, difficulty } = tier;

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'সহজ';
      case 'medium':
        return 'মাঝারি';
      case 'hard':
        return 'কঠিন';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn('flex justify-between items-center px-8 pt-8', {
        'featured-price-title': featured,
      })}
    >
      <div className={'flex items-center gap-[10px]'}>
        <Image src={icon} height={40} width={40} alt={name} />
        <div>
          <p className={'text-[20px] leading-[30px] font-semibold'}>{name}</p>
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              difficulty === 'easy' && 'bg-green-100 text-green-800',
              difficulty === 'medium' && 'bg-yellow-100 text-yellow-800',
              difficulty === 'hard' && 'bg-red-100 text-red-800',
            )}
          >
            {getDifficultyBadge(difficulty)}
          </span>
        </div>
      </div>
      {featured && (
        <div
          className={
            'flex items-center px-3 py-1 rounded-xs border border-secondary-foreground/10 text-[14px] h-[29px] leading-[21px] featured-card-badge'
          }
        >
          জনপ্রিয়
        </div>
      )}
    </div>
  );
}
