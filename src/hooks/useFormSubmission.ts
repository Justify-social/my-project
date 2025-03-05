/**
 * useFormSubmission Hook
 * 
 * A custom hook for handling form submissions with API integration,
 * data transformation, and standardized error handling.
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ValidationError {
  field?: string;
  message: string;
}

export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, any>;
}

export interface FormSubmissionOptions<TFormData, TApiData> {
  /** API endpoint to submit to */
  endpoint: string;
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Whether to show toast notifications automatically */
  showToasts?: boolean;
  /** Success message to show */
  successMessage?: string;
  /** Function to transform form data to API format */
  transformData?: (data: TFormData) => TApiData;
  /** Custom headers to include in request */
  headers?: Record<string, string>;
  /** Callback on successful submission */
  onSuccess?: (response: any) => void;
  /** Callback on error */
  onError?: (error: ApiError) => void;
  /** Whether to include credentials with the request */
  withCredentials?: boolean;
}

export interface FormSubmissionResult<TFormData> {
  /** Current submission status */
  status: SubmissionStatus;
  /** Error object if submission failed */
  error: ApiError | null;
  /** Validation errors for specific fields */
  validationErrors: ValidationError[];
  /** Submit the form data */
  submit: (data: TFormData) => Promise<boolean>;
  /** Reset the submission state */
  reset: () => void;
  /** Last successful response */
  response: any;
}

/**
 * Custom hook for handling form submissions
 * @param options Configuration options for form submission
 * @returns Form submission state and methods
 */
export function useFormSubmission<TFormData, TApiData = TFormData>(
  options: FormSubmissionOptions<TFormData, TApiData>
): FormSubmissionResult<TFormData> {
  const {
    endpoint,
    method = 'POST',
    showToasts = true,
    successMessage = 'Successfully submitted',
    transformData,
    headers = {},
    onSuccess,
    onError,
    withCredentials = false
  } = options;

  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [response, setResponse] = useState<any>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setValidationErrors([]);
  }, []);

  const submit = useCallback(async (formData: TFormData): Promise<boolean> => {
    try {
      // Reset state before submission
      setStatus('submitting');
      setError(null);
      setValidationErrors([]);

      // Transform data if needed
      const apiData = transformData ? transformData(formData) : (formData as unknown as TApiData);

      // Make the API request
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        credentials: withCredentials ? 'include' : 'same-origin',
        body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(apiData)
      };

      const response = await fetch(endpoint, fetchOptions);
      const responseData = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && responseData.details) {
          const fieldErrors: ValidationError[] = [];
          
          // Extract field-specific errors from response
          if (typeof responseData.details === 'object') {
            Object.entries(responseData.details).forEach(([field, errors]) => {
              if (Array.isArray(errors)) {
                errors.forEach(error => {
                  fieldErrors.push({ field, message: error });
                });
              } else if (typeof errors === 'string') {
                fieldErrors.push({ field, message: errors });
              }
            });
          }
          
          setValidationErrors(fieldErrors);
        }

        // Create error object
        const apiError: ApiError = {
          code: responseData.code || `HTTP_${response.status}`,
          message: responseData.error || responseData.message || `Request failed with status ${response.status}`,
          details: responseData.details
        };

        setError(apiError);
        setStatus('error');

        // Show error toast
        if (showToasts) {
          toast.error(apiError.message);
        }

        // Call error callback
        if (onError) {
          onError(apiError);
        }

        return false;
      }

      // Success handling
      setStatus('success');
      setResponse(responseData);

      // Show success toast
      if (showToasts) {
        toast.success(successMessage);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(responseData);
      }

      return true;
    } catch (error) {
      console.error('Form submission error:', error);

      // Handle unexpected errors
      const apiError: ApiError = {
        message: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred'
      };

      setError(apiError);
      setStatus('error');

      // Show error toast
      if (showToasts) {
        toast.error(apiError.message);
      }

      // Call error callback
      if (onError) {
        onError(apiError);
      }

      return false;
    }
  }, [
    endpoint, 
    method, 
    showToasts, 
    successMessage, 
    transformData, 
    headers, 
    onSuccess, 
    onError, 
    withCredentials
  ]);

  return {
    status,
    error,
    validationErrors,
    submit,
    reset,
    response
  };
}

/**
 * Autosave hook that leverages useFormSubmission for autosaving form data
 * @param options Configuration options for autosave
 * @returns Autosave state and methods
 */
export function useAutosave<TFormData, TApiData = TFormData>(
  options: FormSubmissionOptions<TFormData, TApiData> & {
    /** Interval in milliseconds between save attempts */
    interval?: number;
    /** Debounce time to wait after changes before saving */
    debounce?: number;
    /** Whether to enable autosaving */
    enabled?: boolean;
  }
) {
  const { 
    interval = 30000, 
    debounce = 2000,
    enabled = true,
    showToasts = false,
    ...submissionOptions 
  } = options;
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [intervalTimer, setIntervalTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  
  const formSubmission = useFormSubmission<TFormData, TApiData>({
    ...submissionOptions,
    showToasts,
    successMessage: 'Autosaved successfully',
    onSuccess: (response) => {
      setLastSaved(new Date());
      setIsDirty(false);
      if (options.onSuccess) {
        options.onSuccess(response);
      }
    }
  });
  
  const { submit, status } = formSubmission;
  
  /**
   * Mark the form as dirty and schedule an autosave
   */
  const setDirty = useCallback((formData: TFormData) => {
    if (!enabled) return;
    
    setIsDirty(true);
    
    // Clear existing timer
    if (timer) {
      clearTimeout(timer);
    }
    
    // Set a new timer to save after debounce period
    const newTimer = setTimeout(() => {
      submit(formData);
    }, debounce);
    
    setTimer(newTimer);
  }, [enabled, timer, debounce, submit]);
  
  /**
   * Start the autosave interval
   */
  const startAutosave = useCallback((initialData: TFormData) => {
    if (!enabled) return;
    
    // Clear any existing interval
    if (intervalTimer) {
      clearInterval(intervalTimer);
    }
    
    // Set initial data
    let currentData = initialData;
    
    // Create a new interval
    const newIntervalTimer = setInterval(() => {
      if (isDirty && status !== 'submitting') {
        submit(currentData);
      }
    }, interval);
    
    setIntervalTimer(newIntervalTimer);
    
    // Return update function
    return (newData: TFormData) => {
      currentData = newData;
      setDirty(newData);
    };
  }, [enabled, intervalTimer, interval, isDirty, status, submit, setDirty]);
  
  /**
   * Stop the autosave interval
   */
  const stopAutosave = useCallback(() => {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      setIntervalTimer(null);
    }
    
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  }, [intervalTimer, timer]);
  
  return {
    ...formSubmission,
    lastSaved,
    isDirty,
    setDirty,
    startAutosave,
    stopAutosave
  };
} 