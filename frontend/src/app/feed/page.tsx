"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  User, 
  Trophy, 
  Flame, 
  Plus, 
  Heart, 
  MessageCircle, 
  Code2,
  Calendar,
  SunIcon,
  MoonIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Sidebar Context
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

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-6 hidden md:flex md:flex-col bg-background border-r border-border w-[280px] flex-shrink-0",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-16 px-4 flex flex-row md:hidden items-center justify-between bg-background border-b border-border w-full"
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Dev-Ex</span>
        </div>
        <Menu
          className="text-foreground cursor-pointer"
          onClick={() => setOpen(!open)}
        />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-background z-[100] flex flex-col justify-between p-6",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: any;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-xl hover:bg-muted transition-all duration-200",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-foreground/80 text-sm font-medium group-hover/sidebar:text-foreground transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

// Theme Toggle
type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const valueToStore =
        typeof storedValue === "function" ? storedValue(storedValue) : storedValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {}
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const THEME_KEY = "color-theme";

const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage(THEME_KEY, "light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (colorMode === "system") {
      root.classList.add(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      root.classList.add(colorMode);
    }
  }, [colorMode]);

  return [colorMode, setColorMode] as const;
};

export const ThemeToggle = () => {
  const [colorMode, setColorMode] = useColorMode();

  const toggleColorMode = () => {
    if (typeof setColorMode === "function") {
      setColorMode(colorMode === "light" ? "dark" : "light");
    }
  };

  return (
    <motion.button
      onClick={toggleColorMode}
      className={cn(
        "relative flex h-8 w-16 cursor-pointer items-center rounded-full p-1 transition-colors shadow-sm border duration-300",
        colorMode === "dark" ? "bg-background" : "bg-muted"
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
    >
      <span className="sr-only">Toggle color mode</span>
      <span className="absolute left-2 z-10 text-foreground opacity-0 transition-opacity duration-200 ease-in-out dark:opacity-100">
        <MoonIcon className="size-4" />
      </span>
      <span className="absolute right-2 z-10 text-foreground opacity-100 transition-opacity duration-200 ease-in-out dark:opacity-0">
        <SunIcon className="size-4" />
      </span>
      <motion.div
        className="absolute z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md"
        initial={false}
        animate={{
          x: colorMode === "dark" ? 32 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.2,
        }}
      />
    </motion.button>
  );
};

// --- Mock Data (keeping your existing data) ---
const mockUser = {
  name: "Alex",
  username: "alex_codes",
  currentStreak: 12,
  longestStreak: 45,
};

const mockLogs = [
  {
    id: 1,
    author: { name: "Jane Doe", username: "janedev", avatar: "/avatars/02.png" },
    content: "Day 15/75: Finally deployed the new microservice. Docker networking was tricky but learned a lot about bridge vs overlay networks. Tomorrow, I'll focus on setting up the CI/CD pipeline.",
    timestamp: "2h ago",
    tags: ["#docker", "#devops"],
    likes: 24,
    comments: 5,
    streak: 15,
    challenge: "75 Days of Code"
  },
  {
    id: 2,
    author: { name: "John Smith", username: "jsmith", avatar: "/avatars/03.png" },
    content: "Spent the morning refactoring an old React component to use hooks. The code is so much cleaner now! `useEffect` is a lifesaver for handling side effects.",
    timestamp: "5h ago",
    tags: ["#react", "#frontend"],
    likes: 18,
    comments: 3,
    streak: 32,
    challenge: "100 Days of Code"
  },
];

const trendingTags = ["#typescript", "#rust", "#nextjs", "#ai", "#go"];

// Collab Interface
interface Collab {
  id: string;
  name: string;
  techStack: string[];
  members: number;
}

// Post Card Component (adapted from your existing LogPost)
const PostCard = ({ log }: { log: typeof mockLogs[0] }) => {
  return (
    <Card className="mb-4 border-border hover:border-primary/50 transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={log.author.avatar} alt={log.author.name} />
            <AvatarFallback>{log.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">{log.author.name}</span>
              <span className="text-muted-foreground text-sm">@{log.author.username}</span>
            </div>
            <Badge variant="secondary" className="text-xs rounded-full">
              {log.challenge}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-orange-500">{log.streak}</span>
          </div>
        </div>
        
        <p className="text-foreground/90 mb-3 leading-relaxed">{log.content}</p>
        
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>{log.timestamp}</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Heart className="h-4 w-4" />
              <span>{log.likes}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>{log.comments}</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Collab Card Component
const CollabCard = ({ collab }: { collab: Collab }) => {
  return (
    <Card className="mb-3 border-border hover:border-primary/50 transition-all duration-300 rounded-xl">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2">{collab.name}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {collab.techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs rounded-full">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{collab.members} members</span>
          <Button size="sm" className="rounded-full h-7 text-xs">
            Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export default function FeedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      label: "Home",
      href: "#",
      icon: <Home className="h-5 w-5 text-foreground/70 group-hover/sidebar:text-primary transition-colors" />,
    },
    {
      label: "Collabs",
      href: "#",
      icon: <Users className="h-5 w-5 text-foreground/70 group-hover/sidebar:text-primary transition-colors" />,
    },
    {
      label: "Profile",
      href: "#",
      icon: <User className="h-5 w-5 text-foreground/70 group-hover/sidebar:text-primary transition-colors" />,
    },
    {
      label: "Leaderboard",
      href: "#",
      icon: <Trophy className="h-5 w-5 text-foreground/70 group-hover/sidebar:text-primary transition-colors" />,
    },
  ];

  const mockCollabs: Collab[] = [
    {
      id: "1",
      name: "Open Source CMS",
      techStack: ["React", "Node.js", "MongoDB"],
      members: 12,
    },
    {
      id: "2",
      name: "AI Code Assistant",
      techStack: ["Python", "TensorFlow", "FastAPI"],
      members: 8,
    },
    {
      id: "3",
      name: "Dev Portfolio Builder",
      techStack: ["Next.js", "Tailwind", "Vercel"],
      members: 15,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-2 mb-8">
              <Code2 className="h-7 w-7 text-primary" />
              <motion.span
                animate={{
                  display: sidebarOpen ? "inline-block" : "none",
                  opacity: sidebarOpen ? 1 : 0,
                }}
                className="font-bold text-xl text-foreground whitespace-pre"
              >
                Dev-Ex
              </motion.span>
            </div>
            
            <div className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>

            <motion.div
              animate={{
                display: sidebarOpen ? "block" : "none",
                opacity: sidebarOpen ? 1 : 0,
              }}
              className="mt-8 p-4 bg-muted rounded-xl border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-foreground">Current Streak</span>
              </div>
              <div className="text-3xl font-bold text-primary">{mockUser.currentStreak} days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up! 🔥</p>
            </motion.div>
          </div>
          
          <div className="flex flex-col gap-4">
            <motion.div
              animate={{
                display: sidebarOpen ? "flex" : "none",
                opacity: sidebarOpen ? 1 : 0,
              }}
              className="justify-center"
            >
              <ThemeToggle />
            </motion.div>
            <SidebarLink
              link={{
                label: mockUser.name,
                href: "#",
                icon: (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                    <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground">Feed</h1>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-4 space-y-4">
                <Textarea placeholder={`What's your progress for today, ${mockUser.name}?`} className="resize-none border-0 focus-visible:ring-0 shadow-none text-lg p-0" />
                <div className="flex justify-end">
                  <Button>Post Log</Button>
                </div>
              </CardContent>
            </Card>
            
            {mockLogs.map((log) => (
              <PostCard key={log.id} log={log} />
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Trending Collabs
            </h2>
            {mockCollabs.map((collab) => (
              <CollabCard key={collab.id} collab={collab} />
            ))}
            <Button variant="outline" className="w-full mt-3 rounded-full">
              Post New Collab
            </Button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Trending Topics</h2>
            {trendingTags.map(tag => (
              <div key={tag} className="text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-2">
                <p className="font-bold">{tag}</p>
                <p>1,234 Logs</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Daily Reminder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Don't forget to log your progress today! Keep your streak alive 🔥
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}