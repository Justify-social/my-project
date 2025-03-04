import { ToastProvider } from '@/components/ui/toast';

export const metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastProvider>
        <main>
          <div className="border-b bg-white">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
              <h1 className="text-2xl font-bold">Settings</h1>
              <nav className="mt-4 flex space-x-6">
                <a 
                  href="/settings/profile" 
                  className="text-gray-700 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300"
                >
                  Profile
                </a>
                <a 
                  href="/settings/account" 
                  className="text-gray-700 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300"
                >
                  Account
                </a>
                <a 
                  href="/settings/team-management" 
                  className="text-gray-700 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300"
                >
                  Team
                </a>
                <a 
                  href="/settings/billing" 
                  className="text-gray-700 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300"
                >
                  Billing
                </a>
              </nav>
            </div>
          </div>
          {children}
        </main>
      </ToastProvider>
    </div>
  );
} 