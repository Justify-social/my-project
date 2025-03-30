/**
 * @deprecated This component has been moved to src/components/ui/organisms/navigation/mobile-menu
 import { MobileMenu } from '@/components/ui/organisms/navigation/mobile-menu/MobileMenu'
 */

import { 
  MobileMenu as UIMobileMenu,
  MobileMenuProps as UIMobileMenuProps
} from '@/components/ui/organisms/navigation/mobile-menu';

export type { UIMobileMenuProps as MobileMenuProps };
export const MobileMenu = UIMobileMenu;
export default MobileMenu; 