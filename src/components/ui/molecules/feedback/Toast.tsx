'use client';

import { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'

// Types for Toast functionality
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastStyle = 'banner' | 'compact';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  /**
   * Unique identifier for the toast
   */
  id: string;

  /**
   * Message to display in the toast
   */
  message: string;

  /**
   * Type of toast which affects the styling
   */
  type: ToastType;

  /**
   * Style of toast: 'banner' (full-width) or 'compact' (card-like)
   */
  style?: ToastStyle;

  /**
   * Optional title for the toast
   */
  title?: string;

  /**
   * Duration in milliseconds before the toast is auto-dismissed
   * Set to 0 to disable auto-dismiss
   */
  duration?: number;

  /**
   * Position of the toast on the screen
   */
  position?: ToastPosition;
}

interface ToastContextType {
  /**
   * Current active toasts
   */
  toasts: ToastProps[];

  /**
   * Display a success toast
   */
  success: (message: string, options?: ToastOptions) => string;

  /**
   * Display an error toast
   */
  error: (message: string, options?: ToastOptions) => string;

  /**
   * Display an info toast
   */
  info: (message: string, options?: ToastOptions) => string;

  /**
   * Display a warning toast
   */
  warning: (message: string, options?: ToastOptions) => string;

  /**
   * Dismiss a toast by its ID
   */
  dismiss: (id: string) => void;

  /**
   * Dismiss all toasts
   */
  dismissAll: () => void;

  /**
   * Custom toast with more options
   */
  custom: (options: ToastOptions & {type: ToastType;message: string;}) => string;
}

export interface ToastOptions {
  /**
   * Optional title for the toast
   */
  title?: string;

  /**
   * Toast style: 'banner' (full-width) or 'compact' (card-like)
   */
  style?: ToastStyle;

  /**
   * Duration in milliseconds before auto-dismiss
   * Default is 5000ms (5 seconds)
   * Set to 0 to disable auto-dismiss
   */
  duration?: number;

  /**
   * Position of the toast on the screen
   */
  position?: ToastPosition;

  /**
   * Optional callback when toast is dismissed
   */
  onDismiss?: () => void;
}

const DEFAULT_DURATION = 5000; // 5 seconds
const DEFAULT_POSITION: ToastPosition = 'bottom-right';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider component for toast functionality
 */
export function ToastProvider({
  children,
  defaultPosition = DEFAULT_POSITION
}: {children: ReactNode;defaultPosition?: ToastPosition;}) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((message: string, type: ToastType, options?: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastProps = {
      id,
      message,
      type,
      style: options?.style || 'banner',
      title: options?.title,
      duration: options?.duration ?? DEFAULT_DURATION,
      position: options?.position ?? defaultPosition
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration (if not 0)
    if (newToast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        options?.onDismiss?.();
      }, newToast.duration);
    }

    return id;
  }, [defaultPosition]);

  const success = useCallback((message: string, options?: ToastOptions) =>
  addToast(message, 'success', options), [addToast]);

  const error = useCallback((message: string, options?: ToastOptions) =>
  addToast(message, 'error', options), [addToast]);

  const info = useCallback((message: string, options?: ToastOptions) =>
  addToast(message, 'info', options), [addToast]);

  const warning = useCallback((message: string, options?: ToastOptions) =>
  addToast(message, 'warning', options), [addToast]);

  const custom = useCallback((options: ToastOptions & {type: ToastType;message: string;}) =>
  addToast(options.message, options.type, options), [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Clean up all toasts on unmount
  useEffect(() => {
    return () => {
      setToasts([]);
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        success,
        error,
        info,
        warning,
        dismiss,
        dismissAll,
        custom
      }}>

      {children}
      <ToastContainer />
    </ToastContext.Provider>);

}

/**
 * Container that displays all active toasts
 */
function ToastContainer() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, dismiss } = context;

  if (toasts.length === 0) {
    return null;
  }

  // Group toasts by position
  const groupedToasts: Record<ToastPosition, ToastProps[]> = {
    'top-right': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-left': [],
    'top-center': [],
    'bottom-center': []
  };

  toasts.forEach((toast) => {
    const position = toast.position || 'bottom-right';
    groupedToasts[position].push(toast);
  });

  // Position classes
  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center'
  };

  return (
    <>
      {(Object.entries(groupedToasts) as [ToastPosition, ToastProps[]][]).map(([position, positionToasts]) => {
        if (positionToasts.length === 0) return null;

        return (
          <div
            key={position}
            className={`${cn(
              "fixed z-50 flex flex-col gap-2 max-w-md w-full",
              positionClasses[position as ToastPosition]
            )} font-work-sans`}>

            <AnimatePresence>
              {positionToasts.map((toast) =>
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => dismiss(toast.id)} />

              )}
            </AnimatePresence>
          </div>);

      })}
    </>);

}

