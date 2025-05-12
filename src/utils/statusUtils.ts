/**
 * Campaign Status Utilities
 */

export type CampaignStatusKey =
  | 'DRAFT'
  | 'SUBMITTED' // Canonical representation for submitted
  | 'ACTIVE'
  | 'APPROVED'
  | 'PAUSED'
  | 'COMPLETED'
  // REVIEW is intentionally not a primary display/filter status as per prior requirements
  // Other backend-specific statuses (like SUBMITTED_FINAL) should be normalized before calling this utility.
  | string; // Allow other strings for flexibility, will go to default in the utility

interface StatusInfo {
  class: string;
  text: string;
}

/**
 * Gets the display text and CSS classes for a given campaign status.
 * This is the Single Source of Truth for status badge styling and text.
 * Assumes input status has been normalized if necessary (e.g., SUBMITTED_FINAL -> SUBMITTED).
 * @param status The canonical status string.
 * @returns Object containing class string and display text.
 */
export const getCampaignStatusInfo = (status: CampaignStatusKey | null | undefined): StatusInfo => {
  const normalizedStatus = (status || '').toUpperCase();

  switch (normalizedStatus) {
    case 'DRAFT':
      return { class: 'bg-gray-100 text-gray-800', text: 'Draft' };
    case 'SUBMITTED': // Single case for the canonical "Submitted" status
      return { class: 'bg-yellow-100 text-yellow-800', text: 'Submitted' };
    case 'ACTIVE':
      return { class: 'bg-green-100 text-green-800', text: 'Active' };
    case 'APPROVED':
      return { class: 'bg-green-100 text-green-800', text: 'Approved' };
    case 'PAUSED':
      return { class: 'bg-gray-100 text-gray-800', text: 'Paused' };
    case 'COMPLETED':
      return { class: 'bg-accent text-accent-foreground', text: 'Completed' };
    default:
      const defaultText = status
        ? status
            .replace(/_/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        : 'Unknown';
      // If it was SUBMITTED_FINAL and wasn't normalized, it would appear as "Submitted Final" here.
      // Proper normalization should happen before calling this function.
      return { class: 'bg-gray-100 text-gray-800', text: defaultText };
  }
};
