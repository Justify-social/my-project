'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import Link from 'next/link';

// Custom wrapper component for UploadButton to override styling
const StyledUploadButton = ({ endpoint, onClientUploadComplete, onUploadError }: any) => {
  return (
    <div className="ut-wrapper">
      <div className="mb-3">
        <button 
          className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-white hover:text-[var(--accent-color)] hover:border hover:border-[var(--accent-color)] transition-colors"
          onClick={() => document.getElementById(`ut-${endpoint}`)?.click()}
        >
          Select files to upload
        </button>
      </div>
      
      <div style={{ opacity: 0, height: 0, overflow: 'hidden' }}>
        {/* @ts-ignore - Type error with UploadButton but it works at runtime */}
        <UploadButton
          id={`ut-${endpoint}`}
          endpoint={endpoint}
          onClientUploadComplete={onClientUploadComplete}
          onUploadError={onUploadError}
        />
      </div>
    </div>
  );
};

export default function TestUploadDirectPage() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

  return (
    <>
      {/* Add custom style to override UploadThing button styles */}
      <style jsx global>{`
        /* Override UploadThing button styles */
        .ut-button {
          background-color: var(--accent-color) !important;
          color: white !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s !important;
        }
        
        .ut-button:hover {
          background-color: white !important;
          color: var(--accent-color) !important;
          border: 1px solid var(--accent-color) !important;
        }
        
        .ut-label {
          color: var(--secondary-color) !important;
        }
        
        .ut-upload-icon {
          color: var(--accent-color) !important;
        }

        /* Force text color for all button content */
        .ut-button span, 
        .ut-button p, 
        .ut-button div {
          color: white !important;
        }

        .ut-button:hover span, 
        .ut-button:hover p, 
        .ut-button:hover div {
          color: var(--accent-color) !important;
        }

        /* Target label and drag text */
        .uploadthing-label {
          color: var(--secondary-color) !important;
        }

        /* Target uploadthing specific elements */
        .uploadthing span {
          color: var(--secondary-color) !important;
        }

        /* Target the main button component */
        .uploadthing button {
          background-color: var(--accent-color) !important;
          color: white !important;
          border-radius: 0.375rem !important;
        }

        .uploadthing button:hover {
          background-color: white !important;
          color: var(--accent-color) !important;
          border: 1px solid var(--accent-color) !important;
        }

        /* Force button text color */
        .uploadthing button span,
        .uploadthing button p {
          color: white !important;
        }

        .uploadthing button:hover span,
        .uploadthing button:hover p {
          color: var(--accent-color) !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-[var(--background-color)] p-8">
        <div className="max-w-2xl mx-auto bg-[var(--background-color)] p-6 rounded-lg border border-[var(--divider-color)] shadow-sm">
          <h1 className="text-2xl font-bold mb-6 text-[var(--primary-color)]">Direct UploadThing Test</h1>
          
          <div className="mb-4">
            <Link 
              href="/debug-tools" 
              className="text-[var(--accent-color)] hover:underline"
            >
              ← Back to Debug Tools
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
            {/* General Media Uploader */}
            <div className="border border-[var(--divider-color)] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Media Uploader</h2>
              <p className="text-[var(--secondary-color)] mb-4">Supports images and videos</p>
              
              <StyledUploadButton
                endpoint="mediaUploader"
                onClientUploadComplete={(res: any) => {
                  if (res) {
                    const urls = res.map((file: any) => file.url);
                    setUploadedUrls(urls);
                    toast.success(`Uploaded ${urls.length} files successfully!`);
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error: ${error.message}`);
                }}
              />
              
              {uploadedUrls.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-[var(--primary-color)]">Uploaded Media:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedUrls.map((url, index) => (
                      <div key={index} className="border border-[var(--divider-color)] rounded p-2">
                        {url.includes('image') ? (
                          <img src={url} alt={`Upload ${index}`} className="max-h-40 mx-auto" />
                        ) : (
                          <video src={url} controls className="max-h-40 w-full" />
                        )}
                        <input
                          value={url}
                          readOnly
                          className="mt-2 w-full text-xs p-1 bg-[var(--background-color)] border border-[var(--divider-color)] rounded text-[var(--secondary-color)]"
                          onClick={(e) => e.currentTarget.select()}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Logo Uploader */}
            <div className="border border-[var(--divider-color)] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Logo Uploader</h2>
              <p className="text-[var(--secondary-color)] mb-4">For brand logos (max 2MB)</p>
              
              <StyledUploadButton
                endpoint="logoUploader"
                onClientUploadComplete={(res: any) => {
                  if (res && res[0]) {
                    setUploadedLogoUrl(res[0].url);
                    toast.success('Logo uploaded successfully!');
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error: ${error.message}`);
                }}
              />
              
              {uploadedLogoUrl && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-[var(--primary-color)]">Uploaded Logo:</h3>
                  <div className="border border-[var(--divider-color)] rounded p-2">
                    <img src={uploadedLogoUrl} alt="Uploaded Logo" className="max-h-40 mx-auto" />
                    <input
                      value={uploadedLogoUrl}
                      readOnly
                      className="mt-2 w-full text-xs p-1 bg-[var(--background-color)] border border-[var(--divider-color)] rounded text-[var(--secondary-color)]"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Avatar Uploader */}
            <div className="border border-[var(--divider-color)] p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-[var(--primary-color)]">Avatar Uploader</h2>
              <p className="text-[var(--secondary-color)] mb-4">For profile pictures (max 1MB)</p>
              
              <StyledUploadButton
                endpoint="avatarUploader"
                onClientUploadComplete={(res: any) => {
                  if (res && res[0]) {
                    setUploadedAvatarUrl(res[0].url);
                    toast.success('Avatar uploaded successfully!');
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error: ${error.message}`);
                }}
              />
              
              {uploadedAvatarUrl && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 text-[var(--primary-color)]">Uploaded Avatar:</h3>
                  <div className="border border-[var(--divider-color)] rounded p-2">
                    <img src={uploadedAvatarUrl} alt="Uploaded Avatar" className="max-h-40 mx-auto" />
                    <input
                      value={uploadedAvatarUrl}
                      readOnly
                      className="mt-2 w-full text-xs p-1 bg-[var(--background-color)] border border-[var(--divider-color)] rounded text-[var(--secondary-color)]"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 