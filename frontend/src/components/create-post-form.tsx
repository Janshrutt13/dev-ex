"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export async function CreatePostForm({user}:{user : { name : string}}) {
    const [content , setContent] = useState("");
    const [isSubmitting , setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async() => {
        if(!content.trim()){
           return toast.error("Post cannot be empty");
        }
        setIsSubmitting(true);

        try{

          const token = localStorage.getItem("token");
          if(!token) throw new Error("Token not found");

          await axios.post("http://localhost:5000/api/logs",
            {content},
            {headers : {Authorization : `Bearer${token}`}}
          );
          toast.success("Post created successfully");
          setContent("");
          router.refresh() //This re-fetches data in Server Component

        }catch(err){
            toast.error("failed to fetch posts")
        }finally{
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
          <CardContent className="p-4 space-y-4">
            <Textarea
             placeholder={`What's your progress for today , ${user.name}?`}
             className="resize-none border-0 focus-visible:ring-0 shadow-none text-lg p-0"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             disabled={isSubmitting}
             />
           <div className="flex justify-end">
             <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Log"}
             </Button>
           </div>
          </CardContent>
        </Card>
    );
}