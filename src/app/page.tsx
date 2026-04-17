'use client'

import { useState, useEffect } from 'react'
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
  MoreHorizontal
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

export default function AISocialPoster() {
  const [activeView, setActiveView] = useState('dashboard')
  const [posts, setPosts] = useState<Post[]>([])
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

  const { toast } = useToast()

  // Load posts on mount
  useEffect(() => {
    loadPosts()
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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[80px] md:min-h-[100px] bg-muted/20 rounded-lg" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayPosts = posts.filter(post => {
        const postDate = post.scheduledAt || post.postedAt || post.createdAt
        const postDateObj = new Date(postDate)
        return (
          postDateObj.getDate() === day &&
          postDateObj.getMonth() === month &&
          postDateObj.getFullYear() === year
        )
      })

      days.push(
        <div key={day} className="min-h-[80px] md:min-h-[100px] bg-muted/20 rounded-lg p-2 border border-border hover:bg-muted/40 transition-colors">
          <div className="text-xs font-semibold text-muted-foreground mb-1">{day}</div>
          <div className="space-y-1">
            {dayPosts.slice(0, 3).map(post => (
              <div 
                key={post.id} 
                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded truncate cursor-pointer hover:bg-primary/90"
                title={post.caption}
              >
                {post.caption.substring(0, 15)}...
              </div>
            ))}
            {dayPosts.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayPosts.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-950 dark:to-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-background/80 backdrop-blur-sm border-r p-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <Separator />

          <div className="pt-4 flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Demo User</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t z-50">
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
                className={`p-2 rounded-lg transition-colors ${
                  activeView === item.id ? 'bg-blue-100 text-blue-700' : 'text-muted-foreground'
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Social
              </span>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
          </div>

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">Overview of your connected social accounts.</p>
                </div>
                <Button onClick={() => setActiveView('create')} className="mt-4 md:mt-0">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {connections.map((conn) => (
                  <Card key={conn.platform} className="hover:shadow-lg transition-shadow">
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
                              : 'bg-muted hover:bg-muted/80'
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
                          <p className="text-2xl font-bold">{conn.stats?.followers || '0'}</p>
                          <p className="text-sm text-muted-foreground">
                            {conn.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
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

                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-none">
                    <CardContent className="pt-6">
                      <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
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
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Content Calendar</h1>
                  <p className="text-muted-foreground">Plan your monthly strategy.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  >
                    <MoreHorizontal className="w-4 h-4 -rotate-90" />
                  </Button>
                  <span className="text-lg font-semibold px-4 min-w-[200px] text-center">
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

              <Card>
                <CardContent className="pt-6">
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
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
        </main>
      </div>
    </div>
  )
}
