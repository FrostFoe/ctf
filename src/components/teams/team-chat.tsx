'use client';

import { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import type { TeamChatMessage } from '@/lib/database.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { postTeamMessage } from '@/app/teams/actions';
import { Loader2, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface TeamChatProps {
  messages: TeamChatMessage[];
  teamId: string;
  currentUser: User;
}

export function TeamChat({ messages, teamId, currentUser }: TeamChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    const result = await postTeamMessage(teamId, newMessage);
    setNewMessage('');
    setIsSending(false);
    if(result.error) {
      // You might want to show a toast here
      console.error(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>দলের আলোচনা</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4" viewportRef={viewportRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  msg.user_id === currentUser.id ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
                )}
              >
                <div className="font-bold">{msg.profile.username || 'অজানা'}</div>
                {msg.message}
                <div className="text-xs self-end text-muted-foreground/80">
                  {new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
             {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-16">এখনো কোনো আলোচনা শুরু হয়নি।</div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="একটি বার্তা লিখুন..."
            className="flex-1"
            autoComplete="off"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">বার্তা পাঠান</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
