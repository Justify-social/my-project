"use client";

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { navItems, settingsItem } from "@/config/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  remainingCredits: number;
  notificationsCount: number;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  companyName,
  remainingCredits,
  notificationsCount,
}) => {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isNavItemActive = useCallback((href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const isChildActive = useCallback((parentHref: string, childHref: string) => {
    if (childHref === "/campaigns/wizard/step-1") {
      return pathname.startsWith("/campaigns/wizard");
    }
    return pathname === childHref || pathname.startsWith(childHref + "/");
  }, [pathname]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isExpanded = (href: string) => expandedItems.includes(href);

  const menuVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            ref={menuRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white z-50 flex flex-col outline-none"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            {/* Updated Header */}
            <div className="flex items-center justify-between p-2 border-b">
              {/* Logo and Company Name */}
              <div className="flex items-center space-x-3">
                <Image src="/logo.png" alt="Justify Logo" width={32} height={32} priority />
                <span className="font-semibold text-sm text-gray-900">{companyName}</span>
              </div>

              {/* User Actions Group */}
              <div className="flex items-center space-x-4">
                {isSignedIn && (
                  <>
                    {/* Credits */}
                    <Link href="/billing" className="flex items-center space-x-1">
                      <Image src="/coins.svg" alt="Credits" width={20} height={20} />
                      <span className="text-sm font-medium text-gray-700">{remainingCredits}</span>
                    </Link>
                    
                    {/* Notifications */}
                    <div className="relative">
                      <Image src="/bell.svg" alt="Notifications" width={20} height={20} />
                      {notificationsCount > 0 && (
                        <motion.span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-3.5 h-3.5 flex items-center justify-center text-[10px]">
                          {notificationsCount}
                        </motion.span>
                      )}
                    </div>

                    {/* UserButton */}
                    <UserButton afterSignOutUrl="/" />
                  </>
                )}

                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <motion.nav className="flex-1 px-2 py-1 overflow-y-auto">
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <div key={item.href} className="space-y-0.5">
                    {/* Main Menu Item */}
                    <div
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer ${
                        isNavItemActive(item.href)
                          ? 'bg-blue-50 text-[#00BFFF]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (item.children?.length) {
                          toggleExpanded(item.href);
                        } else {
                          onClose();
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {item.icon && (
                          <Image 
                            src={item.icon} 
                            alt="" 
                            width={16} 
                            height={16}
                            style={{
                              filter: isNavItemActive(item.href)
                                ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                                : "none",
                            }}
                          />
                        )}
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.children && (
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            isExpanded(item.href) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Submenu Items */}
                    {item.children && (
                      <AnimatePresence>
                        {isExpanded(item.href) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-6 overflow-hidden"
                          >
                            <div className="grid gap-0.5 py-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex items-center px-3 py-1 rounded-md text-xs ${
                                    isChildActive(item.href, child.href)
                                      ? 'text-[#00BFFF] bg-blue-50'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                  onClick={onClose}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}

                {/* Settings */}
                <Link
                  href={settingsItem.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md mt-1 ${
                    isNavItemActive(settingsItem.href)
                      ? 'bg-blue-50 text-[#00BFFF]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={onClose}
                >
                  {settingsItem.icon && (
                    <Image 
                      src={settingsItem.icon} 
                      alt="" 
                      width={16} 
                      height={16}
                      style={{
                        filter: isNavItemActive(settingsItem.href)
                          ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                          : "none",
                      }}
                    />
                  )}
                  <span className="text-sm font-medium">{settingsItem.label}</span>
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu; 