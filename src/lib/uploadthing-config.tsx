"use client"

// Export types needed for UploadThing
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export type UploadComplete = {
  url: string;
  name?: string;
  size?: number;
};

// Re-export the type for easier imports
export type { OurFileRouter }; 