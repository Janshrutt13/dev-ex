"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import axios from 'axios';
import { X, Link, Tag } from 'lucide-react';

export default function CreateCollabPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    };
    fetchUser();
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to post');
      router.push('/login');
      return;
    }
    
    setIsPosting(true);
    try {
      const requiredSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/collabs`,
        { title, description, url, requiredSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Project posted successfully!');
      router.push('/collab');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post project.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <Button 
            onClick={handlePost} 
            disabled={!title.trim() || !description.trim() || isPosting}
            size="sm"
            className="px-6 rounded-full"
          >
            {isPosting ? "Posting..." : "Post Project"}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentUser?.profileImageUrl || ''} />
              <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              {/* Title */}
              <Input
                placeholder="Project Title (e.g., AI Code Logger)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl border-0 shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
                disabled={isPosting}
              />
              
              {/* Description */}
              <Textarea
                placeholder="Describe your project, what you're building, and who you're looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] border-0 shadow-none resize-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
                disabled={isPosting}
              />
              
              {/* URL */}
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="GitHub Repo Link (Optional)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
                  disabled={isPosting}
                />
              </div>
              
              {/* Skills */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Required Skills (comma-separated, e.g., React, Node.js)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
                  disabled={isPosting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}