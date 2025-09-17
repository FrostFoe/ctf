import { Target, Trophy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserStats } from '@/lib/database.types';
import { BcoinIcon } from '@/components/shared/bcoin-icon';

interface DashboardUsageCardGroupProps {
  stats: UserStats | null;
  totalChallenges: number;
}
export function DashboardUsageCardGroup({ stats, totalChallenges }: DashboardUsageCardGroupProps) {
  const cards = [
    {
      title: 'চ্যালেঞ্জ সমাধান',
      icon: <CheckCircle className={'text-[#4B4F4F]'} size={18} />,
      value: stats?.solved_challenges ?? 0,
      change: `মোট ${totalChallenges}টি থেকে`,
    },
    {
      title: 'খরচযোগ্য বিটকয়েন',
      icon: <BcoinIcon />,
      value: stats?.spendable_points ?? 0,
      change: 'আপনার বর্তমান ব্যালেন্স',
    },
    {
      title: 'বর্তমান র‍্যাঙ্ক',
      icon: <Trophy className={'text-[#4B4F4F]'} size={18} />,
      value: stats?.rank ? `#${stats.rank}` : 'N/A',
      change: 'লিডারবোর্ডে আপনার অবস্থান',
    },
    {
      title: 'মোট অর্জিত পয়েন্ট',
      icon: <Target className={'text-[#4B4F4F]'} size={18} />,
      value: stats?.total_points ?? 0,
      change: 'আপনার সর্বমোট স্কোর',
    },
  ];

  return (
    <div className={'grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2'}>
      {cards.map((card) => (
        <Card key={card.title} className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
          <CardHeader className="p-0 space-y-0">
            <CardTitle className="flex justify-between items-center mb-6">
              <span className={'text-base leading-4'}>{card.title}</span> {card.icon}
            </CardTitle>
            <CardDescription className={'text-[32px] leading-[32px] text-primary'}>{card.value}</CardDescription>
          </CardHeader>
          <CardContent className={'p-0'}>
            <div className="text-sm leading-[14px] pt-2 text-secondary">{card.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
