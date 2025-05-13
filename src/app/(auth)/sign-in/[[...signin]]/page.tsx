import { SignIn } from '@clerk/nextjs';

// Removed Link import as it's handled by Clerk component
// import Link from 'next/link';

export default function SignInPage() {
  // Removed outer container div, layout handles centering and background
  return (
    <SignIn
      routing="path"
      path="/sign-in" // Note: Clerk needs the full path including the group potentially
      signUpUrl="/sign-up"
      forceRedirectUrl="/dashboard"
      appearance={{
        baseTheme: undefined,
        elements: {
          // Make card background transparent or remove padding/shadow if the right column provides it
          // Let's keep the card style for now, as it provides structure within the right column.
          card: 'bg-white shadow-md border border-divider p-6 rounded-lg max-w-md w-full',
          formButtonPrimary:
            'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
          formFieldInput:
            'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
          formFieldLabel: 'text-sm font-medium text-secondary',
          footerActionLink: 'text-interactive hover:underline text-sm',
          headerTitle: 'text-primary text-xl font-semibold',
          headerSubtitle: 'text-secondary text-sm',
          identityPreviewEditButton: 'text-accent hover:text-accent/80',
          dividerLine: 'bg-divider',
          socialButtonsBlockButton: 'border-divider hover:bg-gray-50',
        },
      }}
    />
  );
}
