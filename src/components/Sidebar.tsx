import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

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
  icon?: string; // Path to an SVG icon in the public folder.
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "/Home.svg" },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: "/Campaigns.svg",
    children: [
      { label: "List", href: "/campaigns" },
      { label: "Wizard", href: "/campaigns/wizard/step-1" },
    ],
  },
  {
    label: "Creative Testing",
    href: "/creative-testing",
    icon: "/Creative_Asset_Testing.svg",
    children: [
      { label: "List", href: "/creative-testing/list" },
      { label: "Reports", href: "/creative-testing/reports" },
    ],
  },
  {
    label: "Brand Lift",
    href: "/brand-lift",
    icon: "/Brand_Lift.svg",
    children: [
      { label: "List", href: "/brand-lift/list" },
      { label: "Reports", href: "/brand-lift/reports" },
    ],
  },
  { label: "Brand Health", href: "/brand-health", icon: "/Brand_Health.svg" },
  {
    label: "Influencers",
    // The parent link itself points to Marketplace:
    href: "/influencers/marketplace",
    icon: "/Influencers.svg",
    children: [
      { label: "Marketplace", href: "/influencers/marketplace" },
      { label: "List", href: "/influencers" },
    ],
  },
  {
    label: "MMM",
    href: "/mmm",
    icon: "/MMM.svg",
    children: [
      { label: "Dashboard", href: "/mmm/dashboard" },
      { label: "Attribution", href: "/mmm/attribution" },
      { label: "Weightings", href: "/mmm/weightings" },
      { label: "Cross-channel", href: "/mmm/cross-channel" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "/Reports.svg",
    children: [
      { label: "Insight", href: "/reports/insight" },
      { label: "Dashboard", href: "/reports/dashboard" },
    ],
  },
  { label: "Billing", href: "/billing", icon: "/Billing.svg" },
  { label: "Help", href: "/help", icon: "/Help.svg" },
];

const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "/Settings.svg",
};

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
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
    // Special case for Campaigns Wizard.
    if (childHref === "/campaigns/wizard/step-1") {
      return pathname.startsWith("/campaigns/wizard");
    }

    // Special handling for Influencers.
    if (parentHref === "/influencers/marketplace") {
      if (childHref === "/influencers/marketplace") {
        return (
          pathname === "/influencers/marketplace" ||
          pathname.startsWith("/influencers/marketplace/")
        );
      } else if (childHref === "/influencers") {
        // "List" is active if the path is "/influencers" or deeper,
        // BUT must not be active if the path starts with "/influencers/marketplace".
        if (pathname.startsWith("/influencers/marketplace")) {
          return false;
        }
        return pathname === "/influencers" || pathname.startsWith("/influencers/");
      }
      return false;
    }

    // If a child has the same href as its parent, require an exact match.
    if (childHref === parentHref) {
      return pathname === childHref;
    }

    // Normal rule for all other submenu items.
    return pathname === childHref || pathname.startsWith(childHref + "/");
  }

  const mainFont = "text-sm md:text-base";
  const submenuFont = "text-xs md:text-sm";

  const activeClasses = `text-[#00BFFF] font-medium ${mainFont} px-3 py-2`;
  const defaultClasses = `text-inherit font-medium ${mainFont} px-3 py-2`;

  const activeSubmenuClasses = `text-[#00BFFF] font-medium ${submenuFont} pl-12`;
  const defaultSubmenuClasses = `text-[#4A5568] font-medium ${submenuFont} pl-12`;

  return (
    <aside
      data-testid="sidebar"
      className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-100 flex flex-col"
    >
      <nav aria-label="Sidebar Navigation" className="p-4 flex-grow">
        <ul className="list-none space-y-3">
          {navItems.map((item, index) => {
            const parentIsActive = isNavItemActive(item.href);
            const childIsActive = item.children?.some((child) =>
              isChildActive(item.href, child.href)
            );
            const active = parentIsActive || childIsActive;

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 no-underline ${
                    active ? activeClasses : defaultClasses
                  }`}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="w-5 h-5"
                      onError={(e) => {
                        console.error(`Failed to load icon: ${item.icon}`);
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
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
                            className={`no-underline ${
                              childActiveResult
                                ? activeSubmenuClasses
                                : defaultSubmenuClasses
                            }`}
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
      </nav>
      {/* Bottom "Settings" section */}
      <div
        className="px-4 py-3 border-t border-gray-300"
        style={{ height: "65px" }}
      >
        <Link
          href={settingsNavItem.href}
          className={`flex items-center gap-2 no-underline ${
            isNavItemActive(settingsNavItem.href) ? activeClasses : defaultClasses
          }`}
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
  );
};

export default Sidebar;
