"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ["latin"] });

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
      <UserProvider>
        <body>
          <Header />
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 ml-[240px] mt-[64px]">
            {children}
          </main>
        </body>
      </UserProvider>
    </html>
  );
}
