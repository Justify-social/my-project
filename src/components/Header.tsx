import Link from "next/link";
import Image from "next/image";
import React from "react";

interface HeaderProps {
  companyName: string;
  remainingCredits: number;
  notificationsCount: number;
  profileImageUrl: string;
}

const Header: React.FC<HeaderProps> = ({
  companyName,
  remainingCredits,
  notificationsCount,
  profileImageUrl,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Justify Logo" width={40} height={40} />
          <span className="font-bold text-black text-xl">{companyName}</span>
        </div>

        {/* Center (or right on medium+ screens): Search Bar */}
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
          {/* Coins/Credits - Wrapped in Link to /billing */}
          <Link href="/billing">
            <div className="flex items-center space-x-1 cursor-pointer">
              <Image
                src="/coins.svg"
                alt="Credits"
                width={24}
                height={24}
                data-testid="coins-icon"
              />
              <span className="hidden md:inline text-[#333333] font-medium text-sm">
                {remainingCredits}
              </span>
            </div>
          </Link>

          {/* Search icon for small screens */}
          <div className="md:hidden">
            <Image src="/magnifying-glass.svg" alt="Search" width={24} height={24} />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Image src="/bell.svg" alt="Notifications" width={24} height={24} />
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </div>

          {/* Profile Image - Wrapped in Link to /settings */}
          <Link href="/settings">
            <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
              <Image src={profileImageUrl} alt="Profile" width={32} height={32} />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
