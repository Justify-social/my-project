/**
 * @deprecated Feedback Components have been moved to atomic design structure.
 * Please import directly from the specific atomic level:
 * - Alert: '@/components/ui/organisms/feedback'
 * - Badge & Toast: '@/components/ui/molecules/feedback'
 * - NotificationBell: '@/components/ui/molecules/feedback'
 * 
 * This file will be removed in a future version.
 */

// Re-export from new locations
export * from '../organisms/feedback/Alert';
export * from '../molecules/feedback/Badge';
export * from '../molecules/feedback/Toast';
export * from '../molecules/feedback/NotificationBell';
