'use client';

import { config, library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Configure Font Awesome
config.autoAddCss = false; // Prevent Font Awesome from automatically injecting CSS

// Import all required icons
import { 
  faUser, faCheck, faGear, faSearch, faPlus, faMinus, faXmark,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faEnvelope, faCalendarDays, faTriangleExclamation,
  faCircleInfo, faBell, faCircleCheck, faLightbulb, faCommentDots,
  faEye, faPenToSquare, faCopy, faTrashCan, faHeart, faStar,
  faBookmark, faShare, faUpload, faBars, faFilter, faTableCells,
  faList, faTag, faLock, faUnlock, faKey, faPaperclip, faDownload,
  faPlay, faFile, faFileLines, faHome, faChartBar, faChartPie,
  faMoneyBill, faArrowTrendUp, faArrowTrendDown, faBolt, faGlobe,
  faUserGroup, faBuilding, faRocket, faSignal, faBellSlash, faMap,
  faShield, faClock, faArrowDown, faArrowUp, faArrowRight, faArrowLeft,
  faCircleXmark, faMagnifyingGlassPlus, faPalette, faCreditCard,
  faClockRotateLeft, faChartLine, faTable, faQuestion
} from '@fortawesome/pro-solid-svg-icons';

// Light variants for outline styles
import {
  faUser as falUser, faCheck as falCheck, faGear as falGear, 
  faSearch as falSearch, faPlus as falPlus, faMinus as falMinus, 
  faXmark as falXmark, faChevronDown as falChevronDown, 
  faChevronUp as falChevronUp, faChevronLeft as falChevronLeft, 
  faChevronRight as falChevronRight, faEnvelope as falEnvelope, 
  faCalendarDays as falCalendarDays, 
  faTriangleExclamation as falTriangleExclamation, faCircleInfo as falCircleInfo, 
  faBell as falBell, faCircleCheck as falCircleCheck, faLightbulb as falLightbulb, 
  faCommentDots as falCommentDots, faEye as falEye, faPenToSquare as falPenToSquare, 
  faCopy as falCopy, faTrashCan as falTrashCan, faHeart as falHeart, 
  faStar as falStar, faBookmark as falBookmark, faShare as falShare, 
  faUpload as falUpload, faBars as falBars, faFilter as falFilter, 
  faTableCells as falTableCells, faList as falList, faTag as falTag, 
  faLock as falLock, faUnlock as falUnlock, faKey as falKey, 
  faPaperclip as falPaperclip, faDownload as falDownload, faPlay as falPlay, 
  faFile as falFile, faFileLines as falFileLines, faHome as falHome, 
  faChartBar as falChartBar, faChartPie as falChartPie, faMoneyBill as falMoneyBill, 
  faArrowTrendUp as falArrowTrendUp, faArrowTrendDown as falArrowTrendDown, 
  faBolt as falBolt, faGlobe as falGlobe, faUserGroup as falUserGroup, 
  faBuilding as falBuilding, faRocket as falRocket, faSignal as falSignal, 
  faBellSlash as falBellSlash, faMap as falMap, faShield as falShield, 
  faClock as falClock, faArrowDown as falArrowDown, faArrowUp as falArrowUp, 
  faArrowRight as falArrowRight, faArrowLeft as falArrowLeft, 
  faCircleXmark as falCircleXmark, faMagnifyingGlassPlus as falMagnifyingGlassPlus, 
  faPalette as falPalette, faCreditCard as falCreditCard, 
  faClockRotateLeft as falClockRotateLeft, faChartLine as falChartLine, 
  faTable as falTable, faQuestion as falQuestion
} from '@fortawesome/pro-light-svg-icons';

// Import brand icons for social platforms
import {
  faTwitter, faFacebook, faInstagram, faYoutube, faLinkedin, faTiktok, faGithub
} from '@fortawesome/free-brands-svg-icons';

// Register all icons with library
library.add(
  // Solid icons
  faUser, faCheck, faGear, faSearch, faPlus, faMinus, faXmark,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faEnvelope, faCalendarDays, faTriangleExclamation,
  faCircleInfo, faBell, faCircleCheck, faLightbulb, faCommentDots,
  faEye, faPenToSquare, faCopy, faTrashCan, faHeart, faStar,
  faBookmark, faShare, faUpload, faBars, faFilter, faTableCells,
  faList, faTag, faLock, faUnlock, faKey, faPaperclip, faDownload,
  faPlay, faFile, faFileLines, faHome, faChartBar, faChartPie,
  faMoneyBill, faArrowTrendUp, faArrowTrendDown, faBolt, faGlobe,
  faUserGroup, faBuilding, faRocket, faSignal, faBellSlash, faMap,
  faShield, faClock, faArrowDown, faArrowUp, faArrowRight, faArrowLeft,
  faCircleXmark, faMagnifyingGlassPlus, faPalette, faCreditCard,
  faClockRotateLeft, faChartLine, faTable, faQuestion,
  
  // Light icons
  falUser, falCheck, falGear, falSearch, falPlus, falMinus, falXmark,
  falChevronDown, falChevronUp, falChevronLeft, falChevronRight,
  falEnvelope, falCalendarDays, falTriangleExclamation,
  falCircleInfo, falBell, falCircleCheck, falLightbulb, falCommentDots,
  falEye, falPenToSquare, falCopy, falTrashCan, falHeart, falStar,
  falBookmark, falShare, falUpload, falBars, falFilter, falTableCells,
  falList, falTag, falLock, falUnlock, falKey, falPaperclip, 
  falDownload, falPlay, falFile, falFileLines, falHome, falChartBar, 
  falChartPie, falMoneyBill, falArrowTrendUp, falArrowTrendDown, 
  falBolt, falGlobe, falUserGroup, falBuilding, falRocket, falSignal, 
  falBellSlash, falMap, falShield, falClock, falArrowDown, falArrowUp, 
  falArrowRight, falArrowLeft, falCircleXmark, falMagnifyingGlassPlus, 
  falPalette, falCreditCard, falClockRotateLeft, falChartLine, 
  falTable, falQuestion,
  
  // Brand icons
  faTwitter, faFacebook, faInstagram, faYoutube, faLinkedin, faTiktok, faGithub
);

// Component that can be used to ensure icons are loaded
export function IconRegistry() {
  // This component doesn't render anything visible
  return null;
}

export default IconRegistry; 