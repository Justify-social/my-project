/**
 * @component Header
 * @category oragnism
 * @subcategory header
 * @description Main application header with navigation, search and user controls
 */
'use client';

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { MobileMenu, type MenuItem } from '@/components/ui/navigation/mobile-menu';
import { SearchBar } from '@/components/ui/search-bar';
import { Icon } from '@/components/ui/icon/icon';
import { iconExists } from '@/components/ui/icon/icons';
import { cn } from '@/lib/utils';
import { useSearch } from '@/providers/SearchProvider';
import { SearchResultsDisplay } from './search-results-display';

// Define NavItem locally
// interface NavItem {
//   label: string;
//   href: string;
//   icon: string;
// }

interface HeaderProps {
  companyName: string;
  remainingCredits: number;
  notificationsCount: number;
  profileImageUrl?: string;
  onMenuClick?: () => void;
  navItems?: MenuItem[];
  settingsNavItem?: MenuItem;
}

const Header: React.FC<HeaderProps> = ({
  companyName,
  remainingCredits,
  notificationsCount,
  profileImageUrl = "/icons/solid/user-circle.svg",
  onMenuClick,
  navItems,
  settingsNavItem
}) => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSearch, isSearching } = useSearch();

  // Define icon IDs directly
  const coinsIconId = "faCoinsLight";
  const hasCoinsIcon = iconExists(coinsIconId);

  const bellIconId = "faBellLight";
  const hasBellIcon = iconExists(bellIconId);

  const userIconId = "faUserCircleLight";
  const hasUserIcon = iconExists(userIconId);

  const menuIconId = "faBarsLight"; // Use Light variant from map
  const hasMenuIcon = iconExists(menuIconId);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-white border-b font-sora"
      data-testid="header" // Aid for testing
    >
      <div className="flex items-center justify-between px-4 py-3 font-work-sans">
        {/* Left: Logo & Company Name wrapped in Link to /dashboard */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Justify Logo"
            width={40}
            height={40}
            onError={(e) => {
              // Fallback for logo if image fails to load
              e.currentTarget.style.display = 'none';
              console.warn("Logo image failed to load");
            }}
          />
          <span className="font-bold text-black text-xl font-work-sans">{companyName}</span>
        </Link>

        {/* Center: Search Bar Container (hidden on mobile) */}
        <div className="hidden md:flex flex-grow justify-center px-4 font-work-sans">
          {/* Wrapper for SearchBar + Results - THIS is now relative */}
          <div className="relative w-full max-w-lg">
            <SearchBar
              className="w-full" // SearchBar itself doesn't need max-w-lg now, wrapper handles it
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              autoSearch={true}
              debounce={300}
              isLoading={isSearching}
            />
            {/* Results are positioned relative to the wrapper above */}
            <SearchResultsDisplay />
          </div>
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
                  {hasCoinsIcon ? (
                    <Icon
                      iconId="faCoinsSolid" // Use Solid ID directly
                      className="w-6 h-6 text-[var(--primary-color)]" // Set to primary color (black)
                      data-testid="coins-icon"
                    />
                  ) : (
                    // Fallback if icon doesn't exist
                    <div
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs"
                      title="Coins icon not found"
                    >
                      $
                    </div>
                  )}
                  <span className="text-[#333333] font-medium text-sm font-work-sans">{remainingCredits}</span>
                </div>
              </Link>

              {/* Notifications - positioned directly adjacent to coins */}
              <div className="relative font-work-sans ml-1">
                {hasBellIcon ? (
                  <Icon
                    iconId="faBellSolid" // Use Solid ID directly
                    className="w-6 h-6 text-[var(--primary-color)]" // Set to primary color (black)
                    title="Notifications"
                    data-testid="notifications-icon"
                  />
                ) : (
                  // Fallback if icon doesn't exist
                  <div
                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs"
                    title="Notifications icon not found"
                  >
                    N
                  </div>
                )}

                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center font-work-sans">
                    {notificationsCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 font-work-sans"
            aria-label="Toggle mobile menu"
            data-testid="mobile-menu-toggle"
          >
            {hasMenuIcon ? (
              <Icon
                iconId={menuIconId} // Already Light variant from variable
                className="w-6 h-6"
              />
            ) : (
              // Fallback using SVG if Font Awesome icon is not available
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
            )}
          </button>

          {/* User Button (visible on desktop) */}
          <div className="hidden md:block font-work-sans">
            {user && (
              <Link href="/settings">
                {hasUserIcon ? (
                  <Icon
                    iconId="faUserCircleSolid" // Use Solid ID directly
                    className="w-8 h-8 text-[var(--primary-color)]" // Set to primary color (black)
                    title="Profile"
                    data-testid="user-profile-icon"
                  />
                ) : user.picture ? (
                  // Use user profile picture if available and icon is missing
                  <Image
                    src={user.picture}
                    alt="User Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  // Ultimate fallback
                  <div
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs"
                    title="User profile icon not found"
                  >
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;
