"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CollabChat } from "@/components/collab-chat";
import { MessageCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  status: 'open' | 'closed' | 'in progress';
}

export function CollabPost({ project, onDelete }: { project: CollabProject; onDelete?: (id: string) => void }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);
          // Check if current user is already a collaborator
          setIsJoined(project.collaborators.some(collab => collab._id === response.data._id));
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchUser();
  }, [project.collaborators]);

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collaboration?')) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/collabs/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Collaboration deleted successfully!');
      if (onDelete) onDelete(project._id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete collaboration');
      setIsDeleting(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{project.title}</CardTitle>
          {currentUser?._id === project.author._id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
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
        <div className="flex gap-2 w-full">
          <Button onClick={handleJoin} className="flex-1">Join Project</Button>
          {(isJoined || project.author._id === currentUser?._id) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Project Chat - {project.title}</DialogTitle>
                </DialogHeader>
                {currentUser && (
                  <CollabChat collabId={project._id} currentUser={currentUser} />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}