"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function Home({
    children,
} : 
    {
        children : React.ReactNode
    }){
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        }, []);

        const handleLogout = () => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            toast.success("Logged out successfully!");
            router.push("/login");
        };

        return (
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    {/* Header with Auth Buttons */}
                    <header className="border-b bg-background p-4">
                        <div className="flex justify-end gap-2">
                            {isLoggedIn ? (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => router.push("/login")}
                                        className="flex items-center gap-2"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        onClick={() => router.push("/signup")}
                                        className="flex items-center gap-2"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Sign Up
                                    </Button>
                                </>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }