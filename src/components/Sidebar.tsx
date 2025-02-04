// Sidebar.tsx

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
  { label: "Home", href: "/dashboard", icon: "/home.svg" },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: "/Campaigns.svg",
    children: [
      { label: "List", href: "/campaigns" },
      { label: "Wizard", href: "/campaigns/wizard" },
    ],
  },
  {
    label: "Creative Testing",
    href: "/creative-testing",
    icon: "/Creative_Asset_testing.svg",
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
  { label: "Brand Health", href: "/dashboard/brand-health", icon: "/Brand_Health.svg" },
  { label: "Influencers", href: "/dashboard/influencers", icon: "/Influencers.svg" },
  {
    label: "MMM",
    href: "/mmm-analysis",
    icon: "/MMM.svg",
    children: [
      { label: "Dashboard", href: "/mmm-analysis/dashboard" },
      { label: "Attribution", href: "/mmm-analysis/attribution" },
      { label: "Weightings", href: "/mmm-analysis/weightings" },
      { label: "Cross-channel", href: "/mmm-analysis/cross-channel" },
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

  // Determines if the provided href is the current (active) route.
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Responsive font sizes for main menu and submenu items.
  const mainFont = "text-sm md:text-base";
  const submenuFont = "text-xs md:text-sm";

  // Active main menu items use the accent blue; otherwise inherit the color.
  const activeClasses = `text-[#00BFFF] font-medium ${mainFont} px-3 py-2`;
  const defaultClasses = `text-inherit font-medium ${mainFont} px-3 py-2`;

  // Submenu items are indented more (using pl-12) and use dark grey when inactive.
  const activeSubmenuClasses = `text-[#00BFFF] font-medium ${submenuFont} pl-12`;
  const defaultSubmenuClasses = `text-[#4A5568] font-medium ${submenuFont} pl-12`;

  return (
    <aside data-testid="sidebar" className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-100 flex flex-col">
      {/* Navigation Items */}
      <nav aria-label="Sidebar Navigation" className="p-4 flex-grow">
        <ul className="list-none space-y-3">
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <li key={index}>
                <Link legacyBehavior href={item.href}>
                  <a className={`flex items-center gap-2 no-underline ${active ? activeClasses : defaultClasses}`}>
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt={`${item.label} icon`}
                        className="w-5 h-5"
                        style={{
                          filter: active
                            ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                            : "none",
                        }}
                      />
                    )}
                    <span>{item.label}</span>
                  </a>
                </Link>
                {item.children && active && (
                  <ul className="list-none mt-1 space-y-1">
                    {item.children.map((child, childIndex) => {
                      const childActive =
                        pathname === child.href ||
                        pathname.startsWith(child.href + "/");
                      return (
                        <li key={childIndex}>
                          <Link legacyBehavior href={child.href}>
                            <a className={`no-underline ${childActive ? activeSubmenuClasses : defaultSubmenuClasses}`}>
                              {child.label}
                            </a>
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
      {/* Settings fixed at the bottom left */}
      <div className="px-4 py-3 border-t border-gray-300">
        <Link legacyBehavior href={settingsNavItem.href}>
          <a className={`flex items-center gap-2 no-underline ${isActive(settingsNavItem.href) ? activeClasses : defaultClasses}`}>
            {settingsNavItem.icon && (
              <img
                src={settingsNavItem.icon}
                alt={`${settingsNavItem.label} icon`}
                className="w-5 h-5"
                style={{
                  filter: isActive(settingsNavItem.href)
                    ? "invert(62%) sepia(96%) saturate(3318%) hue-rotate(179deg) brightness(97%) contrast(101%)"
                    : "none",
                }}
              />
            )}
            <span>{settingsNavItem.label}</span>
          </a>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
