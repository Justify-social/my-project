'use client';

import { UploadDropzone } from '@uploadthing/react';
import { OurFileRouter } from './uploadthing';

// Derive the endpoint type from the router
type UploadEndpoints = keyof OurFileRouter;

export const UploadButton = () => (
  <UploadDropzone<OurFileRouter, UploadEndpoints>
    endpoint="campaignAsset"
    onClientUploadComplete={res => {
      console.log('Files: ', res);
    }}
    onUploadError={(error: Error) => {
      alert(`ERROR! ${error.message}`);
    }}
  />
);
