import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationPreferencesSection from '@/src/components/features/dashboard/notifications/NotificationPreferencesSection';

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('NotificationPreferencesSection', () => {
  const mockPreferences = {
    campaignUpdates: true,
    brandHealthAlerts: false,
    aiInsightNotifications: true
  };

  const mockOnSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  test('renders with initial preferences correctly', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Check if the section is rendered with the correct title
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    
    // Check if toggle switches are rendered with correct initial states
    const toggleSwitches = screen.getAllByRole('switch');
    expect(toggleSwitches[0]).toHaveAttribute('aria-checked', 'true'); // campaignUpdates
    expect(toggleSwitches[1]).toHaveAttribute('aria-checked', 'false'); // brandHealthAlerts
    expect(toggleSwitches[2]).toHaveAttribute('aria-checked', 'true'); // aiInsightNotifications
    
    // Check if the form is not in edit mode initially
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  test('enters edit mode when Edit button is clicked', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Click the Edit button
    fireEvent.click(screen.getByText('Edit'));

    // Check if the form is now in edit mode
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('toggles preferences correctly in edit mode', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Get toggle switches
    const toggleSwitches = screen.getAllByRole('switch');
    
    // Toggle campaignUpdates (from true to false)
    fireEvent.click(toggleSwitches[0]);
    expect(toggleSwitches[0]).toHaveAttribute('aria-checked', 'false');
    
    // Toggle brandHealthAlerts (from false to true)
    fireEvent.click(toggleSwitches[1]);
    expect(toggleSwitches[1]).toHaveAttribute('aria-checked', 'true');
  });

  test('disables toggles when not in edit mode', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Get toggle switches
    const toggleSwitches = screen.getAllByRole('switch');
    
    // Try toggling each switch
    fireEvent.click(toggleSwitches[0]);
    fireEvent.click(toggleSwitches[1]);
    fireEvent.click(toggleSwitches[2]);
    
    // Verify that states haven't changed
    expect(toggleSwitches[0]).toHaveAttribute('aria-checked', 'true');
    expect(toggleSwitches[1]).toHaveAttribute('aria-checked', 'false');
    expect(toggleSwitches[2]).toHaveAttribute('aria-checked', 'true');
  });

  test('exits edit mode when Cancel button is clicked', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Toggle some settings
    const toggleSwitches = screen.getAllByRole('switch');
    fireEvent.click(toggleSwitches[0]); // Toggle campaignUpdates
    fireEvent.click(toggleSwitches[1]); // Toggle brandHealthAlerts
    
    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if the form is back to view mode
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    
    // Verify preferences are reset to initial values
    const resetToggles = screen.getAllByRole('switch');
    expect(resetToggles[0]).toHaveAttribute('aria-checked', 'true');
    expect(resetToggles[1]).toHaveAttribute('aria-checked', 'false');
    expect(resetToggles[2]).toHaveAttribute('aria-checked', 'true');
  });

  test('calls onSave with updated preferences when Save button is clicked', async () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Toggle some settings
    const toggleSwitches = screen.getAllByRole('switch');
    fireEvent.click(toggleSwitches[0]); // Toggle campaignUpdates from true to false
    fireEvent.click(toggleSwitches[1]); // Toggle brandHealthAlerts from false to true
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if onSave was called with the updated data
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        campaignUpdates: false,
        brandHealthAlerts: true,
        aiInsightNotifications: true
      });
    });

    // Check if the form is back to view mode after saving
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  test('does not call onSave when there are no changes', () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Save button should be disabled when no changes
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  test('displays error message when save fails', async () => {
    const mockFailedSave = jest.fn().mockRejectedValue(new Error('Failed to save'));
    
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockFailedSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Make a change
    const toggleSwitches = screen.getAllByRole('switch');
    fireEvent.click(toggleSwitches[0]);
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to update notification preferences. Please try again.')).toBeInTheDocument();
    });
  });

  test('displays success message when save succeeds', async () => {
    render(
      <NotificationPreferencesSection
        initialData={mockPreferences}
        onSave={mockOnSave}
      />
    );

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Make a change
    const toggleSwitches = screen.getAllByRole('switch');
    fireEvent.click(toggleSwitches[0]);
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Notification preferences updated successfully')).toBeInTheDocument();
    });
  });
}); 