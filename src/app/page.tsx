'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, addDays, parseISO } from 'date-fns'
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  History, 
  Youtube, 
  Facebook, 
  Instagram,
  Image as ImageIcon,
  Sparkles,
  Hash,
  Lightbulb,
  Upload,
  X,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  Bell,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  BarChart3,
  TrendingUp,
  Eye,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Play,
  Share2
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface Post {
  id: string
  caption: string
  mediaUrl: string | null
  platforms: string[]
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  scheduledAt: string | null
  postedAt: string | null
  createdAt: string
}

interface PlatformConnection {
  platform: 'youtube' | 'instagram' | 'facebook'
  connected: boolean
  stats?: {
    followers?: string
    views?: string
    engagement?: string
    change?: string
  }
}

interface Reminder {
  id: string
  title: string
  date: string
  completed: boolean
  createdAt: string
}

interface Event {
  id: string
  title: string
  date: string
  note?: string
  createdAt: string
}

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  views: string
  likes: string
  comments: string
  uploadedAt: string
}

interface YouTubeAnalytics {
  subscribers: string
  totalViews: string
  totalVideos: string
  engagementRate: string
  viewsTrend: Array<{ name: string; views: number }>
  likesTrend: Array<{ name: string; likes: number }>
  commentsTrend: Array<{ name: string; comments: number }>
}

interface InstagramPost {
  id: string
  caption: string
  imageUrl: string
  likes: string
  comments: string
  shares: string
  createdAt: string
}

interface InstagramAnalytics {
  followers: string
  totalPosts: string
  avgEngagement: string
  reach: string
  likesTrend: Array<{ name: string; likes: number }>
  commentsTrend: Array<{ name: string; comments: number }>
  sharesTrend: Array<{ name: string; shares: number }>
}

interface FacebookPost {
  id: string
  caption: string
  imageUrl: string
  likes: string
  comments: string
  shares: string
  createdAt: string
}

interface FacebookAnalytics {
  followers: string
  totalPosts: string
  pageViews: string
  avgEngagement: string
  likesTrend: Array<{ name: string; likes: number }>
  commentsTrend: Array<{ name: string; comments: number }>
  sharesTrend: Array<{ name: string; shares: number }>
}

