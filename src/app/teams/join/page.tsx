'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { joinTeamByToken } from '@/app/teams/actions';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

function JoinTeamContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [teamName, setTeamName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    async function fetchTeamInfo() {
      if (!token) {
        setError('কোনো ইনভাইট টোকেন পাওয়া যায়নি।');
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase.from('teams').select('name').eq('join_token', token).single();

      if (fetchError || !data) {
        setError('এই ইনভাইট লিঙ্কটি অবৈধ বা মেয়াদোত্তীর্ণ।');
      } else {
        setTeamName(data.name);
      }
      setIsLoading(false);
    }

    fetchTeamInfo();
  }, [token, supabase]);

  const handleJoin = async () => {
    if (!token) return;
    setIsJoining(true);
    const result = await joinTeamByToken(token);
    setIsJoining(false);
    if (result?.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="link" asChild>
          <Link href="/teams">দলসমূহ দেখুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>দলে যোগদান করুন</CardTitle>
        <CardDescription>আপনি "{teamName}" দলে যোগদানের জন্য আমন্ত্রিত।</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleJoin} disabled={isJoining}>
          {isJoining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          দলে যোগ দিন
        </Button>
      </CardContent>
    </>
  );
}

export default function JoinTeamPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <JoinTeamContent />
        </Suspense>
      </Card>
    </div>
  );
}
