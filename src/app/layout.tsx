"use client";

import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./globals.css";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return (
    <div className="flex">
      <Sidebar user={user} />
      {/* Offset main content by sidebar width (w-64) and header height (pt-16) */}
      <main className="flex-1 ml-64 pt-16 bg-white">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <title>My Project</title>
      </head>
      <body>
        <UserProvider>
          <Header
            companyName="Justify"
            remainingCredits={1000}
            notificationsCount={3}
            profileImageUrl="/profile-image.svg"
          />
          <LayoutContent>{children}</LayoutContent>
        </UserProvider>
      </body>
    </html>
  );
}
