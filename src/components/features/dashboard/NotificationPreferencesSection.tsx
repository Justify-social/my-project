// Updated import paths via tree-shake script - 2025-04-01T17:13:32.211Z
'use client';

import React, { useState } from 'react';
// import NotificationPreferences from './notifications/NotificationPreferencesSection'; // Removed invalid import
import { motion } from 'framer-motion';
// Use components from the flat UI directory
import { Card } from '@/components/ui/card';
// import SectionHeader from '@/components/settings/shared/SectionHeader'; // TODO: Rebuild using ui/typography
import { Switch } from '@/components/ui/switch'; // Assuming props are compatible
// import ActionButtons from '@/components/settings/shared/ActionButtons'; // TODO: Rebuild using ui/button
import { Icon } from '@/components/ui/icon/icon';

interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}

interface NotificationPreferencesSectionProps {
  initialData: NotificationPreferences;
  onSave: (data: NotificationPreferences) => Promise<void>;
}

// Define component aliases for the warning, success, and static icons
const WarningIcon = ({ className }: { className?: string }) => (
  <Icon iconId="faTriangleExclamationLight" className={className} />
);

const SuccessIcon = ({ className }: { className?: string }) => (
  <Icon iconId="faCircleCheckLight" className={className} />
);

const StaticIcon = ({ className, iconId }: { className?: string, iconId: string }) => (
  <Icon iconId={iconId} className={className} />
);

const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  initialData,
  onSave
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialData);
  const [originalData] = useState<NotificationPreferences>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    if (!isEditing) return;

    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const hasChanges = () => {
    return (
      preferences.campaignUpdates !== originalData.campaignUpdates ||
      preferences.brandHealthAlerts !== originalData.brandHealthAlerts ||
      preferences.aiInsightNotifications !== originalData.aiInsightNotifications
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setPreferences({ ...originalData });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await onSave(preferences);
      setIsEditing(false);
      setSuccess('Notification preferences updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
      setError('Failed to update notification preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      {/* TODO: Replace with rebuilt SectionHeader */}
      {/* <SectionHeader 
        title="Notification Preferences" 
        description="Control which notifications you receive."
        iconName="bell"
      /> */}

      <div className="space-y-4">
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm p-3 bg-red-50 rounded-md flex items-start"
          >
            <WarningIcon className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-500 text-sm p-3 bg-green-50 rounded-md flex items-start"
          >
            <SuccessIcon className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Notice */}
        <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded-md flex items-start">
          <StaticIcon iconId="faCircleInfoLight" className="mr-2 mt-0.5 flex-shrink-0" />
          <span>
            Email notifications will be sent to your registered email address.
            You can update your email in the Personal Information section.
          </span>
        </div>

        {/* Campaign Updates - Use Shadcn Switch */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div>
            <label htmlFor="campaign-updates" className="font-medium">Campaign Updates</label>
            <p className="text-sm text-muted-foreground">Receive notifications about campaign status changes and performance updates.</p>
          </div>
          <Switch
            id="campaign-updates"
            checked={preferences.campaignUpdates}
            onCheckedChange={(checked) => handleToggle('campaignUpdates', checked)}
            disabled={!isEditing || isSaving}
          />
        </div>

        {/* Brand Health Alerts - Use Shadcn Switch */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div>
            <label htmlFor="brand-health-alerts" className="font-medium">Brand Health Alerts</label>
            <p className="text-sm text-muted-foreground">Get alerted when there are significant changes to your brand health metrics.</p>
          </div>
          <Switch
            id="brand-health-alerts"
            checked={preferences.brandHealthAlerts}
            onCheckedChange={(checked) => handleToggle('brandHealthAlerts', checked)}
            disabled={!isEditing || isSaving}
          />
        </div>

        {/* AI Insight Notifications - Use Shadcn Switch */}
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div>
            <label htmlFor="ai-insight-notifications" className="font-medium">AI Insight Notifications</label>
            <p className="text-sm text-muted-foreground">Receive notifications when our AI generates new insights about your campaigns.</p>
          </div>
          <Switch
            id="ai-insight-notifications"
            checked={preferences.aiInsightNotifications}
            onCheckedChange={(checked) => handleToggle('aiInsightNotifications', checked)}
            disabled={!isEditing || isSaving}
          />
        </div>
      </div>

      {/* Action buttons - Temporarily removed */}
      {/* TODO: Replace with rebuilt ActionButtons */}
      {/* <div className="mt-6">
        <ActionButtons
          isEditing={isEditing}
          isSaving={isSaving}
          hasChanges={hasChanges()}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div> */}
    </Card>
  );
};

export default NotificationPreferencesSection; 