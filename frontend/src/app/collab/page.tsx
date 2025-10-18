"use client"; // Convert to a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CollabPost } from "@/components/collab-post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

// --- Interfaces ---
interface User {
  _id: string;
  username: string;
  profileImageUrl?: string;
  githubUsername?: string; // Add githubUsername
}

interface CollabProject {
  _id: string;
  author: User;
  title: string;
  description: string;
  requiredSkills: string[];
  collaborators: User[];
  status: "OPEN" | "CLOSED";
  link?: string; // Add optional link
}

// Func to fetch collab projects
async function getCollabProject(): Promise<CollabProject[]> {
  try {
    const res = await fetch(`http://localhost:5000/api/collabs`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// --- Main Page Component ---
export default function CollabPage() {
  const [projects, setProjects] = useState<CollabProject[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // --- Form State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [skills, setSkills] = useState("");

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view this page.");
        setIsLoading(false);
        router.push('/login');
        return;
      }

      try {
        // Fetch projects and user data in parallel
        const [projectsData, userData] = await Promise.all([
          getCollabProject(),
          axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        setProjects(projectsData);
        setCurrentUser(userData.data);

      } catch (error) {
        toast.error("Failed to load data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // --- Gating Logic for Modal ---
  const handleOpenModal = () => {
    if (currentUser && currentUser.githubUsername) {
      setIsModalOpen(true);
    } else {
      toast.error("Please link your GitHub profile in settings to post a project.");
      // Optionally redirect to settings page:
      // router.push('/settings');
    }
  };

  // --- Form Submission ---
  const handleCreateProject = async () => {
    if (!title || !description) {
      return toast.error("Title and description are required.");
    }

    try {
      const token = localStorage.getItem("token");
      const requiredSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

      const response = await axios.post(
        "http://localhost:5000/api/collabs",
        { title, description, link, requiredSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new project to the top of the list
      setProjects([response.data, ...projects]);
      setIsModalOpen(false);
      toast.success("Project posted successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setLink("");
      setSkills("");

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post project.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight">Find a Project</h1>
            <p className="text-muted-foreground mt-2">
              Join forces with other developers and build something amazing together.
            </p>
          </div>
          <Button onClick={handleOpenModal} className="w-full sm:w-auto">
            Post a Project
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <CollabPost key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>No open collaborations projects. Why not start one?</p>
          </div>
        )}
      </main>

      {/* --- Create Project Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Post a Collaboration Project</DialogTitle>
            <DialogDescription>
              Share your idea and find teammates. Linking GitHub is required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="title"
              placeholder="Project Title (e.g., AI Code Logger)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              id="description"
              placeholder="Describe your project, what you're building, and who you're looking for."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              id="link"
              placeholder="GitHub Repo Link (Optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <Input
              id="skills"
              placeholder="Required Skills (comma-separated, e.g., React, Node.js)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProject}>Post Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}