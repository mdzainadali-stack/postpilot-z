import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - PostPilot Z',
}

import { SessionProvider } from 'next-auth/react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

