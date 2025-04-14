export interface FormValues {
  name: string;
  businessGoal: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  primaryContact: Contact;
  secondaryContact: Contact;
  currency: Currency;
  totalBudget: number;
  socialMediaBudget: number;
  platform: Platform;
  influencerHandle: string;
}

export interface Contact {
  firstName: string;
  surname: string;
  email: string;
  position: Position;
}

/**
 * Currency enum - Frontend uses the same format as backend (uppercase)
 * No transformation needed between frontend and backend
 */
export enum Currency {
  GBP = 'GBP',
  USD = 'USD',
  EUR = 'EUR',
}

/**
 * Platform enum - Frontend uses Title Case while backend uses UPPERCASE
 * Transformation required:
 * - Frontend to Backend: "Instagram" -> "INSTAGRAM"
 * - Backend to Frontend: "INSTAGRAM" -> "Instagram"
 * Use EnumTransformers.platformToBackend() and EnumTransformers.platformFromBackend()
 */
export enum Platform {
  Instagram = 'Instagram', // Backend expects: "INSTAGRAM"
  YouTube = 'YouTube', // Backend expects: "YOUTUBE"
  TikTok = 'TikTok', // Backend expects: "TIKTOK"
}

/**
 * Position enum - Same format in frontend and backend
 * No transformation needed
 */
export enum Position {
  Manager = 'Manager',
  Director = 'Director',
  VP = 'VP',
}

export interface StepLoaderProps {
  step: number;
}

export interface StepContentProps {
  step: number;
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}
