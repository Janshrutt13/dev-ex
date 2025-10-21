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

let socket : Socket;

export function CollabChat({collabId , currentUser} : CollabChatProps){
    const[message , setMessage] = useState('');
    const[chat, setChat] = useState<Message[]>([]); 

    useEffect( () => {
        //Connect to io-server
        socket = io('http://localhost:5000');

        //Join the specific room for this collab project
        socket.emit('join_collab_room' , collabId);

        //Listen for incoming messages
        socket.on('recieve_message' , (data : Message) => {
            setChat((prevChat) => [...prevChat, data]);
        });

        //Cleanup
        return() => {
            socket.disconnect();
        }
    } , [collabId]);

    const sendMessage = (e : FormEvent) => {
        e.preventDefault();

        if(message.trim()){
            const messageData = {
               collabId,
               username : currentUser.username,
               message
            };
            socket.emit('send_message', messageData);
            setChat((prevChat) => [...prevChat, messageData]); //Add own Message to chat
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
