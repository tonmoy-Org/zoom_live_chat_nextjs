/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Image as ImageIcon, Users, CreditCard as Edit2, Settings, Trash2, Ban, Search, Paperclip, MoveVertical as MoreVertical, Bell, BellOff, BellOffIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ImageViewer from '@/components/ui/image-viewer';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Utility function to parse URLs in message content
const parseMessageContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    phone: string;
    username: string;
    isBlocked: boolean;
    role: string;
  };
  messageType: 'text' | 'image' | 'both';
  imageUrl?: string;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string;
}

interface Member {
  _id: string;
  name: string;
  username: string;
  phone: string;
  isBlocked: boolean;
  role: string;
}

export default function ChatGroup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params?.groupId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [groupSettings, setGroupSettings] = useState<any>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [sendError, setSendError] = useState('');
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [deletingMessageConfirmation, setDeletingMessageConfirmation] = useState<string | null>(null);
  const [blockUserConfirmation, setBlockUserConfirmation] = useState<{ userId: string; userName: string; isCurrentlyBlocked: boolean } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      initializeSocket();
      fetchMessages();
      const savedPreference = localStorage.getItem(`notifications-${groupId}`);
      if (savedPreference !== null) {
        setNotificationsEnabled(JSON.parse(savedPreference));
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (editImagePreview) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [status, groupId]);

  const initializeSocket = async () => {
    try {
      await fetch('/api/socket');
      const socketInstance = io();

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        socketInstance.emit('join-group', groupId);
      });

      socketInstance.on('new-message', (message: Message) => {
        setMessages(prev => {
          if (prev.some(msg => msg._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });

        if (notificationsEnabled && message.sender._id !== session?.user?.id) {
          showMessageNotification(message);
        }
      });

      socketInstance.on('message-edited', (editedMessage: Message) => {
        setMessages(prev => prev.map(msg =>
          msg._id === editedMessage._id ? editedMessage : msg
        ));
      });

      socketInstance.on('message-deleted', (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      });

      socketInstance.on('user-blocked', ({ userId, isBlocked }) => {
        setMessages(prev => prev.map(msg => {
          if (msg.sender?._id === userId) {
            return {
              ...msg,
              sender: {
                ...msg.sender,
                isBlocked
              }
            };
          }
          return msg;
        }));

        if (groupSettings) {
          setGroupSettings((prev: { members: any[] }) => {
            const updatedMembers = prev.members.map((member: any) => {
              if (member._id === userId) {
                return { ...member, isBlocked };
              }
              return member;
            });

            return {
              ...prev,
              members: updatedMembers
            };
          });
        }
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error('Error initializing socket:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to chat server.',
        variant: 'destructive',
      });
    }
  };

  const showMessageNotification = (message: Message) => {
    if (document.hidden) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${message.sender.name} @${message.sender.username}`, {
          body: message.messageType === 'image' ? 'Sent an image' : message.content || 'Sent a message',
          icon: '/favicon.ico',
          tag: `message-${message._id}`,
        });
      }
    }

    toast({
      title: `${message.sender.name} @${message.sender.username}`,
      description: message.messageType === 'image' ? 'Sent an image' : message.content || 'Sent a message',
      variant: 'default',
      action: message.imageUrl ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const messageElement = document.querySelector(`[data-message-id="${message._id}"]`);
            if (messageElement) {
              messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              messageElement.classList.add('bg-yellow-50', 'border-yellow-200');
              setTimeout(() => {
                messageElement.classList.remove('bg-yellow-50', 'border-yellow-200');
              }, 2000);
            }
          }}
        >
          View Image
        </Button>
      ) : undefined,
    });
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem(`notifications-${groupId}`, JSON.stringify(newValue));

    if (newValue && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    toast({
      title: newValue ? 'Notifications Enabled' : 'Notifications Disabled',
      description: newValue ? 'You will receive notifications for new messages.' : 'Notifications are turned off for this group.',
      variant: 'default',
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setGroup(data.group);
      } else {
        router.push('/chat');
        toast({
          title: 'Error',
          description: 'Failed to load group messages.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) {
      toast({
        title: 'Warning',
        description: 'Message or image cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setSendError('');
    const messageContent = newMessage;
    setNewMessage('');
    let imageUrl: string | undefined = undefined;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default');

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/ddh86gfrm/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while uploading the image.',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }
    }

    const content = messageContent.trim() || '';
    const messageType = imageUrl && content ? 'both' : imageUrl ? 'image' : 'text';

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          messageType,
          imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        socket?.emit('send-message', {
          groupId,
          message: data.message,
        });
        setPreviewUrl(null);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      } else {
        const error = await response.json();
        setSendError(error.message);
        setNewMessage(messageContent);
        toast({
          title: 'Error',
          description: error.message || 'Failed to send message.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('Failed to send message');
      setNewMessage(messageContent);
      toast({
        title: 'Error',
        description: 'An error occurred while sending the message.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: 'Warning',
        description: 'No file selected.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Only image files are allowed.',
        variant: 'destructive',
      });
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: 'Warning',
        description: 'No file selected.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Only image files are allowed.',
        variant: 'destructive',
      });
      return;
    }

    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    const url = URL.createObjectURL(file);
    setEditImagePreview(url);
    setEditImageFile(file);
  };

  const removePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const removeEditImagePreview = () => {
    if (editImagePreview) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(null);
    setEditImageFile(null);
  };

  const replaceImage = () => {
    fileInputRef.current?.click();
  };

  const handleEditMessage = async () => {
    if (!editingMessage) {
      return;
    }

    if (!editContent.trim() && !editImagePreview) {
      toast({
        title: 'Warning',
        description: 'Edited message must have either text or an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    let imageUrl: string | undefined = editingMessage.imageUrl;

    if (editImageFile) {
      const formData = new FormData();
      formData.append('file', editImageFile);
      formData.append('upload_preset', 'ml_default');

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/ddh86gfrm/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while uploading the image.',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }
    }

    const content = editContent.trim() || '';
    const messageType = imageUrl && content ? 'both' : imageUrl ? 'image' : 'text';

    try {
      const response = await fetch(`/api/admin/messages/${editingMessage._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          imageUrl,
          messageType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(msg =>
          msg._id === editingMessage._id ? data.message : msg
        ));
        socket?.emit('message-edited', {
          groupId,
          message: data.message,
        });
        setEditingMessage(null);
        setEditContent('');
        setEditImageFile(null);
        setEditImagePreview(null);
        if (editImagePreview) {
          URL.revokeObjectURL(editImagePreview);
        }
        toast({
          title: 'Success',
          description: 'Message edited successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to edit message.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while editing the message.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessageId(messageId);
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        socket?.emit('message-deleted', {
          groupId,
          messageId,
        });
        toast({
          title: 'Success',
          description: 'Message deleted successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete message.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the message.',
        variant: 'destructive',
      });
    } finally {
      setDeletingMessageId(null);
    }
  };

  const promptDeleteMessage = (messageId: string) => {
    setDeletingMessageConfirmation(messageId);
    toast({
      title: 'Delete Message?',
      description: 'Are you sure you want to delete this message?',
      variant: 'default',
      action: (
        <div className="flex gap-2 mt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              handleDeleteMessage(messageId);
              setDeletingMessageConfirmation(null);
            }}
          >
            Yes, Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dismiss();
              setDeletingMessageConfirmation(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const toggleUserBlock = async (userId: string, userName: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Invalid user ID.',
        variant: 'destructive',
      });
      return;
    }

    setBlockingUserId(userId);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/block-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      if (response.ok) {
        const updatedIsBlocked = action === 'block';
        setMessages(prev => prev.map(msg => {
          if (msg.sender?._id === userId) {
            return {
              ...msg,
              sender: {
                ...msg.sender,
                isBlocked: updatedIsBlocked
              }
            };
          }
          return msg;
        }));

        if (groupSettings) {
          setGroupSettings((prev: { members: any[] }) => {
            const updatedMembers = prev.members.map((member: any) => {
              if (member._id === userId) {
                return { ...member, isBlocked: updatedIsBlocked };
              }
              return member;
            });

            return {
              ...prev,
              members: updatedMembers
            };
          });
        }

        socket?.emit('user-blocked', {
          groupId,
          userId,
          isBlocked: updatedIsBlocked
        });
        toast({
          title: 'Success',
          description: `${userName} has been ${action}ed successfully.`,
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${action} user.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: 'Error',
        description: `An error occurred while ${action}ing the user.`,
        variant: 'destructive',
      });
    } finally {
      setBlockingUserId(null);
    }
  };

  const promptBlockUser = (userId: string, userName: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'Unblock' : 'Block';
    setBlockUserConfirmation({ userId, userName, isCurrentlyBlocked });
    toast({
      title: `${action} User?`,
      description: `Are you sure you want to ${action.toLowerCase()} ${userName} from sending messages?`,
      variant: 'default',
      action: (
        <div className="flex gap-2 mt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              toggleUserBlock(userId, userName, isCurrentlyBlocked);
              setBlockUserConfirmation(null);
            }}
          >
            Yes, ${action}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dismiss();
              setBlockUserConfirmation(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const fetchGroupSettings = async () => {
    if (session?.user?.role !== 'admin') return;

    try {
      const response = await fetch(`/api/admin/groups/${groupId}/settings`);
      if (response.ok) {
        const data = await response.json();
        setGroupSettings(data.group);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch group settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching group settings:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching group settings.',
        variant: 'destructive',
      });
    }
  };

  const updateGroupSettings = async (settings: any) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setGroupSettings(data.group);
        toast({
          title: 'Success',
          description: 'Group settings updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update group settings.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating group settings:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating group settings.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchGroupSettings();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 max-w-7xl mx-auto w-full">
      <Toaster />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <button onClick={() => setShowGroupInfo(true)}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[#0b5cff] text-white">
                  <Users className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </button>
            <div className="flex flex-col max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{group?.name || 'Chat Group'}</h1>
              <p className="text-sm text-gray-500">{group?.members?.length || 0} members</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              className="rounded-full hover:bg-gray-100"
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <Bell className="w-5 h-5 text-blue-600" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
            </Button>

            {session?.user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="rounded-full hover:bg-gray-100 sm:hidden"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="rounded-full hover:bg-gray-100 sm:hidden"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </Button>
            {session?.user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="hidden sm:flex items-center space-x-1 text-gray-600 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Button>
            )}
          </div>
        </div>

        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4 sm:hidden">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:bg-gray-100"
                onClick={toggleNotifications}
              >
                {notificationsEnabled ? (
                  < BellOffIcon className="w-4 h-4 mr-2" />
                ) : (
                <Bell className="w-4 h-4 mr-2" />
              )}
                {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
              </Button>
              {session?.user?.role === 'admin' && (
                <Button
                  variant="ghost"
                  className="justify-start text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    setShowSettings(true);
                    setShowMobileMenu(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Group Settings
                </Button>
              )}
              <Button
                variant="ghost"
                className="justify-start text-gray-600 hover:bg-gray-100"
                onClick={() => {
                  setShowMembers(true);
                  setShowMobileMenu(false);
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                View Members
              </Button>
            </div>
          </div>
        )}
      </div>

      {group?.banner && (
        <div className="bg-white border-b border-gray-200 p-4 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            {group.banner.imageUrl && (
              <Image
                width={400}
                height={80}
                src={group.banner.imageUrl}
                alt="Group banner"
                className="w-full sm:w-96 h-full object-cover rounded-md mb-2 sm:mb-0"
              />
            )}
            {group.banner.text && (
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{group.banner.text}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 sm:p-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-gray-200 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                <p className="text-sm text-gray-500">Send a message to start the conversation</p>
              </div>
            ) : (
              messages.map((message) => {
                const isAdminMessage = message?.sender?.role === 'admin';
                const isOwnMessage = message?.sender?._id === session?.user?.id;

                return (
                  <div
                    key={message._id}
                    data-message-id={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-md p-3 rounded-xl transition-all duration-300 ${isAdminMessage
                        ? 'border-l-4 border-purple-600 bg-white shadow-sm'
                        : isOwnMessage
                          ? 'bg-[#0b5cff] text-white'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                        }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
                          <span className="truncate">{message?.sender?.name || ''} @{message?.sender?.username || 'zoomUser'}</span>
                          {message?.sender?.isBlocked && (
                            <span className="text-xs text-red-500">(Blocked)</span>
                          )}
                          {isAdminMessage && (
                            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </p>
                      )}

                      {message.imageUrl && (
                        <ImageViewer
                          src={message.imageUrl}
                          alt="Shared image"
                          className="rounded-lg max-w-full h-auto cursor-pointer mb-2"
                        />
                      )}
                      {message.content && (
                        <p className="text-sm break-words">{parseMessageContent(message.content)}</p>
                      )}

                      <div
                        className={`flex items-center mt-1 text-xs ${isOwnMessage && !isAdminMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}
                      >
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.isEdited && <span className="ml-1 opacity-75">(edited)</span>}
                        {deletingMessageId === message._id && (
                          <span className="ml-1 opacity-75">(deleting...)</span>
                        )}
                      </div>

                      {session?.user?.role === 'admin' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMessage(message);
                              setEditContent(message?.content || '');
                              setEditImagePreview(message?.imageUrl || null);
                            }}
                            className="p-1 h-auto text-gray-500 hover:text-gray-700 text-xs"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => promptDeleteMessage(message._id)}
                            disabled={deletingMessageId === message._id || deletingMessageConfirmation === message._id}
                            className="p-1 h-auto text-red-500 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                          <Button
                            variant={message?.sender?.isBlocked ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              promptBlockUser(
                                message?.sender?._id,
                                message?.sender?.name || '',
                                message?.sender?.isBlocked || false
                              )
                            }
                            disabled={blockingUserId === message?.sender?._id || !!blockUserConfirmation}
                            className={`p-1 h-auto text-xs ${message.sender?.isBlocked
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'text-orange-600 hover:text-orange-700'
                              }`}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            {message?.sender?.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4">
        {sendError && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {sendError}
          </div>
        )}
        <form onSubmit={sendMessage} className="flex flex-col gap-2 items-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {previewUrl && (
            <div className="relative w-fit mb-2">
              <Image
                width={400}
                height={400}
                src={previewUrl}
                alt="Image preview"
                className="max-h-40 rounded-lg object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={removePreview}
                  className="h-6 w-6 rounded-full"
                >
                  X
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={replaceImage}
                  className="h-6 w-6 rounded-full border-gray-300 hover:bg-gray-100"
                >
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 items-center w-full">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full h-10 w-10 shrink-0 border-gray-300 hover:bg-gray-100"
            >
              <Paperclip className="w-4 h-4 text-gray-600" />
            </Button>
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 min-h-[40px] rounded-xl resize-none"
            />
            <Button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || isSending}
              className="rounded-full h-10 w-10 shrink-0 bg-[#0b5cff] hover:bg-blue-700"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={!!editingMessage} onOpenChange={() => {
        setEditingMessage(null);
        setEditContent('');
        setEditImageFile(null);
        setEditImagePreview(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>Modify the message content and/or image below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter message content..."
              className="min-h-[100px]"
            />
            <div className="space-y-2">
              {editImagePreview && (
                <div className="relative w-fit">
                  <Image
                    width={300}
                    height={300}
                    src={editImagePreview}
                    alt="Image preview"
                    className="max-h-40 rounded-lg object-cover"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={removeEditImagePreview}
                      className="h-6 w-6 rounded-full"
                    >
                      X
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => editFileInputRef.current?.click()}
                      className="h-6 w-6 rounded-full border-gray-300 hover:bg-gray-100"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEditFileSelect}
                className="hidden"
              />
              {!editImagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {editingMessage?.imageUrl ? 'Replace Image' : 'Upload Image'}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setEditingMessage(null);
                setEditContent('');
                setEditImageFile(null);
                setEditImagePreview(null);
              }}
              className="flex-1 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMessage}
              disabled={!editContent.trim() && !editImagePreview}
              className="flex-1 bg-[#0b5cff] hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGroupInfo} onOpenChange={setShowGroupInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Group Information</DialogTitle>
            <DialogDescription>Details about this group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-[#0b5cff] text-white">
                  <Users className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group?.name || 'Chat Group'}</h3>
                <p className="text-sm text-gray-500">{group?.members?.length || 0} members</p>
              </div>
            </div>
            {group?.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                <p className="text-sm text-gray-500">{group.description}</p>
              </div>
            )}
            {group?.banner?.text && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Banner Text</h4>
                <p className="text-sm text-gray-500">{group.banner.text}</p>
              </div>
            )}
            {group?.banner?.imageUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Banner Image</h4>
                <Image
                  width={300}
                  height={60}
                  src={group.banner.imageUrl}
                  alt="Group banner"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowGroupInfo(false)}
              className="bg-[#0b5cff] hover:bg-blue-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>List of members in this group</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {group?.members
              ?.filter((member: Member) =>
                member.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                member.phone?.includes(userSearchTerm) ||
                member.username?.toLowerCase().includes(userSearchTerm.toLowerCase())
              )
              .map((member: Member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {member.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {member.name} @{member.username}
                        {member.isBlocked && (
                          <span className="ml-2 text-xs text-red-500">(Blocked)</span>
                        )}
                        {member.role === 'admin' && (
                          <span className="ml-2 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{member.phone}</p>
                    </div>
                  </div>
                  {session?.user?.role === 'admin' && member._id !== session?.user?.id && (
                    <Button
                      variant={member.isBlocked ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        promptBlockUser(member._id, member.name || '', member.isBlocked || false)
                      }
                      disabled={blockingUserId === member._id || !!blockUserConfirmation}
                      className={`text-xs ${member.isBlocked
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'text-orange-600 hover:text-orange-700 border-orange-300'
                        }`}
                    >
                      {member.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  )}
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowMembers(false)}
              className="bg-[#0b5cff] hover:bg-blue-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {session?.user?.role === 'admin' && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Group Settings</DialogTitle>
              <DialogDescription>Manage group permissions and restrictions.</DialogDescription>
            </DialogHeader>

            {groupSettings && (
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="notifications-enabled"
                      checked={notificationsEnabled}
                      onCheckedChange={toggleNotifications}
                    />
                    <label htmlFor="notifications-enabled" className="text-sm font-medium text-gray-700 flex-1">
                      Enable message notifications
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if ('Notification' in window && Notification.permission !== 'granted') {
                          Notification.requestPermission();
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Manage Permissions
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="messaging-enabled"
                      checked={groupSettings.isMessagingEnabled}
                      onCheckedChange={(checked) =>
                        updateGroupSettings({ isMessagingEnabled: checked })
                      }
                    />
                    <label htmlFor="messaging-enabled" className="text-sm font-medium text-gray-700">
                      Enable messaging for this group
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Messaging Mode</label>
                    <Select
                      value={groupSettings.messagingMode}
                      onValueChange={(value) => updateGroupSettings({ messagingMode: value })}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All users can message</SelectItem>
                        <SelectItem value="restricted">Block specific users</SelectItem>
                        <SelectItem value="allowed_only">Only allow specific users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(groupSettings.messagingMode === 'restricted' || groupSettings.messagingMode === 'allowed_only') && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        {groupSettings.messagingMode === 'restricted' ? 'Restricted Users' : 'Allowed Users'}
                      </label>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {groupSettings.members
                          ?.filter((member: any) =>
                            member.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            member.phone?.includes(userSearchTerm) ||
                            member.username?.includes(userSearchTerm.toLowerCase())
                          )
                          .map((member: any) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id={`user-${member._id}`}
                                  checked={
                                    groupSettings.messagingMode === 'restricted'
                                      ? groupSettings.restrictedUsers?.some((u: any) => u._id === member._id)
                                      : groupSettings.allowedUsers?.some((u: any) => u._id === member._id)
                                  }
                                  onCheckedChange={(checked) => {
                                    const currentList =
                                      groupSettings.messagingMode === 'restricted'
                                        ? groupSettings.restrictedUsers?.map((u: any) => u._id) || []
                                        : groupSettings.allowedUsers?.map((u: any) => u._id) || [];

                                    const newList = checked
                                      ? [...currentList, member._id]
                                      : currentList.filter((id: string) => id !== member._id);

                                    updateGroupSettings({
                                      [groupSettings.messagingMode === 'restricted'
                                        ? 'restrictedUsers'
                                        : 'allowedUsers']: newList,
                                    });
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <label
                                    htmlFor={`user-${member._id}`}
                                    className="text-sm font-medium text-gray-700 truncate"
                                  >
                                    {member.name} @{member.username}
                                    {member.isBlocked && (
                                      <span className="ml-2 text-xs text-red-500">(Blocked)</span>
                                    )}
                                  </label>
                                  <p className="text-xs text-gray-500 truncate">{member.phone}</p>
                                </div>
                              </div>
                              <Button
                                variant={member.isBlocked ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                  promptBlockUser(member._id, member.name || '', member.isBlocked || false)
                                }
                                disabled={blockingUserId === member._id || !!blockUserConfirmation}
                                className={`text-xs ${member.isBlocked
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'text-orange-600 hover:text-orange-700 border-orange-300'
                                  }`}
                              >
                                {member.isBlocked ? 'Unblock' : 'Block'}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setShowSettings(false)}
                className="bg-[#0b5cff] hover:bg-blue-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}