'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Plus, 
  Calendar as CalendarIcon, 
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
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Bell,
  CalendarDays,
  Trash2,
  Sun,
  Moon,
  Check
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

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

interface Reminder {
  id: string
  title: string
  date: string
  completed: boolean
}

interface Event {
  id: string
  title: string
  date: string
  note: string | null
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

type Theme = 'dark' | 'light'

export default function AISocialPoster() {
  const [activeView, setActiveView] = useState('dashboard')
  const [theme, setTheme] = useState<Theme>('light')
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
  
  // Reminder & Event Form States
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventNote, setEventNote] = useState('')
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)

  const { toast } = useToast()

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }, [theme])

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

  const createReminder = async () => {
    if (!reminderTitle || !reminderDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      })
      return
    }

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reminderTitle,
          date: reminderDate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReminders(prev => [data.reminder, ...prev])
        setReminderTitle('')
        setReminderDate('')
        setReminderDialogOpen(false)
        toast({
          title: 'Reminder Added!',
          description: 'Your reminder has been set.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add reminder.',
      })
    }
  }

  const toggleReminder = async (id: string, completed: boolean) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !completed }),
      })

      if (response.ok) {
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, completed: !completed } : r)
        )
      }
    } catch (error) {
      console.error('Failed to update reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE',
      })

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

  const createEvent = async () => {
    if (!eventTitle || !eventDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields.',
      })
      return
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          note: eventNote,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(prev => [data.event, ...prev])
        setEventTitle('')
        setEventDate('')
        setEventNote('')
        setEventDialogOpen(false)
        toast({
          title: 'Event Added!',
          description: 'Your event has been scheduled.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add event.',
      })
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      })

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

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 md:h-16 bg-muted/10 rounded-md" />)
    }

    // Days of month - SMALLER SIZE
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      
      // Get posts for this day
      const dayPosts = posts.filter(post => {
        const postDate = post.scheduledAt || post.postedAt || post.createdAt
        const postDateObj = new Date(postDate)
        return (
          postDateObj.getDate() === day &&
          postDateObj.getMonth() === month &&
          postDateObj.getFullYear() === year
        )
      })

      // Get reminders for this day
      const dayReminders = reminders.filter(r => {
        const rDate = new Date(r.date)
        return (
          rDate.getDate() === day &&
          rDate.getMonth() === month &&
          rDate.getFullYear() === year
        )
      })

      // Get events for this day
      const dayEvents = events.filter(e => {
        const eDate = new Date(e.date)
        return (
          eDate.getDate() === day &&
          eDate.getMonth() === month &&
          eDate.getFullYear() === year
        )
      })

      const hasItems = dayPosts.length > 0 || dayReminders.length > 0 || dayEvents.length > 0

      days.push(
        <div 
          key={day} 
          className={`h-14 md:h-16 bg-muted/10 rounded-md p-1.5 border border-border hover:bg-muted/30 transition-colors cursor-pointer relative ${hasItems ? 'ring-1 ring-blue-500/30' : ''}`}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-1">{day}</div>
          <div className="space-y-0.5">
            {/* Posts */}
            {dayPosts.slice(0, 1).map(post => (
              <div 
                key={post.id} 
                className="text-[10px] bg-blue-500 text-white px-1 py-0.5 rounded truncate"
                title={post.caption}
              >
                {post.caption.substring(0, 10)}...
              </div>
            ))}
            {/* Reminders */}
            {dayReminders.slice(0, 1).map(r => (
              <div 
                key={r.id} 
                className="text-[10px] bg-yellow-500 text-white px-1 py-0.5 rounded truncate"
                title={r.title}
              >
                {r.title.substring(0, 10)}...
              </div>
            ))}
            {/* Events */}
            {dayEvents.slice(0, 1).map(e => (
              <div 
                key={e.id} 
                className="text-[10px] bg-purple-500 text-white px-1 py-0.5 rounded truncate"
                title={e.title}
              >
                {e.title.substring(0, 10)}...
              </div>
            ))}
            {dayPosts.length + dayReminders.length + dayEvents.length > 1 && (
              <div className="text-[10px] text-muted-foreground">
                +{dayPosts.length + dayReminders.length + dayEvents.length - 1}
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const getUpcomingItems = () => {
    const now = new Date()
    const upcoming = []
    
    // Get upcoming reminders (not completed)
    reminders.filter(r => !r.completed && new Date(r.date) >= now).forEach(r => {
      upcoming.push({ type: 'reminder', data: r })
    })
    
    // Get upcoming events
    events.filter(e => new Date(e.date) >= now).forEach(e => {
      upcoming.push({ type: 'event', data: e })
    })
    
    // Get upcoming scheduled posts
    posts.filter(p => p.status === 'scheduled' && new Date(p.scheduledAt || '') >= now).forEach(p => {
      upcoming.push({ type: 'post', data: p })
    })
    
    // Sort by date
    return upcoming.sort((a, b) => 
      new Date(a.data.date || a.data.scheduledAt || a.data.createdAt).getTime() - 
      new Date(b.data.date || b.data.scheduledAt || b.data.createdAt).getTime()
    ).slice(0, 5)
  }

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

  const upcomingItems = getUpcomingItems()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 to-blue-950' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`hidden md:flex w-64 flex-col ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm border-r p-6`}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                AI Social
              </span>
            </div>
            
            {/* Theme Selector */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Button
                size="sm"
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                size="sm"
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'create', icon: Plus, label: 'Create Post' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'history', icon: History, label: 'Post History' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? theme === 'dark'
                      ? 'bg-blue-900/40 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                      : 'text-muted-foreground hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <Separator className={theme === 'dark' ? 'bg-gray-800' : ''} />

          <div className="pt-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-gray-200' : ''}`}>Demo User</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-sm border-t z-50`}>
          <div className="flex justify-around p-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard },
              { id: 'create', icon: Plus },
              { id: 'calendar', icon: CalendarIcon },
              { id: 'history', icon: History },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  activeView === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          {/* Mobile Header with Theme Toggle */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                AI Social
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
              >
                <Moon className="w-4 h-4" />
              </Button>
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Dashboard</h1>
                  <p className="text-muted-foreground">Overview of your connected social accounts.</p>
                </div>
                <Button onClick={() => setActiveView('create')} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connections.map((conn) => (
                  <Card key={conn.platform} className={`hover:shadow-lg transition-shadow ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          conn.platform === 'youtube' ? 'bg-red-500' :
                          conn.platform === 'instagram' ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500' :
                          'bg-blue-600'
                        }`}>
                          {conn.platform === 'youtube' && <Youtube className="w-6 h-6 text-white" />}
                          {conn.platform === 'instagram' && <Instagram className="w-6 h-6 text-white" />}
                          {conn.platform === 'facebook' && <Facebook className="w-6 h-6 text-white" />}
                        </div>
                        <button
                          onClick={() => toggleConnection(conn.platform)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            conn.connected
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${conn.connected ? 'bg-green-600' : 'bg-gray-400'}`} />
                          {conn.connected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : ''}`}>{conn.stats?.followers || '0'}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                            {conn.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                          </p>
                        </div>
                        <Separator className={theme === 'dark' ? 'bg-gray-800' : ''} />
                        <div className="flex justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}>
                            {conn.platform === 'youtube' ? `${conn.stats?.views || '0'} Views` :
                             conn.platform === 'instagram' ? `${conn.stats?.engagement || '0'}% Engagement` :
                             `${conn.stats?.reach || '0'} Reach`}
                          </span>
                          <span className={conn.stats?.change?.startsWith('+') ? 'text-green-600' : 'text-orange-600'}>
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
              <div className="mb-6">
                <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Create Post</h1>
                <p className="text-muted-foreground">Draft, schedule, or post instantly with AI.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                    <CardContent className="pt-6 space-y-4">
                      {/* Media Upload */}
                      <div className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer ${theme === 'dark' ? 'border-gray-700' : ''}`}>
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
                            <Upload className={`w-12 h-12 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`} />
                            <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Click to upload or drag & drop</p>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>Supports JPG, PNG, MP4</p>
                          </>
                        )}
                        </label>
                      </div>

                      {/* Caption Input */}
                      <div>
                        <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Caption</label>
                        <Textarea
                          placeholder="Write something amazing... or let AI do it."
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          rows={6}
                          className={`resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
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
                        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Select Platforms</label>
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
                                className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}
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
                      <div className={`flex flex-col md:flex-row gap-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                        <div className="flex-1 space-y-2">
                          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Schedule (Optional)</label>
                          <Input
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                          />
                        </div>
                        <Button 
                          onClick={createPost} 
                          disabled={loading}
                          className="md:mt-6 bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? 'Posting...' : scheduleDate ? 'Schedule Post' : 'Post Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview Sidebar */}
                <div className="space-y-6">
                  <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                    <CardHeader>
                      <CardTitle className={theme === 'dark' ? 'text-white' : ''}>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : ''}`}>
                        {mediaPreview ? (
                          <img 
                            src={mediaPreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className={`w-full h-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} flex items-center justify-center`}>
                            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="p-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} line-clamp-3`}>
                            {caption || 'Your caption will appear here...'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 ${theme === 'dark' ? 'border-gray-800' : 'border-none'}`}>
                    <CardContent className="pt-6">
                      <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
                      <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>✨ AI Pro Tip</h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Content Calendar</h1>
                  <p className="text-muted-foreground">Plan your monthly strategy.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {/* Add Reminder Button */}
                  <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Bell className="w-4 h-4 mr-2" />
                        Add Reminder
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                      <DialogHeader>
                        <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>Add Reminder</DialogTitle>
                        <DialogDescription>Set a reminder for an important date.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Title</label>
                          <Input
                            value={reminderTitle}
                            onChange={(e) => setReminderTitle(e.target.value)}
                            placeholder="e.g., Team meeting"
                            className={theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                          />
                        </div>
                        <div>
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            className={theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={createReminder} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Reminder
                          </Button>
                          <Button onClick={() => setReminderDialogOpen(false)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Add Event Button */}
                  <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                      <DialogHeader>
                        <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>Add Event</DialogTitle>
                        <DialogDescription>Create an event for your calendar.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Title</label>
                          <Input
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="e.g., Product Launch"
                            className={theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                          />
                        </div>
                        <div>
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className={theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}
                          />
                        </div>
                        <div>
                          <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Note (Optional)</label>
                          <Textarea
                            value={eventNote}
                            onChange={(e) => setEventNote(e.target.value)}
                            placeholder="Add a note..."
                            rows={3}
                            className={`resize-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={createEvent} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            Add Event
                          </Button>
                          <Button onClick={() => setEventDialogOpen(false)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  >
                    <MoreHorizontal className="w-4 h-4 -rotate-90" />
                  </Button>
                  <span className={`text-lg font-semibold px-4 min-w-[180px] text-center ${theme === 'dark' ? 'text-white' : ''}`}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  >
                    <MoreHorizontal className="w-4 h-4 rotate-90" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                    <CardContent className="pt-6">
                      {/* Calendar Header */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className={`text-center text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} py-2`}>
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Calendar Grid - SMALLER */}
                      <div className="grid grid-cols-7 gap-1">
                        {renderCalendarDays()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Legend */}
                  <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-muted'}`}>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>Legend</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className={theme === 'dark' ? 'text-gray-400' : ''}>Post</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className={theme === 'dark' ? 'text-gray-400' : ''}>Reminder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className={theme === 'dark' ? 'text-gray-400' : ''}>Event</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events Sidebar */}
                <div className="space-y-6">
                  <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : ''}`}>📅 Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingItems.length === 0 ? (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
                          No upcoming events or reminders.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {upcomingItems.map((item) => (
                            <div 
                              key={`${item.type}-${item.data.id}`} 
                              className={`p-3 rounded-lg border ${
                                item.type === 'reminder' 
                                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
                                  : item.type === 'event' 
                                    ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                    : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {item.type === 'reminder' && <Bell className="w-3 h-3 text-yellow-600" />}
                                    {item.type === 'event' && <CalendarDays className="w-3 h-3 text-purple-600" />}
                                    {item.type === 'post' && <Clock className="w-3 h-3 text-blue-600" />}
                                    <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                                      {item.type === 'post' ? (item.data as Post).caption.substring(0, 20) + '...' : (item.data as Reminder | Event).title}
                                    </p>
                                  </div>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                    {new Date(item.data.date || (item.data as Post).scheduledAt || (item.data as Post).createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {item.type === 'event' && (item.data as Event).note && (
                                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'} line-clamp-2`}>
                                      {(item.data as Event).note}
                                    </p>
                                  )}
                                </div>
                                {item.type === 'reminder' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toggleReminder(item.data.id, (item.data as Reminder).completed)}
                                      className={`p-1 rounded hover:bg-white/50 ${theme === 'dark' ? 'text-gray-400' : ''}`}
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteReminder(item.data.id)}
                                      className={`p-1 rounded hover:bg-white/50 ${theme === 'dark' ? 'text-gray-400' : ''}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                {item.type === 'event' && (
                                  <button
                                    onClick={() => deleteEvent(item.data.id)}
                                    className={`p-1 rounded hover:bg-white/50 ${theme === 'dark' ? 'text-gray-400' : ''}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Post History View */}
          {activeView === 'history' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Post History</h1>
                  <p className="text-muted-foreground">Manage and review past content.</p>
                </div>
              </div>

              <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                      <SelectTrigger className={`w-full md:w-[180px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
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
                      <SelectTrigger className={`w-full md:w-[180px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
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
                          <TableHead className={theme === 'dark' ? 'text-gray-400' : ''}>Date</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-gray-400' : ''}>Platform</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-gray-400' : ''}>Caption</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-gray-400' : ''}>Status</TableHead>
                          <TableHead className={theme === 'dark' ? 'text-gray-400' : ''}>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredPosts().map((post) => (
                          <TableRow key={post.id} className={theme === 'dark' ? 'border-gray-800' : ''}>
                            <TableCell className={theme === 'dark' ? 'text-gray-300' : ''}>
                              {new Date(post.scheduledAt || post.postedAt || post.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {post.platforms.includes('youtube') && <Youtube className="w-4 h-4 text-red-600" />}
                                {post.platforms.includes('instagram') && <Instagram className="w-4 h-4 text-pink-600" />}
                                {post.platforms.includes('facebook') && <Facebook className="w-4 h-4 text-blue-600" />}
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                  {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className={`max-w-[250px] ${theme === 'dark' ? 'text-gray-300' : ''}`}>
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
                          <TableRow className={theme === 'dark' ? 'border-gray-800' : ''}>
                            <TableCell colSpan={5} className={`text-center text-muted-foreground py-8 ${theme === 'dark' ? 'text-gray-500' : ''}`}>
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
        </main>
      </div>
    </div>
  )
}
