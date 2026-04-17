'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, addDays, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Clock, Calendar as CalendarIcon, Bell, AlertCircle } from 'lucide-react';

interface SocialPost {
  id: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: string;
  platforms: string[];
  status: string;
  scheduledAt?: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Form states
  const [postCaption, setPostCaption] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postPlatforms, setPostPlatforms] = useState<string[]>([]);
  const [postScheduledFor, setPostScheduledFor] = useState('');

  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventNote, setEventNote] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, remindersRes, eventsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/reminders'),
        fetch('/api/events'),
      ]);

      const postsData = await postsRes.json();
      const remindersData = await remindersRes.json();
      const eventsData = await eventsRes.json();

      setPosts(postsData.posts || []);
      setReminders(remindersData.reminders || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfMonth(monthEnd) });

  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      if (!post.scheduledAt) return false;
      const scheduledDate = new Date(post.scheduledAt);
      return isSameDay(scheduledDate, date);
    });
  };

  const getRemindersForDay = (date: Date) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      return isSameDay(reminderDate, date);
    });
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Coming Up - Next 5 items
  const getComingUp = () => {
    const now = new Date();
    const allItems: Array<{ type: 'post' | 'reminder' | 'event'; date: Date; title: string; data: any }> = [];

    posts.filter(p => p.status === 'scheduled' && p.scheduledAt).forEach(post => {
      const date = new Date(post.scheduledAt!);
      if (date > now) {
        allItems.push({ type: 'post', date, title: post.caption, data: post });
      }
    });

    reminders.filter(r => !r.completed).forEach(reminder => {
      const date = new Date(reminder.date);
      if (date > now) {
        allItems.push({ type: 'reminder', date, title: reminder.title, data: reminder });
      }
    });

    events.forEach(event => {
      const date = new Date(event.date);
      if (date > now) {
        allItems.push({ type: 'event', date, title: event.title, data: event });
      }
    });

    return allItems
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const comingUp = getComingUp();

  // CRUD operations
  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: postCaption,
          mediaUrl: postMediaUrl || undefined,
          platforms: postPlatforms,
          status: postScheduledFor ? 'scheduled' : 'draft',
          scheduledAt: postScheduledFor || undefined,
        }),
      });

      if (response.ok) {
        setPostDialogOpen(false);
        setPostCaption('');
        setPostMediaUrl('');
        setPostPlatforms([]);
        setPostScheduledFor('');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reminderTitle,
          date: reminderDate,
        }),
      });

      if (response.ok) {
        setReminderDialogOpen(false);
        setReminderTitle('');
        setReminderDate('');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          note: eventNote || undefined,
        }),
      });

      if (response.ok) {
        setEventDialogOpen(false);
        setEventTitle('');
        setEventDate('');
        setEventNote('');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !reminder.completed,
        }),
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleNextMonth = () => setCurrentDate(addDays(monthStart, 35));
  const handlePrevMonth = () => setCurrentDate(addDays(monthStart, -35));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AI Social Poster
          </h1>
          <p className="text-muted-foreground">Plan and manage your social media content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section - Left (2/3) */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-xl">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const postsForDay = getPostsForDay(day);
                    const remindersForDay = getRemindersForDay(day);
                    const eventsForDay = getEventsForDay(day);
                    const hasContent = postsForDay.length > 0 || remindersForDay.length > 0 || eventsForDay.length > 0;

                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          min-h-[80px] md:min-h-[100px] p-2 rounded-lg border-2 transition-all
                          ${isToday(day) ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : 'border-transparent'}
                          ${!isSameMonth(day, currentDate) ? 'opacity-40' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                        `}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        {hasContent && (
                          <div className="space-y-1">
                            {postsForDay.slice(0, 2).map((post) => (
                              <Badge key={post.id} variant="secondary" className="text-[10px] w-full truncate bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Plus className="h-2 w-2 mr-1" />
                                {post.caption.substring(0, 15)}...
                              </Badge>
                            ))}
                            {remindersForDay.slice(0, 1).map((reminder) => (
                              <Badge key={reminder.id} variant="secondary" className="text-[10px] w-full truncate bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Bell className="h-2 w-2 mr-1" />
                                {reminder.title.substring(0, 12)}...
                              </Badge>
                            ))}
                            {eventsForDay.slice(0, 1).map((event) => (
                              <Badge key={event.id} variant="secondary" className="text-[10px] w-full truncate bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                <CalendarIcon className="h-2 w-2 mr-1" />
                                {event.title.substring(0, 12)}...
                              </Badge>
                            ))}
                            {(postsForDay.length > 2 || remindersForDay.length > 1 || eventsForDay.length > 1) && (
                              <Badge variant="outline" className="text-[10px]">
                                +{postsForDay.length + remindersForDay.length + eventsForDay.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel - Right (1/3) */}
          <div className="space-y-6">
            {/* Coming Up */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Coming Up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                {comingUp.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming items</p>
                ) : (
                  comingUp.map((item) => (
                    <div
                      key={`${item.type}-${item.data.id}`}
                      className={`
                        p-3 rounded-lg border transition-all hover:shadow-md
                        ${item.type === 'post' ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900' : ''}
                        ${item.type === 'reminder' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900' : ''}
                        ${item.type === 'event' ? 'border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-900' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {item.type === 'post' && <Plus className="h-3 w-3 text-blue-600" />}
                        {item.type === 'reminder' && <Bell className="h-3 w-3 text-yellow-600" />}
                        {item.type === 'event' && <CalendarIcon className="h-3 w-3 text-purple-600" />}
                        <p className="text-sm font-medium truncate">{item.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(item.date, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Events */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5" />
                  Events
                </CardTitle>
                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createEvent} className="space-y-4">
                      <div>
                        <Label htmlFor="eventTitle">Title</Label>
                        <Input
                          id="eventTitle"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          required
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
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventNote">Note (Optional)</Label>
                        <Textarea
                          id="eventNote"
                          value={eventNote}
                          onChange={(e) => setEventNote(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Create Event
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[250px] overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start justify-between p-3 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-900">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.date), 'MMM d, h:mm a')}
                        </p>
                        {event.note && (
                          <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  Reminders
                </CardTitle>
                <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Reminder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createReminder} className="space-y-4">
                      <div>
                        <Label htmlFor="reminderTitle">Title</Label>
                        <Input
                          id="reminderTitle"
                          value={reminderTitle}
                          onChange={(e) => setReminderTitle(e.target.value)}
                          required
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
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Create Reminder
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[250px] overflow-y-auto">
                {reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No reminders</p>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-start justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          checked={reminder.completed}
                          onCheckedChange={() => toggleReminder(reminder.id)}
                        />
                        <div className={reminder.completed ? "line-through text-muted-foreground" : ""}>
                          <p className="font-medium text-sm">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reminder.date), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Create Post Button */}
            <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-lg shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={createPost} className="space-y-4">
                  <div>
                    <Label htmlFor="postCaption">Caption</Label>
                    <Textarea
                      id="postCaption"
                      value={postCaption}
                      onChange={(e) => setPostCaption(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postMediaUrl">Media URL (Optional)</Label>
                    <Input
                      id="postMediaUrl"
                      value={postMediaUrl}
                      onChange={(e) => setPostMediaUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postScheduledFor">Schedule For (Optional)</Label>
                    <Input
                      id="postScheduledFor"
                      type="datetime-local"
                      value={postScheduledFor}
                      onChange={(e) => setPostScheduledFor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Platforms</Label>
                    <div className="flex gap-4 mt-2">
                      {['youtube', 'instagram', 'facebook'].map((platform) => (
                        <label key={platform} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={postPlatforms.includes(platform)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPostPlatforms([...postPlatforms, platform]);
                              } else {
                                setPostPlatforms(postPlatforms.filter(p => p !== platform));
                              }
                            }}
                          />
                          <span className="capitalize">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Post
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
