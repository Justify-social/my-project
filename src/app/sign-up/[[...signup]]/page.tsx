import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full p-6 md:p-8 rounded-lg shadow-lg bg-white border border-divider">
                <div className="text-center mb-8">
                    {/* Placeholder for Logo */}
                    {/* <img src="/logo.png" alt="Logo" className="mx-auto h-12 w-auto mb-4" /> */}
                    <h1 className="text-2xl font-bold text-primary mt-4">Create your Account</h1>
                    <p className="text-secondary">Get started with our platform</p>
                </div>
                <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in" // Link back to sign-in
                    afterSignUpUrl="/dashboard" // Redirect after successful sign-up
                    appearance={{
                        baseTheme: undefined,
                        elements: {
                            // Apply styles consistent with sign-in page and Shadcn
                            formButtonPrimary: 'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                            card: 'bg-transparent shadow-none border-none', // Embed cleanly
                            headerTitle: 'text-primary text-xl font-semibold',
                            headerSubtitle: 'text-secondary text-sm',
                            formFieldInput: 'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
                            formFieldLabel: 'text-sm font-medium text-primary',
                            footerActionLink: 'text-accent hover:underline text-sm',
                            dividerLine: 'bg-divider',
                            socialButtonsBlockButton: 'border-divider hover:bg-gray-50',
                            // Add specific overrides for sign-up if needed
                        },
                    }}
                />
                <div className="text-center mt-6 text-sm text-secondary">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="font-medium text-accent hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
} 