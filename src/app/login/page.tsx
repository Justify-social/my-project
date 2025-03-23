"use client";

import React from 'react';

export default function LoginPage() {
  const handleLogin = () => {
    // Redirect to Auth0 login
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Justify</h1>
        <p className="text-gray-600 mb-8 text-center">
          Please log in to access your dashboard and manage your social media campaigns.
        </p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md 
                    transition duration-300 ease-in-out flex items-center justify-center"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
            />
          </svg>
          Log in with Auth0
        </button>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
} 