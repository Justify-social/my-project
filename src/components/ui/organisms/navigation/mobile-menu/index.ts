/**
 * Mobile Menu Component
 * 
 * Provides a responsive mobile menu for navigation.
 * 
 * Usage:
 * ```tsx
 * import { BaseMobileMenu, MobileMenu } from '@/components/ui/organisms/navigation/mobile-menu';
 * 
 * // Basic mobile menu
 * <BaseMobileMenu isOpen={isOpen} onClose={handleClose} items={navItems} />
 * 
 * // Application mobile menu with extended functionality
 * <MobileMenu 
 *   isOpen={isOpen} 
 *   onClose={handleClose} 
 *   navItems={navItems}
 *   settingsNavItem={settingsNavItem}
 *   remainingCredits={100}
 *   notificationsCount={3}
 *   companyName="Acme Corp"
 *   user={user}
 * />
 * ```
 */

export { BaseMobileMenu, MobileMenu } from './MobileMenu';
export { default } from './MobileMenu';
export type { BaseMobileMenuProps, MobileMenuProps } from './types'; 