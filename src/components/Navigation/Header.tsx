import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useSidebar } from "@/providers/SidebarProvider";
import MobileMenu from "./MobileMenu";
import { navItems, settingsNavItem } from "@/config/navigation";

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
  const { toggle: toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo & Company Name */}
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Justify Logo" width={40} height={40} />
            <span className="font-bold text-black text-xl">{companyName}</span>
          </div>

          {/* Center: Search Bar (hidden on mobile) */}
          <div className="hidden md:flex flex-grow justify-center px-4">
            <div className="w-full max-w-lg bg-gray-200 rounded-md px-4 py-2 flex items-center">
              <Image src="/magnifying-glass.svg" alt="Search" width={20} height={20} />
              <input
                type="text"
                placeholder="Search campaigns, influencers, or reports."
                className="flex-grow bg-transparent focus:outline-none px-2 text-sm"
              />
              <span className="text-gray-500 text-xs">⌘ K</span>
            </div>
          </div>

          {/* Right: Icon Group */}
          <div className="flex items-center space-x-4">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Credits */}
              <Link href="/billing">
                <div className="flex items-center space-x-1 cursor-pointer">
                  <Image src="/coins.svg" alt="Credits" width={24} height={24} data-testid="coins-icon" />
                  <span className="text-[#333333] font-medium text-sm">{remainingCredits}</span>
                </div>
              </Link>

              {/* Notifications */}
              <div className="relative">
                <Image src="/bell.svg" alt="Notifications" width={24} height={24} />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {notificationsCount}
                  </span>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* UserButton always visible */}
            <div className="hidden md:block">
              {user && (
                <Link href="/settings">
                  <Image 
                    src="/profile-image.svg"
                    alt="Profile" 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        settingsNavItem={settingsNavItem}
        remainingCredits={remainingCredits}
        notificationsCount={notificationsCount}
        companyName={companyName}
        user={user}
      />
    </>
  );
};

export default Header;
