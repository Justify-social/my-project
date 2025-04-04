'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import CampaignWizardContextType from './wizard/CampaignWizardContext';
import P from '../../../middlewares/check-permissions';
import useCampaignWizard, { 
  WizardStep, 
  OverviewFormData, 
  ObjectivesFormData, 
  AudienceFormData, 
  AssetFormData,
  CampaignFormData
} from '@/hooks/useCampaignWizard';

// Re-export types from the hook for convenience
export type { 
  WizardStep, 
  OverviewFormData, 
  ObjectivesFormData, 
  AudienceFormData, 
  AssetFormData,
  CampaignFormData
};

// Define the context type based on the hook return type
type CampaignWizardContextType = ReturnType<typeof useCampaignWizard>;

// Create the context with a default value
const CampaignWizardContext = createContext<CampaignWizardContextType | null>(null);

// Props for the provider component
interface CampaignWizardProviderProps {
  children: ReactNode;
  campaignId: number;
  initialStep?: WizardStep;
  enableAutosave?: boolean;
}

/**
 * Provider component for the Campaign Wizard context
 */
export function CampaignWizardProvider({
  children,
  campaignId,
  initialStep,
  enableAutosave
}: CampaignWizardProviderProps) {
  // Use the hook to get all the wizard functionality
  const wizardState = useCampaignWizard({
    campaignId,
    initialStep,
    enableAutosave
  });

  return (
    <CampaignWizardContext.Provider value={wizardState}>
      {children}
    </CampaignWizardContext.Provider>
  );
}

/**
 * Hook to use the Campaign Wizard context
 * @returns The Campaign Wizard context
 * @throws Error if used outside of a CampaignWizardProvider
 */
export function useCampaignWizardContext(): CampaignWizardContextType {
  const context = useContext(CampaignWizardContext);
  
  if (context === null) {
    throw new Error('useCampaignWizardContext must be used within a CampaignWizardProvider');
  }
  
  return context;
}

/**
 * Higher-order component to wrap a component with the Campaign Wizard context
 * @param Component The component to wrap
 * @returns A wrapped component with access to the Campaign Wizard context
 */
export function withCampaignWizard<P extends object>(
  Component: React.ComponentType<P & CampaignWizardContextType>
) {
  return function WithCampaignWizard(props: P & Omit<CampaignWizardProviderProps, 'children'>) {
    const { campaignId, initialStep, enableAutosave, ...rest } = props;
    
    return (
      <CampaignWizardProvider
        campaignId={campaignId}
        initialStep={initialStep}
        enableAutosave={enableAutosave}
      >
        <ComponentWithContext {...rest as P} />
      </CampaignWizardProvider>
    );
    
    // Inner component that consumes the context
    function ComponentWithContext(componentProps: P) {
      const contextProps = useCampaignWizardContext();
      return <Component {...componentProps} {...contextProps} />;
    }
  };
}

export default CampaignWizardContext; 