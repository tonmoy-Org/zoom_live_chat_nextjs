'use client';

import { useState } from 'react';
import { Bell, Settings, X, Check, Volume2, VolumeX, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotifications, NotificationData } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const {
    notifications,
    settings,
    permission,
    unreadCount,
    updateSettings,
    requestPermission,
    markAsRead,
    clearAll,
  } = useNotifications();
  
  const [showSettings, setShowSettings] = useState(false);

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'system':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '🔔';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={cn('relative', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 sm:w-96 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </DialogTitle>
                    <DialogDescription>
                      Customize how you receive notifications
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Permission Request */}
                    {permission !== 'granted' && (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-orange-800">Enable Desktop Notifications</p>
                              <p className="text-sm text-orange-600">Get notified even when the app is in background</p>
                            </div>
                            <Button
                              onClick={requestPermission}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Enable
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* General Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium">Enable Notifications</Label>
                          <p className="text-sm text-gray-500">Turn all notifications on or off</p>
                        </div>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(enabled) => updateSettings({ enabled })}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-base font-medium">Sound</Label>
                            <p className="text-sm text-gray-500">Play sound for new messages</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.sound}
                          onCheckedChange={(sound) => updateSettings({ sound })}
                          disabled={!settings.enabled}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-gray-500" />
                          <div>
                            <Label className="text-base font-medium">Desktop Notifications</Label>
                            <p className="text-sm text-gray-500">Show notifications on desktop</p>
                          </div>
                        </div>
                        <Switch
                          checked={settings.desktop}
                          onCheckedChange={(desktop) => updateSettings({ desktop })}
                          disabled={!settings.enabled || permission !== 'granted'}
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs h-8 px-2"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                      !notification.read && 'bg-blue-50 border-l-4 border-l-blue-500'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-600 font-medium">New</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}