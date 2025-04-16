import { useState, useEffect, useRef } from 'react';
// Use string type for platform input, handle specific enum logic outside if needed
// import { PlatformEnumBackend } from '@/components/features/campaigns/types';
// import { z } from 'zod';

// Define the structure of the data returned by the validation function
// (Copied from Step1Content - consider moving to a shared types file)
interface InfluencerData {
  id: string;
  handle: string;
  displayName?: string;
  followerCount?: number;
  platformId?: string;
  avatarUrl?: string;
  verified?: boolean;
  url?: string;
  engagementRate?: number;
  averageLikes?: number;
  averageComments?: number;
  description?: string;
  lastFetched?: string;
}

// Validation function (Moved from Step1Content - consider moving to lib/validators)
// Use string type for platform input
async function validateInfluencerHandle(
  platform: string | undefined,
  handle: string
): Promise<InfluencerData | null> {
  // Basic checks before API call
  if (!platform || !handle || handle.length < 3) {
    return null;
  }
  console.log(`VALIDATING: ${handle} on ${platform}...`); // Clearer log
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  try {
    // Simulate API success/failure
    const isValid = Math.random() > 0.3; // Adjust probability as needed
    if (!isValid) {
      console.warn(`Validation failed simulation for ${handle} on ${platform}`);
      return null; // Simulate API returning no data for invalid handle
    }

    // Simulate successful validation data
    const followerCount = handle.length * 10000 + Math.floor(Math.random() * 50000);
    const validatedData: InfluencerData = {
      id: `sim-${Date.now()}`,
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
      followerCount,
      platformId: platform.toString().toLowerCase(), // Platform is already string or undefined
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=random`,
      verified: handle.length > 5,
      url: `https://${platform.toString().toLowerCase()}.com/${handle}`, // Platform is already string or undefined
      engagementRate: ((handle.length % 5) + 1) / 100,
      averageLikes: Math.floor(followerCount * (((handle.length % 5) + 1) / 100)),
      averageComments: Math.floor(followerCount * (((handle.length % 5) + 1) / 100) * 0.1),
      description: `Simulated profile for ${handle}.`,
      lastFetched: new Date().toISOString(),
    };
    console.log(`VALIDATION SUCCESS: ${handle} on ${platform}`, validatedData);
    return validatedData;
  } catch (error) {
    // Simulate API call error
    console.error('Error during simulated validation:', error);
    throw new Error('Simulated API validation failed'); // Throw an error to be caught by the hook
  }
}

interface UseDebouncedValidationReturn {
  isValidating: boolean;
  validationData: InfluencerData | null;
  error: string | null;
  success: boolean;
  // Optional: include a manual refetch function if needed later
  // refetch: () => void;
}

const DEBOUNCE_DELAY = 700; // milliseconds

export function useDebouncedInfluencerValidation(
  // Use string type for platform input
  platform: string | undefined,
  handle: string | undefined
): UseDebouncedValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<InfluencerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ref to store the timeout ID
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous validation state on input change
    setValidationData(null);
    setError(null);
    setSuccess(false);

    // Only proceed if platform and handle are valid enough to potentially validate
    if (!platform || !handle || handle.length < 3) {
      setIsValidating(false); // Ensure loading state is reset
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current); // Clear any pending timeout
      }
      return; // Don't schedule validation if inputs are insufficient
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Start loading state immediately for responsiveness
    setIsValidating(true);

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await validateInfluencerHandle(platform, handle);
        setValidationData(result);
        setSuccess(!!result); // Set success true only if result is not null
        setError(null); // Clear previous errors on success or valid 'null' result
      } catch (err) {
        console.error('Validation hook caught error:', err);
        setError(err instanceof Error ? err.message : 'Unknown validation error');
        setValidationData(null);
        setSuccess(false);
      } finally {
        setIsValidating(false); // End loading state
      }
    }, DEBOUNCE_DELAY);

    // Cleanup function to clear timeout if dependencies change before timeout triggers
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [platform, handle]); // Re-run effect when platform or handle changes

  return { isValidating, validationData, error, success };
}
