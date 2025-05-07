'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SurveyPreview from '@/components/features/brand-lift/SurveyPreview';
// import { ConditionalLayout } from '@/components/ConditionalLayout'; // Assuming this is your layout component

// --- Start of UI component placeholders (consistent with SurveyPreview.tsx) ---
const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'icon' | 'default';
    className?: string;
    isLoading?: boolean;
  }
) => (
  <button
    {...props}
    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors 
            ${
              props.variant === 'outline'
                ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                : props.variant === 'ghost'
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            } 
            ${props.size === 'sm' ? 'px-3 py-1.5 text-xs' : props.size === 'icon' ? 'p-2' : 'px-4 py-2 text-sm'}
            ${props.disabled || props.isLoading ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
            ${props.className || ''}`}
  >
    {props.isLoading ? 'Submitting...' : props.children}
  </button>
);
const Alert = ({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <div
    className={`p-4 rounded-md border ${variant === 'destructive' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'} ${className || ''}`}
  >
    {children}
  </div>
);
const AlertTitle = ({ children }: any) => <h3 className="font-medium mb-1">{children}</h3>;
const AlertDescription = ({ children }: any) => <p className="text-sm">{children}</p>;
// --- End of UI component placeholders ---

const SurveyPreviewSubmitPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyId = params?.studyId as string | undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitForReview = async () => {
    if (!studyId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Ticket BL-MVP-P2-06: Call PUT /api/brand-lift/surveys/{studyId} to update status
      const response = await fetch(`/api/brand-lift/surveys/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING_APPROVAL' }), // Ensure your enum/type matches
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit for review');
      }
      // Navigate to the approval page or a confirmation page upon success
      // For now, let's assume it navigates to the approval page for this study
      router.push(`/brand-lift/approval/${studyId}`);
      // Or show a success message/toast
      alert('Survey submitted for review successfully!'); // TODO: Replace with Shadcn Toast
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission.');
    }
    setIsSubmitting(false);
  };

  // Placeholder for ConditionalLayout
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">{children}</div>
  );

  if (!studyId) {
    return (
      <LayoutWrapper>
        <p className="text-red-500 text-center">Study ID is missing. Cannot load survey preview.</p>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <h1 className="text-2xl font-semibold mb-6 text-center">Preview & Submit Survey</h1>
      <SurveyPreview studyId={studyId} />

      {/* Submission Section */}
      <div className="mt-8 py-6 border-t border-gray-200 flex flex-col items-center space-y-4">
        {submitError && (
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTitle>Submission Failed</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={handleSubmitForReview}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="px-8 py-3 text-base bg-green-600 hover:bg-green-700 focus:ring-green-500" // Customizing button style
        >
          Share Survey for Initial Review
        </Button>
        <p className="text-xs text-gray-600 mt-2 text-center max-w-xs">
          This will lock the survey design and send it to your team for feedback and final approval
          before going live.
        </p>
      </div>
    </LayoutWrapper>
  );
};

export default SurveyPreviewSubmitPage;
