'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createTeam } from '@/app/teams/actions';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export function CreateTeamCard() {
  const [teamName, setTeamName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({ variant: 'destructive', description: 'দলের নাম দিন।' });
      return;
    }
    setIsLoading(true);
    const result = await createTeam(teamName, isPrivate);
    setIsLoading(false);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: `"${teamName}" দলটি সফলভাবে তৈরি হয়েছে।` });
      setTeamName('');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>একটি নতুন দল তৈরি করুন</CardTitle>
        <CardDescription>একটি নতুন দল তৈরি করে অন্যদের সাথে প্রতিযোগিতা করুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="দলের নাম"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleCreateTeam} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            তৈরি করুন
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="is-private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          <Label htmlFor="is-private">প্রাইভেট দল (যোগদানের জন্য টোকেন প্রয়োজন হবে)</Label>
        </div>
      </CardContent>
    </Card>
  );
}
