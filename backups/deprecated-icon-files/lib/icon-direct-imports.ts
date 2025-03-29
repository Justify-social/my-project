/**
 * Icon mappings for Font Awesome Pro icons
 * 
 * This file provides mappings for commonly used Font Awesome icons
 * using array syntax to ensure compatibility with the Font Awesome kit
 * loaded via script tag in the layout.tsx file.
 * 
 * Instead of direct imports which can lead to module resolution errors,
 * we use the array format which relies on the FontAwesome global registry
 * populated by the kit script.
 */

// Define array-based icon mappings rather than direct imports
// Using [prefix, iconName] format which is compatible with FontAwesomeIcon
export const DIRECT_ICON_MAP = {
  // Solid Icons
  fasUser: ['fas', 'user'],
  fasGear: ['fas', 'gear'],
  fasMagnifyingGlass: ['fas', 'magnifying-glass'],
  fasPlus: ['fas', 'plus'],
  fasMinus: ['fas', 'minus'],
  fasXmark: ['fas', 'xmark'],
  fasCheck: ['fas', 'check'],
  fasChevronDown: ['fas', 'chevron-down'],
  fasChevronUp: ['fas', 'chevron-up'],
  fasChevronLeft: ['fas', 'chevron-left'],
  fasChevronRight: ['fas', 'chevron-right'],
  fasEnvelope: ['fas', 'envelope'],
  fasCalendarDays: ['fas', 'calendar-days'],
  fasTrash: ['fas', 'trash'],
  fasTriangleExclamation: ['fas', 'triangle-exclamation'],
  fasCircleInfo: ['fas', 'circle-info'],
  fasBell: ['fas', 'bell'],
  fasCircleCheck: ['fas', 'circle-check'],
  fasLightbulb: ['fas', 'lightbulb'],
  fasCommentDots: ['fas', 'comment-dots'],
  fasEye: ['fas', 'eye'],
  fasPenToSquare: ['fas', 'pen-to-square'],
  fasCopy: ['fas', 'copy'],
  fasTrashCan: ['fas', 'trash-can'],
  fasQuestionCircle: ['fas', 'circle-question'],
  fasAtom: ['fas', 'atom'],
  fasDna: ['fas', 'dna'],
  fasBacteria: ['fas', 'bacteria'],
  
  // Light Icons
  falUser: ['fal', 'user'],
  falGear: ['fal', 'gear'],
  falMagnifyingGlass: ['fal', 'magnifying-glass'],
  falPlus: ['fal', 'plus'],
  falMinus: ['fal', 'minus'],
  falXmark: ['fal', 'xmark'],
  falCheck: ['fal', 'check'],
  falChevronDown: ['fal', 'chevron-down'],
  falChevronUp: ['fal', 'chevron-up'],
  falChevronLeft: ['fal', 'chevron-left'],
  falChevronRight: ['fal', 'chevron-right'],
  falEnvelope: ['fal', 'envelope'],
  falCalendarDays: ['fal', 'calendar-days'],
  falTrash: ['fal', 'trash'],
  falTriangleExclamation: ['fal', 'triangle-exclamation'],
  falCircleInfo: ['fal', 'circle-info'],
  falBell: ['fal', 'bell'],
  falCircleCheck: ['fal', 'circle-check'],
  falLightbulb: ['fal', 'lightbulb'],
  falCommentDots: ['fal', 'comment-dots'],
  falEye: ['fal', 'eye'],
  falPenToSquare: ['fal', 'pen-to-square'],
  falCopy: ['fal', 'copy'],
  falTrashCan: ['fal', 'trash-can'],
  falQuestionCircle: ['fal', 'circle-question'],
  falAtom: ['fal', 'atom'],
  falDna: ['fal', 'dna'],
  falBacteria: ['fal', 'bacteria'],
  
  // Brand Icons
  fabGithub: ['fab', 'github'],
  fabTwitter: ['fab', 'twitter'],
  fabFacebook: ['fab', 'facebook'],
  fabInstagram: ['fab', 'instagram'],
  fabYoutube: ['fab', 'youtube'],
  fabTiktok: ['fab', 'tiktok'],
};

// Helper function to get icons using the original naming scheme
export function getDirectIcon(name: string, style: 'fas' | 'fal' | 'fab' = 'fas') {
  const safeName = name.replace(/-/g, '');
  const iconKey = `${style}${safeName.charAt(0).toUpperCase() + safeName.slice(1)}`;
  
  return DIRECT_ICON_MAP[iconKey as keyof typeof DIRECT_ICON_MAP] || 
         DIRECT_ICON_MAP.fasQuestionCircle; // Fallback to question circle
} 