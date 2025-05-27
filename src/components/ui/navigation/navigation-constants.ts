/**
 * @file navigation-constants.ts
 * @description Single Source of Truth for navigation styling constants
 * SSOT: One place to change, updates everywhere
 */

// SSOT: Navigation icon sizing
export const NAVIGATION_CONSTANTS = {
  // Different sizes for different icons
  coinsSize: 'w-[25px] h-[25px]', // Coins: 25px
  bellSize: 'w-[27px] h-[27px]', // Bell: 27px
  profileSize: 'w-[27px] h-[27px]', // Profile: 27px
  iconGap: '13px', // 13px spacing

  // CSS classes to force exact sizes (overrides Button padding)
  forceCoinsSize: '[&_svg]:!w-[25px] [&_svg]:!h-[25px] [&_*]:!w-[25px] [&_*]:!h-[25px]',
  forceBellSize: '[&_svg]:!w-[27px] [&_svg]:!h-[27px] [&_*]:!w-[27px] [&_*]:!h-[27px]',
  forceProfileSize: '[&_svg]:!w-[27px] [&_svg]:!h-[27px] [&_*]:!w-[27px] [&_*]:!h-[27px]',

  // Icon styling
  defaultColor: 'text-foreground',
  hoverColor: 'text-accent',
  // Mobile menu
  showChildIcons: false,
} as const;
