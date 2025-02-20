"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "../components/Sidebar";
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { SidebarProvider } from '@/components/providers/sidebar-provider'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

export const metadata = {
  title: 'Justify Social',
  description: 'Campaign Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <ClerkProvider>
        <SidebarProvider>
          <UserProvider>
            <body className={inter.className}>
              <Header 
                companyName="Justify"
                remainingCredits={100}
                notificationsCount={0}
                profileImageUrl="/profile-image.svg"
              />
              <Sidebar />
              <main className="flex-1 p-4 md:p-6 lg:p-8 ml-[240px] mt-[64px]">
                {children}
              </main>
            </body>
          </UserProvider>
        </SidebarProvider>
      </ClerkProvider>
    </html>
  );
}
