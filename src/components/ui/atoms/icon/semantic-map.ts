/**
 * Semantic Icon Mapping - Single Source of Truth (SSOT)
 * 
 * This file provides a centralized mapping between semantic/friendly names and
 * their corresponding icon IDs. By using this map, components can reference
 * icons by their semantic meaning rather than specific technical names.
 * 
 * USAGE:
 * import { UI_ICON_MAP } from '@/components/ui/atoms/icon/semantic-map';
 * 
 * const MyComponent = () => (
 *   <Icon iconId={UI_ICON_MAP.calendar} />
 * );
 * 
 * @author MIT Professor Implementation
 * @created 2024-04-15
 */

/**
 * UI Icon Map - Maps semantic names to icon IDs with explicit Light/Solid variants
 */
export const UI_ICON_MAP: Record<string, string> = {
  // Navigation Icons
  "arrowLeft": "faArrowLeftLight",
  "arrowRight": "faArrowRightLight",
  "arrowUp": "faArrowUpLight",
  "arrowDown": "faArrowDownLight",
  "chevronLeft": "faChevronLeftLight",
  "chevronRight": "faChevronRightLight",
  "chevronUp": "faChevronUpLight",
  "chevronDown": "faChevronDownLight",
  "anglesLeft": "faAnglesLeftLight",
  "anglesRight": "faAnglesRightLight",
  
  // Action Icons
  "add": "faPlusLight",
  "edit": "faPenLight",
  "delete": "faTrashLight",
  "save": "faSaveLight",
  "close": "faXmarkLight",
  "check": "faCheckLight",
  "search": "faMagnifyingGlassLight",
  "filter": "faFilterLight",
  "upload": "faUploadLight",
  "download": "faDownloadLight",
  "copy": "faCopyLight",
  "link": "faLinkLight",
  "play": "faPlayLight",
  "pause": "faPauseLight",
  "stop": "faStopLight",
  
  // Status/Notification Icons
  "info": "faInfoCircleLight",
  "warning": "faTriangleExclamationLight",
  "error": "faCircleXmarkLight",
  "success": "faCircleCheckLight",
  "bell": "faBellLight",
  
  // Interface Icons
  "menu": "faBarsLight",
  "more": "faEllipsisVerticalLight",
  "settings": "faGearLight",
  "home": "faHomeLight",
  "user": "faUserLight",
  "calendar": "faCalendarLight",
  "folder": "faFolderLight",
  
  // Data Visualization Icons
  "chartLine": "faChartLineLight",
  "chartBar": "faChartBarLight",
  "chartPie": "faChartPieLight",
  
  // Feedback/Messaging Icons
  "comment": "faCommentLight",
  "mail": "faEnvelopeLight",
  
  // Business/Commerce Icons
  "dollarSign": "faDollarSignLight",
  "tag": "faTagLight",
  "coins": "faCoinsLight",
  
  // Concepts/Ideas
  "lightBulb": "faLightbulbLight",
  "bookmark": "faBookmarkLight",
  "bolt": "faBoltLight",
  "lightning": "faBoltLight",
  
  // People/Social Icons
  "userCircle": "faUserCircleLight",
  "userGroup": "faUserGroupLight",
  
  // Objects/Content
  "photo": "faImageLight",
  "documentText": "faFileLinesLight",
  "building": "faBuildingLight",
  "globe": "faGlobeLight",
  
  // KPIs/Trends
  "trendUp": "faArrowTrendUpLight",
  "trendDown": "faArrowTrendDownLight",
  "circleCheck": "faCircleCheckLight"
};

/**
 * Gets the solid variant of a UI icon (for hover states)
 * @param iconKey The semantic key from UI_ICON_MAP
 * @returns The solid variant of the icon, or the original if key not found
 */
export function getSolidUIIcon(iconKey: string): string {
  const lightIcon = UI_ICON_MAP[iconKey];
  if (!lightIcon) return '';
  
  // Replace Light with Solid in the icon name
  return lightIcon.replace(/Light$/, 'Solid');
}

export default UI_ICON_MAP; 