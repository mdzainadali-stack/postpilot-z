# PostPilot Ai 🚀

**AI-Powered Social Media Management Platform**

![PostPilot Ai](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

A modern, production-ready social media management platform built with Next.js 16, featuring AI-powered content creation, post scheduling, analytics, and trending content discovery.

## ✨ Features

### 📱 Dashboard
- **Platform Connection Management** - Connect YouTube, Instagram, and Facebook accounts
- **Real-time Statistics** - View followers, views, engagement metrics
- **Trending Content** - Top 5 trending videos and shorts from your region
- **Upcoming Items** - See scheduled posts, reminders, and events at a glance

### 🤖 AI Content Creation
- **AI Caption Generator** - Generate engaging captions automatically
- **AI Hashtag Generator** - Get relevant hashtags for better reach
- **AI Post Ideas** - Get content suggestions powered by AI

### 📅 Calendar & Scheduling
- **Interactive Calendar** - Visual month view with all your content
- **Event Management** - Create, edit, and delete events
- **Reminder System** - Set reminders for important dates
- **Post Scheduling** - Schedule posts for automatic publishing
- **Calendar Export** - Export your calendar data as JSON

### 📊 Analytics
- **Platform Analytics** - Detailed stats for YouTube, Instagram, Facebook
- **Trend Charts** - Visual representation of your growth over time
- **Engagement Metrics** - Track likes, comments, shares, and more

### 💼 Post Management
- **Create Posts** - Draft and create new social media posts
- **Multi-Platform** - Post to multiple platforms at once
- **Media Upload** - Support for images and videos
- **Draft & Schedule** - Save as draft or schedule for later
- **Post History** - View and manage all your posts
- **Status Tracking** - Track draft, scheduled, posted, and failed posts

### 👤 Profile & Subscription
- **User Profile** - Manage your account settings
- **Subscription Plans** - Free, Pro, and Premium tiers
- **Plan Comparison** - See features across all plans
- **Easy Upgrade** - One-click plan changes

## 🎨 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide Icons** - Consistent icon set
- **Recharts** - Chart library for analytics visualization
- **date-fns** - Modern date manipulation library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Type-safe database client
- **SQLite** - Lightweight database (configurable)

### AI Integration
- **Z-AI SDK** - AI-powered features
  - Caption generation
  - Hashtag generation
  - Content ideas
- **YouTube Data API v3** - Trending content

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun 1.3+
- npm, yarn, or bun

### Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd postpilot-ai

# Install dependencies
npm install
# or
bun install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=file:./db/custom.db

# YouTube API (Optional - for trending feature)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Get YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key to your `.env` file

## 🚀 Getting Started

### Development Mode

```bash
# Run development server
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build the application
npm run build
# or
bun run build
```

The optimized production build will be created in `.next/standalone/ directory.

### Production Deployment

```bash
# Run production server
cd .next/standalone
bun server.js
# or
node server.js
```

The server will start on port 3000 by default.

## 📂 Project Structure

```
postpilot-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── posts/          # Post management API
│   │   │   ├── reminders/      # Reminders API
│   │   │   ├── events/         # Events API
│   │   │   ├── subscription/    # Subscription API
│   │   │   ├── youtube/        # YouTube trending API
│   │   │   └── ai/            # AI features API
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── theme-toggle.tsx   # Theme switcher
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── .next/                   # Next.js build output
├── .env                     # Environment variables
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── next.config.ts           # Next.js config
```

## 🔧 Configuration

### Database Setup

```bash
# Initialize database
npm run db:push
# or
bun run db:push
```

This will create the SQLite database and apply the schema.

### Schema

```prisma
model SocialPost {
  id          String   @id @default(cuid())
  caption     String
  mediaUrl    String?
  mediaType   String?
  platforms   String
  status      String   @default("draft")
  scheduledAt DateTime?
  postedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Reminder {
  id          String   @id @default(cuid())
  title       String
  date        DateTime
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Event {
  id          String   @id @default(cuid())
  title       String
  date        DateTime
  note        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Subscription {
  id        String   @id @default(cuid())
  userId    String?
  plan      String   @default("free")
  status    String   @default("active")
  price     Int      @default(0)
  billing   String   @default("monthly")
  startedAt DateTime @default(now())
  endsAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🎨 Features Overview

### 1. Dashboard
- Platform connection cards with toggle
- Auto-detected trending content (location-based)
- Upcoming items overview
- Quick access to all features

### 2. Trending Section
- **Auto Location Detection** - Shows content from user's country
- **Two Tabs:**
  - Videos: Top 5 long-form videos (>60 seconds)
  - Shorts: Top 5 short videos (≤60 seconds)
- **Video Cards:**
  - Rank badges (Gold, Silver, Bronze for top 3)
  - Thumbnails with hover zoom
  - Views, likes, comments (formatted)
  - Duration badges (Video/Shorts)
  - Click to open on YouTube

### 3. Create Post
- Media upload with preview
- Caption textarea
- AI-powered tools:
  - Generate Caption
  - Generate Hashtags
  - Get Post Ideas
- Platform selection (YouTube, Instagram, Facebook)
- Schedule option with datetime picker

### 4. Calendar
- Month view with navigation
- Post indicators
- Reminder markers
- Event badges
- Click on date to create items
- Calendar export functionality

### 5. Post History
- Filter by platform (All, YouTube, Instagram, Facebook)
- Filter by status (All, Draft, Scheduled, Posted, Failed)
- View post details
- Delete posts

### 6. Profile
- User avatar and info
- Current subscription badge
- Three plan cards:
  - Free: ₹0/month
  - Pro: ₹199/month
  - Premium: ₹999/year
- Feature comparison table
- Plan upgrade/downgrade buttons

## 🌍 Localization

The app supports automatic location-based content:

### Supported Countries
- India (IN)
- United States (US)
- United Kingdom (GB)
- Canada (CA)
- Australia (AU)
- Germany (DE)
- France (FR)
- Japan (JP)
- China (CN)
- Brazil (BR)
- Russia (RU)
- South Korea (KR)
- Mexico (MX)
- South Africa (ZA)
- Nigeria (NG)

## 🎯 API Endpoints

### Posts
```
GET  /api/posts          - Get all posts
POST /api/posts          - Create new post
GET  /api/posts/:id      - Get single post
PUT  /api/posts/:id      - Update post
DELETE /api/posts/:id   - Delete post
```

### Reminders
```
GET  /api/reminders          - Get all reminders
POST /api/reminders          - Create new reminder
PUT  /api/reminders/:id      - Update reminder
DELETE /api/reminders/:id   - Delete reminder
```

### Events
```
GET  /api/events          - Get all events
POST /api/events          - Create new event
PUT  /api/events/:id      - Update event
DELETE /api/events/:id   - Delete event
```

### Subscription
```
GET  /api/subscription      - Get current subscription
POST /api/subscription     - Update subscription plan
```

### YouTube Trending
```
GET /api/youtube/trending?country=IN&type=video    - Get trending videos
GET /api/youtube/trending?country=IN&type=shorts   - Get trending shorts
```

### AI Features
```
POST /api/ai/generate-caption   - Generate AI caption
POST /api/ai/generate-hashtags  - Generate AI hashtags
POST /api/ai/generate-idea      - Get AI content idea
```

## 🎨 Customization

### Colors
The app uses a dark theme with blue accents. To customize:

```css
/* Primary colors: */
--primary: blue-600
--primary-foreground: white

/* Background: */
--background: #0d1b2e
--card: #162035
--card-border: #1e3050
```

### Icons
Uses Lucide icons. To add new icons:

```tsx
import { IconName } from 'lucide-react'

<IconName className="w-5 h-5" />
```

## 📱 Responsive Design

The app is fully responsive:

- **Mobile** - Bottom navigation, full-width cards
- **Tablet** - Two-column layouts
- **Desktop** - Three-column layouts, sidebar navigation

## 🔒 Security

- Environment variables for sensitive data
- Input sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection (React)
- API route protection

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build
npm run build

# Copy .next/standalone to server
scp -r .next/standalone user@server:/var/www/postpilot

# Start
cd /var/www/postpilot
bun server.js
```

## 📊 Subscription Plans

### Free Plan (₹0/month)
- Up to 5 posts/month
- 1 social platform
- Basic analytics
- Email support

### Pro Plan (₹199/month)
- Unlimited posts
- All social platforms
- Advanced analytics
- AI caption generator
- Priority support
- Calendar scheduling

### Premium Plan (₹999/year)
- Everything in Pro
- AI hashtag generator
- AI content ideas
- 24/7 premium support
- Team collaboration
- White-label reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue in the repository
- Email: support@postpilot.ai
- Documentation: [Link to docs]

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Lucide](https://lucide.dev/) - Icon library
- [Recharts](https://recharts.org/) - Chart library
- [YouTube API](https://developers.google.com/youtube/v3) - Data API

---

**Built with ❤️ using Next.js and AI**

**Version:** 1.0.0
**Last Updated:** April 2026
