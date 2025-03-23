import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  // General media uploader with basic configuration
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" }
  })
    .middleware(() => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.url };
    }),
    
  // Simple avatar uploader for profiles
  avatarUploader: f({ image: { maxFileSize: "1MB" } })
    .middleware(() => {
      return { type: "avatar" };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url };
    }),
    
  // Campaign asset uploader with minimal configuration
  campaignAssetUploader: f({
    image: { maxFileSize: "8MB" },
    video: { maxFileSize: "16MB" },
  })
    .middleware(() => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(({ file }) => {
      return { 
        url: file.url,
        name: file.name,
        size: file.size
      };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 