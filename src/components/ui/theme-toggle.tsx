"use client"

import { useThemeToggle } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * @component ThemeToggle
 * @category atom
 * @description A button that toggles between light and dark themes.
 * @returns {React.ReactElement} The rendered theme toggle button.
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useThemeToggle()
  const isDark = resolvedTheme === "dark"; // Check if dark mode is active

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      // Apply active styles conditionally based on isDark
      className={cn(
        "flex items-center group w-full justify-start px-0 py-0 rounded-md transition-all duration-150", // Base layout + transition
        isDark
          ? 'text-[#00BFFF] bg-[#fafafa] font-medium' // Active dark mode styles (accent text, light bg)
          : 'text-[#333333] hover:text-[#00BFFF] hover:bg-[#fafafa]' // Default + Hover styles
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {/* Icon: Apply active color if dark, hover color otherwise */}
      {isDark ? (
        <SunIcon className={cn("h-5 w-5 mr-3", isDark ? "text-[#00BFFF]" : "group-hover:text-[#00BFFF]")} />
      ) : (
        <MoonIcon className={cn("h-5 w-5 mr-3", isDark ? "text-[#00BFFF]" : "group-hover:text-[#00BFFF]")} />
      )}
      {/* Text: Apply active color if dark, hover color otherwise */}
      <span className={cn(
        "text-sm font-sora font-medium truncate",
        isDark ? "text-[#00BFFF]" : "text-[#333333] group-hover:text-[#00BFFF]"
      )}>
        Dark Mode
      </span>
    </Button>
  )
}

/**
 * @component MoonIcon
 * @category atom
 * @description Moon icon for dark mode toggle
 */
function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  )
}

/**
 * @component SunIcon
 * @category atom
 * @description Sun icon for light mode toggle
 */
function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  )
} 