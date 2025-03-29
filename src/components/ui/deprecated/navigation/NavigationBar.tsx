/**
 * @deprecated This component has been moved to src/components/ui/organisms/navigation/nav-bar
 * Please import from '@/components/ui/organisms/navigation/nav-bar' instead.
 */
import { 
  NavigationBar as OrgNavigationBar, 
  NavigationBarProps,
  NavItem
} from '../organisms/navigation/nav-bar';

export type { NavigationBarProps, NavItem };
export const NavigationBar = OrgNavigationBar;
export default NavigationBar; 