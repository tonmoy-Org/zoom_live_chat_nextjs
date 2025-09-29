/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  MessageSquare,
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
  Link as LinkIcon,
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
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
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

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete' | 'make_admin' | 'make_user', userName?: string) => {
    try {
      if (action === 'delete') {
        toast({
          title: 'Confirm User Deletion',
          description: `Are you sure you want to permanently delete ${userName || 'this user'}? This action cannot be undone.`,
          action: (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await fetch('/api/admin/users', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                  });
                  fetchUsers();
                  toast({
                    title: 'Success',
                    description: `${userName || 'User'} deleted successfully.`,
                  });
                }}
              >
                Delete
              </Button>
              <Button size="sm" variant="outline" onClick={() => dismiss()}>
                Cancel
              </Button>
            </div>
          ),
        });
        return;
      } else if (action === 'block' || action === 'unblock') {
        const isBlock = action === 'block';
        toast({
          title: `Confirm User ${isBlock ? 'Block' : 'Unblock'}`,
          description: `Are you sure you want to ${isBlock ? 'block' : 'unblock'} ${userName || 'this user'}?`,
          action: (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await fetch('/api/admin/users', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, action }),
                  });
                  fetchUsers();
                  toast({
                    title: 'Success',
                    description: `${userName || 'User'} ${isBlock ? 'blocked' : 'unblocked'} successfully.`,
                  });
                }}
              >
                {isBlock ? 'Block' : 'Unblock'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => dismiss()}>
                Cancel
              </Button>
            </div>
          ),
        });
        return;
      }

      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      fetchUsers();
      toast({
        title: 'Success',
        description: 'User role updated successfully.',
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

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleCreateGroup = async () => {
    const nameWordCount = getWordCount(newGroupName);
    const descWordCount = getWordCount(newGroupDescription);

    if (!newGroupName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name is required.',
      });
      return;
    }

    if (nameWordCount > 15) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name cannot exceed 15 words.',
      });
      return;
    }

    if (descWordCount > 20) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group description cannot exceed 20 words.',
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
        setIsCreateGroupOpen(false);
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
    const nameWordCount = getWordCount(editGroupName);
    const descWordCount = getWordCount(editGroupDescription);

    if (!editGroupName.trim() || !editingGroup) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name is required.',
      });
      return;
    }

    if (nameWordCount > 15) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group name cannot exceed 15 words.',
      });
      return;
    }

    if (descWordCount > 20) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Group description cannot exceed 20 words.',
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
    toast({
      title: 'Confirm Group Deletion',
      description: `Are you sure you want to delete "${groupName}"? This will permanently remove all messages and members.`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
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
          <Button size="sm" variant="outline" onClick={() => dismiss()}>
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleResetChat = async (groupId: string, groupName: string) => {
    toast({
      title: 'Confirm Chat Reset',
      description: `Are you sure you want to reset all messages in "${groupName}"? This action cannot be undone.`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
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
          <Button size="sm" variant="outline" onClick={() => dismiss()}>
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
    const textWordCount = getWordCount(bannerText);

    if (!bannerGroup) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No group selected.',
      });
      return;
    }

    if (textWordCount > 40) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Banner text cannot exceed 40 words.',
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
    toast({
      title: 'Confirm Banner Removal',
      description: 'Are you sure you want to remove this banner?',
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
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
          <Button size="sm" variant="outline" onClick={() => dismiss()}>
            Cancel
          </Button>
        </div>
      ),
    });
  };

  const handleRemoveUser = async (groupId: string, userId: string, userName: string) => {
    toast({
      title: 'Confirm Member Removal',
      description: `Are you sure you want to remove ${userName} from this group?`,
      action: (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={async () => {
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
            Remove
          </Button>
          <Button size="sm" variant="outline" onClick={() => dismiss()}>
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
      description: 'Invite link copied to clipboard.',
    });
  };

  const handleExportToExcel = () => {
    const data = filteredUsers.map((user: any) => ({
      Name: user.name,
      Username: user.username,
      Phone: user.phone,
      Role: user.role,
      Status: user.isBlocked ? 'Blocked' : 'Active',
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
      <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Manage users, groups, and banners efficiently</p>
            </div>
            <Button
              onClick={() => router.push('/chat')}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-gray-700"
              size="sm"
            >
              Back to Chat
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 text-gray-700 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#cdffd8] data-[state=active]:to-[#94b9ff] data-[state=active]:shadow-inner"
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="flex items-center gap-2 text-gray-700 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#cdffd8] data-[state=active]:to-[#94b9ff] data-[state=active]:shadow-inner"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger
              value="banners"
              className="flex items-center gap-2 text-gray-700 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#cdffd8] data-[state=active]:to-[#94b9ff] data-[state=active]:shadow-inner"
            >
              <Settings className="w-4 h-4" />
              <span>Banners</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Users className="w-5 h-5 text-blue-600" />
                  User Management
                </CardTitle>
                <p className="text-sm text-gray-500">View and manage all registered users</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, username, or phone"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                      aria-label="Search users"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 text-gray-700"
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {showFilters && (
                    <div
                      id="filter-panel"
                      className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm transition-all duration-200 ease-in-out"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        size="sm"
                        className="mt-4 border-gray-300 hover:bg-gray-50 text-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <Button
                    onClick={handleExportToExcel}
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </Button>
                  <p className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No users found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredUsers.map((user: any) => (
                      <div
                        key={user?._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-4 mb-4 sm:mb-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] rounded-full flex items-center justify-center shadow-sm">
                            <span className="font-medium text-gray-900">
                              {user?.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {user.name}{' '}
                              <span className="text-xs uppercase text-gray-500">({user.role})</span>
                            </h3>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                            <p className="text-sm text-gray-600">{user.phone}</p>
                            <p className="text-sm text-gray-500">
                              Joined:{' '}
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                            {user?.joinedGroups?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.joinedGroups.slice(0, 2).map((group: any) => (
                                  <Badge
                                    key={group?.groupId?._id}
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-600"
                                  >
                                    {group.groupName}
                                  </Badge>
                                ))}
                                {user.joinedGroups.length > 2 && (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
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
                            <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.isBlocked && (
                            <Badge variant="destructive" className="hidden sm:inline-flex ml-2">
                              Blocked
                            </Badge>
                          )}
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, user.isBlocked ? 'unblock' : 'block', user.name)}
                              className={user.isBlocked ? 'text-green-600 hover:text-green-700 border-gray-300 hover:bg-gray-50' : 'text-red-600 hover:text-red-700 border-gray-300 hover:bg-gray-50'}
                              aria-label={user.isBlocked ? 'Unblock user' : 'Block user'}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserAction(user._id, 'delete', user.name)}
                              className="text-red-600 hover:text-red-700 border-gray-300 hover:bg-gray-50"
                              aria-label="Delete user"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
            <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Group Management
                    </CardTitle>
                    <p className="text-sm text-gray-500">Create and manage chat groups</p>
                  </div>
                  <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl">Create New Group</DialogTitle>
                        <DialogDescription>Enter the details for your new chat group</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="groupName" className="text-sm font-medium text-gray-700">Group Name</Label>
                          <Input
                            id="groupName"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                            className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                            aria-required="true"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {getWordCount(newGroupName)} / 15 words
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="groupDescription" className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea
                            id="groupDescription"
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            placeholder="Enter group description (optional)"
                            className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {getWordCount(newGroupDescription)} / 20 words
                          </p>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button
                          onClick={handleCreateGroup}
                          disabled={isCreatingGroup || !newGroupName.trim() || getWordCount(newGroupName) > 15 || getWordCount(newGroupDescription) > 20}
                          className="bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                          {isCreatingGroup ? 'Creating...' : 'Create Group'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No groups created yet</p>
                      <p className="text-sm text-gray-500">Create your first group to get started</p>
                    </div>
                  ) : (
                    groups.map((group: any) => (
                      <div
                        key={group._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <h3 className="font-semibold text-gray-900">{group?.name}</h3>
                          <p className="text-sm text-gray-600 max-w-xl truncate">{group?.description || 'No description'}</p>
                          <div className="flex items-center text-sm mt-1">
                            <LinkIcon className="w-4 h-4 mr-2 text-blue-600" />
                            <a
                              href={`https://zoomchat.cloud/invite/${group?.inviteCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              https://zoomchat.cloud/invite/{group?.inviteCode}
                            </a>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge
                              variant="secondary"
                              className="cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200"
                              onClick={() => setMembersModal(group)}
                            >
                              {group?.members?.length || 0} members
                            </Badge>
                            {group?.banner?.imageUrl && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                Has Banner
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(group?.inviteCode)}
                            className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700"
                            aria-label="Copy invite link"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGroup(group)}
                            className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 text-gray-700"
                            aria-label="Edit group"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Link href={`/chat/${group?._id}`} className="flex-1 sm:flex-none">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                              aria-label="View group"
                            >
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetChat(group._id, group.name)}
                            disabled={resettingChatId === group._id}
                            className="flex-1 sm:flex-none text-orange-600 hover:text-orange-700 border-gray-300 hover:bg-gray-50"
                            aria-label="Reset chat history"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {resettingChatId === group._id ? 'Resetting...' : 'Reset'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGroup(group._id, group.name)}
                            className="flex-1 sm:flex-none text-red-600 hover:text-red-700 border-gray-300 hover:bg-gray-50"
                            aria-label="Delete group"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
            <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Group Banners
                </CardTitle>
                <p className="text-sm text-gray-500">Manage banners for chat groups</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No groups available</p>
                      <p className="text-sm text-gray-500">Create a group to add banners</p>
                    </div>
                  ) : (
                    groups.map((group: any) => (
                      <div
                        key={group._id}
                        className="p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                            {group.banner?.imageUrl ? (
                              <div className="mb-4">
                                <div className="relative w-full max-w-md h-32 border border-gray-200 rounded-md overflow-hidden shadow-sm">
                                  <Image
                                    fill
                                    src={group.banner.imageUrl}
                                    alt={`Banner for ${group.name}`}
                                    className="object-cover"
                                  />
                                </div>
                                {group.banner.text && (
                                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                    {group.banner.text}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 mb-4">No banner set</p>
                            )}
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
                              className="border-gray-300 hover:bg-gray-50 text-gray-700"
                              aria-label={`Edit banner for ${group.name}`}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            {group.banner?.imageUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBanner(group._id)}
                                className="text-red-600 hover:text-red-700 border-gray-300 hover:bg-gray-50"
                                aria-label={`Remove banner for ${group.name}`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
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
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Group</DialogTitle>
              <DialogDescription>Update the group name and description</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="editGroupName" className="text-sm font-medium text-gray-700">Group Name</Label>
                <Input
                  id="editGroupName"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  aria-required="true"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getWordCount(editGroupName)} / 15 words
                </p>
              </div>
              <div>
                <Label htmlFor="editGroupDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="editGroupDescription"
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  placeholder="Enter group description (optional)"
                  className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getWordCount(editGroupDescription)} / 20 words
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingGroup(null)}
                className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateGroup}
                disabled={isUpdatingGroup || !editGroupName.trim() || getWordCount(editGroupName) > 15 || getWordCount(editGroupDescription) > 20}
                className="bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {isUpdatingGroup ? 'Updating...' : 'Update Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Banner Management Dialog */}
        <Dialog open={!!bannerGroup} onOpenChange={() => setBannerGroup(null)}>
          <DialogContent className="sm:max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Manage Group Banner</DialogTitle>
              <DialogDescription>Upload an image and add text for the group banner</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Banner Image</Label>
                <div className="mt-2">
                  {bannerImageUrl && (
                    <div className="relative w-full h-40 border border-gray-200 rounded-md overflow-hidden mb-4 shadow-sm">
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
                    aria-label="Upload banner image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isUploadingBanner}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
                  >
                    {isUploadingBanner ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="bannerText" className="text-sm font-medium text-gray-700">Banner Text</Label>
                <Textarea
                  id="bannerText"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Enter banner text (optional)"
                  className="mt-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getWordCount(bannerText)} / 40 words
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setBannerGroup(null)}
                className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBanner}
                className="bg-blue-600 hover:bg-blue-700 rounded-md"
                disabled={(!bannerImageUrl && !bannerText) || getWordCount(bannerText) > 40}
              >
                Update Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Modal */}
        <Dialog open={!!membersModal} onOpenChange={() => setMembersModal(null)}>
          <DialogContent className="sm:max-w-lg rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Group Members - {membersModal?.name}</DialogTitle>
              <DialogDescription>Manage members in this group</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search members by name or username"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                aria-label="Search group members"
              />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {membersModal?.members
                  ?.filter((member: any) =>
                    member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                    member.username.toLowerCase().includes(memberSearch.toLowerCase())
                  )
                  .map((member: any) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-medium text-gray-900">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name} @{member.username}
                          </p>
                          <p className="text-sm text-gray-600">{member.phone}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveUser(membersModal._id, member._id, member.name)}
                        disabled={removingMemberId === member._id}
                        className="text-red-600 hover:text-red-700 border-gray-300 hover:bg-gray-50 rounded-md"
                        aria-label={`Remove ${member.name} from group`}
                      >
                        {removingMemberId === member._id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                onClick={() => setMembersModal(null)}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}