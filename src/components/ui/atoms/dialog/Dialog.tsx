"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { IconAdapter } from "@/components/ui/atoms/icon/adapters"

// Define types for each component
type DialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
type DialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
type DialogPortalProps = DialogPrimitive.DialogPortalProps;
type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;
type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;
type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

// Define the compound component interface
interface CompoundDialog extends React.FC<DialogProps> {
  Trigger: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
  Portal: React.FC<DialogPortalProps>;
  Overlay: React.ForwardRefExoticComponent<DialogOverlayProps & React.RefAttributes<HTMLDivElement>>;
  Content: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
  Header: React.FC<DialogHeaderProps>;
  Footer: React.FC<DialogFooterProps>;
  Title: React.ForwardRefExoticComponent<DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>;
  Description: React.ForwardRefExoticComponent<DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
  Close: React.ForwardRefExoticComponent<DialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
}

// Implement components
const DialogComponent: React.FC<DialogProps> = DialogPrimitive.Root;

const DialogTriggerComponent = React.forwardRef<
  HTMLButtonElement,
  DialogTriggerProps
>((props, ref) => <DialogPrimitive.Trigger ref={ref} {...props} />);
DialogTriggerComponent.displayName = "DialogTrigger";

const DialogPortalComponent: React.FC<DialogPortalProps> = (props) => 
  <DialogPrimitive.Portal {...props} />;
DialogPortalComponent.displayName = "DialogPortal";

const DialogOverlayComponent = React.forwardRef<
  HTMLDivElement,
  DialogOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlayComponent.displayName = "DialogOverlay";

const DialogContentComponent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortalComponent>
    <DialogOverlayComponent />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <IconAdapter iconId="faXmarkLight" className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortalComponent>
));
DialogContentComponent.displayName = "DialogContent";

const DialogHeaderComponent: React.FC<DialogHeaderProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeaderComponent.displayName = "DialogHeader";

const DialogFooterComponent: React.FC<DialogFooterProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooterComponent.displayName = "DialogFooter";

const DialogTitleComponent = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitleComponent.displayName = "DialogTitle";

const DialogDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescriptionComponent.displayName = "DialogDescription";

// Create the compound component
export const Dialog = DialogComponent as CompoundDialog;
Dialog.Trigger = DialogTriggerComponent;
Dialog.Portal = DialogPortalComponent;
Dialog.Overlay = DialogOverlayComponent;
Dialog.Content = DialogContentComponent;
Dialog.Header = DialogHeaderComponent;
Dialog.Footer = DialogFooterComponent;
Dialog.Title = DialogTitleComponent;
Dialog.Description = DialogDescriptionComponent;
Dialog.Close = DialogPrimitive.Close;

// Export named components for direct imports
export const DialogTrigger = DialogTriggerComponent;
export const DialogPortal = DialogPortalComponent;
export const DialogOverlay = DialogOverlayComponent;
export const DialogContent = DialogContentComponent;
export const DialogHeader = DialogHeaderComponent;
export const DialogFooter = DialogFooterComponent;
export const DialogTitle = DialogTitleComponent;
export const DialogDescription = DialogDescriptionComponent;
export const DialogClose = DialogPrimitive.Close;
