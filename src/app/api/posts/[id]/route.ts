import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.socialPost.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const parsedPost = {
      ...post,
      platforms: JSON.parse(post.platforms),
    }

    return NextResponse.json({ post: parsedPost })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PUT update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { caption, mediaUrl, platforms, status, scheduledAt, errorMessage } = body

    const updateData: any = {}

    if (caption !== undefined) updateData.caption = caption
    if (mediaUrl !== undefined) {
      updateData.mediaUrl = mediaUrl
      updateData.mediaType = mediaUrl ? (mediaUrl.startsWith('data:video') ? 'video' : 'image') : null
    }
    if (platforms !== undefined) updateData.platforms = JSON.stringify(platforms)
    if (status !== undefined) updateData.status = status
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage

    // Update postedAt based on status
    if (status === 'posted' && status !== undefined) {
      updateData.postedAt = new Date()
    }

    const post = await db.socialPost.update({
      where: { id: params.id },
      data: updateData
    })

    const parsedPost = {
      ...post,
      platforms: JSON.parse(post.platforms),
    }

    return NextResponse.json({ post: parsedPost })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.socialPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
