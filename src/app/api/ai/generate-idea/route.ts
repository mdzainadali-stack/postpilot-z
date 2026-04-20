import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const fallbackIdeas = [
      "Share a carousel post with '5 Quick Tips for [Your Niche]'. Numbered slides get 3x engagement! 📈",
      "Ask 'What\\'s your biggest challenge with [topic]? Reply below!' Questions boost comments 2x. 💬",
      "Post 'Before/After' transformation. Visual stories stop scrolls! ✨",
      "Share customer testimonial screenshot. Social proof converts! ⭐",
      "Create 'Day in Life' Reel series. Behind-the-scenes builds trust. 🎥"
    ];

    const idea = fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];

    return NextResponse.json({ idea })
  } catch (error) {
    console.error('Error generating idea:', error)
    return NextResponse.json(
      { idea: "Post a poll: 'Team A or Team B?' Polls get massive engagement!" },
      { status: 200 }
    )
  }
}
