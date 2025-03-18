import { 
  faSearch, faPlus, faMinus, faXmark, faCheck,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faUser, faCog, faEnvelope, faCalendarDays, faTrash,
  faTriangleExclamation, faCircleInfo, faBell,
  faCircleCheck, faLightbulb, faCommentDots,
  faEye, faPen, faCopy, faTrashCan,
  faHeart, faStar, faBookmark, faShare,
  faDownload, faUpload, faList, faFilter,
  faTableCells, faListCheck, faTag, faLock,
  faUnlock, faKey, faPaperclip,
  // Add missing icons
  faPlay,
  faFile, 
  faFileLines,
  faHome,
  faChartBar,
  faChartPie,
  faMoneyBill,
  faBolt,
  faGlobe,
  faUserGroup,
  faBuilding,
  faRocket,
  faSignal,
  faBell as faBellIcon,
  faMap,
  faShield,
  faClock,
  faCalendar,
  // Arrow icons (keep only one instance of each)
  faArrowDown,
  faArrowUp,
  faArrowRight,
  faArrowLeft,
  faCircleUser,
  faCircleXmark,
  faCircleCheck as faSolidCircleCheck,
  faImage,
  faMagnifyingGlassPlus,
  faPalette, // For swatch icon
  faFileText, // For document text icon
  faCreditCard,    // For creditCard icon
  faClockRotateLeft, // For history/clock icon
  // New icons for brand health
  faChartBar as faChartColumn,
  faChartLine,
  faTable
} from '@fortawesome/free-solid-svg-icons';

import {
  faUser as farUser,
  faCircleCheck as farCircleCheck,
  faLightbulb as farLightbulb,
  faCommentDots as farCommentDots,
  faEye as farEye,
  faCopy as farCopy,
  faTrashCan as farTrashCan,
  faHeart as farHeart,
  faStar as farStar,
  faBookmark as farBookmark,
  faFileLines as farFileLines,
  faCircleUser as farCircleUser
} from '@fortawesome/free-regular-svg-icons';

import {
  faInstagram, faYoutube, faTiktok, faFacebook, 
  faXTwitter, faLinkedin
} from '@fortawesome/free-brands-svg-icons';

// UI Icons Map (solid variants)
export const FA_UI_ICON_MAP = {
  // Heroicons equivalents
  search: faSearch,
  plus: faPlus,
  minus: faMinus,
  close: faXmark,
  check: faCheck,
  chevronDown: faChevronDown,
  chevronUp: faChevronUp,
  chevronLeft: faChevronLeft,
  chevronRight: faChevronRight,
  user: faUser,
  settings: faCog,
  mail: faEnvelope,
  calendar: faCalendarDays,
  trash: faTrash,
  warning: faTriangleExclamation,
  info: faCircleInfo,
  bell: faBell,
  
  // Bootstrap Icons equivalents
  circleCheck: faCircleCheck,
  lightBulb: faLightbulb,
  chatBubble: faCommentDots,
  
  // Action Icons
  view: faEye,
  edit: faPen,
  copy: faCopy,
  delete: faTrashCan,
  
  // Additional common UI icons
  heart: faHeart,
  star: faStar,
  bookmark: faBookmark,
  share: faShare,
  upload: faUpload,
  menu: faList,
  filter: faFilter,
  grid: faTableCells,
  list: faListCheck,
  tag: faTag,
  lock: faLock,
  unlock: faUnlock,
  key: faKey,
  paperclip: faPaperclip,
  
  // Original mappings
  download: faDownload,
  
  // New mappings for missing icons
  play: faPlay,
  document: faFile,
  documentText: faFileLines,
  home: faHome,
  chart: faChartBar,
  chartPie: faChartPie,
  money: faMoneyBill,
  trendUp: faArrowUp,
  trendDown: faArrowDown,
  lightning: faBolt,
  globe: faGlobe,
  userGroup: faUserGroup,
  building: faBuilding,
  rocket: faRocket,
  signal: faSignal,
  bellAlert: faBellIcon,
  map: faMap,
  shield: faShield,
  clock: faClock,
  calendarDays: faCalendarDays,
  arrowDown: faArrowDown,
  arrowUp: faArrowUp,
  arrowRight: faArrowRight,
  arrowLeft: faArrowLeft,
  userCircle: faCircleUser,
  xCircle: faCircleXmark,
  checkCircle: faSolidCircleCheck,
  photo: faImage,
  magnifyingGlassPlus: faMagnifyingGlassPlus,
  swatch: faPalette,
  creditCard: faCreditCard,
  history: faClockRotateLeft,
  
  // Brand health specific icons
  presentationChartBar: faChartLine,
  tableCells: faTable,
  chartBar: faChartColumn
};

// UI icons with outline variants
export const FA_UI_OUTLINE_ICON_MAP = {
  // Regular icons for outline variants
  user: farUser,
  circleCheck: farCircleCheck,
  lightBulb: farLightbulb,
  chatBubble: farCommentDots,
  view: farEye,
  edit: faPen,
  copy: farCopy,
  delete: faTrashCan,
  heart: farHeart,
  star: farStar,
  bookmark: farBookmark,
  share: faShare,
  documentText: farFileLines,
  userCircle: farCircleUser
};

// Platform icons
export const FA_PLATFORM_ICON_MAP = {
  instagram: faInstagram,
  youtube: faYoutube,
  tiktok: faTiktok,
  facebook: faFacebook,
  twitter: faXTwitter,
  linkedin: faLinkedin,
};

// Platform-specific brand colors
export const PLATFORM_COLORS = {
  instagram: '#E1306C',
  youtube: '#FF0000',
  tiktok: '#000000',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
}; 