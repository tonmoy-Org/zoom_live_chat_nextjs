/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Users, Settings, Plus, LogOut, Search } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function ChatDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status, router]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch groups.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching groups.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid invite code.',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchGroups();
        toast({
          title: 'Success',
          description: `Successfully joined "${data.group.name}"!`,
        });
        router.push(`/chat/${data.group._id}`);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to join group.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while joining the group.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
      setInviteCode('');
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    setLeavingGroupId(groupId);
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchGroups();
        toast({
          title: 'Success',
          description: `You have left "${groupName}".`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to leave group.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while leaving the group.',
        variant: 'destructive',
      });
    } finally {
      setLeavingGroupId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      toast({
        title: 'Signing out...',
        description: 'Please wait.',
        variant: 'default',
        duration: 1000,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      await signOut({ callbackUrl: '/login' });
      localStorage.setItem('showLogoutToast', 'true');
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: 'Unable to sign out. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, {session?.user.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Choose a chat group or join a new one</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 text-gray-600"
            size="sm"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Join Group Card */}
        {/* <Card className="mb-6 border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">Join a Group</CardTitle>
            </div>
            <p className="text-sm text-gray-600">Enter an invite code to join a group</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGroup} className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter invite code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 border-gray-300 focus:ring-2 focus:ring-[#94b9ff] rounded-md"
                disabled={isJoining}
                aria-label="Invite code"
              />
              <Button
                type="submit"
                disabled={isJoining || !inviteCode.trim()}
                className="bg-[#0b5cff] hover:bg-blue-700 text-white rounded-md"
                aria-label="Join group"
              >
                {isJoining ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Join Group'
                )}
              </Button>
            </form>
          </CardContent>
        </Card> */}

        {/* My Groups Card */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <CardTitle className="text-lg font-semibold text-gray-900">My Groups</CardTitle>
              </div>
              {groups.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                    aria-label="Search groups"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">Your active chat groups</p>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No groups yet</p>
                <p className="text-sm text-gray-500">Join a group to start chatting</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No groups match your search</p>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGroups.map((group: any) => (
                  <div
                    key={group._id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-600 truncate">{group.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto">
                        <Link href={`/chat/${group._id}`} className="flex-1 sm:flex-none">
                          <Button
                            size="sm"
                            className="w-full sm:w-auto bg-[#0b5cff] hover:bg-blue-700 text-white rounded-md"
                            aria-label={`Open chat for ${group.name}`}
                          >
                            Open Chat
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: `Leave "${group.name}"?`,
                              description: 'Are you sure you want to leave this group?',
                              variant: 'default',
                              action: (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => dismiss()}
                                    className="border-gray-300 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleLeaveGroup(group._id, group.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Leave
                                  </Button>
                                </div>
                              ),
                            });
                          }}
                          disabled={leavingGroupId === group._id}
                          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-md"
                          aria-label={`Leave ${group.name}`}
                        >
                          {leavingGroupId === group._id ? 'Leaving...' : 'Leave'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Panel */}
        {session?.user.role === 'admin' && (
          <Card className="mt-6 border-gray-200 shadow-sm border-l-4 border-blue-600">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                  <p className="text-sm text-gray-600">Manage users and groups</p>
                </div>
                <Link href="/admin" className="flex-1 sm:flex-none">
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-gray-900 hover:from-[#b5f0c6] hover:to-[#7aa2e6] rounded-md"
                    aria-label="Access admin panel"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}