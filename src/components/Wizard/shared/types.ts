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

export enum Currency {
  GBP = "GBP",
  USD = "USD",
  EUR = "EUR"
}

export enum Platform {
  Instagram = "Instagram",
  YouTube = "YouTube",
  TikTok = "TikTok"
}

export enum Position {
  Manager = "Manager",
  Director = "Director",
  VP = "VP"
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