'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the toast types
export type ToastType = 'info' | 'success' | 'warning' | 'error';

// Define the toast interface
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Define the toast context interface
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

// Create a hook for using the toast context
export const useToast = () => useContext(ToastContext);

// Create the toast provider component
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider; 