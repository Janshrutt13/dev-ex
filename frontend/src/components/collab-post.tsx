"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MoreHorizontal, Trash2, Check, X, UserX, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Import all alert dialog parts
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // <-- IMPORT TABS
import Link from "next/link";
import { CollabChat } from "@/components/collab-chat";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

// --- TypeScript Interfaces ---
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
  pendingRequests: User[]; 
  status: 'open' | 'closed' | 'in progress';
}

// --- Component Props ---
interface CollabPostProps {
  project: CollabProject;
  currentUser: User | null;
  onDelete: (projectId: string) => void;
  onProjectUpdate: (updatedProject: CollabProject) => void; 
}

export function CollabPost({ project, currentUser, onDelete, onProjectUpdate }: CollabPostProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  console.log("Current User:", currentUser);
  console.log("Project Author:", project.author);

  const isAuthor = currentUser?._id === project.author._id;
  const isMember = project.collaborators.some(c => c._id === currentUser?._id);
  const isPending = project.pendingRequests.some(p => p._id === currentUser?._id);

  const token = localStorage.getItem("token");

  // --- MODIFIED: "Join" button now sends a "request" ---
  const handleJoin = async () => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/collabs/${project._id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onProjectUpdate(res.data); // Update the card's state
      toast.success("Request sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send request.");
    }
  };

  // --- NEW: Author accepts or rejects a request ---
  const handleManageRequest = async (applicantId: string, action: "accept" | "reject") => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/collabs/${project._id}/manage`,
        { applicantId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onProjectUpdate(res.data);
      toast.success(`User ${action}ed`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed.");
    }
  };

  // --- NEW: Author removes an existing member ---
  const handleRemoveCollaborator = async (memberId: string) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/collabs/${project._id}/remove`,
        { memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onProjectUpdate(res.data);
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed.");
    }
  };

  const handleDeleteProject = async () => {
    // ... (your existing delete logic) ...
    onDelete(project._id);
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription className="flex items-center pt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={project.author.profileImageUrl} />
                <AvatarFallback>{project.author.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              Posted by @{project.author.username}
            </CardDescription>
          </div>
          {isAuthor && (
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                {/* ... (your existing Delete dropdown logic) ... */}
              </DropdownMenu>
              {(isAuthor || isMember) && (
                <Button size="icon" variant="outline" onClick={() => setChatOpen(true)}>
                  <MessageCircle className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
          {!isAuthor && (isMember) && (
            <Button size="icon" variant="outline" onClick={() => setChatOpen(true)} className="ml-auto">
              <MessageCircle className="w-5 h-5" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-muted-foreground">{project.description}</p>
          
          {/* --- NEW: Author Management Tabs --- */}
          {isAuthor ? (
            <Tabs defaultValue="members" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Members ({project.collaborators.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({project.pendingRequests.length})</TabsTrigger>
              </TabsList>
              
              {/* --- Accepted Members Tab --- */}
              <TabsContent value="members" className="mt-4 space-y-4">
                {project.collaborators.length > 0 ? project.collaborators.map(user => (
                  <div key={user._id} className="flex items-center justify-between">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2 group">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm group-hover:underline">{user.username}</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCollaborator(user._id)}>
                      <UserX className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )) : <p className="text-xs text-muted-foreground text-center">No members yet.</p>}
              </TabsContent>
              
              {/* --- Pending Requests Tab --- */}
              <TabsContent value="pending" className="mt-4 space-y-4">
                {project.pendingRequests.length > 0 ? project.pendingRequests.map(user => (
                  <div key={user._id} className="flex items-center justify-between">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-2 group">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm group-hover:underline">{user.username}</span>
                    </Link>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleManageRequest(user._id, 'reject')}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleManageRequest(user._id, 'accept')}>
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                )) : <p className="text-xs text-muted-foreground text-center">No pending requests.</p>}
              </TabsContent>
            </Tabs>
          ) : (
             // --- Original Collaborator List (for non-authors) ---
            <div className="mt-6">
                <h4 className="font-semibold text-sm mb-2">Team ({project.collaborators.length})</h4>
                <div className="flex items-center space-x-2">
                    {project.collaborators.map(user => (
                        <Link key={user._id} href={`/profile/${user.username}`} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImageUrl} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">{user.username}</span>
                        </Link>
                    ))}
                </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col items-start gap-4">
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.map(skill => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
          {/* --- MODIFIED: Join Button Logic --- */}
          {!isAuthor && (
            <Button onClick={handleJoin} className="w-full" disabled={isMember || isPending}>
              {isMember ? "Joined" : isPending ? "Request Sent" : "Join Project"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* --- Delete Confirmation Dialog (remains the same) --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        {/* ... (your existing alert dialog JSX) ... */}
      </AlertDialog>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-lg w-full p-0 overflow-hidden">
          <CollabChat 
            collabId={project._id}
            currentUser={currentUser || { _id: '', username: '', profileImageUrl: '' }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}