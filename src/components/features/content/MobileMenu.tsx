import React, { useCallback, useRef, useState } from 'react';
import HTMLDivElement from '../../ui/radio/types/index';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from "@auth0/nextjs-auth0/client";
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/configs/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  settingsNavItem: NavItem;
  remainingCredits: number;
  notificationsCount: number;
  companyName: string;
  user?: any;
}

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  settingsNavItem,
  remainingCredits,
  notificationsCount,
  companyName,
  user
}: MobileMenuProps) => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isNavItemActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const isChildActive = useCallback((parentHref: string, childHref: string) => {
    if (childHref === "/campaigns/wizard/step-1") {
      return pathname.startsWith("/campaigns/wizard");
    }
    if (parentHref === "/influencers/marketplace") {
      if (childHref === "/influencers/marketplace") {
        return (
          pathname === "/influencers/marketplace" ||
          pathname.startsWith("/influencers/marketplace/"));

      } else if (childHref === "/influencers") {
        if (pathname.startsWith("/influencers/marketplace")) {
          return false;
        }
        return pathname === "/influencers" || pathname.startsWith("/influencers/");
      }
      return false;
    }
    if (childHref === parentHref) {
      return pathname === childHref;
    }
    return pathname === childHref || pathname.startsWith(childHref + "/");
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) =>
    prev.includes(href) ?
    prev.filter((item) => item !== href) :
    [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  const handleSignOut = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={onClose} />

          
          <motion.div
          ref={menuRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
          tabIndex={-1}
          role="dialog"
          aria-modal="true">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b font-work-sans">
              <div className="flex items-center space-x-3 font-work-sans">
                <Image src="/logo.png" alt="Justify Logo" width={32} height={32} priority />
                <span className="font-semibold text-gray-900 font-work-sans">{companyName}</span>
              </div>

              <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full font-work-sans"
              aria-label="Close menu">

                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b font-work-sans">
              <div className="flex items-center space-x-3 font-work-sans">
                <Image
                src="/icons/app/profile-image.svg"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full" />

                <div className="font-work-sans">
                  <div className="font-medium font-work-sans">{user?.name}</div>
                  <div className="text-sm text-gray-500 font-work-sans">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto font-work-sans">
              <div className="space-y-2 font-work-sans">
                {navItems.map((item) => {
                // Force "Home" to use "/dashboard"
                const linkHref = item.label === "Home" ? "/dashboard" : item.href;
                const active = isNavItemActive(linkHref);
                return (
                  <div key={linkHref} className="space-y-0.5 font-work-sans">
                      {/* Main Menu Item */}
                      <div
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer ${
                      active ?
                      'bg-blue-50 text-[#00BFFF]' :
                      'text-gray-700 hover:bg-gray-50'} font-work-sans`
                      }
                      onClick={() => {
                        if (item.children?.length) {
                          toggleExpanded(linkHref);
                        } else {
                          onClose();
                        }
                      }}>

                        <div className="flex items-center space-x-2 font-work-sans">
                          {item.icon &&
                        <Image
                          src={item.icon}
                          alt=""
                          width={16}
                          height={16}
                          style={{
                            filter: active ?
                            "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)" :
                            "none"
                          }} />

                        }
                          <span className="text-sm font-medium font-work-sans">{item.label}</span>
                        </div>
                        {item.children &&
                      <svg
                        className={`w-4 h-4 transition-transform ${
                        isExpanded(linkHref) ? 'rotate-180' : ''}`
                        }
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">

                            <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7" />

                          </svg>
                      }
                      </div>

                      {/* Submenu Items */}
                      {item.children &&
                    <AnimatePresence>
                          {isExpanded(linkHref) &&
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 overflow-hidden">

                              <div className="grid gap-0.5 py-1 font-work-sans">
                                {item.children.map((child) =>
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center px-3 py-1 rounded-md text-xs ${
                            isChildActive(linkHref, child.href) ?
                            'text-[#00BFFF] bg-blue-50' :
                            'text-gray-600 hover:bg-gray-50'} font-work-sans`
                            }
                            onClick={onClose}>

                                    {child.label}
                                  </Link>
                          )}
                              </div>
                            </motion.div>
                      }
                        </AnimatePresence>
                    }
                    </div>);

              })}

                {/* Settings */}
                <Link
                href={settingsNavItem.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md mt-1 ${
                isNavItemActive(settingsNavItem.href) ?
                'bg-blue-50 text-[#00BFFF]' :
                'text-gray-700 hover:bg-gray-50'}`
                }
                onClick={onClose}>

                  {settingsNavItem.icon &&
                <Image
                  src={settingsNavItem.icon}
                  alt=""
                  width={16}
                  height={16}
                  style={{
                    filter: isNavItemActive(settingsNavItem.href) ?
                    "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)" :
                    "none"
                  }} />

                }
                  <span className="text-sm font-medium font-work-sans">{settingsNavItem.label}</span>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t font-work-sans">
              <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 font-work-sans">

                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

};

export default MobileMenu;