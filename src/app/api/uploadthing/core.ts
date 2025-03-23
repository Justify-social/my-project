import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

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
    .middleware(async ({ req }) => {
      // Simplify the middleware to reduce potential issues
      const campaignId = req.headers.get("x-campaign-id") || "unknown";
      
      return { 
        campaignId,
        uploadedAt: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Simplify the completion handler
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
        campaignId: metadata.campaignId
      };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 