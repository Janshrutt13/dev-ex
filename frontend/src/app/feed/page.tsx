"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Menu, X, Home, Users, User, Trophy, Flame, Plus, Heart, MessageCircle, Code2, Calendar, SunIcon, MoonIcon, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import axios from "axios";
// Simple date formatting function
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
};

//Data Interfaces (Based on Backend Scehmas) 
interface Author {
  _id: string;
  username: string;
  profileImageUrl?: string;
}

interface Log {
  _id: string;
  author: Author;
  content: string;
  tags: string[];
  createdAt: string; // ISO String
  // Mock data fields for UI compatibility
  likes?: number;
  comments?: number;
  streak?: number;
  challenge?: string;
}

interface Collab {
  _id: string;
  author: Author;
  title: string;
  description: string;
  requiredSkills: string[];
  collaborators: Author[];
}

interface CurrentUser {
    _id: string;
    username: string;
    email: string;
    profileImageUrl?: string;
    currentStreak: number;
    longestStreak: number;
}

// --- Sidebar Components (Unchanged from your original code) ---
// (Your entire Sidebar context, provider, body, and link components go here)
// ...
interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};
// ... (Include all your other sidebar components: Sidebar, SidebarBody, etc.)
// For brevity, I've omitted them here, but you should copy them in.

// --- UI Components ---

// Post Card Component (Adapted for live data)
const PostCard = ({ log }: { log: Log }) => {
  return (
    <Card className="mb-4 border-border hover:border-primary/50 transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={log.author.profileImageUrl} alt={log.author.username} />
            <AvatarFallback>{log.author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{log.author.username}</span>
              <span className="text-muted-foreground text-sm">@{log.author.username}</span>
            </div>
            {log.challenge && (
              <Badge variant="secondary" className="text-xs rounded-full">
                {log.challenge}
              </Badge>
            )}
          </div>
          {log.streak && (
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-orange-500">{log.streak}</span>
            </div>
          )}
        </div>
        <p className="text-foreground/90 mb-3 leading-relaxed">{log.content}</p>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>{formatDistanceToNow(new Date(log.createdAt))}</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Heart className="h-4 w-4" />
              <span>{log.likes || 0}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{log.comments || 0}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Collab Card Component (Adapted for live data)
const CollabCard = ({ collab }: { collab: Collab }) => {
  return (
    <Card className="mb-3 border-border hover:border-primary/50 transition-all duration-300 rounded-xl">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2">{collab.title}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {collab.requiredSkills.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs rounded-full">{tech}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{collab.collaborators.length} members</span>
          <Button size="sm" className="rounded-full h-7 text-xs">Join</Button>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Page Component ---
export default function FeedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- State for Live Data ---
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- State for New Post ---
  const [newLogContent, setNewLogContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        // We'll assume a /api/users/me endpoint exists to get the current user
        // For now, we mock this part but show how to fetch others.
        const mockCurrentUser: CurrentUser = {
            _id: '123', username: 'Alex', email: 'alex@dev.com',
            currentStreak: 12, longestStreak: 45
        };
        setUser(mockCurrentUser);

        // Fetch logs and collabs in parallel
        const [logsResponse, collabsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/logs"),
          axios.get("http://localhost:5000/api/collabs"),
        ]);
        
        setLogs(logsResponse.data);
        setCollabs(collabsResponse.data);

      } catch (error) {
        toast.error("Failed to load data. Please refresh.");
        console.error("Data fetching error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handle Post Submission ---
  const handlePostLog = async () => {
    if (!newLogContent.trim()) {
      return toast.error("Log content cannot be empty.");
    }
    setIsPosting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/logs",
        { content: newLogContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add new post to the top of the feed instantly
      setLogs([response.data, ...logs]);
      setNewLogContent("");
      toast.success("Log posted!");
    } catch (error) {
      toast.error("Could not post log. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const links = [ /* ... Your links array remains unchanged ... */ ];

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* --- Sidebar (unmodified) --- */}
      {/* <Sidebar> ... </Sidebar> */}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Feed</h1>
              {/* <div className="md:hidden"><ThemeToggle /></div> */}
            </div>
            
            {/* --- Create Post Form --- */}
            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                <Textarea 
                  placeholder={`What's your progress for today, ${user?.username}?`} 
                  className="resize-none border-0 focus-visible:ring-0 shadow-none text-lg p-0"
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  disabled={isPosting}
                />
                <div className="flex justify-end">
                  <Button onClick={handlePostLog} disabled={isPosting}>
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Log"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* --- Dynamic Feed --- */}
            {logs.map((log) => (
              <PostCard key={log._id} log={log} />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 md:right-[380px] h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-50"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </main>

        <aside className="hidden lg:block w-80 border-l border-border overflow-y-auto p-6 bg-background">
          {/* --- Dynamic Collabs Section --- */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Trending Collabs
            </h2>
            {collabs.map((collab) => (
              <CollabCard key={collab._id} collab={collab} />
            ))}
            <Button variant="outline" className="w-full mt-3 rounded-full">
              Post New Collab
            </Button>
          </div>
          {/* ... (Rest of your aside content is unchanged) ... */}
        </aside>
      </div>
    </div>
  );
}