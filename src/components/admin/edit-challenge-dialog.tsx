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
import { useState, useEffect } from 'react';
import { useToast } from '../ui/use-toast';
import { updateChallenge } from '@/app/admin/actions';
import type { Challenge } from '@/constants/ctf-tiers';

interface Props {
  challenge: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onChallengeUpdate: (challenge: Challenge) => void;
}

export function EditChallengeDialog({ challenge, isOpen, onClose, onChallengeUpdate }: Props) {
  const { toast } = useToast();
  const [editedChallenge, setEditedChallenge] = useState<Challenge>(challenge);

  useEffect(() => {
    setEditedChallenge(challenge);
  }, [challenge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedChallenge((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const result = await updateChallenge(editedChallenge);
    if (result.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    } else {
      toast({
        description: 'চ্যালেঞ্জ সফলভাবে আপডেট করা হয়েছে।',
      });
      onChallengeUpdate(editedChallenge);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>চ্যালেঞ্জ সম্পাদনা করুন: {challenge.name}</DialogTitle>
          <DialogDescription>এখানে চ্যালেঞ্জের ফ্ল্যাগ এবং URL আপডেট করুন।</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="flag" className="text-right">
              ফ্ল্যাগ
            </Label>
            <Input
              id="flag"
              name="flag"
              value={editedChallenge.flag || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              name="url"
              value={editedChallenge.url || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={handleSave}>সংরক্ষণ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
