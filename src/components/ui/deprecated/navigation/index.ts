/**
 * Navigation Components
 * 
 * @deprecated These components have been moved to the atomic design structure.
 * Tabs components are now in src/components/ui/molecules/Tabs
 * NavigationBar is now in src/components/ui/organisms/navigation/nav-bar
 * ComponentNav is now in src/components/ui/organisms/navigation/component-nav
 */

// Export components
export { default as Header } from '@/components/layouts/Header';
export { default as MobileMenu } from '@/components/features/content/MobileMenu';
export { default as Sidebar } from '@/components/layouts/Sidebar';

// Export Tabs components
export * from './Tabs';

// Export CustomTabs
export * from './CustomTabs';
export { default as CustomTabs } from './CustomTabs';

// Export ComponentNav
export * from './ComponentNav';
export { default as ComponentNav } from './ComponentNav';

// Export NavigationBar
export * from './NavigationBar';
export { default as NavigationBar } from './NavigationBar';
