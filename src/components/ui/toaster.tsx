/**
 * @component Toaster
 * @category organism
 * @subcategory feedback
 * @description Renders toast notifications based on the `useToast` hook.
 * @status 10th April
 */
'use client';

import { useToast } from '@/hooks/use-toast';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        ...props
      }: ToastProps & {
        id: string;
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: ToastActionElement;
      }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
