'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { checkFlag } from '@/app/challenges/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { Challenge } from '@/lib/database.types';
import Link from 'next/link';

interface ChallengeSubmissionFormProps {
  challenge: Challenge;
  isSolved: boolean;
}

export function ChallengeSubmissionForm({ challenge, isSolved: initialIsSolved }: ChallengeSubmissionFormProps) {
  const { toast } = useToast();
  const [submittedFlag, setSubmittedFlag] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSolved, setIsSolved] = useState(initialIsSolved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedFlag) {
      toast({
        variant: 'destructive',
        description: 'অনুগ্রহ করে একটি ফ্ল্যাগ লিখুন।',
      });
      return;
    }
    setIsChecking(true);
    const result = await checkFlag(challenge.id, submittedFlag);
    setIsChecking(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    } else if (result.success) {
      toast({
        description: result.message,
      });
      setIsSolved(true);
    } else {
      toast({
        variant: 'destructive',
        description: result.message,
      });
    }
  };

  if (isSolved) {
    return (
      <div className="text-center p-4 bg-green-900/20 border border-green-500 rounded-lg">
        <p className="font-bold text-green-400">আপনি সফলভাবে এই চ্যালেঞ্জটি সমাধান করেছেন!</p>
        <Button asChild variant="link">
          <Link href="/challenges">অন্যান্য চ্যালেঞ্জ দেখুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <p className="font-semibold">ফ্ল্যাগ ফরম্যাট:</p>
        <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
          ff{'{'}anything_here{'}'}
        </p>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="flag">আপনার ফ্ল্যাগ</Label>
        <Input
          id="flag"
          name="flag"
          value={submittedFlag}
          onChange={(e) => setSubmittedFlag(e.target.value)}
          placeholder="ff{...}"
          disabled={isChecking || isSolved}
        />
      </div>
      <div className="flex justify-between w-full">
        {challenge.url ? (
          <Button variant="outline" asChild>
            <Link href={challenge.url} target="_blank">
              রিসোর্স অ্যাক্সেস করুন
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            কোনো রিসোর্স নেই
          </Button>
        )}
        <Button type="submit" disabled={isChecking || isSolved}>
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isChecking ? 'চেক করা হচ্ছে...' : 'ফ্ল্যাগ জমা দিন'}
        </Button>
      </div>
    </form>
  );
}
