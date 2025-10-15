"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import axios from 'axios';
import { X, Image, Code, Hash } from 'lucide-react';

export default function CreateFeedPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/logs',
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Posted successfully!');
      router.push('/feed');
    } catch (error: any) {
      toast.error('Failed to post. Please try again.');
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
            disabled={!content.trim() || isPosting}
            size="sm"
            className="px-6 rounded-full"
          >
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's your coding progress today?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] text-xl border-0 shadow-none resize-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/60"
                autoFocus
                disabled={isPosting}
              />
              
              {/* Action buttons */}
              <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                  <Code className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                  <Hash className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}