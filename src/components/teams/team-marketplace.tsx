'use client';

import { useState } from 'react';
import type { TeamDetails, TeamMarketplaceItem } from '@/lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BcoinIcon } from '@/components/shared/bcoin-icon';
import { Button } from '@/components/ui/button';
import { purchaseTeamItem } from '@/app/teams/actions';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface TeamMarketplaceProps {
  team: TeamDetails;
  items: TeamMarketplaceItem[];
}

export function TeamMarketplace({ team, items }: TeamMarketplaceProps) {
  const { toast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);

  const handlePurchase = async (itemId: number) => {
    setIsPurchasing(itemId);
    const result = await purchaseTeamItem(team.id, itemId);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
    } else {
      toast({ description: result.message });
    }
    setIsPurchasing(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>টিম মার্কেটপ্লেস</CardTitle>
        <CardDescription>আপনার দলের সম্মিলিত পয়েন্ট ব্যবহার করে আইটেম কিনুন।</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg flex items-center gap-1 justify-end">
                <BcoinIcon /> {item.cost}
              </div>
              <Button size="sm" onClick={() => handlePurchase(item.id)} disabled={isPurchasing !== null}>
                {isPurchasing === item.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                কিনুন
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-16">মার্কেটপ্লেসে কোনো আইটেম নেই।</div>
        )}
      </CardContent>
    </Card>
  );
}
