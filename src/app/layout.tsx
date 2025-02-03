// src/app/layout.tsx
"use client";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "./globals.css"; // updated path

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head />
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
