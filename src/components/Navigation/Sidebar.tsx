import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/providers/SidebarProvider";
import { navItems, settingsNavItem, type NavItem } from "@/config/navigation";

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface SidebarProps {
  user?: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  // Returns true if the main nav item is active.
  function isNavItemActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  /**
   * Checks if a submenu item is active.
   *
   * Special cases:
   * 1. For Campaigns Wizard, if the child href is "/campaigns/wizard/step-1",
   *    we consider it active if the pathname starts with "/campaigns/wizard".
   * 2. For Influencers, we prevent "/influencers/marketplace" from highlighting "List".
   */
  function isChildActive(parentHref: string, childHref: string) {
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

  // Updated dynamic font classes with more granular breakpoints
  const mainFont = "text-xs sm:text-sm lg:text-base transition-all duration-200";
  const submenuFont = "text-[10px] sm:text-xs lg:text-sm transition-all duration-200";

  const activeClasses = `text-[#00BFFF] font-medium ${mainFont} px-2 sm:px-3 py-1.5 sm:py-2`;
  const defaultClasses = `text-inherit font-medium ${mainFont} px-2 sm:px-3 py-1.5 sm:py-2`;

  const activeSubmenuClasses = `text-[#00BFFF] font-medium ${submenuFont} pl-8 sm:pl-10 lg:pl-12`;
  const defaultSubmenuClasses = `text-[#4A5568] font-medium ${submenuFont} pl-8 sm:pl-10 lg:pl-12`;

  return (
    <aside
      data-testid="sidebar"
      className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)]
        w-48 sm:w-56 lg:w-64 bg-[#f5f5f5] flex flex-col
        transition-all duration-300 ease-in-out
        hidden md:flex
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav aria-label="Sidebar Navigation" className="p-2 sm:p-3 lg:p-4 flex-grow overflow-auto">
        <ul className="list-none space-y-1 sm:space-y-2">
          {navItems.map((item, index) => {
            const active = isNavItemActive(item.href);
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-1.5 sm:gap-2 no-underline ${
                    active ? activeClasses : defaultClasses
                  }`}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200"
                      style={{
                        filter: active
                          ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                          : "none",
                      }}
                    />
                  )}
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                </Link>
                {item.children && active && (
                  <ul className="list-none mt-1 space-y-1">
                    {item.children.map((child, childIndex) => {
                      const childActive = isChildActive(item.href, child.href);
                      return (
                        <li key={childIndex}>
                          <Link
                            href={child.href}
                            className={`no-underline block py-1 ${
                              childActive ? activeSubmenuClasses : defaultSubmenuClasses
                            }`}
                          >
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {child.label}
                            </span>
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
      </nav>
      
      {/* Settings section */}
      <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border-t border-gray-300">
        <Link
          href={settingsNavItem.href}
          className={`flex items-center gap-1.5 sm:gap-2 no-underline ${
            isNavItemActive(settingsNavItem.href) ? activeClasses : defaultClasses
          }`}
        >
          {settingsNavItem.icon && (
            <img
              src={settingsNavItem.icon}
              alt={`${settingsNavItem.label} icon`}
              className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200"
              style={{
                filter: isNavItemActive(settingsNavItem.href)
                  ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                  : "none",
              }}
            />
          )}
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {settingsNavItem.label}
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
