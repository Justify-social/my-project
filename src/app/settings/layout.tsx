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
          {children}
        </main>
      </ToastProvider>
    </div>
  );
} 