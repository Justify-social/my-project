import React from 'react';
import { Badge } from '@/components/ui/badge'; // Assuming Badge is the base component
import {
  BrandLiftStudyStatus,
  SurveyApprovalCommentStatus,
  SurveyOverallApprovalStatus,
} from '@prisma/client'; // Import enums directly from Prisma

// Define possible statuses this component can handle
type StatusTagProps = {
  status: BrandLiftStudyStatus | SurveyApprovalCommentStatus | SurveyOverallApprovalStatus | string; // Allow string for flexibility if needed
};

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  let variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info' = 'secondary';
  let text = String(status);

  // Determine variant and text based on status and type
  switch (status) {
    // BrandLiftStudy Statuses
    case BrandLiftStudyStatus.DRAFT:
      variant = 'outline';
      text = 'Draft';
      break;
    case BrandLiftStudyStatus.PENDING_APPROVAL:
      variant = 'warning';
      text = 'Pending Approval';
      break;
    case BrandLiftStudyStatus.APPROVED:
      variant = 'info';
      text = 'Approved (Design)';
      break;
    case BrandLiftStudyStatus.COLLECTING:
      variant = 'default';
      text = 'Collecting Responses';
      break;
    case BrandLiftStudyStatus.COMPLETED:
      variant = 'success';
      text = 'Completed';
      break;
    case BrandLiftStudyStatus.ARCHIVED:
      variant = 'secondary';
      text = 'Archived';
      break;

    // SurveyApprovalComment Statuses
    case SurveyApprovalCommentStatus.OPEN:
      // Use default variant or specific one like 'destructive' for NEED_ACTION?
      variant = 'warning'; // Or maybe destructive? Depends on desired emphasis
      text = 'Needs Action'; // Changed text for clarity
      break;
    case SurveyApprovalCommentStatus.RESOLVED:
      variant = 'success';
      text = 'Resolved';
      break;

    // SurveyOverallApproval Statuses
    case SurveyOverallApprovalStatus.PENDING_REVIEW:
      variant = 'warning';
      text = 'Pending Review';
      break;
    case SurveyOverallApprovalStatus.CHANGES_REQUESTED:
      variant = 'destructive';
      text = 'Changes Requested';
      break;
    case SurveyOverallApprovalStatus.APPROVED:
      // Distinguish from study design approval
      variant = 'info';
      text = 'Approved for Sign-off';
      break;
    case SurveyOverallApprovalStatus.SIGNED_OFF:
      variant = 'success';
      text = 'Signed Off';
      break;

    default:
      // Handle any unexpected string statuses gracefully
      variant = 'secondary';
      text = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic formatting
      break;
  }

  // Ensure the Badge component accepts these variants or map them
  // If Badge variants don't match ('success', 'warning', 'info'), map them here:
  const badgeVariantMapping: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    default: 'default',
    secondary: 'secondary',
    destructive: 'destructive',
    outline: 'outline',
    success: 'default', // Map to a valid Badge variant
    warning: 'secondary', // Map to a valid Badge variant
    info: 'outline', // Map to a valid Badge variant
  };

  const finalVariant = badgeVariantMapping[variant] || 'secondary';

  return (
    <Badge variant={finalVariant} className="capitalize">
      {text}
    </Badge>
  );
};

export default StatusTag;
