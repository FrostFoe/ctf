import { LoginGradient } from '@/components/gradients/login-gradient';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { GhLoginButton } from '@/components/authentication/gh-login-button';
import { SignupForm } from '@/components/authentication/sign-up-form';
import { Separator } from '@/components/ui/separator';

export default function SignupPage() {
  return (
    <div>
      <LoginGradient />
      <div className={'flex flex-col'}>
        <div
          className={
            'mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg rounded-b-none login-card-border backdrop-blur-[6px]'
          }
        >
          <LoginCardGradient />
          <SignupForm />
        </div>
        <div
          className={
            'mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 pt-0 pb-8 gap-6 flex flex-col items-center justify-center'
          }
        >
          <div className={'flex w-full items-center justify-center'}>
            <Separator className={'w-5/12 bg-border'} />
            <div className={'text-border text-xs font-medium px-4'}>or</div>
            <Separator className={'w-5/12 bg-border'} />
          </div>
          <GhLoginButton label={'গিটহাব দিয়ে সাইন আপ করুন'} />
        </div>
        <div
          className={
            'mx-auto w-[343px] md:w-[488px] bg-background/80 backdrop-blur-[6px] px-6 md:px-16 pt-0 py-8 gap-6 flex flex-col items-center justify-center rounded-b-lg'
          }
        >
          <div className={'text-center text-muted-foreground text-sm mt-4 font-medium'}>
            ইতিমধ্যে একটি একাউন্ট আছে?{' '}
            <a href={'/login'} className={'text-white'}>
              লগ ইন
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
