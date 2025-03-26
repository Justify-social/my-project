"use client";

import React from 'react';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';

interface NotificationPreferences {
  campaignUpdates: boolean;
  brandHealthAlerts: boolean;
  aiInsightNotifications: boolean;
}

interface NotificationPreferencesSectionProps {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
  loading?: boolean;
  error?: string;
}

/**
 * NotificationPreferencesSection component for Profile Settings
 * Handles notification preferences with toggle switches
 */
const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  preferences,
  onToggle,
  loading = false,
  error
}) => {
  return (
    <Card>
      <SectionHeader 
        title="Notification Preferences" 
        description="Control which notifications you receive."
        iconName="fa-light fa-bell"
      />
      
      <div className="space-y-4">
        {/* Show error if provided */}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {/* Campaign Updates */}
        <ToggleSwitch
          id="campaign-updates"
          label="Campaign Updates"
          description="Receive notifications about campaign status changes and performance updates."
          isEnabled={preferences.campaignUpdates}
          onToggle={() => onToggle('campaignUpdates', !preferences.campaignUpdates)}
          disabled={loading}
        />
        
        {/* Brand Health Alerts */}
        <ToggleSwitch
          id="brand-health-alerts"
          label="Brand Health Alerts"
          description="Get alerted when there are significant changes to your brand health metrics."
          isEnabled={preferences.brandHealthAlerts}
          onToggle={() => onToggle('brandHealthAlerts', !preferences.brandHealthAlerts)}
          disabled={loading}
        />
        
        {/* AI Insight Notifications */}
        <ToggleSwitch
          id="ai-insight-notifications"
          label="AI Insight Notifications"
          description="Receive notifications when our AI generates new insights about your campaigns."
          isEnabled={preferences.aiInsightNotifications}
          onToggle={() => onToggle('aiInsightNotifications', !preferences.aiInsightNotifications)}
          disabled={loading}
        />
        
        {/* Additional info */}
        <div className="mt-6 text-sm text-[#4A5568] bg-gray-50 p-3 rounded-md">
          <p className="mb-2">
            <i className="fa-light fa-info-circle mr-2"></i>
            <span className="font-medium">Note:</span> Email notification settings apply to all devices where you are signed in.
          </p>
          <p>
            You can update your contact email in your Personal Information settings.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NotificationPreferencesSection; 