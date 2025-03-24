'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  memberId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamDashboard() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching team data...');
      const response = await fetch('/api/settings/team');
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (!data.success) {
        setError(data.error || 'Failed to fetch team data');
        return;
      }

      setMembers(data.data?.teamMembers || []);
      setInvitations(data.data?.pendingInvitations || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to fetch team data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      console.log('Cancelling invitation with ID:', invitationId);

      // Make sure we're using the correct URL for the API
      const apiUrl = `/api/settings/team/invitation/${invitationId}`;
      console.log('Making DELETE request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Cancel API response status:', response.status);

      // If response is not ok, throw error
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Cancel API response data:', data);

      if (!data.success) {
        toast.error(data.error || 'Failed to cancel invitation');
        return;
      }

      // Success! Show toast and refresh data
      toast.success('Invitation cancelled successfully');
      fetchTeamData(); // Refresh the team data
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation. Please try again later.');
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/settings/team/invitation/${invitationId}/resend`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to resend invitation');
        return;
      }

      toast.success('Invitation resent successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation. Please try again later.');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/team/member/${memberId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to remove team member');
        return;
      }

      toast.success('Team member removed successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member. Please try again later.');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/settings/team/member/${memberId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to update member role');
        return;
      }

      toast.success('Member role updated successfully');
      // Refresh the team data
      fetchTeamData();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] font-work-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 font-work-sans"></div>
      </div>);

  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4 font-work-sans">
        <div className="flex font-work-sans">
          <div className="flex-shrink-0 font-work-sans">
            <svg className="h-5 w-5 text-red-400 font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 font-work-sans">
            <p className="text-sm text-red-700 font-work-sans">{error}</p>
            <button
              onClick={fetchTeamData}
              className="mt-2 text-sm text-red-700 underline font-work-sans">

              Try again
            </button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="space-y-8 font-work-sans">
      {/* Team Members Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-sora">Team Members</h3>
        
        {members.length === 0 ?
        <p className="text-gray-500 italic font-work-sans">No team members yet.</p> :

        <div className="overflow-x-auto font-work-sans">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Joined
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) =>
              <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-work-sans">
                      {member.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 font-work-sans">

                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium font-work-sans">
                      <button
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-900 font-work-sans">

                        Remove
                      </button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </section>
      
      {/* Pending Invitations Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-sora">Pending Invitations</h3>
        
        {invitations.length === 0 ?
        <p className="text-gray-500 italic font-work-sans">No pending invitations.</p> :

        <div className="overflow-x-auto font-work-sans">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Role
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Expires
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-work-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation) =>
              <tr key={invitation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      {invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  invitation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  invitation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'} font-work-sans`
                  }>
                        {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-work-sans">
                      {formatDate(invitation.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium font-work-sans">
                      <button
                    onClick={() => resendInvitation(invitation.id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 font-work-sans">

                        Resend
                      </button>
                      <button
                    onClick={() => cancelInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-900 font-work-sans">

                        Cancel
                      </button>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>);

}