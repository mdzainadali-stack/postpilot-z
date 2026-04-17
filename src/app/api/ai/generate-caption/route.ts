import { NextRequest, NextResponse } from 'next/server'
import { LLM } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const prompts = [
      "Generate an engaging social media post caption for a tech/saas product. Make it short, catchy, and include relevant emojis.",
      "Create a motivational social media post caption. Keep it inspiring and use emojis.",
      "Write a social media caption about productivity and business growth. Add some relevant hashtags.",
      "Generate an engaging caption for a lifestyle/entrepreneurship post. Make it relatable and authentic.",
      "Create a social media caption about innovation and technology. Use modern emojis."
    ]

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]

    try {
      const llm = new LLM()
      const result = await llm.chat({
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert who creates engaging, viral-worthy captions for posts on platforms like Instagram, Twitter, and LinkedIn. Keep captions concise (under 280 characters), engaging, and include relevant emojis. Always respond with just the caption text, no explanations.'
          },
          {
            role: 'user',
            content: randomPrompt
          }
        ],
        maxTokens: 100,
      })

      const caption = result?.output || result?.content || 'Unlock your potential today! 🚀 #Growth #Mindset'

      return NextResponse.json({ caption })
    } catch (llmError) {
      console.error('LLM Error:', llmError)
      
      // Fallback captions
      const fallbackCaptions = [
        "Unlock your potential today! 🚀 #Growth #Mindset",
        "Just shipped a new feature! What do you think? 💡 #Tech #SaaS",
        "Monday motivation: Keep pushing forward! 🏔️",
        "Success is not final, failure is not fatal. 🌟"
      ]
      
      const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)]
      return NextResponse.json({ caption })
    }
  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json(
      { error: 'Failed to generate caption' },
      { status: 500 }
    )
  }
}
