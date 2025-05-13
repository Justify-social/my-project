/**
 * @component Header
 * @category oragnism
 * @subcategory header
 * @description Main application header with navigation, search and user controls
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { Icon } from '@/components/ui/icon/icon';
import { iconExists } from '@/components/ui/icon/icons';
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
  onMenuClick?: () => void;
  authControls?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  companyName,
  remainingCredits,
  notificationsCount,
  onMenuClick,
  authControls,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSearch, isSearching } = useSearch();

  // Define icon IDs directly
  const coinsIconId = 'faCoinsLight';
  const hasCoinsIcon = iconExists(coinsIconId);

  const bellIconId = 'faBellLight';
  const hasBellIcon = iconExists(bellIconId);

  const menuIconId = 'faBarsLight'; // Use Light variant from map
  const hasMenuIcon = iconExists(menuIconId);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-background border-b font-heading"
      data-testid="header" // Aid for testing
    >
      <div className="flex items-center justify-between px-4 py-3 font-body">
        {/* Left: Logo & Company Name wrapped in Link to /dashboard */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <>
            <Image
              src="/logo.png"
              alt="Justify Logo"
              width={40}
              height={40}
              onError={e => {
                e.currentTarget.style.display = 'none';
                // console.warn('Logo image failed to load');
              }}
            />
            <span className="font-bold text-foreground text-xl font-body">{companyName}</span>
          </>
        </Link>

        {/* Center: Search Bar Container (hidden on mobile) */}
        <div className="hidden md:flex flex-grow justify-center px-4 font-body">
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
        <div className="flex items-center space-x-4 md:space-x-6 font-body">
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4 font-body">
            {/* Credits */}
            <Link href="/account/billing" className="flex items-center space-x-1 cursor-pointer font-body">
              {hasCoinsIcon ? (
                <Icon
                  iconId="faCoinsSolid" // Use Solid ID directly
                  className="w-6 h-6 text-foreground" // Changed to text-foreground
                  data-testid="coins-icon"
                />
              ) : (
                <div
                  className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs"
                  title="Coins icon not found"
                >$
                </div>
              )}
            </Link>

            {/* Notifications - positioned directly adjacent to coins */}
            <div className="relative font-body">
              {hasBellIcon ? (
                <Icon
                  iconId="faBellSolid" // Use Solid ID directly
                  className="w-6 h-6 text-foreground" // Changed to text-foreground
                  title="Notifications"
                  data-testid="notifications-icon"
                />
              ) : (
                // Fallback if icon doesn't exist
                (<div
                  className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs"
                  title="Notifications icon not found"
                >N
                </div>)
              )}

              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-background rounded-full text-xs w-4 h-4 flex items-center justify-center font-body">
                  {notificationsCount}
                </span>
              )}
            </div>
          </div>

          {/* Render Clerk Auth Controls (passed as prop) - visible on desktop */}
          <div className="hidden md:block font-body">{authControls}</div>

          {/* Mobile Menu Button - Conditionally Rendered */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 font-body"
            aria-label="Toggle mobile menu"
            data-testid="mobile-menu-toggle"
          >
            {hasMenuIcon ? (
              <Icon iconId={menuIconId} className="w-6 h-6" />
            ) : (
              <Icon iconId="faBarsLight" className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;
