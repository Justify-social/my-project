'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Theme context
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

// UI State context
interface UIStateContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const UIStateContext = createContext<UIStateContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

// Toast context
interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

// Combined providers component
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UIStateContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
          {children}
        </ToastContext.Provider>
      </UIStateContext.Provider>
    </ThemeContext.Provider>
  );
}

// Custom hooks for accessing the contexts
export function useTheme() {
  return useContext(ThemeContext);
}

export function useUIState() {
  return useContext(UIStateContext);
}

export function useToast() {
  return useContext(ToastContext);
}

// Export the contexts for direct usage
export { ThemeContext, UIStateContext, ToastContext }; 