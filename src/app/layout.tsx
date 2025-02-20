import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import ClientLayout from '@/components/layouts/client-layout'

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
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ClerkProvider>
      </body>
    </html>
  )
}
