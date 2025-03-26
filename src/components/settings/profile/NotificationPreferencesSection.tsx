'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/settings/shared/Card';
import SectionHeader from '@/components/settings/shared/SectionHeader';
import ToggleSwitch from '@/components/settings/shared/ToggleSwitch';
import ActionButtons from '@/components/settings/shared/ActionButtons';
import { Icon, SuccessIcon, WarningIcon, StaticIcon } from '@/components/ui/icons';

interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}

interface NotificationPreferencesSectionProps {
  initialData: NotificationPreferences;
  onSave: (data: NotificationPreferences) => Promise<void>;
}

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
      <SectionHeader 
        title="Notification Preferences" 
        description="Control which notifications you receive."
        iconName="bell"
      />
      
      <div className="space-y-4">
        {/* Error message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm p-3 bg-red-50 rounded-md"
          >
            <WarningIcon name="circleExclamation" size="md" className="mr-2 mt-0.5" />
            {error}
          </motion.div>
        )}
        
        {/* Success message */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-500 text-sm p-3 bg-green-50 rounded-md"
          >
            <SuccessIcon name="circleCheck" size="md" className="mr-2 mt-0.5" />
            {success}
          </motion.div>
        )}
        
        {/* Notice */}
        <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded-md flex items-start">
          <StaticIcon name="circleInfo" size="md" className="mr-2 mt-0.5" />
          <span>
            Email notifications will be sent to your registered email address. 
            You can update your email in the Personal Information section.
          </span>
        </div>
        
        {/* Campaign Updates */}
        <ToggleSwitch
          id="campaign-updates"
          label="Campaign Updates"
          description="Receive notifications about campaign status changes and performance updates."
          isEnabled={preferences.campaignUpdates}
          onToggle={() => handleToggle('campaignUpdates', !preferences.campaignUpdates)}
          disabled={!isEditing || isSaving}
        />
        
        {/* Brand Health Alerts */}
        <ToggleSwitch
          id="brand-health-alerts"
          label="Brand Health Alerts"
          description="Get alerted when there are significant changes to your brand health metrics."
          isEnabled={preferences.brandHealthAlerts}
          onToggle={() => handleToggle('brandHealthAlerts', !preferences.brandHealthAlerts)}
          disabled={!isEditing || isSaving}
        />
        
        {/* AI Insight Notifications */}
        <ToggleSwitch
          id="ai-insight-notifications"
          label="AI Insight Notifications"
          description="Receive notifications when our AI generates new insights about your campaigns."
          isEnabled={preferences.aiInsightNotifications}
          onToggle={() => handleToggle('aiInsightNotifications', !preferences.aiInsightNotifications)}
          disabled={!isEditing || isSaving}
        />
      </div>
      
      {/* Action buttons */}
      <div className="mt-6">
        <ActionButtons
          isEditing={isEditing}
          isSaving={isSaving}
          hasChanges={hasChanges()}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    </Card>
  );
};

export default NotificationPreferencesSection; 