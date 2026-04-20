import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updateData: any = { ...body }

    // Parse platforms if provided
    if (updateData.platforms && typeof updateData.platforms === 'object') {
      updateData.platforms = JSON.stringify(updateData.platforms)
    }

    // Convert dates
    if (updateData.scheduledAt) updateData.scheduledAt = new Date(updateData.scheduledAt)
    if (updateData.postedAt) updateData.postedAt = new Date(updateData.postedAt)

    const post = await db.socialPost.update({
      where: { id: params.id },
      data: updateData
    })

    // Parse platforms for response
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
