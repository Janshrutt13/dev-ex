"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Users,
  Code2,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Flame,
  Moon,
  Sun,
} from "lucide-react";

// Define the properties for a navigation link
interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

// Reusable NavLink component
function NavLink({ href, icon: Icon, label, isCollapsed }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start h-10"
          >
            <Link href={href}>
              <Icon className="h-5 w-5" />
              <span
                className={cn(
                  "ml-4 transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}
              >
                {label}
              </span>
            </Link>
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// The main Sidebar component
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const currentStreak = 0; // Empty for now

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setCurrentUser({ username: "Guest", email: "" });
        }
      } else {
        setCurrentUser({ username: "Guest", email: "" });
      }
    };
    fetchUser();

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <div
      className={cn(
        "relative h-screen flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* --- Logo and Toggle Button --- */}
      <div className="flex items-center justify-between p-4 border-b">
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden",
            isCollapsed ? "w-0" : "w-auto"
          )}
        >
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Dev-Ex</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      {/* --- Navigation Links --- */}
      <nav className="flex-grow p-4 space-y-2">
        <NavLink href="/feed" icon={Home} label="Feed" isCollapsed={isCollapsed} />
        <NavLink href="/collab" icon={Users} label="Collab" isCollapsed={isCollapsed} />
        <NavLink href="/profile" icon={User} label="Profile" isCollapsed={isCollapsed} />
        
        {/* --- Streak Display --- */}
        {!isCollapsed && (
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-foreground">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-2">{currentStreak} days</div>
            <p className="text-sm text-muted-foreground">Start your coding journey! 🚀</p>
          </div>
        )}
        
        {/* --- Theme Toggle --- */}
        <div className="mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              const newTheme = theme === "dark" ? "light" : "dark";
              setTheme(newTheme);
              document.documentElement.classList.toggle('dark', newTheme === 'dark');
              localStorage.setItem('theme', newTheme);
            }}
          >
            <Sun className="h-5 w-5" />
            <span
              className={cn(
                "ml-4 transition-all duration-300",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              Toggle Theme
            </span>
          </Button>
        </div>
      </nav>

      {/* --- User Profile Section (Bottom) --- */}
      <div className="p-4 border-t">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser?.profileImageUrl || "/default-avatar.png"} alt="User" />
                  <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex flex-col overflow-hidden transition-all duration-300",
                    isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  <span className="text-sm font-medium truncate">{currentUser?.username || "Loading..."}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {currentUser?.email || ""}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{currentUser?.username || "Loading..."}</p>
                <p>{currentUser?.email || ""}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}