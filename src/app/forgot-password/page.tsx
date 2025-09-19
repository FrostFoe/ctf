'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { LoginGradient } from '@/components/gradients/login-gradient';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { requestPasswordReset } from '@/app/forgot-password/actions';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ description: 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন।', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.error) {
      toast({ description: result.message, variant: 'destructive' });
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="p-4">
      <LoginGradient />
      <div className="flex flex-col">
        <div className="mx-auto mt-[112px] w-full max-w-md flex-col rounded-lg bg-background/80 backdrop-blur-[6px] login-card-border">
          <LoginCardGradient />
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6 px-6 py-8 md:px-16">
            <Image src={'/logo.png'} alt={'ফ্রস্টফল লোগো'} width={80} height={80} className="rounded-full" />
            <div className="text-center text-[30px] font-medium leading-[36px] tracking-[-0.6px]">পাসওয়ার্ড রিসেট</div>

            {isSubmitted ? (
              <div className="text-center text-muted-foreground">
                <p>পাসওয়ার্ড রিসেট করার লিঙ্ক আপনার ইমেইলে ({email}) পাঠানো হয়েছে।</p>
                <p className="mt-2">অনুগ্রহ করে আপনার ইনবক্স চেক করুন।</p>
              </div>
            ) : (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল ঠিকানা লিখুন। আমরা আপনাকে একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব।
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label className="leading-5 text-muted-foreground" htmlFor="email">
                    ইমেইল ঠিকানা
                  </Label>
                  <Input
                    className="rounded-xs border-border"
                    type="email"
                    id="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  রিসেট লিঙ্ক পাঠান
                </Button>
              </>
            )}

            <div className="mt-4 text-center text-sm font-medium text-muted-foreground">
              <Link href="/login" className="text-white">
                লগইন পৃষ্ঠায় ফিরে যান
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
