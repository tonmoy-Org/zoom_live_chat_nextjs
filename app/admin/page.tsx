'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Shield, MessageCircle, Plus, Ban, Trash2, Edit2, Settings, RotateCcw, Search } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  useEffect(() => {
    const filtered = users.filter((user: any) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.phone.includes(userSearchTerm);

      const userDate = user.createdAt ? new Date(user.createdAt) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate = (!start || (userDate && userDate >= start)) &&
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
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleUserAction = async (userId: string, action: 'block' | 'unblock' | 'delete' | 'make_admin' | 'make_user') => {
    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this user?')) return;
        await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } else {
        await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action }),
        });
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

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
      }
    } catch (error) {
      console.error('Error creating group:', error);
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
    if (!editGroupName.trim() || !editingGroup) return;

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
      }
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This will delete all messages and remove all members.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleResetChat = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to reset all messages in "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    setResettingChatId(groupId);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/reset`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Chat history reset successfully');
      } else {
        alert('Failed to reset chat history');
      }
    } catch (error) {
      console.error('Error resetting chat:', error);
      alert('Failed to reset chat history');
    } finally {
      setResettingChatId(null);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bannerGroup) return;

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
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleUpdateBanner = async () => {
    if (!bannerGroup) return;

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
      }
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const handleDeleteBanner = async (groupId: string) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/banner`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleRemoveUser = async (groupId: string, userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from this group?`)) return;

    setRemovingMemberId(userId);
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchGroups();
        // Update the modal data
        if (membersModal) {
          const updatedMembers = membersModal.members.filter((m: any) => m._id !== userId);
          setMembersModal({ ...membersModal, members: updatedMembers });
        }
      }
    } catch (error) {
      console.error('Error removing user:', error);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `https://zoomchat.cloud/invite/${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
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
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto lg:p-6 p-2">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and groups</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/chat')} variant="outline">
                Back to Chat
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Banners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
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
                <div className="lg:flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleExportToExcel}>
                    Export to Excel
                  </Button>
                </div>
                <div className="space-y-4">
                  {filteredUsers.map((user: any) => (
                    <div key={user?._id} className="flex items-center justify-between lg:p-4 p-2 bg-white rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {user?.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}- <span className='text-sm uppercase'>({user.role})</span></h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                          <p className="text-xs text-gray-400">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {user?.joinedGroups && user?.joinedGroups.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.joinedGroups.map((group: any) => (
                                <Badge key={group?.groupId?._id} variant="outline" className="text-xs">
                                  {group.groupName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="lg:flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleUserAction(user._id, newRole === 'admin' ? 'make_admin' : 'make_user')}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {user.isBlocked && (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user._id, user.isBlocked ? 'unblock' : 'block')}
                            className={user.isBlocked ? 'text-green-600' : 'text-red-600'}
                          >
                            <Ban className="w-3 h-3" />
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user._id, 'delete')}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Group Management
                    </CardTitle>
                    <CardDescription>
                      Create and manage chat groups
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription>
                          Enter the details for your new chat group
                        </DialogDescription>
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
                      <div key={group._id} className="lg:flex items-center justify-between lg:p-4 p-2 bg-white rounded-lg border">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Invite Link: https://zoomchat.cloud/invite/{group.inviteCode}
                          </p>
                          <div className="lg:flex items-center gap-4 mt-2">
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => setMembersModal(group)}
                            >
                              {group.members?.length || 0} members
                            </Badge>
                            {group.banner?.imageUrl && (
                              <Badge variant="secondary">Has Banner</Badge>
                            )}
                          </div>
                        </div>
                        <div className="lg:flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(group.inviteCode)}
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Link href={`/chat/${group._id}`}>
                            <Button size="sm" variant="outline">
                              View Chat
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetChat(group?._id, group.name)}
                            disabled={resettingChatId === group._id}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {resettingChatId === group._id ? 'Resetting...' : 'Reset Chat'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGroup(group._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Group Banners
                </CardTitle>
                <CardDescription>
                  Manage group banners and headers
                </CardDescription>
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
                      <div key={group._id} className="lg:p-4 p-2 bg-white rounded-lg border">
                        <div className="lg:flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2">{group.name}</h3>

                            {group.banner?.imageUrl && (
                              <div className="mb-4">
                                <Image
                                  width={300}
                                  height={300}
                                  src={group.banner.imageUrl}
                                  alt="Group banner"
                                  className="w-full max-w-md h-32 object-cover border"
                                />
                                {group.banner.text && (
                                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {group.banner.text}
                                  </p>
                                )}
                              </div>
                            )}

                            {!group.banner?.imageUrl && (
                              <p className="text-sm text-gray-500 mb-4">No banner set</p>
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
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit Banner
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
              <DialogDescription>
                Update the group name and description
              </DialogDescription>
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
              <Button
                variant="outline"
                onClick={() => setEditingGroup(null)}
              >
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
              <DialogDescription>
                Upload an image and add text for the group banner
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Banner Image</Label>
                <div className="mt-2">
                  {bannerImageUrl && (
                    <Image
                      width={300}
                      height={300}
                      src={bannerImageUrl}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-lg border mb-2"
                    />
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
              <Button onClick={handleUpdateBanner}>
                Update Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Modal */}
        <Dialog open={!!membersModal} onOpenChange={() => setMembersModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Group Members - {membersModal?.name}</DialogTitle>
              <DialogDescription>
                Manage members in this group
              </DialogDescription>
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
                          <p className="text-sm font-medium">{member.name} @{member.username}</p>
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
              <Button onClick={() => setMembersModal(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}