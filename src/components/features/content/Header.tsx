import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useSidebar } from "@/providers/SidebarProvider";
import { MobileMenu } from '@/components/ui/organisms/navigation/mobile-menu/MobileMenu'
import { navItems, settingsNavItem } from "@/components/ui/organisms/navigation/config";
import { SearchBar } from "@/components/ui/molecules/search-bar";

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
  profileImageUrl = "/icons/solid/user-circle.svg"
}) => {
  const { user } = useUser();
  const { toggle: toggleSidebar } = useSidebar();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b font-sora">
        <div className="flex items-center justify-between px-4 py-3 font-work-sans">
          {/* Left: Logo & Company Name wrapped in Link to /dashboard */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Justify Logo" width={40} height={40} />
            <span className="font-bold text-black text-xl font-work-sans">{companyName}</span>
          </Link>

          {/* Center: Search Bar (hidden on mobile) */}
          <div className="hidden md:flex flex-grow justify-center px-4 font-work-sans">
            <SearchBar className="w-full max-w-lg" />
          </div>

          {/* Right: Icon Group */}
          <div className="flex items-center space-x-1 font-work-sans">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center font-work-sans ml-auto mr-3">
              {/* Combined Credits and Notifications container */}
              <div className="relative flex items-center">
                {/* Credits */}
                <Link href="/billing">
                  <div className="flex items-center space-x-1 cursor-pointer font-work-sans">
                    <Image src="/coins.svg" alt="Credits" width={24} height={24} data-testid="coins-icon" />
                    <span className="text-[#333333] font-medium text-sm font-work-sans">{remainingCredits}</span>
                  </div>
                </Link>

                {/* Notifications - positioned directly adjacent to coins */}
                <div className="relative font-work-sans ml-1">
                  <Image
                    src="/bell.svg"
                    alt="Notifications"
                    width={24}
                    height={24}
                    className="w-6 h-6" />

                  {notificationsCount > 0 &&
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center font-work-sans">
                      {notificationsCount}
                    </span>
                  }
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 font-work-sans">

              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />

              </svg>
            </button>

            {/* User Button (visible on desktop) */}
            <div className="hidden md:block font-work-sans">
              {user &&
              <Link href="/settings">
                  <Image
                  src={profileImageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                  unoptimized />

                </Link>
              }
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
        user={user} />

    </>);

};

export default Header;