import { Target, Star, Trophy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const cards = [
  {
    title: 'চ্যালেঞ্জ সমাধান',
    icon: <CheckCircle className={'text-[#4B4F4F]'} size={18} />,
    value: '12',
    change: 'মোট ৩০টি থেকে',
  },
  {
    title: 'মোট পয়েন্ট',
    icon: <Star className={'text-[#4B4F4F]'} size={18} />,
    value: '1250',
    change: 'গত মাস থেকে +১৫০',
  },
  {
    title: 'বর্তমান র‍্যাঙ্ক',
    icon: <Trophy className={'text-[#4B4F4F]'} size={18} />,
    value: '#8',
    change: 'শীর্ষ ১০% এর মধ্যে',
  },
  {
    title: 'সঠিকতা',
    icon: <Target className={'text-[#4B4F4F]'} size={18} />,
    value: '85%',
    change: 'গত মাস থেকে +৫%',
  },
];
export function DashboardUsageCardGroup() {
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
