import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const connections = await db.platformConnection.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, connected, accountName, accountHandle, avatarUrl } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    const connection = await db.platformConnection.upsert({
      where: { platform },
      create: {
        platform,
        connected: connected ?? false,
        accountName: accountName || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accountHandle: accountHandle || `@${platform}_user`,
        avatarUrl: avatarUrl || null,
        accessToken: connected ? 'mock_token_' + Date.now() : null,
        refreshToken: connected ? 'mock_refresh_token_' + Date.now() : null,
      },
      update: {
        connected: connected ?? false,
        accountName: accountName || undefined,
        accountHandle: accountHandle || undefined,
        avatarUrl: avatarUrl || undefined,
        accessToken: connected ? 'mock_token_' + Date.now() : null,
        refreshToken: connected ? 'mock_refresh_token_' + Date.now() : null,
      },
    })

    return NextResponse.json({ connection })
  } catch (error) {
    console.error('Error updating connection:', error)
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    const updated = await db.platformConnection.update({
      where: { platform },
      data: {
        connected: false,
        accessToken: null,
        refreshToken: null,
      }
    })

    return NextResponse.json({ connection: updated })
  } catch (error) {
    console.error('Error disconnecting platform:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect platform' },
      { status: 500 }
    )
  }
}
