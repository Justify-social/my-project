'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function TestUploadDirectPage() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Direct UploadThing Test</h1>
        
        <div className="grid grid-cols-1 gap-12">
          {/* General Media Uploader */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Media Uploader</h2>
            <p className="text-gray-600 mb-4">Supports images and videos</p>
            
            {/* @ts-ignore - Type error with UploadButton but it works at runtime */}
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                if (res) {
                  const urls = res.map((file) => file.url);
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
                <h3 className="font-medium mb-2">Uploaded Media:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedUrls.map((url, index) => (
                    <div key={index} className="border rounded p-2">
                      {url.includes('image') ? (
                        <img src={url} alt={`Upload ${index}`} className="max-h-40 mx-auto" />
                      ) : (
                        <video src={url} controls className="max-h-40 w-full" />
                      )}
                      <input
                        value={url}
                        readOnly
                        className="mt-2 w-full text-xs p-1 bg-gray-100 rounded"
                        onClick={(e) => e.currentTarget.select()}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Logo Uploader */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Logo Uploader</h2>
            <p className="text-gray-600 mb-4">For brand logos (max 2MB)</p>
            
            {/* @ts-ignore - Type error with UploadButton but it works at runtime */}
            <UploadButton
              endpoint="logoUploader"
              onClientUploadComplete={(res) => {
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
                <h3 className="font-medium mb-2">Uploaded Logo:</h3>
                <div className="border rounded p-2">
                  <img src={uploadedLogoUrl} alt="Uploaded Logo" className="max-h-40 mx-auto" />
                  <input
                    value={uploadedLogoUrl}
                    readOnly
                    className="mt-2 w-full text-xs p-1 bg-gray-100 rounded"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Avatar Uploader */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Avatar Uploader</h2>
            <p className="text-gray-600 mb-4">For profile pictures (max 1MB)</p>
            
            {/* @ts-ignore - Type error with UploadButton but it works at runtime */}
            <UploadButton
              endpoint="avatarUploader"
              onClientUploadComplete={(res) => {
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
                <h3 className="font-medium mb-2">Uploaded Avatar:</h3>
                <div className="border rounded p-2">
                  <img src={uploadedAvatarUrl} alt="Uploaded Avatar" className="max-h-40 mx-auto" />
                  <input
                    value={uploadedAvatarUrl}
                    readOnly
                    className="mt-2 w-full text-xs p-1 bg-gray-100 rounded"
                    onClick={(e) => e.currentTarget.select()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 