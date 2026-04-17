'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Youtube,
  Facebook,
  Instagram,
  Sun,
  Moon,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

interface PlatformConnection {
  id: string
  platform: 'youtube' | 'instagram' | 'facebook'
  connected: boolean
  accountName: string | null
  accountHandle: string | null
  avatarUrl: string | null
}

interface Post {
  id: string
  caption: string
  mediaUrl: string | null
  platforms: string[]
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  scheduledAt: string | null
  createdAt: string
}

export default function SocialMediaDashboard() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Dialog states
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'instagram' | 'facebook' | null>(null)
  const [accountName, setAccountName] = useState('')
  const [accountHandle, setAccountHandle] = useState('')

  // Create/Edit post dialog states
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [postCaption, setPostCaption] = useState('')
  const [postMediaUrl, setPostMediaUrl] = useState('')
  const [postPlatforms, setPostPlatforms] = useState<string[]>([])
  const [postStatus, setPostStatus] = useState<'draft' | 'scheduled' | 'posted'>('draft')
  const [postScheduledAt, setPostScheduledAt] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadConnections()
    loadPosts()
  }, [])

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

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

  const handleConnect = async () => {
    if (!selectedPlatform || !accountName || !accountHandle) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          connected: true,
          accountName,
          accountHandle,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConnections(prev => 
          prev.map(conn => 
            conn.platform === selectedPlatform ? data.connection : conn
          )
        )
        toast({
          title: 'Success',
          description: `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} connected successfully!`,
        })
        setConnectDialogOpen(false)
        setAccountName('')
        setAccountHandle('')
        setSelectedPlatform(null)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to connect platform.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect platform.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (platform: 'youtube' | 'instagram' | 'facebook') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/connections?platform=${platform}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setConnections(prev => 
          prev.map(conn => 
            conn.platform === platform ? data.connection : conn
          )
        )
        toast({
          title: 'Success',
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected.`,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to disconnect platform.',
      })
    } finally {
      setLoading(false)
    }
  }

  const openConnectDialog = (platform: 'youtube' | 'instagram' | 'facebook') => {
    setSelectedPlatform(platform)
    setConnectDialogOpen(true)
  }

  const openCreatePostDialog = () => {
    setEditingPost(null)
    setPostCaption('')
    setPostMediaUrl('')
    setPostPlatforms([])
    setPostStatus('draft')
    setPostScheduledAt('')
    setPostDialogOpen(true)
  }

  const openEditPostDialog = (post: Post) => {
    setEditingPost(post)
    setPostCaption(post.caption)
    setPostMediaUrl(post.mediaUrl || '')
    setPostPlatforms(post.platforms)
    setPostStatus(post.status)
    setPostScheduledAt(post.scheduledAt ? post.scheduledAt.slice(0, 16) : '')
    setPostDialogOpen(true)
  }

  const handleSavePost = async () => {
    if (!postCaption && !postMediaUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please add a caption or media.',
      })
      return
    }

    if (postPlatforms.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select at least one platform.',
      })
      return
    }

    setLoading(true)
    try {
      const isEdit = !!editingPost
      const url = isEdit ? `/api/posts/${editingPost.id}` : '/api/posts'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: postCaption,
          mediaUrl: postMediaUrl || null,
          platforms: postPlatforms,
          status: postStatus,
          scheduledAt: postScheduledAt || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (isEdit) {
          setPosts(prev => prev.map(p => p.id === editingPost.id ? data.post : p))
          toast({
            title: 'Success',
            description: 'Post updated successfully!',
          })
        } else {
          setPosts(prev => [data.post, ...prev])
          toast({
            title: 'Success',
            description: 'Post created successfully!',
          })
        }
        setPostDialogOpen(false)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save post.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save post.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== id))
        toast({
          title: 'Success',
          description: 'Post deleted successfully!',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete post.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete post.',
      })
    }
  }

  const togglePlatform = (platform: string) => {
    setPostPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  const getFilteredPosts = () => {
    if (activeTab === 'all') return posts
    return posts.filter(post => post.status === activeTab)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-500'
      case 'instagram':
        return 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'
      case 'facebook':
        return 'bg-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getPlatformBadgeVariant = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      case 'instagram':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      case 'facebook':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      default:
        return ''
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Scheduled</Badge>
      case 'posted':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Posted</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStats = () => {
    const totalPosts = posts.length
    const postsByPlatform = {
      youtube: posts.filter(p => p.platforms.includes('youtube')).length,
      instagram: posts.filter(p => p.platforms.includes('instagram')).length,
      facebook: posts.filter(p => p.platforms.includes('facebook')).length,
    }
    const postsByStatus = {
      draft: posts.filter(p => p.status === 'draft').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      posted: posts.filter(p => p.status === 'posted').length,
      failed: posts.filter(p => p.status === 'failed').length,
    }
    const upcoming = posts
      .filter(p => p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .slice(0, 5)

    return { totalPosts, postsByPlatform, postsByStatus, upcoming }
  }

  const stats = getStats()

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Social Media Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Platform Connections */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Platform Connections</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* YouTube */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                        <Youtube className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">YouTube</CardTitle>
                        <CardDescription className="text-xs">
                          {connections.find(c => c.platform === 'youtube')?.connected
                            ? connections.find(c => c.platform === 'youtube')?.accountName
                            : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.find(c => c.platform === 'youtube')?.connected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        @{connections.find(c => c.platform === 'youtube')?.accountHandle}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect('youtube')}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-red-500 hover:bg-red-600"
                      onClick={() => openConnectDialog('youtube')}
                    >
                      Connect YouTube
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Instagram */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                        <Instagram className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Instagram</CardTitle>
                        <CardDescription className="text-xs">
                          {connections.find(c => c.platform === 'instagram')?.connected
                            ? connections.find(c => c.platform === 'instagram')?.accountName
                            : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.find(c => c.platform === 'instagram')?.connected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        @{connections.find(c => c.platform === 'instagram')?.accountHandle}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect('instagram')}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600"
                      onClick={() => openConnectDialog('instagram')}
                    >
                      Connect Instagram
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Facebook */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Facebook className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Facebook</CardTitle>
                        <CardDescription className="text-xs">
                          {connections.find(c => c.platform === 'facebook')?.connected
                            ? connections.find(c => c.platform === 'facebook')?.accountName
                            : 'Not connected'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {connections.find(c => c.platform === 'facebook')?.connected ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        @{connections.find(c => c.platform === 'facebook')?.accountHandle}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDisconnect('facebook')}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => openConnectDialog('facebook')}
                    >
                      Connect Facebook
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stats Overview */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Stats Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalPosts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>By Platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      <span>{stats.postsByPlatform.youtube}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-purple-500" />
                      <span>{stats.postsByPlatform.instagram}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <span>{stats.postsByPlatform.facebook}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>By Status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span>Draft: {stats.postsByStatus.draft}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Scheduled: {stats.postsByStatus.scheduled}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Posted: {stats.postsByStatus.posted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>Failed: {stats.postsByStatus.failed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Upcoming</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.upcoming.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {stats.upcoming.slice(0, 3).map(post => (
                        <div key={post.id} className="truncate" title={post.caption}>
                          {new Date(post.scheduledAt!).toLocaleDateString()}
                        </div>
                      ))}
                      {stats.upcoming.length > 3 && (
                        <div className="text-muted-foreground">+{stats.upcoming.length - 3} more</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No upcoming posts</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Posts Management */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Posts Management</h2>
              <Button onClick={openCreatePostDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="posted">Posted</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {getFilteredPosts().map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {post.caption.slice(0, 50) || '(No caption)'}
                              {post.caption.length > 50 && '...'}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          {getStatusBadge(post.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {post.mediaUrl && (
                          <div className="mb-3">
                            <img
                              src={post.mediaUrl}
                              alt="Post media"
                              className="w-full h-40 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.platforms.map((platform) => (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className={getPlatformBadgeVariant(platform)}
                            >
                              {platform === 'youtube' && <Youtube className="h-3 w-3 mr-1" />}
                              {platform === 'instagram' && <Instagram className="h-3 w-3 mr-1" />}
                              {platform === 'facebook' && <Facebook className="h-3 w-3 mr-1" />}
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </Badge>
                          ))}
                        </div>
                        {post.scheduledAt && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Calendar className="h-3 w-3" />
                            Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditPostDialog(post)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getFilteredPosts().length === 0 && (
                    <Card className="col-span-1 lg:col-span-2">
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No posts found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      {/* Connect Platform Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect {selectedPlatform?.charAt(0).toUpperCase() + selectedPlatform?.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Enter your account details to connect your {selectedPlatform} account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="My Awesome Channel"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHandle">Account Handle</Label>
              <Input
                id="accountHandle"
                placeholder="@username"
                value={accountHandle}
                onChange={(e) => setAccountHandle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Post Dialog */}
      <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Update your post details.' : 'Create a new post for your social media platforms.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postCaption">Caption</Label>
              <Textarea
                id="postCaption"
                placeholder="Write your post caption..."
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postMediaUrl">Media URL (Optional)</Label>
              <Input
                id="postMediaUrl"
                placeholder="https://example.com/image.jpg"
                value={postMediaUrl}
                onChange={(e) => setPostMediaUrl(e.target.value)}
              />
              {postMediaUrl && (
                <img
                  src={postMediaUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {(['youtube', 'instagram', 'facebook'] as const).map((platform) => (
                  <Badge
                    key={platform}
                    variant={postPlatforms.includes(platform) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      postPlatforms.includes(platform) ? getPlatformBadgeVariant(platform) : ''
                    }`}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform === 'youtube' && <Youtube className="h-3 w-3 mr-1" />}
                    {platform === 'instagram' && <Instagram className="h-3 w-3 mr-1" />}
                    {platform === 'facebook' && <Facebook className="h-3 w-3 mr-1" />}
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postStatus">Status</Label>
              <select
                id="postStatus"
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value as 'draft' | 'scheduled' | 'posted')}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
              </select>
            </div>

            {postStatus === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="postScheduledAt">Schedule Date & Time</Label>
                <Input
                  id="postScheduledAt"
                  type="datetime-local"
                  value={postScheduledAt}
                  onChange={(e) => setPostScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={loading}>
              {loading ? 'Saving...' : editingPost ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
