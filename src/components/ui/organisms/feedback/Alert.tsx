import React from 'react';
import { cn } from '@/utils/string/utils';
import { Icon } from '@/components/ui/atoms/icons'

type AlertProps = {
  status?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  variant?: 'default' | 'bordered';
  children?: React.ReactNode;
};

const iconMap = {
  success: 'checkCircle',
  error: 'xCircle',
  warning: 'warning',
  info: 'info',
};

const colorMap = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-blue-500 dark:text-blue-400',
};

const bgColorMap = {
  success: 'bg-green-50 dark:bg-green-900/20',
  error: 'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-amber-50 dark:bg-amber-900/20',
  info: 'bg-blue-50 dark:bg-blue-900/20',
};

const borderColorMap = {
  success: 'border-green-500 dark:border-green-400',
  error: 'border-red-500 dark:border-red-400',
  warning: 'border-amber-500 dark:border-amber-400',
  info: 'border-blue-500 dark:border-blue-400',
};

export const Alert = ({ 
  status = 'info', 
  message, 
  className = '',
  dismissible = false,
  onDismiss,
  variant = 'default',
  children
}: AlertProps) => {
  const baseClass = cn(
    'p-4 rounded-md flex items-start',
    variant === 'default' ? bgColorMap[status] : 'border',
    variant === 'bordered' && borderColorMap[status],
    className
  );

  const iconName = iconMap[status];
  const iconClass = colorMap[status];

  return (
    <div className={baseClass}>
      <div className="flex-shrink-0 mr-3">
        <Icon 
          name={iconName} 
          className={cn("h-5 w-5", iconClass)} 
        />
      </div>
      <div className="flex-1">
        <div className="text-sm">
          {message}
          {children}
        </div>
      </div>
      {dismissible && (
        <button 
          onClick={onDismiss} 
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <Icon name="xMark" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;