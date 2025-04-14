import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full p-6 md:p-8 rounded-lg shadow-lg bg-white border border-divider">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary mt-4">Welcome Back</h1>
                    <p className="text-secondary">Sign in to continue</p>
                </div>
                <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    afterSignInUrl="/dashboard"
                    appearance={{
                        baseTheme: undefined,
                        elements: {
                            formButtonPrimary: 'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
                            card: 'bg-transparent shadow-none border-none',
                            headerTitle: 'text-primary text-xl font-semibold',
                            headerSubtitle: 'text-secondary text-sm',
                            formFieldInput: 'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
                            formFieldLabel: 'text-sm font-medium text-primary',
                            footerActionLink: 'text-accent hover:underline text-sm',
                            identityPreviewEditButton: 'text-accent hover:text-accent/80',
                            dividerLine: 'bg-divider',
                            socialButtonsBlockButton: 'border-divider hover:bg-gray-50',
                        },
                    }}
                />
                <div className="text-center mt-6 text-sm text-secondary">
                    Don\'t have an account?{' '}
                    <Link href="/sign-up" className="font-medium text-accent hover:underline">
                        Sign up here
                    </Link>
                </div>
            </div>
        </div>
    );
} 