export default function AISocialPoster() {
  const [activeView, setActiveView] = useState('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [connections, setConnections] = useState<PlatformConnection[]>([
    {
      platform: 'youtube',
      connected: true,
      stats: { followers: '125K', views: '2.4M', engagement: '+12%' }
    },
    {
      platform: 'instagram',
      connected: true,
      stats: { followers: '45.2K', engagement: '3.5%', change: '+5%' }
    },
    {
      platform: 'facebook',
      connected: false,
      stats: { followers: '12K', reach: '890', change: '-2%' }
    }
  ])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'instagram'])
  const [caption, setCaption] = useState('')
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)

  // Dialog states
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [dateClickDialogOpen, setDateClickDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventNote, setEventNote] = useState('')

  // YouTube analytics data
  const [youtubeAnalytics, setYoutubeAnalytics] = useState<YouTubeAnalytics>({
    subscribers: '125K',
    totalViews: '2.4M',
    totalVideos: '156',
    engagementRate: '4.2%',
    viewsTrend: [
      { name: 'Jan', views: 120000 },
      { name: 'Feb', views: 150000 },
      { name: 'Mar', views: 180000 },
      { name: 'Apr', views: 140000 },
      { name: 'May', views: 200000 },
      { name: 'Jun', views: 250000 },
      { name: 'Jul', views: 220000 },
      { name: 'Aug', views: 280000 },
      { name: 'Sep', views: 320000 },
      { name: 'Oct', views: 380000 },
      { name: 'Nov', views: 420000 },
      { name: 'Dec', views: 480000 },
    ],
    likesTrend: [
      { name: 'Jan', likes: 8500 },
      { name: 'Feb', likes: 9200 },
      { name: 'Mar', likes: 11000 },
      { name: 'Apr', likes: 9500 },
      { name: 'May', likes: 13000 },
      { name: 'Jun', likes: 15500 },
      { name: 'Jul', likes: 14200 },
      { name: 'Aug', likes: 17800 },
      { name: 'Sep', likes: 21000 },
      { name: 'Oct', likes: 24500 },
      { name: 'Nov', likes: 28800 },
      { name: 'Dec', likes: 32000 },
    ],
    commentsTrend: [
      { name: 'Jan', comments: 1200 },
      { name: 'Feb', comments: 1450 },
      { name: 'Mar', comments: 1800 },
      { name: 'Apr', comments: 1350 },
      { name: 'May', comments: 2100 },
      { name: 'Jun', comments: 2500 },
      { name: 'Jul', comments: 2300 },
      { name: 'Aug', comments: 2800 },
      { name: 'Sep', comments: 3200 },
      { name: 'Oct', comments: 3650 },
      { name: 'Nov', comments: 4100 },
      { name: 'Dec', comments: 4800 },
    ],
  })

  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([
    {
      id: '1',
      title: 'How to Build a Full-Stack App with Next.js',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      views: '125K',
      likes: '8.5K',
      comments: '1.2K',
      uploadedAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'React Tutorial for Beginners - Complete Guide',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      views: '98K',
      likes: '7.2K',
      comments: '980',
      uploadedAt: '2024-01-10',
    },
    {
      id: '3',
      title: 'Tailwind CSS Tips & Tricks 2024',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      views: '76K',
      likes: '5.8K',
      comments: '750',
      uploadedAt: '2024-01-05',
    },
    {
      id: '4',
      title: 'Building Modern UI with shadcn/ui',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      views: '64K',
      likes: '4.9K',
      comments: '620',
      uploadedAt: '2024-01-01',
    },
    {
      id: '5',
      title: 'TypeScript Best Practices You Should Know',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      views: '52K',
      likes: '4.1K',
      comments: '540',
      uploadedAt: '2023-12-28',
    },
  ])

  // Instagram analytics data
  const [instagramAnalytics, setInstagramAnalytics] = useState<InstagramAnalytics>({
    followers: '45.2K',
    totalPosts: '328',
    avgEngagement: '3.5%',
    reach: '128K',
    likesTrend: [
      { name: 'Jan', likes: 4200 },
      { name: 'Feb', likes: 4800 },
      { name: 'Mar', likes: 5500 },
      { name: 'Apr', likes: 5100 },
      { name: 'May', likes: 6200 },
      { name: 'Jun', likes: 7100 },
      { name: 'Jul', likes: 6800 },
      { name: 'Aug', likes: 7900 },
      { name: 'Sep', likes: 8500 },
      { name: 'Oct', likes: 9200 },
      { name: 'Nov', likes: 9800 },
      { name: 'Dec', likes: 10500 },
    ],
    commentsTrend: [
      { name: 'Jan', comments: 580 },
      { name: 'Feb', comments: 640 },
      { name: 'Mar', comments: 720 },
      { name: 'Apr', comments: 690 },
      { name: 'May', comments: 810 },
      { name: 'Jun', comments: 890 },
      { name: 'Jul', comments: 850 },
      { name: 'Aug', comments: 960 },
      { name: 'Sep', comments: 1020 },
      { name: 'Oct', comments: 1100 },
      { name: 'Nov', comments: 1180 },
      { name: 'Dec', comments: 1250 },
    ],
    sharesTrend: [
      { name: 'Jan', shares: 210 },
      { name: 'Feb', shares: 250 },
      { name: 'Mar', shares: 290 },
      { name: 'Apr', shares: 270 },
      { name: 'May', shares: 340 },
      { name: 'Jun', shares: 390 },
      { name: 'Jul', shares: 370 },
      { name: 'Aug', shares: 420 },
      { name: 'Sep', shares: 470 },
      { name: 'Oct', shares: 510 },
      { name: 'Nov', shares: 560 },
      { name: 'Dec', shares: 620 },
    ],
  })

  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([
    {
      id: '1',
      caption: 'Beautiful sunset view from my window today! 🌅 #sunset #nature #photography',
      imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=300&fit=crop',
      likes: '3.2K',
      comments: '428',
      shares: '156',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      caption: 'New project update! Check out our latest design work. 💼✨ #design #work #creativity',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      likes: '2.8K',
      comments: '365',
      shares: '142',
      createdAt: '2024-01-12',
    },
    {
      id: '3',
      caption: 'Coffee and coding - perfect combo! ☕💻 #coding #developer #lifestyle',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      likes: '2.5K',
      comments: '298',
      shares: '118',
      createdAt: '2024-01-10',
    },
    {
      id: '4',
      caption: 'Travel vibes from Barcelona! 🇪🇸✈️ #travel #barcelona #adventure',
      imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop',
      likes: '4.1K',
      comments: '512',
      shares: '203',
      createdAt: '2024-01-08',
    },
    {
      id: '5',
      caption: 'New team member announcement! Welcome aboard! 🎉 #team #welcome #growth',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
      likes: '2.1K',
      comments: '245',
      shares: '98',
      createdAt: '2024-01-05',
    },
  ])

  // Facebook analytics data
  const [facebookAnalytics, setFacebookAnalytics] = useState<FacebookAnalytics>({
    followers: '12K',
    totalPosts: '245',
    pageViews: '89K',
    avgEngagement: '2.8%',
    likesTrend: [
      { name: 'Jan', likes: 1800 },
      { name: 'Feb', likes: 2100 },
      { name: 'Mar', likes: 2400 },
      { name: 'Apr', likes: 2200 },
      { name: 'May', likes: 2700 },
      { name: 'Jun', likes: 3100 },
      { name: 'Jul', likes: 2900 },
      { name: 'Aug', likes: 3400 },
      { name: 'Sep', likes: 3700 },
      { name: 'Oct', likes: 4000 },
      { name: 'Nov', likes: 4300 },
      { name: 'Dec', likes: 4600 },
    ],
    commentsTrend: [
      { name: 'Jan', comments: 320 },
      { name: 'Feb', comments: 360 },
      { name: 'Mar', comments: 410 },
      { name: 'Apr', comments: 380 },
      { name: 'May', comments: 440 },
      { name: 'Jun', comments: 490 },
      { name: 'Jul', comments: 460 },
      { name: 'Sep', comments: 520 },
      { name: 'Oct', comments: 560 },
      { name: 'Nov', comments: 590 },
      { name: 'Dec', comments: 620 },
      { name: 'Aug', comments: 490 },
    ],
    sharesTrend: [
      { name: 'Jan', shares: 140 },
      { name: 'Feb', shares: 170 },
      { name: 'Mar', shares: 200 },
      { name: 'Apr', shares: 180 },
      { name: 'May', shares: 230 },
      { name: 'Jun', shares: 260 },
      { name: 'Jul', shares: 240 },
      { name: 'Aug', shares: 280 },
      { name: 'Sep', shares: 310 },
      { name: 'Oct', shares: 340 },
      { name: 'Nov', shares: 370 },
      { name: 'Dec', shares: 410 },
    ],
  })

  const [facebookPosts, setFacebookPosts] = useState<FacebookPost[]>([
    {
      id: '1',
      caption: 'Check out our latest product launch! 🚀 We are excited to bring you something new and innovative.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      likes: '2.4K',
      comments: '328',
      shares: '245',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      caption: 'Happy New Year from our team! Wishing everyone a prosperous 2024! 🎆✨',
      imageUrl: 'https://images.unsplash.com/photo-1532153267853-0f0469af93d4?w=400&h=300&fit=crop',
      likes: '3.1K',
      comments: '415',
      shares: '368',
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      caption: 'Behind the scenes at our office! Meet our amazing team members. 👥💼',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
      likes: '1.8K',
      comments: '242',
      shares: '186',
      createdAt: '2023-12-28',
    },
    {
      id: '4',
      caption: 'Quick tip: Stay hydrated and take breaks! Your health matters! 💧🏃‍♂️',
      imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400&h=300&fit=crop',
      likes: '1.5K',
      comments: '198',
      shares: '142',
      createdAt: '2023-12-25',
    },
    {
      id: '5',
      caption: 'Holiday sale is ON! Up to 50% off on all products. Don\'t miss out! 🎁🛒',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
      likes: '2.8K',
      comments: '365',
      shares: '298',
      createdAt: '2023-12-20',
    },
  ])

  const { toast } = useToast()

  // Load data on mount
  useEffect(() => {
    loadPosts()
    loadReminders()
    loadEvents()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load posts:', error)
    }
  }

  const loadReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data.reminders || [])
      }
    } catch (error) {
      console.error('Failed to load reminders:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleConnection = (platform: 'youtube' | 'instagram' | 'facebook') => {
    setConnections(prev =>
      prev.map(conn =>
        conn.platform === platform
          ? { ...conn, connected: !conn.connected }
          : conn
      )
    )
    toast({
      title: platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : 'Facebook',
      description: connections.find(c => c.platform === platform)?.connected
        ? 'Disconnected'
        : 'Connected successfully',
    })
  }

  const openPlatformAnalytics = (platform: 'youtube' | 'instagram' | 'facebook') => {
    if (connections.find(c => c.platform === platform)?.connected) {
      setActiveView(platform)
    } else {
      toast({
        variant: 'destructive',
        title: 'Not Connected',
        description: `Please connect your ${platform} account first to view analytics.`,
      })
    }
  }

  const createPost = async () => {
    if (!caption && !mediaPreview) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please add a caption or image.',
      })
      return
    }
    if (selectedPlatforms.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Select at least one platform.',
      })
      return
    }

    setLoading(true)
    try {
      const status = scheduleDate ? 'scheduled' : 'posted'
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          mediaUrl: mediaPreview,
          platforms: selectedPlatforms,
          status,
          scheduledAt: scheduleDate || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(prev => [data.post, ...prev])
        
        // Reset form
        setCaption('')
        setMediaPreview(null)
        setScheduleDate('')
        
        toast({
          title: status === 'posted' ? 'Posted Successfully!' : 'Post Scheduled!',
          description: status === 'posted' 
            ? 'Your post has been published.' 
            : 'Your post has been scheduled.',
        })

        if (status === 'scheduled') {
          setActiveView('calendar')
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create post.',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateCaption = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        setCaption(data.caption)
        toast({
          title: 'Caption Generated!',
          description: 'AI has created a caption for you.',
        })
      }
    } catch (error) {
      console.error('Failed to generate caption:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateHashtags = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      })

      if (response.ok) {
        const data = await response.json()
        setCaption(prev => prev + '\n\n' + data.hashtags)
        toast({
          title: 'Hashtags Added!',
          description: 'AI has added relevant hashtags.',
        })
      }
    } catch (error) {
      console.error('Failed to generate hashtags:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateIdea = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: '💡 AI Idea',
          description: data.idea,
        })
      }
    } catch (error) {
      console.error('Failed to generate idea:', error)
    } finally {
      setLoading(false)
    }
  }

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminderTitle || !reminderDate) return

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: reminderTitle, date: reminderDate }),
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(prev => [...prev, data.reminder])
        setReminderTitle('')
        setReminderDate('')
        setReminderDialogOpen(false)
        setDateClickDialogOpen(false)
        setSelectedDate(null)
        toast({
          title: 'Reminder Created!',
          description: 'Your reminder has been added.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create reminder.',
      })
    }
  }

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !reminder.completed }),
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(prev => prev.map(r => r.id === id ? data.reminder : r))
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setReminders(prev => prev.filter(r => r.id !== id))
        toast({
          title: 'Reminder Deleted',
          description: 'Your reminder has been removed.',
        })
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle || !eventDate) return

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: eventTitle, date: eventDate, note: eventNote }),
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(prev => [...prev, data.event])
        setEventTitle('')
        setEventDate('')
        setEventNote('')
        setEventDialogOpen(false)
        setDateClickDialogOpen(false)
        setSelectedDate(null)
        toast({
          title: 'Event Created!',
          description: 'Your event has been added.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create event.',
      })
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== id))
        toast({
          title: 'Event Deleted',
          description: 'Your event has been removed.',
        })
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const getFilteredPosts = () => {
    return posts.filter(post => {
      const matchPlatform = filterPlatform === 'all' || post.platforms.includes(filterPlatform)
      const matchStatus = filterStatus === 'all' || post.status === filterStatus
      return matchPlatform && matchStatus
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setDateClickDialogOpen(true)
  }

  const openEventDialogFromDate = () => {
    setDateClickDialogOpen(false)
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm")
      setEventDate(formattedDate)
      setEventDialogOpen(true)
    }
  }

  const openReminderDialogFromDate = () => {
    setDateClickDialogOpen(false)
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd'T'HH:mm")
      setReminderDate(formattedDate)
      setReminderDialogOpen(true)
    }
  }

  const closeDateClickDialog = () => {
    setDateClickDialogOpen(false)
    setSelectedDate(null)
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: monthEnd })

    return calendarDays.map((day) => {
      const dayPosts = posts.filter(post => {
        if (!post.scheduledAt) return false
        const postDate = new Date(post.scheduledAt)
        return isSameDay(postDate, day)
      })

      const dayReminders = reminders.filter(reminder => {
        const reminderDate = new Date(reminder.date)
        return isSameDay(reminderDate, day)
      })

      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return isSameDay(eventDate, day)
      })

      const isCurrentMonth = isSameMonth(day, currentMonth)
      const isDayToday = isToday(day)

      return (
        <div
          key={day.toISOString()}
          onClick={() => isCurrentMonth && handleDateClick(day)}
          className={`
            min-h-[90px] md:min-h-[110px] p-2 rounded-xl border-2 transition-all duration-300 cursor-pointer
            ${isDayToday 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-lg shadow-blue-500/20' 
              : isCurrentMonth
              ? 'border-blue-200/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50 dark:border-blue-800/30 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-105'
              : 'opacity-40 bg-muted/10 cursor-default'
            }
          `}
        >
          <div className={`text-xs font-bold mb-1 ${isDayToday ? 'text-blue-600 dark:text-blue-300' : 'text-muted-foreground'}`}>
            {format(day, 'd')}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[60px]">
            {dayPosts.slice(0, 2).map(post => (
              <div 
                key={post.id} 
                className="text-[10px] bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded shadow-md truncate cursor-pointer hover:shadow-lg transition-shadow"
                title={post.caption}
              >
                📱 {post.caption.substring(0, 12)}...
              </div>
            ))}
            {dayReminders.slice(0, 1).map(reminder => (
              <div 
                key={reminder.id} 
                className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-2 py-0.5 rounded shadow-md truncate cursor-pointer hover:shadow-lg transition-shadow"
                title={reminder.title}
              >
                🔔 {reminder.title.substring(0, 12)}...
              </div>
            ))}
            {dayEvents.slice(0, 1).map(event => (
              <div 
                key={event.id} 
                className="text-[10px] bg-gradient-to-r from-blue-400 to-blue-600 text-white px-2 py-0.5 rounded shadow-md truncate cursor-pointer hover:shadow-lg transition-shadow"
                title={event.title}
              >
                📅 {event.title.substring(0, 12)}...
              </div>
            ))}
            {(dayPosts.length > 2 || dayReminders.length > 1 || dayEvents.length > 1) && (
              <div className="text-[10px] text-muted-foreground text-center">
                +{dayPosts.length + dayReminders.length + dayEvents.length - 4} more
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  // Get upcoming items for dashboard
  const getUpcomingItems = () => {
    const now = new Date()
    const upcomingPosts = posts.filter(post => 
      post.status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) > now
    ).slice(0, 2)
    
    const upcomingReminders = reminders.filter(reminder => 
      !reminder.completed && new Date(reminder.date) > now
    ).slice(0, 2)
    
    const upcomingEvents = events.filter(event => 
      new Date(event.date) > now
    ).slice(0, 2)

    return { upcomingPosts, upcomingReminders, upcomingEvents }
  }

  const { upcomingPosts, upcomingReminders, upcomingEvents } = getUpcomingItems()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">DRAFT</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">SCHEDULED</Badge>
      case 'posted':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">POSTED</Badge>
      case 'failed':
        return <Badge variant="destructive">FAILED</Badge>
      default:
        return <Badge>{status.toUpperCase()}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 dark:from-black dark:via-blue-950 dark:to-black">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-white/95 to-blue-50/90 dark:from-blue-950/95 dark:to-black/95 backdrop-blur-md border-r border-blue-200/30 dark:border-blue-800/30 p-6 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent drop-shadow-sm">
                AI Social
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'create', icon: Plus, label: 'Create Post' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' },
              { id: 'history', icon: History, label: 'Post History' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105'
                    : 'text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-200 hover:shadow-md hover:shadow-blue-500/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeView === item.id ? 'animate-pulse' : ''}`} />
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
          </nav>

          <Separator />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3">
            <span className="text-sm font-semibold">Theme</span>
            <ThemeToggle />
          </div>

          <div className="pt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/30 border border-blue-200/30 dark:border-blue-800/30">
            <Avatar className="w-12 h-12 ring-2 ring-blue-500/30 hover:ring-blue-500/60 transition-all">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">Demo User</p>
              <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold">Pro Plan</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-blue-50 dark:from-blue-950 dark:to-black/95 backdrop-blur-md border-t-2 border-blue-200/50 dark:border-blue-800/50 z-50 shadow-2xl">
          <div className="flex justify-around p-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard },
              { id: 'create', icon: Plus },
              { id: 'calendar', icon: Calendar },
              { id: 'history', icon: History },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  activeView === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-110' 
                    : 'text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-200 hover:shadow-md'
                }`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
                AI Social
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">Dashboard</h1>
                  <p className="text-muted-foreground font-medium">Overview of your connected social accounts & upcoming events.</p>
                </div>
                <Button onClick={() => setActiveView('create')} className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  New Post
                </Button>
              </div>

              {/* Platform Connections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {connections.map((conn) => (
                  <Card
                    key={conn.platform}
                    onClick={() => openPlatformAnalytics(conn.platform)}
                    className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50 cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          conn.platform === 'youtube' ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30' :
                          conn.platform === 'instagram' ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 shadow-pink-500/30' :
                          'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30'
                        }`}>
                          {conn.platform === 'youtube' && <Youtube className="w-7 h-7 text-white" />}
                          {conn.platform === 'instagram' && <Instagram className="w-7 h-7 text-white" />}
                          {conn.platform === 'facebook' && <Facebook className="w-7 h-7 text-white" />}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleConnection(conn.platform)
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            conn.connected
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 shadow-md hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${conn.connected ? 'bg-white' : 'bg-gray-500'}`} />
                          {conn.connected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-3xl font-black">{conn.stats?.followers || '0'}</p>
                          <p className="text-sm font-semibold text-muted-foreground">
                            {conn.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            {conn.platform === 'youtube' ? `${conn.stats?.views || '0'} Views` :
                             conn.platform === 'instagram' ? `${conn.stats?.engagement || '0'}% Engagement` :
                             `${conn.stats?.reach || '0'} Reach`}
                          </span>
                          <span className={`font-bold ${conn.stats?.change?.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {conn.stats?.change || '0%'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Create Post View */}
          {activeView === 'create' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Post</h1>
                <p className="text-muted-foreground">Draft, schedule, or post instantly with AI.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      {/* Media Upload */}
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          className="hidden"
                          id="media-upload"
                        />
                        <label htmlFor="media-upload" className="cursor-pointer">
                          {mediaPreview ? (
                            <div className="relative">
                            <img 
                              src={mediaPreview} 
                              alt="Preview" 
                              className="max-h-64 mx-auto rounded-lg object-contain"
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setMediaPreview(null)
                              }}
                              className="absolute top-2 right-2 p-1 bg-background/90 rounded-full hover:bg-background"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="font-medium">Click to upload or drag & drop</p>
                            <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, MP4</p>
                          </>
                        )}
                        </label>
                      </div>

                      {/* Caption Input */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Caption</label>
                        <Textarea
                          placeholder="Write something amazing... or let AI do it."
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      {/* AI Tools */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={generateCaption}
                          disabled={loading}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Caption
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={generateHashtags}
                          disabled={loading}
                        >
                          <Hash className="w-4 h-4 mr-2" />
                          Generate Hashtags
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={generateIdea}
                          disabled={loading}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Post Idea
                        </Button>
                      </div>

                      {/* Platform Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Select Platforms</label>
                        <div className="flex flex-wrap gap-4">
                          {(['youtube', 'instagram', 'facebook'] as const).map((platform) => (
                            <div key={platform} className="flex items-center space-x-2">
                              <Checkbox
                                id={platform}
                                checked={selectedPlatforms.includes(platform)}
                                onCheckedChange={() => togglePlatform(platform)}
                              />
                              <label
                                htmlFor={platform}
                                className="text-sm font-medium cursor-pointer flex items-center gap-2"
                              >
                                {platform === 'youtube' && <Youtube className="w-4 h-4" />}
                                {platform === 'instagram' && <Instagram className="w-4 h-4" />}
                                {platform === 'facebook' && <Facebook className="w-4 h-4" />}
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule & Post */}
                      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium">Schedule (Optional)</label>
                          <Input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Button 
                          onClick={createPost} 
                          disabled={loading}
                          className="md:mt-6"
                        >
                          {loading ? 'Posting...' : scheduleDate ? 'Schedule Post' : 'Post Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        {mediaPreview ? (
                          <img 
                            src={mediaPreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {caption || 'Your caption will appear here...'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-black border-none">
                    <CardContent className="pt-6">
                      <Sparkles className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-2">✨ AI Pro Tip</h3>
                      <p className="text-sm text-muted-foreground">
                        Posts with questions get 2x more engagement! Try asking your audience something in your next post.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">Content Calendar</h1>
                  <p className="text-muted-foreground font-medium">Plan your monthly strategy.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 border-2 hover:shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-lg font-black px-6 py-2 min-w-[200px] text-center bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-xl border-2 border-blue-300 dark:border-blue-700">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 border-2 hover:shadow-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <Card className="border-2 border-blue-200/30 dark:border-blue-800/30 shadow-2xl">
                <CardContent className="pt-6">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-black text-muted-foreground py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950 rounded-lg">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendarDays()}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events, Reminders, and Posts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Upcoming Events */}
                <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-blue-950/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-500/30 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-white" />
                      </div>
                      Upcoming Events
                    </CardTitle>
                    <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Create Event</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={createEvent} className="space-y-4">
                          <div>
                            <Label htmlFor="eventTitle">Event Title</Label>
                            <Input
                              id="eventTitle"
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="eventDate">Date & Time</Label>
                            <Input
                              id="eventDate"
                              type="datetime-local"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="eventNote">Note (Optional)</Label>
                            <Textarea
                              id="eventNote"
                              value={eventNote}
                              onChange={(e) => setEventNote(e.target.value)}
                              rows={3}
                              className="mt-2"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                            Create Event
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                        <p className="font-medium">No upcoming events</p>
                      </div>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/50 border border-blue-200/30 dark:border-blue-800/30 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-sm mb-1">{event.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(event.date), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)} className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Reminders */}
                <Card className="border-2 border-yellow-200/50 dark:border-yellow-800/50 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/50 dark:to-blue-950/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md shadow-yellow-500/30 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      Reminders
                    </CardTitle>
                    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all">
                          <Plus className="w-4 h-4 text-black" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold">Create Reminder</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={createReminder} className="space-y-4">
                          <div>
                            <Label htmlFor="reminderTitle">Reminder Title</Label>
                            <Input
                              id="reminderTitle"
                              value={reminderTitle}
                              onChange={(e) => setReminderTitle(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reminderDate">Date & Time</Label>
                            <Input
                              id="reminderDate"
                              type="datetime-local"
                              value={reminderDate}
                              onChange={(e) => setReminderDate(e.target.value)}
                              required
                              className="mt-2"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg">
                            Create Reminder
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    {upcomingReminders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-yellow-500" />
                        <p className="font-medium">No reminders</p>
                      </div>
                    ) : (
                      upcomingReminders.map((reminder) => (
                        <div key={reminder.id} className={`flex items-start justify-between p-3 rounded-xl border transition-all ${reminder.completed ? 'opacity-60 bg-muted/30 dark:bg-muted/10' : 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/50 dark:to-yellow-950/50 border-yellow-200/30 dark:border-yellow-800/30 hover:shadow-md'}`}>
                          <div className="flex items-start gap-2 flex-1">
                            <Checkbox
                              checked={reminder.completed}
                              onCheckedChange={() => toggleReminder(reminder.id)}
                              className="mt-1"
                            />
                            <div className={reminder.completed ? "line-through text-muted-foreground" : ""}>
                              <p className="font-bold text-sm mb-1">{reminder.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(reminder.date), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteReminder(reminder.id)} className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Posts */}
                <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-blue-950/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      Scheduled Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    {upcomingPosts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                        <p className="font-medium">No scheduled posts</p>
                      </div>
                    ) : (
                      upcomingPosts.map((post) => (
                        <div key={post.id} className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-950/50 border border-blue-200/30 dark:border-blue-800/30 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-sm mb-1 line-clamp-2">{post.caption}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.scheduledAt && format(new Date(post.scheduledAt), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold">
                              {post.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Date Click Dialog */}
              <Dialog open={dateClickDialogOpen} onOpenChange={setDateClickDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button 
                      onClick={openEventDialogFromDate}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                    >
                      <CalendarDays className="w-5 h-5 mr-2" />
                      Add Event
                    </Button>
                    <Button 
                      onClick={openReminderDialogFromDate}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Add Reminder
                    </Button>
                    <Button 
                      onClick={closeDateClickDialog}
                      variant="outline"
                      className="w-full border-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Post History View */}
          {activeView === 'history' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Post History</h1>
                  <p className="text-muted-foreground">Manage and review past content.</p>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Platforms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Caption</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredPosts().map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              {new Date(post.scheduledAt || post.postedAt || post.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {post.platforms.includes('youtube') && <Youtube className="w-4 h-4 text-red-600" />}
                                {post.platforms.includes('instagram') && <Instagram className="w-4 h-4 text-pink-600" />}
                                {post.platforms.includes('facebook') && <Facebook className="w-4 h-4 text-blue-600" />}
                                <span className="text-sm">
                                  {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[250px]">
                              <p className="text-sm truncate">{post.caption}</p>
                            </TableCell>
                            <TableCell>{getStatusBadge(post.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {getFilteredPosts().length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No posts found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* YouTube Analytics View */}
          {activeView === 'youtube' && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => setActiveView('dashboard')}
                  variant="outline"
                  className="rounded-xl hover:shadow-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">YouTube Analytics</h1>
                  <p className="text-muted-foreground font-medium">Track your channel performance & growth.</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-red-200/30 dark:border-red-800/30 bg-gradient-to-br from-white to-red-50/50 dark:from-red-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Youtube className="w-8 h-8 mx-auto mb-3 text-red-600 dark:text-red-400" />
                    <p className="text-3xl font-black mb-1">{youtubeAnalytics.subscribers}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Subscribers</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-red-200/30 dark:border-red-800/30 bg-gradient-to-br from-white to-red-50/50 dark:from-red-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <p className="text-3xl font-black mb-1">{youtubeAnalytics.totalViews}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Total Views</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-red-200/30 dark:border-red-800/30 bg-gradient-to-br from-white to-red-50/50 dark:from-red-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Play className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <p className="text-3xl font-black mb-1">{youtubeAnalytics.totalVideos}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Videos</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-red-200/30 dark:border-red-800/30 bg-gradient-to-br from-white to-red-50/50 dark:from-red-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                    <p className="text-3xl font-black mb-1">{youtubeAnalytics.engagementRate}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Engagement Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="col-span-1 md:col-span-3 border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Views Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={youtubeAnalytics.viewsTrend}>
                        <defs>
                          <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(59, 130, 246, 0.9)',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} fill="url(#viewsGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-green-200/30 dark:border-green-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Likes Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={youtubeAnalytics.likesTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(34, 197, 94, 0.9)',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="likes" fill="#22c55e" radius={[8, 8, 8, 8, 8]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-purple-200/30 dark:border-purple-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Comments Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={youtubeAnalytics.commentsTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(147, 51, 234, 0.9)',
                            border: '1px solid #9333ea',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line type="monotone" dataKey="comments" stroke="#9333ea" strokeWidth={2} dot={{ fill: '#9333ea', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Uploads */}
              <Card className="border-2 border-red-200/30 dark:border-red-800/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
                    Recent 5 Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {youtubeVideos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-red-50/30 to-white dark:from-red-950/30 dark:to-black/30 border border-red-200/30 dark:border-red-800/30 hover:shadow-lg transition-all"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-sm line-clamp-2 pr-4">{video.title}</h3>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(video.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs">
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold">{video.views}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="font-semibold">{video.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="font-semibold">{video.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Instagram Analytics View */}
          {activeView === 'instagram' && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => setActiveView('dashboard')}
                  variant="outline"
                  className="rounded-xl hover:shadow-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-pink-600 via-red-500 to-yellow-500 bg-clip-text text-transparent">Instagram Analytics</h1>
                  <p className="text-muted-foreground font-medium">Track your Instagram performance & growth.</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-200/30 dark:border-pink-800/30 bg-gradient-to-br from-white to-pink-50/50 dark:from-pink-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Instagram className="w-8 h-8 mx-auto mb-3 text-pink-600 dark:text-pink-400" />
                    <p className="text-3xl font-black mb-1">{instagramAnalytics.followers}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Followers</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-200/30 dark:border-pink-800/30 bg-gradient-to-br from-white to-pink-50/50 dark:from-pink-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <p className="text-3xl font-black mb-1">{instagramAnalytics.totalPosts}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Total Posts</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-200/30 dark:border-pink-800/30 bg-gradient-to-br from-white to-pink-50/50 dark:from-pink-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <p className="text-3xl font-black mb-1">{instagramAnalytics.avgEngagement}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Avg Engagement</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-200/30 dark:border-pink-800/30 bg-gradient-to-br from-white to-pink-50/50 dark:from-pink-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                    <p className="text-3xl font-black mb-1">{instagramAnalytics.reach}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Reach</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="col-span-1 md:col-span-3 border-2 border-pink-200/30 dark:border-pink-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      Likes Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={instagramAnalytics.likesTrend}>
                        <defs>
                          <linearGradient id="igLikesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(236, 72, 153, 0.9)',
                            border: '1px solid #ec4899',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} fill="url(#igLikesGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Comments Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={instagramAnalytics.commentsTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(59, 130, 246, 0.9)',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="comments" fill="#3b82f6" radius={[8, 8, 8, 8, 8]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-green-200/30 dark:border-green-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Shares Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={instagramAnalytics.sharesTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(34, 197, 94, 0.9)',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line type="monotone" dataKey="shares" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Posts */}
              <Card className="border-2 border-pink-200/30 dark:border-pink-800/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                    Recent 5 Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {instagramPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-pink-50/30 to-white dark:from-pink-950/30 dark:to-black/30 border border-pink-200/30 dark:border-pink-800/30 hover:shadow-lg transition-all"
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.caption}
                          className="w-32 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-sm line-clamp-2 pr-4">{post.caption}</h3>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs">
                              <ThumbsUp className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                              <span className="font-semibold">{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold">{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="font-semibold">{post.shares}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Facebook Analytics View */}
          {activeView === 'facebook' && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => setActiveView('dashboard')}
                  variant="outline"
                  className="rounded-xl hover:shadow-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Facebook Analytics</h1>
                  <p className="text-muted-foreground font-medium">Track your Facebook page performance & growth.</p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Facebook className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <p className="text-3xl font-black mb-1">{facebookAnalytics.followers}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Followers</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
                    <p className="text-3xl font-black mb-1">{facebookAnalytics.totalPosts}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Total Posts</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
                    <p className="text-3xl font-black mb-1">{facebookAnalytics.pageViews}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Page Views</p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-950/50 dark:to-black/50">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-3 text-orange-600 dark:text-orange-400" />
                    <p className="text-3xl font-black mb-1">{facebookAnalytics.avgEngagement}</p>
                    <p className="text-sm font-semibold text-muted-foreground">Avg Engagement</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="col-span-1 md:col-span-3 border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Likes Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={facebookAnalytics.likesTrend}>
                        <defs>
                          <linearGradient id="fbLikesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(59, 130, 246, 0.9)',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Area type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} fill="url(#fbLikesGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-green-200/30 dark:border-green-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Comments Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={facebookAnalytics.commentsTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(34, 197, 94, 0.9)',
                            border: '1px solid #22c55e',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="comments" fill="#22c55e" radius={[8, 8, 8, 8, 8]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 border-2 border-orange-200/30 dark:border-orange-800/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      Shares Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={facebookAnalytics.sharesTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                        <YAxis stroke="#888888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(249, 115, 22, 0.9)',
                            border: '1px solid #f97316',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line type="monotone" dataKey="shares" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Posts */}
              <Card className="border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Facebook className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Recent 5 Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facebookPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/30 to-white dark:from-blue-950/30 dark:to-black/30 border border-blue-200/30 dark:border-blue-800/30 hover:shadow-lg transition-all"
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.caption}
                          className="w-32 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-sm line-clamp-2 pr-4">{post.caption}</h3>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs">
                              <ThumbsUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-semibold">{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="font-semibold">{post.comments}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Share2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="font-semibold">{post.shares}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
