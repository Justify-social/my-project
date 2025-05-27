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
import { NotificationCenter } from '@/components/ui/notifications/NotificationCenter';

// Define NavItem locally
// interface NavItem {
//   label: string;
//   href: string;
//   icon: string;
// }

interface HeaderProps {
  companyName: string;
  remainingCredits: number;
  onMenuClick?: () => void;
  authControls?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  companyName,
  remainingCredits: _remainingCredits,
  onMenuClick,
  authControls,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { handleSearch, isSearching } = useSearch();

  // Define icon IDs directly
  const coinsIconId = 'faCoinsLight';
  const hasCoinsIcon = iconExists(coinsIconId);

  const menuIconId = 'faBarsLight'; // Use Light variant from map
  const hasMenuIcon = iconExists(menuIconId);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 bg-background border-b"
      data-testid="header" // Aid for testing
      data-cy="main-header"
    >
      <div className="flex items-center justify-between px-4 py-3" data-cy="header-container">
        {/* Left: Logo & Company Name wrapped in Link to /dashboard */}
        <Link href="/dashboard" className="flex items-center space-x-2" data-cy="header-logo">
          <Image
            src="/logo.png"
            alt="Justify Logo"
            width={40}
            height={40}
            data-cy="logo-image"
            onError={e => {
              e.currentTarget.style.display = 'none';
              // console.warn('Logo image failed to load');
            }}
          />
          <span
            className="font-black text-foreground text-xl"
            data-cy="company-name"
            style={{ fontWeight: 700 }}
          >
            {companyName}
          </span>
        </Link>

        {/* Center: Search Bar Container (hidden on mobile) */}
        <div
          className="hidden md:flex flex-grow justify-center px-4"
          data-cy="header-search-container"
        >
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
        <div className="flex items-center space-x-4 md:space-x-6" data-cy="header-actions">
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4" data-cy="desktop-actions">
            {/* Credits */}
            <Link
              href="/account/billing"
              className="flex items-center space-x-1 cursor-pointer"
              data-cy="credits-button"
            >
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
                >
                  $
                </div>
              )}
            </Link>

            {/* Notifications - using NotificationCenter component */}
            <NotificationCenter data-cy="notifications-button" />
          </div>

          {/* Render Clerk Auth Controls (passed as prop) - visible on desktop */}
          <div className="hidden md:block" data-cy="auth-controls">
            {authControls}
          </div>

          {/* Mobile Menu Button - Conditionally Rendered */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2"
            aria-label="Toggle mobile menu"
            data-testid="mobile-menu-toggle"
            data-cy="mobile-menu-button"
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
