import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function DashboardTutorialCard() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-2 font-medium">
          বৈশিষ্ট্যযুক্ত চ্যালেঞ্জ
        </CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-6'}>
        <div className="text-base leading-6 text-secondary">
          &apos;রিডল&apos; চ্যালেঞ্জটি গ্রহণ করে আপনার দক্ষতা পরীক্ষা করুন এবং আপনার বুদ্ধিমত্তার প্রমাণ দিন。
        </div>
        <div>
          <Button size={'sm'} asChild variant={'outline'} className={'flex gap-2 text-sm rounded-sm border-border'}>
            <Link href={'/challenges'}>
              এখনই শুরু করুন
              <ArrowRight size={16} className={'text-[#797C7C]'} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
