import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function FooterLinks() {
  return (
    <>
      <Separator className={'footer-border'} />
      <div
        className={
          'flex flex-col justify-center items-center gap-2 text-muted-foreground text-sm leading-[14px] py-[24px]'
        }
      >
        <div className={'flex justify-center items-center gap-2'}>
          <span className={'text-sm leading-[14px]'}>© {new Date().getFullYear()} ফ্রস্টফল</span>
        </div>
        <div className={'flex justify-center items-center gap-4 flex-wrap md:flex-nowrap'}>
          <Link className={'text-sm leading-[14px]'} href={'#'} target={'_blank'}>
            <span className={'flex items-center gap-1'}>ব্যবহারের শর্তাবলী</span>
          </Link>
          <Link className={'text-sm leading-[14px]'} href={'#'} target={'_blank'}>
            <span className={'flex items-center gap-1'}>গোপনীয়তা নীতি</span>
          </Link>
        </div>
      </div>
    </>
  );
}
