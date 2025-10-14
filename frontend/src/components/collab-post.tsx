"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// --- TypeScript Interface for our Collab Project data ---
interface User {
  _id: string;
  username: string;
  profileImageUrl?: string;
}

interface CollabProject {
  _id: string;
  author: User;
  title: string;
  description: string;
  requiredSkills: string[];
  collaborators: User[];
  status: 'OPEN' | 'CLOSED';
}

export function CollabPost({ project }: { project: CollabProject }) {
  const router = useRouter();

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to join.");
        return router.push('/login');
      }
      
      await axios.patch(
        `http://localhost:5000/api/collabs/${project._id}/join`,
        {}, // No body needed
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Successfully joined the project!");
      router.refresh(); // Refresh the page to show the new collaborator
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join project.");
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription className="flex items-center pt-2">
            <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={project.author.profileImageUrl} />
                <AvatarFallback>{project.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            Posted by @{project.author.username}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{project.description}</p>
        
        {/* --- Collaborators Section --- */}
        <div className="mt-6">
            <h4 className="font-semibold text-sm mb-2">Team</h4>
            <div className="flex items-center space-x-2">
                {project.collaborators.length > 0 ? (
                    project.collaborators.map(user => (
                        <Avatar key={user._id} className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground">Be the first to join!</p>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map(skill => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
        </div>
        <Button onClick={handleJoin} className="w-full">Join Project</Button>
      </CardFooter>
    </Card>
  );
}