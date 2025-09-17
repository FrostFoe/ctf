'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { login } from '@/app/login/actions';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    const data = await login({ email, password });
    setIsLoading(false);

    if (data?.error) {
      toast({ description: 'অবৈধ ইমেইল বা পাসওয়ার্ড', variant: 'destructive' });
    }
  }

  return (
    <form action={handleLogin} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/logo.png'} alt={'ফ্রস্টফল লোগো'} width={80} height={80} className="rounded-full" />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        আপনার অ্যাকাউন্টে লগ ইন করুন
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <div className="w-full text-right">
        <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
          পাসওয়ার্ড ভুলে গেছেন?
        </Link>
      </div>
      <Button type={'submit'} variant={'secondary'} className={'w-full'} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        লগ ইন
      </Button>
    </form>
  );
}
