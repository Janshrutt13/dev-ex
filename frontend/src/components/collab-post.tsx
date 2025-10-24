"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CollabChat } from "@/components/collab-chat";
import { MessageCircle, Trash2, Users } from "lucide-react";
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

export function CollabPost({ project, onDelete, onUpdate }: { project: CollabProject; onDelete?: (id: string) => void; onUpdate?: () => void }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

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
          setIsJoined(localProject.collaborators.some(collab => collab._id === response.data._id));
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchUser();
  }, [localProject.collaborators]);

  const handleJoin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to join.");
        return router.push('/login');
      }
      
      const response = await axios.patch(
        `http://localhost:5000/api/collabs/${localProject._id}/join`,
        {}, // No body needed
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocalProject(response.data);
      setIsJoined(true);
      toast.success("Successfully joined the project!");
      if (onUpdate) onUpdate();
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
          <CardTitle>{localProject.title}</CardTitle>
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
                <AvatarImage src={localProject.author.profileImageUrl} />
                <AvatarFallback>{localProject.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            Posted by @{localProject.author.username}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{localProject.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
            {localProject.requiredSkills.map(skill => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
        </div>
        
        {/* --- Collaborators Display --- */}
        {localProject.collaborators.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center -space-x-2">
              {localProject.collaborators.slice(0, 3).map(user => (
                <Avatar key={user._id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {localProject.collaborators.length > 3 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium hover:bg-muted/80">
                      +{localProject.collaborators.length - 3}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">All Collaborators</h4>
                      {localProject.collaborators.map(user => (
                        <div key={user._id} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">@{user.username}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              {localProject.collaborators.length} {localProject.collaborators.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Button onClick={handleJoin} className="flex-1">Join Project</Button>
          {(isJoined || localProject.author._id === currentUser?._id) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Project Chat - {localProject.title}</DialogTitle>
                </DialogHeader>
                {currentUser && (
                  <CollabChat collabId={localProject._id} currentUser={currentUser} />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}