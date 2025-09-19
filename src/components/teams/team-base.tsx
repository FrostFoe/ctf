'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import type { TeamDetails, TeamChatMessage, TeamMarketplaceItem } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamChat } from './team-chat';
import { TeamMarketplace } from './team-marketplace';
import { createClient } from '@/utils/supabase/client';
import { BcoinIcon } from '@/components/shared/bcoin-icon';

interface TeamBaseProps {
  initialTeam: TeamDetails;
  currentUser: User;
}

export function TeamBase({ initialTeam, currentUser }: TeamBaseProps) {
  const supabase = createClient();
  const [team, setTeam] = useState<TeamDetails>(initialTeam);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<TeamMarketplaceItem[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch initial chat messages
      const { data: chatData, error: chatError } = await supabase
        .from('team_chat_messages')
        .select('*, profile:profiles(username)')
        .eq('team_id', team.id)
        .order('created_at', { ascending: true });
      if (chatError) console.error('Error fetching chat messages:', chatError);
      else setMessages(chatData as TeamChatMessage[]);

      // Fetch marketplace items
      const { data: marketData, error: marketError } = await supabase.from('team_marketplace_items').select('*');

      if (marketError) console.error('Error fetching marketplace items:', marketError);
      else setMarketplaceItems(marketData as TeamMarketplaceItem[]);
    };

    fetchInitialData();
  }, [team.id, supabase]);

  useEffect(() => {
    const chatChannel = supabase
      .channel(`team-chat-${team.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_chat_messages', filter: `team_id=eq.${team.id}` },
        async (payload) => {
          // Fetch the new message with the profile data
          const { data: newMessage, error } = await supabase
            .from('team_chat_messages')
            .select('*, profile:profiles(username)')
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message:', error);
          } else {
            setMessages((prev) => [...prev, newMessage as TeamChatMessage]);
          }
        },
      )
      .subscribe();

    const teamUpdateChannel = supabase
      .channel(`team-updates-${team.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${team.id}` },
        (payload) => {
          setTeam((prev) => ({ ...prev, ...(payload.new as Partial<TeamDetails>) }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(teamUpdateChannel);
    };
  }, [team.id, supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">আলোচনা</TabsTrigger>
            <TabsTrigger value="marketplace">মার্কেটপ্লেস</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <TeamChat messages={messages} teamId={team.id} currentUser={currentUser} />
          </TabsContent>
          <TabsContent value="marketplace">
            <TeamMarketplace team={team} items={marketplaceItems} />
          </TabsContent>
        </Tabs>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>দলের তথ্য</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">দলের পয়েন্ট</span>
              <span className="font-bold text-primary flex items-center gap-1 text-lg">
                <BcoinIcon /> {team.points}
              </span>
            </div>
            <div className="space-y-2">
              <h4 className="text-muted-foreground">সদস্যরা</h4>
              <ul className="space-y-1">
                {team.members.map((member) => (
                  <li key={member.user_id} className="text-sm">
                    {member.username} {member.role === 'admin' && '(অ্যাডমিন)'}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
