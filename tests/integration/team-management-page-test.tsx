import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamManagementPage from '@/app/settings/team-management/page';

// Mock the API modules
jest.mock('@/lib/api', () => ({
  getTeamMembers: jest.fn().mockResolvedValue([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor', status: 'active' },
    { id: '3', name: 'Alice Johnson', email: 'alice@example.com', role: 'viewer', status: 'active' }
  ]),
  getInvitations: jest.fn().mockResolvedValue([
    { id: 'inv1', email: 'pending@example.com', role: 'editor', invitedAt: '2023-05-10T12:00:00Z' }
  ]),
  inviteTeamMember: jest.fn().mockResolvedValue({ success: true }),
  deleteTeamMember: jest.fn().mockResolvedValue({ success: true }),
  deleteInvitation: jest.fn().mockResolvedValue({ success: true }),
  updateMemberRole: jest.fn().mockResolvedValue({ success: true })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/settings/team-management',
}));

// Mock the framer-motion animation library
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('TeamManagementPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders team management page with team members when data is loaded', async () => {
    render(<TeamManagementPage />);
    
    // Initially should show loading state
    expect(screen.getByTestId('team-management-loading')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('team-management-loading')).not.toBeInTheDocument();
    });
    
    // Should render team members
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    
    // Should render pending invitations
    expect(screen.getByText('pending@example.com')).toBeInTheDocument();
  });
  
  test('can invite a new team member', async () => {
    import inviteTeamMember from '@/lib/api';
    render(<TeamManagementPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('team-management-loading')).not.toBeInTheDocument();
    });
    
    // Click invite button
    const inviteButton = screen.getByText('Invite Team Member');
    fireEvent.click(inviteButton);
    
    // Fill in invitation form
    const emailInput = screen.getByLabelText(/Email/i);
    const roleSelect = screen.getByLabelText(/Role/i);
    
    fireEvent.change(emailInput, { target: { value: 'newmember@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'editor' } });
    
    // Submit the form
    const submitButton = screen.getByText('Send Invitation');
    fireEvent.click(submitButton);
    
    // Verify API was called with correct data
    await waitFor(() => {
      expect(inviteTeamMember).toHaveBeenCalledWith({
        email: 'newmember@example.com',
        role: 'editor'
      });
    });
    
    // Should show success message
    expect(screen.getByText('Invitation sent successfully')).toBeInTheDocument();
  });
  
  test('can delete a team member', async () => {
    import deleteTeamMember from '@/lib/api';
    render(<TeamManagementPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('team-management-loading')).not.toBeInTheDocument();
    });
    
    // Find and click delete button for Jane Smith
    const janeRow = screen.getByText('Jane Smith').closest('tr');
    const deleteButton = within(janeRow).getByLabelText('Delete member');
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Verify API was called with correct ID
    await waitFor(() => {
      expect(deleteTeamMember).toHaveBeenCalledWith('2');
    });
    
    // Should show success message
    expect(screen.getByText('Team member removed successfully')).toBeInTheDocument();
  });
  
  test('can cancel a pending invitation', async () => {
    import deleteInvitation from '@/lib/api';
    render(<TeamManagementPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('team-management-loading')).not.toBeInTheDocument();
    });
    
    // Find and click cancel button for the pending invitation
    const invitationRow = screen.getByText('pending@example.com').closest('tr');
    const cancelButton = within(invitationRow).getByLabelText('Cancel invitation');
    fireEvent.click(cancelButton);
    
    // Confirm cancellation
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    // Verify API was called with correct ID
    await waitFor(() => {
      expect(deleteInvitation).toHaveBeenCalledWith('inv1');
    });
    
    // Should show success message
    expect(screen.getByText('Invitation cancelled successfully')).toBeInTheDocument();
  });
}); 