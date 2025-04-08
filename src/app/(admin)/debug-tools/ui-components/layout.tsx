'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getIconClasses } from '@/components/ui/utils/icon-integration';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function ComponentBrowserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  
  const navLinks = [
    { href: '/debug-tools/ui-components', label: 'Component Browser', icon: 'grid-2' },
    { href: '/debug-tools/ui-components/render-type-comparison', label: 'Server vs Client', icon: 'code-compare' },
    { href: '/debug-tools/ui-components/server-test', label: 'Server Test', icon: 'server' },
    { href: '/debug-tools/ui-components/client-test', label: 'Client Test', icon: 'browser' },
  ];

  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-background">
          <div className="container flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <Link 
                href="/debug-tools/ui-components" 
                className="font-semibold text-lg flex items-center"
              >
                <i className={`${getIconClasses('layer-group')} mr-2 text-primary`}></i>
                UI Components
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive = 
                    pathname === link.href || 
                    (pathname !== '/debug-tools/ui-components' && pathname.startsWith(link.href));
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm flex items-center ${
                        isActive 
                          ? 'font-medium text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <i className={`${getIconClasses(link.icon)} mr-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}></i>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="flex-1 pb-12">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
} 