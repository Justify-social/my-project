'use client';

import React, { useState, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  // Check API status
  const checkApiStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/uploadthing/test');
      const data = await response.json();
      setApiStatus(data);
      
      if (data.success) {
        toast.success('UploadThing API is accessible!');
      } else {
        toast.error('Error checking UploadThing API');
      }
    } catch (error) {
      console.error('API check error:', error);
      toast.error('Failed to check API status');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload the file
  const uploadFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create form data for the upload - using the actual format expected by the branding endpoint
      const formData = new FormData();
      formData.append('primaryColor', '#00BFFF');
      formData.append('secondaryColor', '#40404F');
      formData.append('headerFont', 'Work Sans');
      formData.append('headerFontSize', '18px');
      formData.append('bodyFont', 'Work Sans');
      formData.append('bodyFontSize', '14px');
      formData.append('logoFile', file);
      
      // Simple direct upload using our branding endpoint as a test
      const response = await fetch('/api/settings/branding', {
        method: 'POST',
        body: formData
      });
      
      let responseText;
      try {
        responseText = await response.text();
        const result = JSON.parse(responseText);
        setUploadResult(result);
        
        if (response.ok) {
          if (result.data?.logoUrl) {
            toast.success(`Upload successful! Logo URL: ${result.data.logoUrl}`);
            // If there's a URL, show it in an image
            setPreview(result.data.logoUrl);
          } else {
            toast.success('Settings updated but no logo URL returned');
          }
        } else {
          toast.error(`Upload failed: ${result.error || result.details || 'Unknown error'}`);
        }
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.log('Raw response:', responseText);
        setUploadResult({ error: 'JSON parse error', rawResponse: responseText });
        toast.error('Failed to parse server response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploadResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">UploadThing Test</h1>
        
        {/* API Status Check */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <button
            onClick={checkApiStatus}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? (
              <span className="flex items-center">
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Checking...
              </span>
            ) : 'Check API Status'}
          </button>
          
          {apiStatus && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(apiStatus, null, 2)}</pre>
            </div>
          )}
        </div>
        
        {/* File Upload */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Test File Upload</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select File</label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
            />
          </div>
          
          {preview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <img src={preview} alt="Preview" className="mt-2 max-h-40 rounded" />
            </div>
          )}
          
          <button
            onClick={uploadFile}
            disabled={isLoading || !file}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? (
              <span className="flex items-center">
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </span>
            ) : 'Upload File'}
          </button>
          
          {uploadResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <h3 className="font-medium mb-2">Upload Result:</h3>
              <pre className="text-sm">{JSON.stringify(uploadResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 