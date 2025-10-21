"use client"; // Convert to a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CollabPost } from "@/components/collab-post";
import { Button } from "@/components/ui/button";

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
  status: "open" | "closed" | "in progress";
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

  const router = useRouter();



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

  // --- Gating Logic for Create ---
  const handleCreateProject = () => {
    router.push('/collab/create');
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
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight">Find a Project</h1>
            <p className="text-muted-foreground mt-2">
              Join Amazing projects or post your ideas for others to collaborate.
            </p>
          </div>
          <Button onClick={handleCreateProject} className="w-full sm:w-auto">
            Post a Project
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="max-w-2xl mx-auto space-y-6">
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


    </div>
  );
}