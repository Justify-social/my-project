"use client";

import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isSignedIn ? (
        <div>You are signed in!</div>
      ) : (
        <div>Please sign in!</div>
      )}
    </div>
  );
}
