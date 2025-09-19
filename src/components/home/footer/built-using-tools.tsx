import Image from 'next/image';

export function BuiltUsingTools() {
  return (
    <div className={'mx-auto max-w-7xl text-center px-8 mt-24 mb-12 md:mb-24'}>
      <span className={'text-base'}>দিয়ে নির্মিত</span>
      <div
        className={
          'flex flex-col sm:flex-row flex-wrap gap-10 sm:gap-6 justify-center md:justify-between items-center mt-8 md:gap-1'
        }
      >
        <Image src={'/assets/icons/logo/supabase-logo.svg'} alt={'সুপাবেস লোগো'} width={150} height={32} />
        <Image src={'/assets/icons/logo/nextjs-logo.svg'} alt={'নেক্সট.জেএস লোগো'} width={120} height={24} />
        <Image src={'/assets/icons/logo/tailwind-logo.svg'} alt={'টেলউইন্ডসিএসএস লোগো'} width={194} height={24} />
        <Image src={'/assets/icons/logo/shadcn-logo.svg'} alt={'শাডসিএন লোগো'} width={137} height={32} />
      </div>
    </div>
  );
}
