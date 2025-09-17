'use client';

import type { Team } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { joinTeam } from '@/app/teams/actions';
import { useToast } from '../ui/use-toast';
import { useState } from 'react';
import { Loader2, Lock, Unlock } from 'lucide-react';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeamsListProps {
  teams: Team[];
  currentPage: number;
  totalPages: number;
}

export function TeamsList({ teams, currentPage, totalPages }: TeamsListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});

  const handleJoinTeam = async (team: Team) => {
    setIsLoading(team.id);
    const token = team.is_private ? tokenInputs[team.id] || null : null;
     if (team.is_private && !token) {
      toast({ variant: 'destructive', description: 'প্রাইভেট দলে যোগদানের জন্য একটি টোকেন প্রয়োজন।' });
      setIsLoading(null);
      return;
    }

    const result = await joinTeam(team.id, token);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: 'সফলভাবে দলে যোগ দিয়েছেন!' });
    }
    setIsLoading(null);
  };
  
  const handleTokenInputChange = (teamId: string, value: string) => {
    setTokenInputs(prev => ({...prev, [teamId]: value}));
  }

  if (teams.length === 0 && currentPage === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">এখনও কোনো দল তৈরি হয়নি</h3>
          <p className="text-sm text-muted-foreground">আপনিই প্রথম দল তৈরি করতে পারেন!</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
               <CardTitle>{team.name}</CardTitle>
               {team.is_private ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription>{team.is_private ? "প্রাইভেট দল" : "পাবলিক দল"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             {team.is_private && (
                <Input 
                  placeholder="যোগদান টোকেন"
                  value={tokenInputs[team.id] || ''}
                  onChange={(e) => handleTokenInputChange(team.id, e.target.value)}
                />
              )}
            <Button className="w-full" onClick={() => handleJoinTeam(team)} disabled={!!isLoading}>
              {isLoading === team.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              যোগ দিন
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
     <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          disabled={currentPage === 0}
          asChild
        >
          <Link href={`/teams?page=${currentPage - 1}`}>পূর্ববর্তী</Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          পৃষ্ঠা {currentPage + 1} এর {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage >= totalPages - 1}
          asChild
        >
          <Link href={`/teams?page=${currentPage + 1}`}>পরবর্তী</Link>
        </Button>
      </div>
      </>
  );
}
