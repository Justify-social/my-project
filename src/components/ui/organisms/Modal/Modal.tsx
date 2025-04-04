import React from 'react';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { Icon } from '@/components/ui/atoms/icon';

const modalVariants = cva("fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4", {
  variants: {
    position: {
      center: "items-center justify-center",
      top: "items-start justify-center pt-16",
      bottom: "items-end justify-center pb-16",
    }
  },
  defaultVariants: {
    position: "center"
  }
});

const modalContentVariants = cva("bg-white rounded-lg shadow-lg w-full overflow-hidden", {
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-full",
    }
  },
  defaultVariants: {
    size: "md"
  }
});

export interface ModalProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof modalVariants>,
  VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, children, position, size, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
      
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
      <div
        className={cn(modalVariants({ position }))}
        onClick={onClose}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            modalContentVariants({ size }),
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Close dialog"
              >
                <Icon iconId="faXmarkLight" size="lg" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export default Modal; 