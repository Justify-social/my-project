import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";

// For SDK v7+ configuration - no need to decode token or configure manually
// UploadThing automatically reads UPLOADTHING_TOKEN from environment variables
const f = createUploadthing();

// Always verify the environment variables exist
if (!process.env.UPLOADTHING_TOKEN) {
  console.error("Missing required UPLOADTHING_TOKEN environment variable");
  throw new Error('Missing required UPLOADTHING_TOKEN environment variable');
}

// Log that we're using SDK v7+ configuration for debugging
console.log("UploadThing initialized with SDK v7+ configuration");

export const ourFileRouter = {
  // General media uploader for various content
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" }
  })
    .middleware(async () => {
      console.log("Processing media upload");
      return { uploadedAt: new Date() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Media upload complete:", file.url);
      return { url: file.url };
    }),
    
  // Specific route for logo uploads (used in branding settings)
  logoUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      console.log("Processing logo upload");
      return { uploadedAt: new Date(), type: "logo" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Logo upload complete:", file.url);
      return { url: file.url, type: "logo" };
    }),
    
  // Specific route for profile pictures/avatars
  avatarUploader: f({
    image: { maxFileSize: "1MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      console.log("Processing avatar upload");
      return { uploadedAt: new Date(), type: "avatar" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload complete:", file.url);
      return { url: file.url, type: "avatar" };
    }),
    
  // Campaign asset uploader for Step 4 of the Campaign Wizard
  campaignAssetUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      // Simplified middleware with minimal processing
      console.log("Processing campaign asset upload");
      return { 
        campaignId: "temp-id", // Will be replaced client-side
        uploadedAt: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ file }) => {
      // Return minimal data to avoid serialization issues
      console.log("Campaign asset upload complete:", file.url);
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 