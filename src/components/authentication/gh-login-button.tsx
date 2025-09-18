'use client';

import { Button } from '@/components/ui/button';
import { signInWithGithub } from '@/app/login/actions';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Props {
  label: string;
}
export function GhLoginButton({ label }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGithub();
      if (result?.error) {
        toast({
          description: 'GitHub লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      toast({
        description: 'GitHub লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSignIn} 
      variant={'secondary'} 
      className={'w-full'} 
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
      ) : (
        <Image height="24" className={'mr-3'} width="24" src="/assets/icons/github-logo.svg" alt={'GitHub লোগো'} />
      )}
      {label}
    </Button>
  );
}
