import ConditionalLayout from '@/components/layouts/conditional-layout';
import './globals.css';
import { SidebarProvider } from '@/providers/SidebarProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { WebVitalsProvider } from '@/components/providers/WebVitalsProvider';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Icon } from '@/components/ui/icon/icon';
import { ClerkProvider } from '@clerk/nextjs';
import { debugClerkConfig } from '@/lib/auth/clerk-config';

export const metadata = {
  title: 'Justify',
  description: 'Measureing the impact of your social campaigns',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Debug Clerk configuration in development
  if (process.env.NODE_ENV === 'development') {
    debugClerkConfig();
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <head></head>
        <body className="bg-white">
          <LocalizationProvider>
            <WebVitalsProvider>
              <SidebarProvider>
                <SearchProvider>
                  <ConditionalLayout>{children}</ConditionalLayout>
                  <HotToaster
                    position="top-center"
                    toastOptions={{
                      duration: 5000, // Default duration 5s
                      success: {
                        duration: 3000, // Success duration 3s
                        icon: <Icon iconId="faFloppyDiskLight" className="h-5 w-5 text-success" />,
                        className: 'toast-success-custom',
                      },
                      error: {
                        icon: (
                          <Icon
                            iconId="faTriangleExclamationLight"
                            className="h-5 w-5 text-destructive"
                          />
                        ),
                        className: 'toast-error-custom',
                      },
                    }}
                  />
                </SearchProvider>
              </SidebarProvider>
            </WebVitalsProvider>
          </LocalizationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
