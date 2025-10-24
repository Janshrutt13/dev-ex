"use client";

import { useState, useEffect, FormEvent } from "react";
import io, { Socket } from "socket.io-client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { set } from "react-hook-form";

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

export function CollabChat({collabId , currentUser} : CollabChatProps){
    const[message , setMessage] = useState('');
    const[chat, setChat] = useState<Message[]>(() => chatStorage[collabId] || []); 

    useEffect( () => {
        //Connect to io-server if not already connected
        if (!socket) {
            socket = io('http://localhost:5000');
        }

        //Join the specific room for this collab project
        socket.emit('join_collab_room' , collabId);

        //Listen for incoming messages
        const handleMessage = (data : Message) => {
            setChat((prevChat) => {
                const newChat = [...prevChat, data];
                chatStorage[collabId] = newChat;
                return newChat;
            });
        };
        
        socket.on('recieve_message' , handleMessage);

        //Cleanup
        return() => {
            socket?.off('recieve_message', handleMessage);
        }
    } , [collabId]);

    const sendMessage = (e : FormEvent) => {
        e.preventDefault();

        if(message.trim() && socket){
            const messageData = {
               collabId,
               username : currentUser.username,
               message
            };
            socket.emit('send_message', messageData);
            setChat((prevChat) => {
                const newChat = [...prevChat, messageData];
                chatStorage[collabId] = newChat;
                return newChat;
            });
            setMessage("");
        }
    }
    return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <h3 className="font-semibold">Project Discussion</h3>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {chat.map((msg, index) => (
            <div key={index} className="flex items-start gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{msg.username}</span>
                <p className="text-sm text-muted-foreground">{msg.message}</p>
              </div>
            </div>
          ))}
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
