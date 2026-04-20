import { withAuth } from 'next-auth/middleware'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const session = await getToken({ req: request })
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}

