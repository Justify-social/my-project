import { createUploadthing, type FileRouter } from "uploadthing/next"
import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const f = createUploadthing()

export const ourFileRouter = {
  campaignAsset: f({ image: { maxFileSize: "4MB" }, video: { maxFileSize: "16MB" } })
    .middleware(async () => {
      return { uploadedAt: new Date() }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.uploadedAt)
      console.log("file url", file.url)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter 

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export const { UploadButton, UploadDropzone } = generateComponents<OurFileRouter>(); 