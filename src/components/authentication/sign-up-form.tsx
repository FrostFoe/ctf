'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { signup } from '@/app/signup/actions';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function SignupForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password) {
      toast({ description: 'ইমেইল এবং পাসওয়ার্ড উভয়ই প্রয়োজন', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ description: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const result = await signup({ email, password });
    setIsLoading(false);

    if (result?.error) {
      toast({ 
        description: result.message || 'কিছু একটা ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন', 
        variant: 'destructive' 
      });
    } else if (result?.success) {
      toast({ 
        description: result.message || 'সফলভাবে সাইন আপ হয়েছে!', 
        variant: 'default' 
      });
    }
  }

  return (
    <form action={handleSignup} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/logo.png'} alt={'ফ্রস্টফল লogo'} width={80} height={80} className="rounded-full" />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>
        একটি অ্যাকাউন্ট তৈরি করুন
      </div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
      />
      <Button type={'submit'} variant={'secondary'} className={'w-full'} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        সাইন আপ করুন
      </Button>
    </form>
  );
}
