'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { LoginGradient } from '@/components/gradients/login-gradient';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { updateUserPassword } from '@/app/reset-password/actions';

function ResetPasswordForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get('code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      setError('অবৈধ বা মেয়াদোত্তীর্ণ রিসেট লিঙ্ক।');
      return;
    }

    if (password.length < 6) {
      toast({ description: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ description: 'পাসওয়ার্ড দুটি মিলছে না।', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await updateUserPassword(code, password);
    setIsLoading(false);

    if (result.error) {
      setError(result.message);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="mx-auto mt-[112px] w-full max-w-md flex-col rounded-lg bg-background/80 backdrop-blur-[6px] login-card-border">
      <LoginCardGradient />
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-6 px-6 py-8 md:px-16">
        <Image src={'/logo.png'} alt={'ফ্রস্টফল লোগো'} width={80} height={80} className="rounded-full" />
        <div className="text-center text-[30px] font-medium leading-[36px] tracking-[-0.6px]">
          নতুন পাসওয়ার্ড সেট করুন
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        {isSuccess ? (
          <div className="text-center">
            <p className="text-green-400">আপনার পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।</p>
            <Button asChild className="mt-4">
              <Link href="/login">এখন লগইন করুন</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="leading-5 text-muted-foreground" htmlFor="password">
                নতুন পাসওয়ার্ড
              </Label>
              <Input
                className="rounded-xs border-border"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="leading-5 text-muted-foreground" htmlFor="confirmPassword">
                পাসওয়ার্ড নিশ্চিত করুন
              </Label>
              <Input
                className="rounded-xs border-border"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              পাসওয়ার্ড আপডেট করুন
            </Button>
          </>
        )}
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="p-4">
      <LoginGradient />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
