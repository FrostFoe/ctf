'use client';

import { Button } from '@/components/ui/button';
import { signInWithGithub } from '@/app/login/actions';
import Image from 'next/image';

interface Props {
  label: string;
}
export function GhLoginButton({ label }: Props) {
  return (
    <Button onClick={() => signInWithGithub()} variant={'secondary'} className={'w-full'}>
      <Image
        height="24"
        className={'mr-3'}
        width="24"
        src="https://cdn.simpleicons.org/github/878989"
        unoptimized={true}
        alt={'GitHub logo'}
      />
      {label}
    </Button>
  );
}
