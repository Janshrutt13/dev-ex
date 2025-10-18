import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast"; // For notifications

import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevEx",
  description: "A code logging platform to build discipline, maintain streaks, and collaborate with other developers."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          {/* Main content of the application */}
          {children}
          
          {/* Toaster component for displaying notifications globally */}
          <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
