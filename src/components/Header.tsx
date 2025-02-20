import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useSidebar } from "../context/SidebarContext"; // adjust the path as needed

interface HeaderProps {
  companyName: string;
  remainingCredits: number;
  notificationsCount: number;
  profileImageUrl?: string;
}

const Header: React.FC<HeaderProps> = ({
  companyName,
  remainingCredits,
  notificationsCount,
  profileImageUrl = "/profile-image.svg",
}) => {
  const { user } = useUser();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Justify Logo" width={40} height={40} />
          <span className="font-bold text-black text-xl">{companyName}</span>
        </div>

        {/* Right: For desktop, show full icon group; for mobile, show burger button */}
        <div className="flex items-center">
          {/* Desktop icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/billing">
              <div className="flex items-center space-x-1 cursor-pointer">
                <Image src="/coins.svg" alt="Credits" width={24} height={24} />
                <span className="text-[#333333] font-medium text-sm">{remainingCredits}</span>
              </div>
            </Link>
            <div className="flex items-center">
              <Image src="/magnifying-glass.svg" alt="Search" width={24} height={24} />
            </div>
            <div className="relative">
              <Image src="/bell.svg" alt="Notifications" width={24} height={24} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </div>
            <Link href="/settings">
              <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
                <img 
                  src={user?.picture || profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load profile image: ${user?.picture || profileImageUrl}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "/profile-image.svg";
                    target.onerror = null;
                  }}
                />
              </div>
            </Link>
          </div>
          {/* Mobile burger button on top right */}
          <div className="md:hidden">
            <button 
              onClick={toggleSidebar} 
              aria-label="Open navigation menu" 
              className="p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