interface ToastItemProps {
  toast: ToastProps;
  onDismiss: () => void;
}

/**
 * Individual toast item
 */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  // Configuring styles based on toast type
  const config = {
    success: {
      bgClass: toast.style === 'compact' ?
      'bg-white text-gray-800 border border-gray-200' :
      'bg-green-50 text-green-800 border-l-4 border-green-400',
      icon: toast.style === 'compact' ?
      <div className="rounded-full bg-green-500 p-1 flex-shrink-0 font-work-sans">
            <Icon name="faCircleCheck" className="h-3 w-3 text-white font-work-sans" solid />
          </div> :
      <Icon name="faCheck" className="h-4 w-4 text-green-500 font-work-sans" solid />,
      title: toast.title || 'Success'
    },
    error: {
      bgClass: toast.style === 'compact' ?
      'bg-white text-gray-800 border border-gray-200' :
      'bg-red-50 text-red-800 border-l-4 border-red-400',
      icon: toast.style === 'compact' ?
      <div className="rounded-full bg-red-500 p-1 flex-shrink-0 font-work-sans">
            <Icon name="faCircleXmark" className="h-3 w-3 text-white font-work-sans" solid />
          </div> :
      <Icon name="faCircleXmark" className="h-4 w-4 text-red-500 font-work-sans" solid />,
      title: toast.title || 'Error'
    },
    warning: {
      bgClass: toast.style === 'compact' ?
      'bg-white text-gray-800 border border-gray-200' :
      'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400',
      icon: toast.style === 'compact' ?
      <div className="rounded-full bg-yellow-500 p-1 flex-shrink-0 font-work-sans">
            <Icon name="faTriangleExclamation" className="h-3 w-3 text-white font-work-sans" solid />
          </div> :
      <Icon name="faTriangleExclamation" className="h-4 w-4 text-yellow-500 font-work-sans" solid />,
      title: toast.title || 'Warning'
    },
    info: {
      bgClass: toast.style === 'compact' ?
      'bg-white text-gray-800 border border-gray-200' :
      'bg-blue-50 text-blue-800 border-l-4 border-blue-400',
      icon: toast.style === 'compact' ?
      <div className="rounded-full bg-blue-500 p-1 flex-shrink-0 font-work-sans">
            <Icon name="faCircleInfo" className="h-3 w-3 text-white font-work-sans" solid />
          </div> :
      <Icon name="faCircleInfo" className="h-4 w-4 text-blue-500 font-work-sans" solid />,
      title: toast.title || 'Info'
    }
  }[toast.type];

  // Special case for the "Campaign data loaded" compact toast to make it look exactly right
  const isCampaignDataLoaded = toast.style === 'compact' &&
  toast.type === 'success' &&
  toast.message === 'Campaign data loaded';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-lg shadow-md',
        'flex items-start',
        toast.style === 'compact' ?
        isCampaignDataLoaded ?
        'p-3 items-center gap-2 max-w-sm' :
        'p-4 max-w-sm' :
        'p-3 max-w-md w-full shadow-sm',
        config.bgClass
      )}
      role="alert">

      <div className={`${cn("flex-shrink-0", toast.style === 'compact' ? "mr-2" : "mr-3")} font-work-sans`}>
        {config.icon}
      </div>
      
      <div className="flex-grow font-work-sans">
        {toast.title && <div className="text-sm font-medium font-work-sans">{toast.title}</div>}
        <div className={`${cn(
          isCampaignDataLoaded ? "text-sm text-gray-800" : "text-sm"
        )} font-work-sans`}>
          {toast.message}
        </div>
      </div>
      
      {toast.style !== 'compact' &&
      <button
        type="button"
        className="ml-auto inline-flex text-gray-400 hover:text-gray-500 transition-colors font-work-sans"
        onClick={onDismiss}
        aria-label="Close toast">

          <span className="sr-only font-work-sans">Close</span>
          <Icon name="faXmark" className="h-4 w-4" solid={false} />
        </button>
      }
    </motion.div>);

}

/**
 * Hook to access toast functionality
 * @returns Toast context with methods to show and dismiss toasts
 * @example
 * const { success, error } = useToast();
 * success('Operation completed successfully');
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
/**
 * Toast - Combined component exporting all subcomponents
 * 
 * This component is the default export to ensure compatibility with dynamic imports.
 */
const Toast = {
  ToastProvider,
  useToast
};

export default Toast;
