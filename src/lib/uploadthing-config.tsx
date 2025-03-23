'use client'

import { UploadDropzone } from "@uploadthing/react"
import { OurFileRouter } from "./uploadthing"

export const UploadButton = () => (
  <UploadDropzone<OurFileRouter>
    endpoint="campaignAsset"
    onClientUploadComplete={(res) => {
      console.log("Files: ", res)
    }}
    onUploadError={(error: Error) => {
      alert(`ERROR! ${error.message}`)
    }}
  />
) 