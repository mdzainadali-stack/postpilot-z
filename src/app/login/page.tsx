'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Signed in as {session.user?.email}</p>
          <Button onClick={() => signOut()}>Sign out</Button>
          <Button asChild>
            <a href="/">Go to Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Sign in to PostPilot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => signIn('google')} className="w-full">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  )
}

