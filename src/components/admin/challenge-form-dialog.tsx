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
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '../ui/use-toast';
import { addChallenge, updateChallenge } from '@/app/admin/actions';
import type { Challenge } from '@/constants/ctf-tiers';
import { Switch } from '../ui/switch';
import { Select } from '../shared/select/select';

interface Props {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: Challenge) => void;
}

const INITIAL_STATE: Omit<Challenge, 'id'> = {
  name: '',
  description: '',
  icon: '/assets/icons/ctf-tiers/default-icon.svg',
  features: [],
  featured: false,
  difficulty: 'easy',
  category: 'beginner',
  flag: '',
  url: '',
};

export function ChallengeFormDialog({ challenge, isOpen, onClose, onSave }: Props) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Challenge, 'id'> | Challenge>(challenge || INITIAL_STATE);
  const isEditing = !!challenge;

  useEffect(() => {
    setFormData(challenge || INITIAL_STATE);
  }, [challenge, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'difficulty' | 'category') => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: 'featured') => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    const features = value.split('\n').filter((f) => f.trim() !== '');
    setFormData((prev) => ({ ...prev, features }));
  };

  const handleSave = async () => {
    let result;
    let savedData: Challenge;

    if (isEditing) {
      result = await updateChallenge(formData as Challenge);
      savedData = formData as Challenge;
    } else {
      const id = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      savedData = { ...(formData as Omit<Challenge, 'id'>), id };
      result = await addChallenge(formData as Omit<Challenge, 'id'>);
    }

    if (result.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    } else {
      toast({
        description: `চ্যালেঞ্জ সফলভাবে ${isEditing ? 'আপডেট' : 'যোগ'} করা হয়েছে।`,
      });
      onSave(savedData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'চ্যালেঞ্জ সম্পাদনা করুন' : 'নতুন চ্যালেঞ্জ যোগ করুন'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'এখানে চ্যালেঞ্জের বিবরণ আপডেট করুন।' : 'একটি নতুন চ্যালেঞ্জের বিবরণ পূরণ করুন।'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              নাম
            </Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              বিবরণ
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="features" className="text-right">
              বৈশিষ্ট্য
            </Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features.join('\n')}
              onChange={handleFeaturesChange}
              className="col-span-3"
              placeholder="প্রতি লাইনে একটি বৈশিষ্ট্য লিখুন"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              আইকন পাথ
            </Label>
            <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty" className="text-right">
              কঠিনতা
            </Label>
            <Select
              value={formData.difficulty}
              onChange={handleSelectChange('difficulty')}
              options={['easy', 'medium', 'hard']}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              বিভাগ
            </Label>
            <Select
              value={formData.category}
              onChange={handleSelectChange('category')}
              options={['beginner', 'hacker']}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="flag" className="text-right">
              ফ্ল্যাগ
            </Label>
            <Input id="flag" name="flag" value={formData.flag || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input id="url" name="url" value={formData.url || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">
              জনপ্রিয়
            </Label>
            <Switch
              id="featured"
              name="featured"
              checked={formData.featured}
              onCheckedChange={handleSwitchChange('featured')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            বাতিল
          </Button>
          <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
