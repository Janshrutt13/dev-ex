"use client";

import { useState, useEffect, FormEvent } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { set } from "react-hook-form";
import { useRef } from "react";

interface Message {
    username : string,
    message : string
}

interface User {
    username : string,
    profileImageUrl? : string
}

interface CollabChatProps {
    collabId : string,
    currentUser : User
}

// Store messages per collab room
const chatStorage: { [key: string]: Message[] } = {};
let socket : Socket | null = null;

export function CollabChat({collabId, currentUser}: CollabChatProps) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/collabs/${collabId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChat(res.data || []);
      } catch {
        setChat([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    if (!socket) {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    }
    socket.emit('join_collab_room', collabId);
    const handleMessage = (data: Message) => {
      setChat((prevChat) => [...prevChat, data]);
    };
    socket.on('recieve_message', handleMessage);
    return () => {
      socket?.off('recieve_message', handleMessage);
    };
  }, [collabId]);

  // Auto-scroll to bottom on chat update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const messageData = {
        collabId,
        username: currentUser.username,
        authorId: (currentUser as any)._id, // fix: send required authorId to backend
        message
      };
      socket.emit('send_message', messageData);
      setChat((prevChat) => [...prevChat, messageData]); // Optimistic update
      setMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <h3 className="font-semibold">Project Discussion</h3>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div ref={scrollRef} style={{height:'100%', overflowY:'auto'}}>
          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading chat…</div>
          ) : chat.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No messages yet.</div>
          ) : (
            chat.map((msg, index) => (
              <div key={index} className="flex items-start gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{msg.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{msg.username}</span>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
