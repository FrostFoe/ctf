'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { purchaseHintAction } from '@/app/challenges/actions';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lightbulb, Bitcoin } from 'lucide-react';

interface Hint {
  id: number;
  challenge_id: string;
  hint_text: string;
  cost: number;
}

interface HintDisplayProps {
  challengeId: string;
  userId: string;
}

export function HintDisplay({ challengeId, userId }: HintDisplayProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [hint, setHint] = useState<Hint | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    async function fetchHintData() {
      setIsLoading(true);

      // Fetch the hint details (cost, etc.)
      const { data: hintData, error: hintError } = await supabase
        .from('hints')
        .select('*')
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (hintError) {
        console.error('Error fetching hint:', hintError);
        setHint(null);
      } else {
        setHint(hintData);
      }

      if (hintData) {
        // Check if the user has already purchased this hint
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('user_hints')
          .select('*')
          .match({ user_id: userId, hint_id: hintData.id })
          .maybeSingle();

        if (purchaseError) {
          console.error('Error checking hint purchase:', purchaseError);
        }
        setHasPurchased(!!purchaseData);
      }

      setIsLoading(false);
    }

    fetchHintData();
  }, [challengeId, userId, supabase]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    const result = await purchaseHintAction(challengeId);
    setIsPurchasing(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        description: result.error,
      });
    } else {
      toast({
        description: result.message,
      });
      setHasPurchased(true);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb /> ইঙ্গিত
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hint) {
    // No hint available for this challenge
    return null;
  }

  return (
    <Card className="bg-background/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb /> ইঙ্গিত
        </CardTitle>
        <CardDescription>
          {hasPurchased ? 'আপনি এই ইঙ্গিতটি কিনেছেন।' : 'সাহায্য প্রয়োজন? একটি ইঙ্গিত কিনুন।'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPurchased ? (
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-foreground">{hint.hint_text}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-bold text-lg">
              মূল্য: <Bitcoin className="h-5 w-5" /> {hint.cost}
            </div>
            <Button onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  কেনা হচ্ছে...
                </>
              ) : (
                'ইঙ্গিত কিনুন'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
