import { NextRequest, NextResponse } from 'next/server'

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

    // Enhanced fallback - AI ready
    const fallbackCaptions = [
      "Unlock your potential today! 🚀 #Growth #Mindset #SuccessMindset 💪✨",
      "Just shipped a new feature! What do you think? 💡 #Tech #SaaS #Innovation",
      "Monday motivation: Keep pushing forward! 🏔️ #MotivationMonday #Entrepreneur",
      "Success is not final, failure is not fatal. The courage to continue counts. 🌟 #Wisdom #Perseverance",
      "Double tap if you're ready to level up your game! 📈 #LevelUp #BusinessGrowth #Hustle"
    ];

    const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];

    return NextResponse.json({ caption })
  } catch (error) {
    console.error('Error generating caption:', error)
    return NextResponse.json(
      { caption: 'Ready to grow? Let\\'s make it happen! 🚀 #Motivation' },
      { status: 200 }
    )
  }
}
