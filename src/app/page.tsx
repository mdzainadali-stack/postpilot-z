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
  ChevronLeft,
  ChevronRight,
  Bell,
  CalendarDays,
  Trash2,
  Sun,
  Moon,
  Check,
  Menu,
  List,
  CalendarCheck
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Reminder & Event Form States
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventNote, setEventNote] = useState('')
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarViewTab, setCalendarViewTab] = useState('calendar')

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

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const clickedDate = new Date(year, month, day)
    
    const formattedDate = new Date(clickedDate.getTime() - clickedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    
    setSelectedDate(clickedDate)
    setReminderDate(formattedDate)
    setEventDate(formattedDate)
    setReminderDialogOpen(true)
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
    const today = new Date()

    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-14 md:h-20 lg:h-24 bg-muted/5 rounded-md" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      
      const dayPosts = posts.filter(post => {
        const postDate = post.scheduledAt || post.postedAt || post.createdAt
        const postDateObj = new Date(postDate)
        return (
          postDateObj.getDate() === day &&
          postDateObj.getMonth() === month &&
          postDateObj.getFullYear() === year
        )
      })

      const dayReminders = reminders.filter(r => {
        const rDate = new Date(r.date)
        return (
          rDate.getDate() === day &&
          rDate.getMonth() === month &&
          rDate.getFullYear() === year
        )
      })

      const dayEvents = events.filter(e => {
        const eDate = new Date(e.date)
        return (
          eDate.getDate() === day &&
          eDate.getMonth() === month &&
          eDate.getFullYear() === year
        )
      })

      const totalItems = dayPosts.length + dayReminders.length + dayEvents.length

      days.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          className={`h-12 sm:h-14 md:h-20 lg:h-24 bg-muted/5 rounded-lg border ${
            isToday 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400' 
              : 'border-border hover:border-blue-400 hover:bg-muted/20'
          } p-1 sm:p-1.5 md:p-2 cursor-pointer transition-all relative`}
        >
          <div className={`text-xs sm:text-sm md:text-base font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'} mb-1`}>
            {day}
          </div>
          {totalItems > 0 && (
            <div className="flex flex-wrap gap-0.5">
              {dayPosts.map(post => (
                <div 
                  key={post.id}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"
                  title={post.caption.substring(0, 30)}
                />
              ))}
              {dayReminders.map(r => (
                <div 
                  key={r.id}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"
                  title={r.title}
                />
              ))}
              {dayEvents.map(e => (
                <div 
                  key={e.id}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"
                  title={e.title}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    const upcoming = events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
    return upcoming
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

  const upcomingEventsList = getUpcomingEvents()

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-950 to-blue-950' : 'bg-gradient-to-br from-blue-50 to-white'}`}>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex w-64 flex-col ${theme === 'dark' ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-sm border-r p-4 sm:p-6`}>
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                AI Social
              </span>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Button
                size="sm"
                variant={theme === 'light' ? 'default' : 'ghost'}
                onClick={() => setTheme('light')}
                className="flex-1 text-xs sm:text-sm"
              >
                <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Light
              </Button>
              <Button
                size="sm"
                variant={theme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="flex-1 text-xs sm:text-sm"
              >
                <Moon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 sm:space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'create', icon: Plus, label: 'Create Post' },
              { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
              { id: 'history', icon: History, label: 'Post History' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  setMobileSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? theme === 'dark'
                      ? 'bg-blue-900/40 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                      : 'text-muted-foreground hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </button>
            ))}
          </nav>

          <Separator className={theme === 'dark' ? 'bg-gray-800' : ''} />

          <div className="pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-semibold truncate ${theme === 'dark' ? 'text-gray-200' : ''}`}>Demo User</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className={`${theme === 'dark' ? 'bg-black/95' : 'bg-white/95'} w-72 p-4`}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                  AI Social
                </span>
              </div>
              
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
                  onClick={() => {
                    setActiveView(item.id)
                    setMobileSidebarOpen(false)
                  }}
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
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className={`lg:hidden flex items-center justify-between p-3 sm:p-4 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} border-b`}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-muted/50"
            >
              <Menu className={`w-5 h-5 sm:w-6 sm:h-6 ${theme === 'dark' ? 'text-gray-300' : ''}`} />
            </button>
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
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-20 sm:pb-24">
              {/* Dashboard View */}
              {activeView === 'dashboard' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                    <div>
                      <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Dashboard</h1>
                      <p className={`text-sm sm:text-base text-muted-foreground`}>Overview of your connected social accounts.</p>
                    </div>
                    <Button onClick={() => setActiveView('create')} className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      New Post
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {connections.map((conn) => (
                      <Card key={conn.platform} className={`hover:shadow-lg transition-shadow ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}`}>
                        <CardHeader className="p-3 sm:p-4 md:p-6">
                          <div className="flex items-center justify-between">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                              conn.platform === 'youtube' ? 'bg-red-500' :
                              conn.platform === 'instagram' ? 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500' :
                              'bg-blue-600'
                            }`}>
                              {conn.platform === 'youtube' && <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                              {conn.platform === 'instagram' && <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                              {conn.platform === 'facebook' && <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                            </div>
                            <button
                              onClick={() => toggleConnection(conn.platform)}
                              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${
                                conn.connected
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${conn.connected ? 'bg-green-600' : 'bg-gray-400'}`} />
                              <span className="hidden sm:inline">{conn.connected ? 'Connected' : 'Connect'}</span>
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <p className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : ''}`}>{conn.stats?.followers || '0'}</p>
                              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                {conn.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                              </p>
                            </div>
                            <Separator className={theme === 'dark' ? 'bg-gray-800' : ''} />
                            <div className="flex justify-between text-xs sm:text-sm">
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
                  <div className="mb-4 sm:mb-6">
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Create Post</h1>
                    <p className={`text-sm sm:text-base text-muted-foreground`}>Draft, schedule, or post instantly with AI.</p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    <div className="xl:col-span-2 space-y-3 sm:space-y-6">
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4 md:pt-6 space-y-3 sm:space-y-4">
                          {/* Media Upload */}
                          <div className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer ${theme === 'dark' ? 'border-gray-700' : ''}`}>
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
                                    className="max-h-48 sm:max-h-64 mx-auto rounded-lg object-contain"
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setMediaPreview(null)
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-background/90 rounded-full hover:bg-background"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`} />
                                  <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Click to upload or drag & drop</p>
                                  <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>Supports JPG, PNG, MP4</p>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Caption Input */}
                          <div>
                            <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Caption</label>
                            <Textarea
                              placeholder="Write something amazing... or let AI do it."
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                              rows={4}
                              className={`resize-none text-sm sm:text-base ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                            />
                          </div>

                          {/* AI Tools */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={generateCaption}
                              disabled={loading}
                              className="text-xs sm:text-sm"
                            >
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Generate Caption
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={generateHashtags}
                              disabled={loading}
                              className="text-xs sm:text-sm"
                            >
                              <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Generate Hashtags
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={generateIdea}
                              disabled={loading}
                              className="text-xs sm:text-sm"
                            >
                              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Post Idea
                            </Button>
                          </div>

                          {/* Platform Selection */}
                          <div className="space-y-2 sm:space-y-3">
                            <label className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Select Platforms</label>
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                              {(['youtube', 'instagram', 'facebook'] as const).map((platform) => (
                                <div key={platform} className="flex items-center space-x-1.5 sm:space-x-2">
                                  <Checkbox
                                    id={platform}
                                    checked={selectedPlatforms.includes(platform)}
                                    onCheckedChange={() => togglePlatform(platform)}
                                  />
                                  <label
                                    htmlFor={platform}
                                    className={`text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-1.5 sm:gap-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}
                                  >
                                    {platform === 'youtube' && <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {platform === 'instagram' && <Instagram className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {platform === 'facebook' && <Facebook className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Schedule & Post */}
                          <div className={`flex flex-col sm:flex-row gap-2.5 sm:gap-4 pt-3 sm:pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : ''}`}>
                            <div className="flex-1 space-y-1.5 sm:space-y-2">
                              <label className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>Schedule (Optional)</label>
                              <Input
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                className={`w-full text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <Button 
                              onClick={createPost} 
                              disabled={loading}
                              className={`sm:mt-5 sm:mt-6 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm`}
                            >
                              {loading ? 'Posting...' : scheduleDate ? 'Schedule Post' : 'Post Now'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="space-y-3 sm:space-y-6 hidden xl:block">
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardHeader className="p-3 sm:p-4 md:p-6 pb-3">
                          <CardTitle className={`text-base sm:text-lg ${theme === 'dark' ? 'text-white' : ''}`}>Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                          <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : ''}`}>
                            {mediaPreview ? (
                              <img 
                                src={mediaPreview} 
                                alt="Preview" 
                                className="w-full h-36 sm:h-48 object-cover"
                              />
                            ) : (
                              <div className={`w-full h-36 sm:h-48 ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'} flex items-center justify-center`}>
                                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
                              </div>
                            )}
                            <div className="p-3 sm:p-4">
                              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} line-clamp-3`}>
                                {caption || 'Your caption will appear here...'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 ${theme === 'dark' ? 'border-gray-800' : 'border-none'}`}>
                        <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-6">
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mb-2 sm:mb-3" />
                          <h3 className={`text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>✨ AI Pro Tip</h3>
                          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                    <div>
                      <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Content Calendar</h1>
                      <p className={`text-sm sm:text-base text-muted-foreground`}>Plan your monthly strategy.</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 flex-wrap">
                      {/* Add Reminder Button */}
                      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                            <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Add</span> Reminder
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''} max-w-[90vw] sm:max-w-md`}>
                          <DialogHeader>
                            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>Add Reminder</DialogTitle>
                            <DialogDescription>Set a reminder for an important date.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4 mt-4">
                            <div>
                              <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Title</label>
                              <Input
                                value={reminderTitle}
                                onChange={(e) => setReminderTitle(e.target.value)}
                                placeholder="e.g., Team meeting"
                                className={`text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className={`text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={createReminder} className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">
                                Add Reminder
                              </Button>
                              <Button onClick={() => setReminderDialogOpen(false)} variant="outline" className="text-xs sm:text-sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Add Event Button */}
                      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                            <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Add</span> Event
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''} max-w-[90vw] sm:max-w-md`}>
                          <DialogHeader>
                            <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>Add Event</DialogTitle>
                            <DialogDescription>Create an event for your calendar.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4 mt-4">
                            <div>
                              <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Title</label>
                              <Input
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                placeholder="e.g., Product Launch"
                                className={`text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Date & Time</label>
                              <Input
                                type="datetime-local"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className={`text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Note (Optional)</label>
                              <Textarea
                                value={eventNote}
                                onChange={(e) => setEventNote(e.target.value)}
                                placeholder="Add a note..."
                                rows={2}
                                className={`resize-none text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={createEvent} className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">
                                Add Event
                              </Button>
                              <Button onClick={() => setEventDialogOpen(false)} variant="outline" className="text-xs sm:text-sm">
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
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <span className={`text-base sm:text-lg sm:text-xl font-semibold px-2 sm:px-4 min-w-[120px] sm:min-w-[180px] text-center ${theme === 'dark' ? 'text-white' : ''}`}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>

                  {/* CALENDAR LAYOUT - Normal Calendar App Style */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left: Calendar Grid */}
                    <div className="lg:col-span-2">
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4 md:pt-6">
                          {/* Calendar Header - Days */}
                          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day} className={`text-center text-[10px] sm:text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} py-1 sm:py-2`}>
                                {day}
                              </div>
                            ))}
                          </div>
                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                            {renderCalendarDays()}
                          </div>
                          {/* Legend */}
                          <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'}`}>
                            <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                                <span className={theme === 'dark' ? 'text-gray-400' : ''}>Posts</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                                <span className={theme === 'dark' ? 'text-gray-400' : ''}>Reminders</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                                <span className={theme === 'dark' ? 'text-gray-400' : ''}>Events</span>
                              </div>
                            </div>
                            <p className={`mt-2 sm:mt-3 text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
                              💡 Click any date to add a reminder or event
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right: Side Panel with Events, Reminders, and Upcoming */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* Coming Up Section */}
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                          <CardTitle className={`text-sm sm:text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Coming Up
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                          {upcomingEventsList.length === 0 ? (
                            <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
                              No upcoming events.
                            </p>
                          ) : (
                            <ScrollArea className="max-h-[200px] sm:max-h-[250px]">
                              <div className="space-y-2">
                                {upcomingEventsList.map((event) => (
                                  <div 
                                    key={event.id}
                                    className={`p-2 sm:p-2.5 rounded-lg border bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-[10px] sm:text-xs font-semibold ${theme === 'dark' ? 'text-gray-200' : ''} mb-0.5`}>
                                        {event.title}
                                      </p>
                                      <p className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                      {event.note && (
                                        <p className={`text-[9px] sm:text-[10px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'} line-clamp-2`}>
                                          {event.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>

                      {/* Events List Section */}
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between">
                          <CardTitle className={`text-sm sm:text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Events
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                          {events.length === 0 ? (
                            <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'} text-center py-3 sm:py-4`}>
                              No events yet.
                            </p>
                          ) : (
                            <ScrollArea className="max-h-[200px] sm:max-h-[250px]">
                              <div className="space-y-2">
                                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event) => (
                                  <div 
                                    key={event.id}
                                    className={`p-2 sm:p-2.5 rounded-lg border ${
                                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-muted/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] sm:text-xs font-medium ${theme === 'dark' ? 'text-white' : ''} mb-0.5`}>
                                          {event.title}
                                        </p>
                                        <p className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                          {new Date(event.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        {event.note && (
                                          <p className={`text-[9px] sm:text-[10px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'} line-clamp-2`}>
                                            {event.note}
                                          </p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => deleteEvent(event.id)}
                                        className={`p-1 sm:p-1.5 rounded hover:bg-white/10 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </CardContent>
                      </Card>

                      {/* Reminders List Section */}
                      <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between">
                          <CardTitle className={`text-sm sm:text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                            <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Reminders
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3">
                          {reminders.length === 0 ? (
                            <p className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'} text-center py-3 sm:py-4`}>
                              No reminders yet.
                            </p>
                          ) : (
                            <ScrollArea className="max-h-[200px] sm:max-h-[250px]">
                              <div className="space-y-2">
                                {reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((reminder) => (
                                  <div 
                                    key={reminder.id}
                                    className={`p-2 sm:p-2.5 rounded-lg border ${
                                      reminder.completed 
                                        ? 'opacity-60' 
                                        : ''
                                    } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-muted/50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <button
                                            onClick={() => toggleReminder(reminder.id, reminder.completed)}
                                            className={`p-0.5 sm:p-1 rounded hover:bg-white/10 ${
                                              reminder.completed
                                                ? 'bg-green-600 text-white'
                                                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                                            }`}
                                          >
                                            <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                                          </button>
                                          <p className={`text-[10px] sm:text-xs font-medium ${reminder.completed ? 'line-through' : ''} ${theme === 'dark' ? 'text-white' : ''}`}>
                                            {reminder.title}
                                          </p>
                                        </div>
                                        <p className={`text-[9px] sm:text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                          {new Date(reminder.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => deleteReminder(reminder.id)}
                                        className={`p-1 sm:p-1.5 rounded hover:bg-white/10 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                                      >
                                        <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                    <div>
                      <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>Post History</h1>
                      <p className={`text-sm sm:text-base text-muted-foreground`}>Manage and review past content.</p>
                    </div>
                  </div>

                  <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4 md:pt-6">
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mb-3 sm:mb-6">
                        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                          <SelectTrigger className={`w-full sm:w-[180px] text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
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
                          <SelectTrigger className={`w-full sm:w-[180px] text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}`}>
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
                              <TableHead className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : ''}`}>Date</TableHead>
                              <TableHead className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : ''}`}>Platform</TableHead>
                              <TableHead className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : ''}`}>Caption</TableHead>
                              <TableHead className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : ''}`}>Status</TableHead>
                              <TableHead className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-400' : ''}`}>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredPosts().map((post) => (
                              <TableRow key={post.id} className={theme === 'dark' ? 'border-gray-800' : ''}>
                                <TableCell className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                  {new Date(post.scheduledAt || post.postedAt || post.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    {post.platforms.includes('youtube') && <Youtube className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                                    {post.platforms.includes('instagram') && <Instagram className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />}
                                    {post.platforms.includes('facebook') && <Facebook className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                                    <span className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                      {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className={`max-w-[150px] sm:max-w-[250px] ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                                  <p className="text-[10px] sm:text-xs truncate">{post.caption}</p>
                                </TableCell>
                                <TableCell>{getStatusBadge(post.status)}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs">
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {getFilteredPosts().length === 0 && (
                              <TableRow className={theme === 'dark' ? 'border-gray-800' : ''}>
                                <TableCell colSpan={5} className={`text-center text-muted-foreground py-4 sm:py-8 text-[10px] sm:text-xs ${theme === 'dark' ? 'text-gray-500' : ''}`}>
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
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
