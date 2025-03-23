"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Icon } from '@/components/ui/icons';

// Debug function
function debugLog(message: string, data?: any) {
  console.log(`[Settings Debug] ${message}`, data || '');
}

// Define the tab interface
interface Tab {
  id: string;
  label: string;
  icon: string;
}

// Simple Settings Page Component
const SimpleSettingsPage = () => {
  const router = useRouter();
  const { user, isLoading, error } = useUser();
  
  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Add debug logging
  debugLog('useUser hook state:', { user: !!user, isLoading, error: !!error });
  
  // Check admin status on component mount
  useEffect(() => {
    debugLog('useEffect triggered', { user: !!user });
    
    const checkAdminStatus = async () => {
      try {
        debugLog('Checking super admin status');
        const response = await fetch('/api/auth/verify-role');
        debugLog('Admin check response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to verify role');
        const data = await response.json();
        debugLog('Admin check response data:', data);
        
        setIsAdmin(data?.user?.isSuperAdmin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        debugLog('Admin check error:', error);
        setIsAdmin(false);
      } finally {
        setIsPageLoading(false);
        debugLog('Page loading complete');
      }
    };
    
    if (user) {
      checkAdminStatus();
    } else {
      debugLog('No user, skipping admin check');
      setIsPageLoading(false);
    }
  }, [user]);
  
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'team':
        router.push('/settings/team-management');
        break;
      case 'branding':
        router.push('/settings/branding');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/settings');
    }
  };
  
  const handleSignOut = () => {
    window.location.href = '/api/auth/logout';
  };
  
  // Loading state
  if (isLoading || isPageLoading) {
    debugLog('Showing loading state', { isLoading, isPageLoading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !user) {
    debugLog('Showing error state', { error, user: !!user });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-800 rounded-xl p-6 max-w-md w-full shadow-lg flex items-center">
          <Icon name="faXCircle" className="w-12 h-12 text-red-400 mr-4" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-red-600">
              {error?.message || 'Please log in to access settings'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-4 hover:bg-blue-600 transition-all duration-200 flex items-center"
            >
              <Icon name="faArrowRight" className="w-5 h-5 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main content
  debugLog('Rendering main content', { user: !!user });
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center"
            >
              <Icon name="faRightFromBracket" className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-1" aria-label="Settings navigation">
            {[
              { id: 'profile', label: 'Profile Settings', icon: 'faUserCircle' },
              { id: 'team', label: 'Team Management', icon: 'faUserGroup' },
              { id: 'branding', label: 'Branding', icon: 'faImage' },
              ...(isAdmin ? [{ id: 'admin', label: 'Admin Console', icon: 'faKey' }] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  relative py-4 px-6 flex items-center transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'text-blue-500 bg-gray-100 bg-opacity-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                  rounded-t-lg
                `}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon name={tab.icon} className="w-5 h-5 mr-2" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Icon name="faUserCircle" className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                <p className="mt-1 text-sm text-gray-600">Your basic profile information</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={user?.name || ''} 
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Email
                    </label>
                    <input 
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={user?.email || ''} 
                      disabled
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      User ID
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={user?.sub || ''} 
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Role
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={isAdmin ? 'Administrator' : 'User'} 
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Debug Information (only visible in development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Debug Information
              </summary>
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-gray-300">
                  {JSON.stringify({
                    user: {
                      email: user.email,
                      name: user.name,
                      sub: user.sub,
                      isAdmin
                    },
                    auth: {
                      isAuthenticated: !!user,
                      lastChecked: new Date().toISOString()
                    },
                    state: {
                      activeTab,
                      isPageLoading
                    }
                  }, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleSettingsPage;