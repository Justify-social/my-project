import React from 'react';

// Assuming this is your Shadcn UI primitive component
// import { Badge } from "@/components/ui/badge";

// TODO: Replace with actual enum from src/types/brand-lift.ts if different
// Using a union type here for flexibility, could also be a specific status enum.
export type StatusTagVariant =
  | 'OPEN'
  | 'RESOLVED'
  | 'NEED_ACTION'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SIGNED_OFF'
  | 'DRAFT'
  | 'COLLECTING'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'DEFAULT'; // Default/neutral style

interface StatusTagProps {
  status: StatusTagVariant | string; // Allow string for flexibility if statuses come from various sources
  className?: string;
}

const getStatusColors = (status: StatusTagVariant | string): string => {
  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'PENDING_REVIEW':
    case 'NEED_ACTION':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'RESOLVED':
    case 'APPROVED':
    case 'SIGNED_OFF':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'CHANGES_REQUESTED':
    case 'ARCHIVED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'COLLECTING':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
  }
};

/**
 * StatusTag Atom/Molecule
 * Displays a status with appropriate coloring using a Badge primitive conceptually.
 */
export const StatusTag: React.FC<StatusTagProps> = ({ status, className }) => {
  // Placeholder for Shadcn Badge component usage
  const Badge = ({
    children,
    className: badgeClassName,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center ${badgeClassName}`}
    >
      {children}
    </span>
  );

  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_') as StatusTagVariant;
  // Try to match specific known statuses, otherwise use the input as is for the label
  const displayStatus =
    Object.values(SurveyApprovalCommentStatus).includes(normalizedStatus as any) ||
    Object.values(SurveyOverallApprovalStatus).includes(normalizedStatus as any) ||
    Object.values(BrandLiftStudyStatus).includes(normalizedStatus as any)
      ? normalizedStatus
          .replace(/_/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      : status;

  return (
    <Badge className={`${getStatusColors(normalizedStatus)} ${className || ''}`}>
      {displayStatus}
    </Badge>
  );
};

// Expose enums if they are defined here for Storybook or testing, ideally import from types
export enum SurveyApprovalCommentStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export enum SurveyOverallApprovalStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  SIGNED_OFF = 'SIGNED_OFF',
}
export enum BrandLiftStudyStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  COLLECTING = 'COLLECTING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export default StatusTag;
