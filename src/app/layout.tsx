import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import ClientLayout from '@/components/layouts/client-layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

export const metadata = {
  title: 'Justify Social',
  description: 'Campaign Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`h-full ${inter.className}`}>
        <ClerkProvider>
          <ClientLayout>
            <main className="min-h-screen bg-gray-100">
              {children}
            </main>
          </ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  )
}
