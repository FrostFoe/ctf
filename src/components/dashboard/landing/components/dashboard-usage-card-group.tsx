import { Bolt, Image, Shapes, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const cards = [
  {
    title: 'ব্যবহৃত স্টোরেজ',
    icon: <Bolt className={'text-[#4B4F4F]'} size={18} />,
    value: '1.2 GB',
    change: '১০ জিবি অবশিষ্ট',
  },
  {
    title: 'সক্রিয় ওয়ার্কস্পেস',
    icon: <Shapes className={'text-[#4B4F4F]'} size={18} />,
    value: '4',
    change: '৬টি ওয়ার্কস্পেস উপলব্ধ',
  },
  {
    title: 'এক্সপোর্ট করা সম্পদ',
    // eslint-disable-next-line jsx-a11y/alt-text
    icon: <Image className={'text-[#4B4F4F]'} size={18} />,
    value: '286',
    change: 'গত মাস থেকে +১৬%',
  },
  {
    title: 'সহযোগী',
    icon: <Timer className={'text-[#4B4F4F]'} size={18} />,
    value: '10',
    change: 'গত মাস থেকে +২৭%',
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
