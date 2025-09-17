'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { updateUserProfile } from '@/app/profile/actions';
import { Loader2 } from 'lucide-react';
import type { Profile } from '@/lib/database.types';

interface ProfileFormProps {
  user: User;
  profile: Profile;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!username) {
      toast({
        variant: 'destructive',
        description: 'ব্যবহারকারীর নাম আবশ্যক।',
      });
      setIsLoading(false);
      return;
    }

    const result = await updateUserProfile({ fullName, username });

    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    } else {
      toast({
        description: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।',
      });
    }
  };

  return (
    <form onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle>প্রোফাইল</CardTitle>
          <CardDescription>এখানে আপনার প্রোফাইলের তথ্য আপডেট করুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">ব্যবহারকারীর নাম</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <p className="text-xs text-muted-foreground">এটি আপনার পাবলিক প্রোফাইলের URL হবে।</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">পুরো নাম</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            সংরক্ষণ করুন
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
