import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  // General endpoint for campaign assets (images, videos, PDFs)
  campaignAsset: f({
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 10,
      minFileCount: 1
    }
  })
    .middleware(async () => {
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
    
  // Specific endpoint for the campaign wizard step 4
  campaignAssetUploader: f({
    image: { 
      maxFileSize: "8MB",
      maxFileCount: 10,
      minFileCount: 1
    },
    video: { 
      maxFileSize: "16MB",
      maxFileCount: 5,
      minFileCount: 1
    },
    pdf: { 
      maxFileSize: "8MB",
      maxFileCount: 5, 
      minFileCount: 1
    },
  })
    .middleware(async ({ req }) => {
      return { 
        campaignId: req.headers.get("x-campaign-id") || "unknown",
        userId: "user" 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter 