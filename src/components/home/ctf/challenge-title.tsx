import type { Challenge } from '@/lib/database.types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BcoinIcon } from '@/components/shared/bcoin-icon';

interface Props {
  tier: Challenge;
}

export function ChallengeTitle({ tier }: Props) {
  const { name, featured, icon, difficulty, points } = tier;

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
      className={cn('flex justify-between items-start px-8 pt-8', {
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
              difficulty === 'easy' && 'bg-green-100/10 text-green-400',
              difficulty === 'medium' && 'bg-yellow-100/10 text-yellow-400',
              difficulty === 'hard' && 'bg-red-100/10 text-red-400',
            )}
          >
            {getDifficultyBadge(difficulty)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        {featured && (
          <div
            className={
              'flex items-center px-3 py-1 rounded-xs border border-secondary-foreground/10 text-[14px] h-[29px] leading-[21px] featured-card-badge'
            }
          >
            জনপ্রিয়
          </div>
        )}
        <div className="flex items-center gap-1 text-primary font-bold">
          <BcoinIcon />
          <span>{points}</span>
        </div>
      </div>
    </div>
  );
}
