import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caption } = body

    const fallbackHashtags = '#viral #trending #socialmedia #growth #marketing #digital #ai #future #innovation #success #motivation #business #entrepreneur #tech #productivity #mindset #leadership #startup #hustle #contentcreator';

    return NextResponse.json({ hashtags: fallbackHashtags })
  } catch (error) {
    console.error('Error generating hashtags:', error)
    return NextResponse.json(
      { hashtags: '#socialmedia #growth #marketing #digital #ai' },
      { status: 200 }
    )
  }
}
