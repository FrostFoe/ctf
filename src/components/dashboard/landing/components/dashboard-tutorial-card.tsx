import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export function DashboardTutorialCard() {
  return (
    <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
      <CardHeader className="p-0 space-y-0">
        <CardTitle className="flex justify-between items-center text-xl mb-2 font-medium">টিউটোরিয়াল</CardTitle>
      </CardHeader>
      <CardContent className={'p-0 flex flex-col gap-6'}>
        <div className="text-base leading-6 text-secondary">
          এরোএডিট টুলস থেকে কীভাবে সর্বাধিক সুবিধা পাবেন এবং আপনার ভেতরের শিল্পীকে আবিষ্কার করবেন তা জানুন।
        </div>
        <div>
          <Button size={'sm'} variant={'outline'} className={'flex gap-2 text-sm rounded-sm border-border'}>
            টিউটোরিয়াল
            <ArrowUpRight size={16} className={'text-[#797C7C]'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
