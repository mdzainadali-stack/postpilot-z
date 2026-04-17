import { NextRequest, NextResponse } from 'next/server'
import { LLM } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caption } = body

    try {
      const llm = new LLM()
      const prompt = caption 
        ? `Generate 10-15 relevant, trending hashtags for this post caption: "${caption}". Only return the hashtags, nothing else.`
        : 'Generate 10-15 popular, trending social media hashtags. Only return the hashtags, nothing else.'

      const result = await llm.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a social media hashtag expert. Generate relevant, trending hashtags. Always respond with just the hashtags, no explanations. Format like: #hashtag1 #hashtag2 #hashtag3'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        maxTokens: 80,
      })

      const hashtags = result?.output || result?.content || '#viral #trending #socialmedia #growth #marketing #digital #ai #future'

      return NextResponse.json({ hashtags })
    } catch (llmError) {
      console.error('LLM Error:', llmError)
      
      // Fallback hashtags
      const fallbackHashtags = '#viral #trending #socialmedia #growth #marketing #digital #ai #future #innovation #success'
      
      return NextResponse.json({ hashtags: fallbackHashtags })
    }
  } catch (error) {
    console.error('Error generating hashtags:', error)
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    )
  }
}
