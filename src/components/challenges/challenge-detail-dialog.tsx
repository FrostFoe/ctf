'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { checkFlag } from '@/app/challenges/actions';
import type { Challenge } from '@/constants/ctf-tiers';
import Link from 'next/link';

interface Props {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onChallengeSolved: (challengeId: string) => void;
}

export function ChallengeDetailDialog({ challenge, isOpen, onClose, onChallengeSolved }: Props) {
  const { toast } = useToast();
  const [submittedFlag, setSubmittedFlag] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async () => {
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
      onChallengeSolved(challenge.id);
      onClose();
    } else {
      toast({
        variant: 'destructive',
        description: result.message,
      });
    }
  };

  const handleClose = () => {
    setSubmittedFlag('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{challenge.name}</DialogTitle>
          <DialogDescription>{challenge.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between w-full">
          {challenge.url ? (
            <Button variant="outline" asChild>
              <Link href={challenge.url} target="_blank">
                রিসোর্স অ্যাক্সেস করুন
              </Link>
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleSubmit} disabled={isChecking}>
            {isChecking ? 'চেক করা হচ্ছে...' : 'ফ্ল্যাগ জমা দিন'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
