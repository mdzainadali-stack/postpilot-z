import { NextRequest, NextResponse } from 'next/server'
import { LLM } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    try {
      const llm = new LLM()
      const result = await llm.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media strategist. Generate engaging, creative post ideas that drive engagement. Provide specific, actionable ideas. Keep responses under 50 words.'
          },
          {
            role: 'user',
            content: 'Give me one creative social media post idea that would get high engagement. Make it specific and actionable.'
          }
        ],
        maxTokens: 100,
      })

      const idea = result?.output || result?.content || 'Share a behind-the-scenes photo of your workspace or creative process.'

      return NextResponse.json({ idea })
    } catch (llmError) {
      console.error('LLM Error:', llmError)
      
      // Fallback ideas
      const fallbackIdeas = [
        "Share a behind-the-scenes photo of your workspace.",
        "Post a carousel with '5 Tips for X'.",
        "Ask your audience: 'What is your biggest challenge right now?'",
        "Share a customer testimonial or success story.",
        "Create a 'Day in the Life' post."
      ]
      
      const idea = fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)]
      return NextResponse.json({ idea })
    }
  } catch (error) {
    console.error('Error generating idea:', error)
    return NextResponse.json(
      { error: 'Failed to generate idea' },
      { status: 500 }
    )
  }
}
