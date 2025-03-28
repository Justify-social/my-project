import React from 'react';
import ClientLayoutProps from './client-layout.example';
import { Header } from '@/components/layouts/Header';
import { Sidebar } from '@/components/layouts/Sidebar';
import { useUser } from '@auth0/nextjs-auth0/client';
import { AuthSpinner } from '@/components/ui/spinner';
import Link from 'next/link';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, error, isLoading } = useUser();

  // Show the auth spinner while checking authentication
  if (isLoading) {
    return <AuthSpinner label="Loading Justify..." />;
  }

  // Show error with login button if authentication fails
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-work-sans">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md font-work-sans">
          <div className="text-center font-work-sans">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 font-sora">Authentication Error</h2>
            <p className="mt-2 text-sm text-gray-600 font-work-sans">{error.message}</p>
            <div className="mt-6 font-work-sans">
              <Link
                href="/api/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-work-sans">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>);

  }

  // Only render the layout if the user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-work-sans">
      <Header className="font-sora" />
      <div className="flex font-work-sans">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>);

};

export default ClientLayout;