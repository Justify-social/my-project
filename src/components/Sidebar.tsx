import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";

interface User {
  role: string;
  name?: string;
}

interface SidebarProps {
  user?: User;
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  // ... (your nav items as before)
];

const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "/Settings.svg",
};

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSidebar();
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, closeSidebar]);

  function isNavItemActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isChildActive(parentHref: string, childHref: string) {
    // ... (same logic as before)
    if (childHref === "/campaigns/wizard/step-1") {
      return pathname.startsWith("/campaigns/wizard");
    }
    if (parentHref === "/influencers/marketplace") {
      if (childHref === "/influencers/marketplace") {
        return (
          pathname === "/influencers/marketplace" ||
          pathname.startsWith("/influencers/marketplace/")
        );
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
  }

  const mainFont = "text-sm md:text-base";
  const submenuFont = "text-xs md:text-sm";
  const activeClasses = `text-[#00BFFF] font-medium ${mainFont} px-3 py-2`;
  const defaultClasses = `text-inherit font-medium ${mainFont} px-3 py-2`;
  const activeSubmenuClasses = `text-[#00BFFF] font-medium ${submenuFont} pl-12`;
  const defaultSubmenuClasses = `text-[#4A5568] font-medium ${submenuFont} pl-12`;

  const renderNavItems = () => (
    <ul className="list-none space-y-3">
      {navItems.map((item, index) => {
        const parentIsActive = isNavItemActive(item.href);
        const childIsActive = item.children?.some(child => isChildActive(item.href, child.href));
        const active = parentIsActive || childIsActive;
        return (
          <li key={index}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 no-underline ${active ? activeClasses : defaultClasses}`}
              onClick={closeSidebar}
            >
              {item.icon && (
                <img
                  src={item.icon}
                  alt={`${item.label} icon`}
                  className="w-5 h-5"
                  onError={(e) => {
                    console.error(`Failed to load icon: ${item.icon}`);
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                  }}
                  style={{
                    filter: active
                      ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                      : "none",
                  }}
                />
              )}
              <span>{item.label}</span>
            </Link>
            {item.children && active && (
              <ul className="list-none mt-1 space-y-1">
                {item.children.map((child, childIndex) => {
                  const childActiveResult = isChildActive(item.href, child.href);
                  return (
                    <li key={childIndex}>
                      <Link
                        href={child.href}
                        className={`no-underline ${childActiveResult ? activeSubmenuClasses : defaultSubmenuClasses}`}
                        onClick={closeSidebar}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile full-screen sidebar overlay */}
      {isSidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="md:hidden fixed inset-0 z-40 bg-gray-100 flex flex-col transition-opacity duration-300"
        >
          {/* Close button in top-right */}
          <button
            ref={closeButtonRef}
            onClick={closeSidebar}
            aria-label="Close navigation menu"
            className="absolute top-4 right-4 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Mobile header items: credits, search, notifications, profile */}
          <div className="flex items-center justify-around p-4 border-b">
            <Link href="/billing" onClick={closeSidebar}>
              <div className="flex flex-col items-center">
                <Image src="/coins.svg" alt="Credits" width={24} height={24} />
                <span className="text-xs">{/* Optionally show remaining credits */}</span>
              </div>
            </Link>
            <button onClick={closeSidebar}>
              <Image src="/magnifying-glass.svg" alt="Search" width={24} height={24} />
            </button>
            <div className="relative">
              <Image src="/bell.svg" alt="Notifications" width={24} height={24} />
              {/* Optionally add notification count */}
            </div>
            <Link href="/settings" onClick={closeSidebar}>
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={user?.picture || "/profile-image.svg"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(`Failed to load profile image: ${user?.picture || "/profile-image.svg"}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "/profile-image.svg";
                    target.onerror = null;
                  }}
                />
              </div>
            </Link>
          </div>
          <nav aria-label="Sidebar Navigation" className="mt-4 p-4 flex-grow overflow-auto">
            {renderNavItems()}
          </nav>
          {/* Bottom "Settings" section */}
          <div className="px-4 py-3 border-t border-gray-300">
            <Link
              href={settingsNavItem.href}
              className={`flex items-center gap-2 no-underline ${isNavItemActive(settingsNavItem.href) ? activeClasses : defaultClasses}`}
              onClick={closeSidebar}
            >
              {settingsNavItem.icon && (
                <img
                  src={settingsNavItem.icon}
                  alt={`${settingsNavItem.label} icon`}
                  className="w-5 h-5"
                  style={{
                    filter: isNavItemActive(settingsNavItem.href)
                      ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                      : "none",
                  }}
                />
              )}
              <span>{settingsNavItem.label}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-100 flex-col">
        <nav aria-label="Sidebar Navigation" className="p-4 flex-grow overflow-auto">
          {renderNavItems()}
        </nav>
        <div className="px-4 py-3 border-t border-gray-300">
          <Link
            href={settingsNavItem.href}
            className={`flex items-center gap-2 no-underline ${isNavItemActive(settingsNavItem.href) ? activeClasses : defaultClasses}`}
          >
            {settingsNavItem.icon && (
              <img
                src={settingsNavItem.icon}
                alt={`${settingsNavItem.label} icon`}
                className="w-5 h-5"
                style={{
                  filter: isNavItemActive(settingsNavItem.href)
                    ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                    : "none",
                }}
              />
            )}
            <span>{settingsNavItem.label}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
