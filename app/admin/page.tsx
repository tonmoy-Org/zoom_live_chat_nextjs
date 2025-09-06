'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  Shield,
  MessageCircle,
  Plus,
  Ban,
  Trash2,
  Edit2,
  Settings,
  RotateCcw,
  Search,
  Download,
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';


export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [bannerGroup, setBannerGroup] = useState<any>(null);
  const [bannerText, setBannerText] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [membersModal, setMembersModal] = useState<any>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [resettingChatId, setResettingChatId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    userId?: string;
    groupId?: string;
    userName?: string;
    groupName?: string;
  } | null>(null);

  useEffect(() => {
    const filtered = users.filter((user: any) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.phone.includes(userSearchTerm);

      const userDate = user.createdAt ? new Date(user.createdAt) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate =
        (!start || (userDate && userDate >= start)) &&
        (!end || (userDate && userDate <= end));

      return matchesSearch && matchesDate;
    });
    setFilteredUsers(filtered);
  }, [users, userSearchTerm, startDate, endDate]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role !== 'admin') {
      router.push('/chat');
    } else if (status === 'authenticated') {
      fetchUsers();
      fetchGroups();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch users.',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while fetching users.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch groups.',
        });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while fetching groups.',
      });
    }
  };

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete' | 'make_admin' | 'make_user') => {
    if (action === 'delete') {
      setPendingAction({ type: 'delete_user', userId });
      toast({
        title: 'Confirm Deletion',
        description: 'Are you sure you want to delete this user?',
        action: (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                setPendingAction(null);
                try {
                  await fetch('/api/admin/users', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                  });
                  fetchUsers();
                  toast({
                    title: 'Success',
                    description: 'User deleted successfully.',
                  });
                } catch (error) {
                  console.error('Error deleting user:', error);
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete user.',
                  });
                }
              }}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Dismiss the toast
                dismiss();
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
          </div>
        ),
      });
      return;
    }

    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      fetchUsers();
      toast({
        title: 'Success',
        description: `User ${action === 'block' ? 'blocked' : action === 'unblock' ? 'unblocked' : 'role updated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user.',
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name is required.',
      });
      return;
    }

    setIsCreatingGroup(true);
    try {
      const response = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      });

      if (response.ok) {
        setNewGroupName('');
        setNewGroupDescription('');
        fetchGroups();
        toast({
          title: 'Success',
          description: 'Group created successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create group.',
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while creating the group.',
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
  };

  const handleUpdateGroup = async () => {
    if (!editGroupName.trim() || !editingGroup) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name is required.',
      });
      return;
    }

    setIsUpdatingGroup(true);
    try {
      const response = await fetch(`/api/admin/groups/${editingGroup._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editGroupName,
          description: editGroupDescription,
        }),
      });

      if (response.ok) {
        setEditingGroup(null);
        setEditGroupName('');
        setEditGroupDescription('');
        fetchGroups();
        toast({
          title: 'Success',
          description: 'Group updated successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update group.',
        });
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating the group.',
      });
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    setPendingAction({ type: 'delete_group', groupId, groupName });
    toast({
      title: 'Confirm Deletion',
      description: `Are you sure you want to delete "${groupName}"? This will delete all messages and remove all members.`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              setPendingAction(null);
              try {
                const response = await fetch(`/api/admin/groups/${groupId}`, {
                  method: 'DELETE',
                });

                if (response.ok) {
                  fetchGroups();
                  toast({
                    title: 'Success',
                    description: 'Group deleted successfully.',
                  });
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete group.',
                  });
                }
              } catch (error) {
                console.error('Error deleting group:', error);
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'An error occurred while deleting the group.',
                });
              }
            }}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleResetChat = async (groupId: string, groupName: string) => {
    setPendingAction({ type: 'reset_chat', groupId, groupName });
    toast({
      title: 'Confirm Reset',
      description: `Are you sure you want to reset all messages in "${groupName}"? This action cannot be undone.`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              setPendingAction(null);
              setResettingChatId(groupId);
              try {
                const response = await fetch(`/api/admin/groups/${groupId}/reset`, {
                  method: 'POST',
                });

                if (response.ok) {
                  toast({
                    title: 'Success',
                    description: 'Chat history reset successfully.',
                  });
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to reset chat history.',
                  });
                }
              } catch (error) {
                console.error('Error resetting chat:', error);
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'An error occurred while resetting chat history.',
                });
              } finally {
                setResettingChatId(null);
              }
            }}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bannerGroup) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file and a group.',
      });
      return;
    }

    setIsUploadingBanner(true);
    const formData = new FormData();
    formData.append('file', file);
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
        setBannerImageUrl(data.secure_url);
        toast({
          title: 'Success',
          description: 'Banner image uploaded successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to upload banner image.',
        });
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while uploading the banner.',
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleUpdateBanner = async () => {
    if (!bannerGroup) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No group selected.',
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${bannerGroup._id}/banner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: bannerImageUrl,
          text: bannerText,
        }),
      });

      if (response.ok) {
        setBannerGroup(null);
        setBannerText('');
        setBannerImageUrl('');
        fetchGroups();
        toast({
          title: 'Success',
          description: 'Banner updated successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update banner.',
        });
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating the banner.',
      });
    }
  };

  const handleDeleteBanner = async (groupId: string) => {
    setPendingAction({ type: 'delete_banner', groupId });
    toast({
      title: 'Confirm Deletion',
      description: 'Are you sure you want to remove this banner?',
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              setPendingAction(null);
              try {
                const response = await fetch(`/api/admin/groups/${groupId}/banner`, {
                  method: 'DELETE',
                });

                if (response.ok) {
                  fetchGroups();
                  toast({
                    title: 'Success',
                    description: 'Banner removed successfully.',
                  });
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to remove banner.',
                  });
                }
              } catch (error) {
                console.error('Error deleting banner:', error);
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'An error occurred while removing the banner.',
                });
              }
            }}
          >
            Remove
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleRemoveUser = async (groupId: string, userId: string, userName: string) => {
    setPendingAction({ type: 'remove_user', groupId, userId, userName });
    toast({
      title: 'Confirm Removal',
      description: `Are you sure you want to remove ${userName} from this group?`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
              setPendingAction(null);
              setRemovingMemberId(userId);
              try {
                const response = await fetch(`/api/admin/groups/${groupId}/members`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId }),
                });

                if (response.ok) {
                  fetchGroups();
                  if (membersModal) {
                    const updatedMembers = membersModal.members.filter((m: any) => m._id !== userId);
                    setMembersModal({ ...membersModal, members: updatedMembers });
                  }
                  toast({
                    title: 'Success',
                    description: `${userName} removed from the group.`,
                  });
                } else {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to remove user from group.',
                  });
                }
              } catch (error) {
                console.error('Error removing user:', error);
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'An error occurred while removing the user.',
                });
              } finally {
                setRemovingMemberId(null);
              }
            }}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `https://zoomchat.cloud/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Success',
      description: 'Invite link copied to clipboard!',
    });
  };

  const handleExportToExcel = () => {
    const data = filteredUsers.map((user: any) => ({
      Name: user.name,
      Username: user.username,
      Phone: user.phone,
      Role: user.role,
      Blocked: user.isBlocked ? 'Yes' : 'No',
      'Joined Groups': user.joinedGroups?.map((g: any) => g.groupName).join(', ') || 'None',
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'users.xlsx');
    toast({
      title: 'Success',
      description: 'Users exported to Excel successfully.',
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setUserSearchTerm('');
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset.',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <Toaster />
      <div className="max-w-7xl mx-auto lg:p-6 p-4">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and groups</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/chat')} variant="outline" size="sm" className="text-sm">
                Back to Chat
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, username, or phone..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={clearFilters} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <Button onClick={handleExportToExcel} size="sm" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export to Excel
                  </Button>
                  <div className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <div
                        key={user?._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
                      >
                        <div className="flex items-start gap-4 mb-4 sm:mb-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-blue-600">
                              {user?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {user.name} <span className="text-sm uppercase text-gray-500">({user.role})</span>
                            </h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                            <p className="text-xs text-gray-400">{user.phone}</p>
                            <p className="text-xs text-gray-400">
                              Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                            {user?.joinedGroups && user?.joinedGroups.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {user.joinedGroups.slice(0, 2).map((group: any) => (
                                  <Badge key={group?.groupId?._id} variant="outline" className="text-xs">
                                    {group.groupName}
                                  </Badge>
                                ))}
                                {user.joinedGroups.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.joinedGroups.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) =>
                              handleUserAction(user._id, newRole === 'admin' ? 'make_admin' : 'make_user')
                            }
                          >
                            <SelectTrigger className="w-full sm:w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.isBlocked && (
                            <Badge variant="destructive" className="hidden sm:inline-flex">
                              Blocked
                            </Badge>
                          )}
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, user.isBlocked ? 'unblock' : 'block')}
                              className={user.isBlocked ? 'text-green-600' : 'text-red-600'}
                            >
                              <Ban className="w-3 h-3" />
                              <span className="hidden sm:inline ml-1">{user.isBlocked ? 'Unblock' : 'Block'}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, 'delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Group Management
                    </CardTitle>
                    <CardDescription>Create and manage chat groups</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Create Group</span>
                        <span className="sm:hidden">Create</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription>Enter the details for your new chat group</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="groupName">Group Name</Label>
                          <Input
                            id="groupName"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="groupDescription">Description</Label>
                          <Textarea
                            id="groupDescription"
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            placeholder="Enter group description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleCreateGroup}
                          disabled={isCreatingGroup || !newGroupName.trim()}
                          className="w-full"
                        >
                          {isCreatingGroup ? 'Creating...' : 'Create Group'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No groups created yet</p>
                      <p className="text-sm text-gray-400">Create your first group to get started</p>
                    </div>
                  ) : (
                    groups.map((group: any) => (
                      <div
                        key={group._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                          <p className="text-xs text-gray-400 mt-1 break-all">
                            Invite Link: https://zoomchat.cloud/invite/{group.inviteCode}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setMembersModal(group)}
                            >
                              {group.members?.length || 0} members
                            </Badge>
                            {group.banner?.imageUrl && <Badge variant="secondary">Has Banner</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(group.inviteCode)}
                            className="flex-1 sm:flex-none"
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGroup(group)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit2 className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Link href={`/chat/${group._id}`} className="flex-1 sm:flex-none">
                            <Button size="sm" variant="outline" className="w-full">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetChat(group._id, group.name)}
                            disabled={resettingChatId === group._id}
                            className="text-orange-600 hover:text-orange-700 flex-1 sm:flex-none"
                          >
                            <RotateCcw className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{resettingChatId === group._id ? 'Resetting...' : 'Reset'}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGroup(group._id, group.name)}
                            className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                          >
                            <Trash2 className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Group Banners
                </CardTitle>
                <CardDescription>Manage group banners and headers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No groups available</p>
                    </div>
                  ) : (
                    groups.map((group: any) => (
                      <div key={group._id} className="p-4 bg-white rounded-lg border shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>
                            {group.banner?.imageUrl && (
                              <div className="mb-4">
                                <div className="relative w-full max-w-md h-32 border rounded-lg overflow-hidden">
                                  <Image
                                    fill
                                    src={group.banner.imageUrl}
                                    alt="Group banner"
                                    className="object-cover"
                                  />
                                </div>
                                {group.banner.text && (
                                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {group.banner.text}
                                  </p>
                                )}
                              </div>
                            )}
                            {!group.banner?.imageUrl && <p className="text-sm text-gray-500 mb-4">No banner set</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBannerGroup(group);
                                setBannerText(group.banner?.text || '');
                                setBannerImageUrl(group.banner?.imageUrl || '');
                              }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            {group.banner?.imageUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBanner(group._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Group Dialog */}
        <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>Update the group name and description</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editGroupName">Group Name</Label>
                <Input
                  id="editGroupName"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Label htmlFor="editGroupDescription">Description</Label>
                <Textarea
                  id="editGroupDescription"
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGroup(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateGroup}
                disabled={isUpdatingGroup || !editGroupName.trim()}
              >
                {isUpdatingGroup ? 'Updating...' : 'Update Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Banner Management Dialog */}
        <Dialog open={!!bannerGroup} onOpenChange={() => setBannerGroup(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Group Banner</DialogTitle>
              <DialogDescription>Upload an image and add text for the group banner</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  {bannerImageUrl && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden mb-2">
                      <Image
                        fill
                        src={bannerImageUrl}
                        alt="Banner preview"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isUploadingBanner}
                  >
                    {isUploadingBanner ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="bannerText">Banner Text</Label>
                <Textarea
                  id="bannerText"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Enter banner text (optional)"
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBannerGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBanner}>Update Banner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Modal */}
        <Dialog open={!!membersModal} onOpenChange={() => setMembersModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Group Members - {membersModal?.name}</DialogTitle>
              <DialogDescription>Manage members in this group</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search members by name..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {membersModal?.members
                  ?.filter((member: any) =>
                    member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    member.username.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((member: any) => (
                    <div key={member._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.name} @{member.username}
                          </p>
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveUser(membersModal._id, member._id, member.name)}
                        disabled={removingMemberId === member._id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {removingMemberId === member._id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setMembersModal(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}