import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const posts = await db.socialPost.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse platforms from JSON string
    const parsedPosts = posts.map(post => ({
      ...post,
      platforms: JSON.parse(post.platforms),
    }))

    return NextResponse.json({ posts: parsedPosts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caption, mediaUrl, platforms, status, scheduledAt } = body

    if (!caption && !mediaUrl) {
      return NextResponse.json(
        { error: 'Caption or media URL is required' },
        { status: 400 }
      )
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    const post = await db.socialPost.create({
      data: {
        caption,
        mediaUrl,
        mediaType: mediaUrl ? (mediaUrl.startsWith('data:video') ? 'video' : 'image') : null,
        platforms: JSON.stringify(platforms),
        status: status || 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        postedAt: status === 'posted' ? new Date() : null,
      },
    })

    // Parse platforms for response
    const parsedPost = {
      ...post,
      platforms: JSON.parse(post.platforms),
    }

    return NextResponse.json({ post: parsedPost }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
