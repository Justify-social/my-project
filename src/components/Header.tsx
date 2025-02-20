import Link from "next/link";
import Image from "next/image";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { useSidebar } from "@/components/providers/sidebar-provider";

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
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Justify Logo" width={40} height={40} />
          <span className="font-bold text-black text-xl">{companyName}</span>
        </div>

        {/* Desktop: show full icon group */}
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
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile: show burger menu on top right */}
        <div className="flex md:hidden items-center">
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
    </header>
  );
};

export default Header;
