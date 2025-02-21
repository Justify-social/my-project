import { UserProvider } from '@auth0/nextjs-auth0/client'
import { Inter } from 'next/font/google'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Justify',
  description: 'Campaign Management Platform',
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
      <body className={`${inter.className} bg-white`}>
        <UserProvider>
          <ClientLayout>
            <main className="min-h-screen bg-gray-100">
              {children}
            </main>
          </ClientLayout>
        </UserProvider>
      </body>
    </html>
  )
}
