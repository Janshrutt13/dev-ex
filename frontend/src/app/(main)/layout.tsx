"use client";

import { Sidebar } from "@/components/sidebar";

export default function Home({
    children,
} : 
    {
        children : React.ReactNode
    }){
        return (
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />

                <main className="flex-1 overflow-y-auto h-full">
                    {children}
                </main>
            </div>
        );
    }