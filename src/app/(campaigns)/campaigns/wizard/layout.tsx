// src/app/campaigns/wizard/layout.tsx

'use client'; // This layout needs hooks

import React from 'react';
import { WizardProvider } from '@/components/features/campaigns/WizardContext';
// AutosaveIndicator is no longer needed here as the status display is removed
// import { AutosaveIndicator, AutosaveStatus } from '@/components/ui/autosave-indicator';

// Component to render the indicator using context - REMOVED
/*
function WizardStatusIndicator() {
  const wizardContext = useWizard();
  const [showIndicator, setShowIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to show the indicator temporarily when lastSaved updates
  useEffect(() => {
    if (wizardContext.lastSaved) {
      console.log('[WizardStatusIndicator] lastSaved updated, showing indicator.');
      setShowIndicator(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to hide the indicator after 5 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('[WizardStatusIndicator] Timeout reached, hiding indicator.');
        setShowIndicator(false);
      }, 5000); // 5 seconds
    }

    // Cleanup function to clear timeout if component unmounts or lastSaved changes again
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // Depend only on lastSaved from the context
  }, [wizardContext.lastSaved]);

  // Determine the status (will always be 'success' if shown based on this logic)
  const getStatus = (): AutosaveStatus => {
    if (!wizardContext) return 'idle';
    // Although we only *show* on success, the component needs the status prop
    if (wizardContext.isLoading) return 'saving'; // This state won't be shown due to outer logic
    if (wizardContext.lastSaved) return 'success';
    return 'idle';
  };

  // Only render if showIndicator is true
  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <AutosaveIndicator
        status={getStatus()} // Should be 'success' when rendered
        lastSaved={wizardContext.lastSaved}
      />
    </div>
  );
}
*/

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  // This layout assumes it wraps individual step pages.
  // It provides the WizardContext.

  return (
    // Provide Wizard context to all wizard steps
    <WizardProvider>
      {/* Remove the WizardStatusIndicator component */}
      {/* <WizardStatusIndicator /> */}
      {/* Render the actual step content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">{children}</div>
    </WizardProvider>
  );
}
