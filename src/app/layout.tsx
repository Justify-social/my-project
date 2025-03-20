import { Inter } from 'next/font/google'
import { UserProvider } from '@auth0/nextjs-auth0/client'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";
import { Toaster } from 'react-hot-toast';
import { ToastProvider } from '@/components/ui/toast';

// CRITICAL: Import Font Awesome CSS before config
import '@fortawesome/fontawesome-svg-core/styles.css';
// THEN configure Font Awesome
import { config, library } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; // Prevent Font Awesome from auto-adding CSS

// Import commonly used icons
import { 
  faUser, faCheck, faGear, faBell, faStar, faMagnifyingGlass,
  faPlus, faMinus, faXmark, faChevronDown, faChevronUp, 
  faChevronLeft, faChevronRight, faEnvelope, faCalendarDays,
  faTrash, faTriangleExclamation, faCircleInfo, faLightbulb
} from '@fortawesome/pro-solid-svg-icons';

import {
  faUser as falUser, faHouse as falHouse, faGear as falGear
} from '@fortawesome/pro-light-svg-icons';

import {
  faTwitter, faFacebook, faGithub, faInstagram, faLinkedin
} from '@fortawesome/free-brands-svg-icons';

// Register commonly used icons
library.add(
  // Solid icons
  faUser, faCheck, faGear, faBell, faStar, faMagnifyingGlass,
  faPlus, faMinus, faXmark, faChevronDown, faChevronUp,
  faChevronLeft, faChevronRight, faEnvelope, faCalendarDays,
  faTrash, faTriangleExclamation, faCircleInfo, faLightbulb,
  
  // Light icons
  falUser, falHouse, falGear,
  
  // Brand icons
  faTwitter, faFacebook, faGithub, faInstagram, faLinkedin
);

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Justify',
  description: 'Measureing the impact of your social campaigns',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome Kit script removed - using only NPM packages */}
      </head>
      <body className={`${inter.className} bg-white`}>
        <UserProvider>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Toaster />
          <ToastProvider>
            <ClientLayout>
              <main className="min-h-screen bg-gray-100">
                {children}
              </main>
            </ClientLayout>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}