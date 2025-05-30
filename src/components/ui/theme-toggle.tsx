'use client';

import { useThemeToggle } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { cn } from '@/lib/utils';

/**
 * @component ThemeToggle
 * @category atom
 * @description A button that toggles between light and dark themes.
 * @returns {React.ReactElement} The rendered theme toggle button.
 * @example
 * <ThemeToggle />
 * @status 10th April
 * @author Custom
 * @since 2024-01-01
 */
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeToggle();
  const isDark = resolvedTheme === 'dark';

  // Determine the correct icon ID based on the theme
  const iconId = isDark ? 'faSunBrightLight' : 'faMoonLight';
  const iconLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={cn(
        'flex items-center group w-full justify-start px-0 py-0 rounded-md transition-all duration-150', // Base layout + transition
        isDark
          ? 'text-accent bg-background font-medium' // Active dark mode styles
          : 'text-foreground hover:text-accent hover:bg-muted/50' // Default + Hover styles
      )}
      aria-label={iconLabel}
    >
      {/* Use the standard Icon component */}
      <Icon
        iconId={iconId}
        className={cn(
          'h-5 w-5 mr-3 transition-colors duration-150', // Base size + transition
          isDark ? 'text-accent' : 'text-foreground group-hover:text-accent' // Conditional colors
        )}
      />

      {/* Text: Apply active color if dark, hover color otherwise */}
      <span
        className={cn(
          'text-sm font-medium truncate',
          isDark ? 'text-accent' : 'text-foreground group-hover:text-accent'
        )}
      >
        Dark Mode
      </span>
    </Button>
  );
}
