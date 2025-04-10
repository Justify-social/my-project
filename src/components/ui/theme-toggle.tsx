"use client"

import { useThemeToggle } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon/icon"
import { cn } from "@/lib/utils"

/**
 * @component ThemeToggle
 * @category atom
 * @description A button that toggles between light and dark themes.
 * @returns {React.ReactElement} The rendered theme toggle button.
 * @example
 * <ThemeToggle />
 * @status stable
 * @author Custom
 * @since 2024-01-01
 */
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeToggle()
  const isDark = resolvedTheme === "dark"

  // Determine the correct icon ID based on the theme
  const iconId = isDark ? "faSunBrightLight" : "faMoonLight"
  const iconLabel = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={cn(
        "flex items-center group w-full justify-start px-0 py-0 rounded-md transition-all duration-150", // Base layout + transition
        isDark
          ? 'text-Accent bg-white font-medium' // Active dark mode styles
          : 'text-Primary hover:text-Accent hover:bg-gray-100' // Default + Hover styles (Adjusted hover background)
      )}
      aria-label={iconLabel}
    >
      {/* Use the standard Icon component */}
      <Icon
        iconId={iconId}
        className={cn(
          "h-5 w-5 mr-3 transition-colors duration-150", // Base size + transition
          isDark ? "text-Accent" : "text-Primary group-hover:text-Accent" // Conditional colors
        )}
      />

      {/* Text: Apply active color if dark, hover color otherwise */}
      <span className={cn(
        "text-sm font-sora font-medium truncate",
        isDark ? "text-Accent" : "text-Primary group-hover:text-Accent"
      )}>
        Dark Mode
      </span>
    </Button>
  )
} 