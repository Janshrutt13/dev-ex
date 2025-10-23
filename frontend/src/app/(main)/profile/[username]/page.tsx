"use client";

import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription } from "@/components/ui/card";
import { Loader2, Link as LinkIcon, Users } from "lucide-react";
import { set } from "react-hook-form";

interface UserProfile{
    _id : string,
    username : string,
    profileImageUrl? : string,
    githubUsername? : string,
    streak : Date[];
}

interface Log{
    _id : string,
    content : string,
    hastags : string[],
    author : string,
    createdAt : Date,
    updatedAt : Date,
}

interface Collab{
   _id : string,
   title : string,
   description : string,
   author : string,
   createdAt : Date,
   updatedAt : Date,
   collaborators : string[],
}

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;

    const[user,setUser] = useState<UserProfile | null>(null);
    const[logs,setLogs] = useState<Log[]>([]);
    const[createdCollabs,setCreatedCollabs] = useState<Collab[]>([]);
    const[joinedCollabs,setJoinedCollabs] = useState<Collab[]>([]);
    const[isLoading,setIsLoading] = useState(true);
    const[error,setError] = useState<string | null>(null);

    useEffect(() => {
        if(!username) return;
        
        const fetchData = async() => {
            setIsLoading(true);
            setError(null);
            try{

               //Fetch all data in parallel
               const[userRes, logRes , collabsRes] = await Promise.all([
                 axios.get(`http://localhost:5000/api/users/${username}`),
                 axios.get(`http://localhost:5000/api/users/${username}/logs`),
                 axios.get(`http://localhost:5000/api/users/${username}/collabs`)
               ]);

               setUser(userRes.data);
               setLogs(logRes.data);
               setCreatedCollabs(collabsRes.data.created);
               setJoinedCollabs(collabsRes.data.joined);

            }catch(err){
                setError("User not found or an error occured");
               console.error(err);
            }finally{
               setIsLoading(false);
            }
        };
        fetchData();
    } , [username]);


    if(isLoading){
        return (
            <div className="flex h-full items-center justfiy-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    if(error || !user){
        return(
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>{error || "User not found"}</p>
            </div>
        );
    }

    return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* --- Profile Header --- */}
      <div className="flex flex-col items-center sm:flex-row gap-6 mb-8">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
          <AvatarImage src={user.profileImageUrl} alt={user.username} />
          <AvatarFallback className="text-4xl">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          {user.githubUsername && (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 justify-center sm:justify-start mt-1"
            >
              <LinkIcon className="h-4 w-4" />
              {user.githubUsername}
            </a>
          )}
          {/* You could add stats like streak, total logs, etc. here */}
        </div>
      </div>

      {/* --- Content Tabs --- */}
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="created">My Collabs</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-6 space-y-4">
          {logs.length > 0 ? (
            logs.map(log => (
                <Card key={log._id} className="p-4">
                    <p className="text-sm text-muted-foreground">{log.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(log.createdAt).toLocaleDateString()}</p>
                </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">No logs posted yet.</p>
          )}
        </TabsContent>

        <TabsContent value="created" className="mt-6 space-y-4">
           {createdCollabs.length > 0 ? (
            createdCollabs.map(collab => (
                <Card key={collab._id} className="p-4">
                    <h3 className="font-semibold">{collab.title}</h3>
                    <CardDescription>{collab.description.substring(0, 100)}...</CardDescription>
                </Card>
            ))
           ) : (
            <p className="text-center text-muted-foreground py-10">No collaboration projects created yet.</p>
           )}
        </TabsContent>

        <TabsContent value="joined" className="mt-6 space-y-4">
          {joinedCollabs.length > 0 ? (
            joinedCollabs.map(collab => (
                <Card key={collab._id} className="p-4">
                    <h3 className="font-semibold">{collab.title}</h3>
                    <CardDescription>{collab.description.substring(0, 100)}...</CardDescription>
                </Card>
            ))
           ) : (
            <p className="text-center text-muted-foreground py-10">Not a member of any collaborations yet.</p>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}