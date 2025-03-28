'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Invalid invitation link. No token provided.');
      return;
    }

    // Verify token when component mounts
    const verifyToken = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const response = await fetch(`/api/settings/team/verify-invitation?token=${token}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to verify invitation.');
          return;
        }

        setInvitationDetails(data.data);

        // If user is logged in, try to accept the invitation automatically
        if (status === 'authenticated' && session?.user) {
          acceptInvitation(token);
        }
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('Failed to verify invitation. Please try again later.');
      } finally {
        setIsProcessing(false);
      }
    };

    verifyToken();
  }, [searchParams, status, session]);

  const acceptInvitation = async (token: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/settings/team/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to accept invitation.');
        return;
      }

      setSuccess('You have successfully joined the team!');

      // Redirect to team management page after 2 seconds
      setTimeout(() => {
        router.push('/settings/team-management');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-work-sans">
      <div className="max-w-md w-full space-y-8 font-work-sans">
        <div className="font-work-sans">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-sora">
            Team Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-work-sans">
            {invitationDetails ?
            <>You have been invited to join as a <span className="font-semibold font-work-sans">{invitationDetails.role.toLowerCase()}</span></> :

            'Verifying your invitation...'
            }
          </p>
        </div>
        
        <div className="mt-8 space-y-6 font-work-sans">
          {isProcessing &&
          <div className="flex justify-center font-work-sans">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 font-work-sans"></div>
              <p className="mt-4 text-center text-sm text-gray-600 font-work-sans">
                {status === 'loading' ?
              'Checking your login status...' :
              'Processing your invitation...'}
              </p>
            </div>
          }
          
          {error &&
          <div className="bg-red-50 border-l-4 border-red-400 p-4 font-work-sans">
              <div className="flex font-work-sans">
                <div className="flex-shrink-0 font-work-sans">
                  <svg className="h-5 w-5 text-red-400 font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 font-work-sans">
                  <p className="text-sm text-red-700 font-work-sans">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          }
          
          {success &&
          <div className="bg-green-50 border-l-4 border-green-400 p-4 font-work-sans">
              <div className="flex font-work-sans">
                <div className="flex-shrink-0 font-work-sans">
                  <svg className="h-5 w-5 text-green-400 font-work-sans" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 font-work-sans">
                  <p className="text-sm text-green-700 font-work-sans">
                    {success}
                  </p>
                  <p className="text-sm text-green-700 mt-1 font-work-sans">
                    Redirecting you to the team management page...
                  </p>
                </div>
              </div>
            </div>
          }
          
          {invitationDetails && status === 'unauthenticated' && !error &&
          <div className="font-work-sans">
              <p className="text-center text-sm text-gray-600 mb-4 font-work-sans">
                You need to sign in to accept this invitation.
              </p>
              <div className="flex justify-center font-work-sans">
                <Link
                href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-work-sans">

                  Sign in to accept
                </Link>
              </div>
            </div>
          }
          
          {invitationDetails && status === 'authenticated' && !isProcessing && !success && !error &&
          <div className="font-work-sans">
              <p className="text-center text-sm text-gray-600 mb-4 font-work-sans">
                Click the button below to accept this invitation and join the team.
              </p>
              <button
              onClick={() => acceptInvitation(searchParams.get('token')!)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-work-sans"
              disabled={isProcessing}>

                Accept Invitation
              </button>
            </div>
          }
          
          <div className="text-center mt-6 font-work-sans">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500 font-work-sans">
              Return to home page
            </Link>
          </div>
        </div>
      </div>
    </div>);

}