// Auto-generated types file for step-1
import { z } from 'zod';

// TODO: Define props if needed
export type Step1Props = Record<string, any>;

// TODO: Define proper form value types based on Step 1 content
export interface FormValues {
  [key: string]: any; // Allow any properties temporarily
}

export const validationSchema = z.object({
  // Define your Zod schema based on Step 1 fields
  // Example:
  // campaignName: z.string().min(1, { message: 'Campaign name is required' }),
});
