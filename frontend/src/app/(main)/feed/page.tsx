"use client";

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Users,
  User,
  Trophy,
  Plus,
  Flame,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Moon,
  Sun,
  Code2,
  Search,
  Bell,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import toast from "react-hot-toast"
import axios from "axios"

interface Post {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  challenge: string
  content: string
  streak: number
  timestamp: string
  reactions: {
    likes: number
    encourages: number
    comments: number
  }
  hasLiked?: boolean
  codeSnippet?: string
  hashtags?: string[]
  imageUrl?: string
  dayNumber?: number
  totalDays?: number
}

interface Collab {
  id: string
  name: string
  techStack: string[]
  members: number
  description: string
}

const SAMPLE_COLLABS: Collab[] = []

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const [isLiked, setIsLiked] = useState(post.hasLiked || false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(post.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-border rounded-2xl p-6 hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{post.user.name}</span>
            <span className="text-sm text-muted-foreground">{post.user.username}</span>
            <Badge variant="secondary" className="text-xs">
              {post.challenge}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">{post.streak} day streak</span>
            <span className="text-sm text-muted-foreground">• {post.timestamp}</span>
          </div>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <p className="text-foreground leading-relaxed">{post.content}</p>

      {post.codeSnippet && (
        <pre className="bg-muted/50 border border-border rounded-lg p-4 mt-4 overflow-x-auto">
          <code className="text-sm font-mono text-foreground">{post.codeSnippet}</code>
        </pre>
      )}

      {/* Image at bottom */}
      {post.imageUrl && (
        <div className="mt-4">
          <img 
            src={post.imageUrl} 
            alt="Post image" 
            className="max-h-96 w-full object-cover rounded-lg border border-border"
          />
        </div>
      )}

      {/* Hashtags at bottom */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.hashtags.map((tag, index) => (
            <button
              key={index}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
              onClick={() => console.log('Search hashtag:', tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            <span>{post.reactions.likes + (isLiked && !post.hasLiked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-5 h-5" />
            <span>{post.reactions.encourages}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.reactions.comments}</span>
          </button>
        </div>
        
        {/* Challenge Badge */}
        {post.dayNumber && post.totalDays && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Day {post.dayNumber}/{post.totalDays}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CollabCard({ collab }: { collab: Collab }) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-foreground">{collab.name}</h4>
        <Badge variant="outline" className="text-xs">
          {collab.members} members
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{collab.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {collab.techStack.map((tech) => (
          <Badge key={tech} variant="secondary" className="text-xs">
            {tech}
          </Badge>
        ))}
      </div>
      <Button size="sm" className="w-full">
        Join Collab
      </Button>
    </div>
  )
}



export default function DevExPlatform() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [focusMode, setFocusMode] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState("feed")
  const [isLoading, setIsLoading] = useState(true)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/logs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Transform backend data to match frontend interface
          const transformedPosts = response.data.map((log: any) => ({
            id: log._id,
            user: {
              name: log.author.username,
              username: `@${log.author.username}`,
              avatar: log.author.profileImageUrl || '/default-avatar.png'
            },
            challenge: 'Daily Log',
            content: log.content,
            streak: 0, // Will be updated when user streak is available
            timestamp: new Date(log.createdAt).toLocaleDateString(),
            reactions: {
              likes: 0,
              encourages: 0,
              comments: 0
            },
            hashtags: log.tags || [],
            imageUrl: log.imageUrl
          }));
          
          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, hasLiked: !post.hasLiked }
        : post
    ))
  }

  const currentStreak = 0 // Empty for now

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 p-4 lg:p-6">


          {/* Main Feed */}
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {activeTab === "feed" ? "Feed" : "Active Collaborations"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {activeTab === "feed" ? (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share your coding progress!</p>
                    <Button onClick={() => {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        toast.error('Please signup to post');
                        router.push('/signup');
                        return;
                      }
                      router.push('/feed/create');
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first post
                    </Button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} onLike={handleLike} />
                  ))
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {SAMPLE_COLLABS.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No collaborations yet</h3>
                    <p className="text-muted-foreground mb-4">Start collaborating with other developers!</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create collaboration
                    </Button>
                  </div>
                ) : (
                  SAMPLE_COLLABS.map((collab) => (
                    <CollabCard key={collab.id} collab={collab} />
                  ))
                )}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              <div className="bg-background border border-border rounded-2xl p-4">
                <h3 className="font-semibold text-foreground mb-4">Trending Collabs</h3>
                <div className="space-y-3">
                  {SAMPLE_COLLABS.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No collaborations yet</p>
                    </div>
                  ) : (
                    SAMPLE_COLLABS.slice(0, 2).map((collab) => (
                      <CollabCard key={collab.id} collab={collab} />
                    ))
                  )}
                </div>
              </div>


            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => {
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('Please signup to post');
            router.push('/signup');
            return;
          }
          router.push('/feed/create');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>


    </div>
  )
}