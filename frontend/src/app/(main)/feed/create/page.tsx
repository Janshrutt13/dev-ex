"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import axios from 'axios';
import { X, Image, Code, Hash, Upload, Tag } from 'lucide-react';

export default function CreateFeedPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/users/me', {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please signup to post');
      router.push('/signup');
      return;
    }
    
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      // Process hashtags
      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.toLowerCase());
      formData.append('hashtags', JSON.stringify(hashtagArray));
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      await axios.post(
        'http://localhost:5000/api/logs',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
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
              <AvatarImage src={currentUser?.profileImageUrl || ''} />
              <AvatarFallback>{currentUser?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
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
              
              {/* Hashtags input */}
              <div className="flex items-center gap-2 mt-4">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add hashtags (e.g., #javascript #webdev)"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/60"
                  disabled={isPosting}
                />
              </div>
              
              {/* Image preview */}
              {imagePreview && (
                <div className="relative mt-4">
                  <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
                <label className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors cursor-pointer">
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isPosting}
                  />
                </label>
                <button className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                  <Code className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}