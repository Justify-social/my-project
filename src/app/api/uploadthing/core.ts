import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" }
  })
    .middleware(async () => {
      return { uploadedAt: new Date() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 