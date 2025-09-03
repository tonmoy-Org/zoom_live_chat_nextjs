'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Users, Settings, Plus, LogOut, Search } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function ChatDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leavingGroupId, setLeavingGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroups();
    }
  }, [status, router]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/user/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
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
        fetchGroups(); // Refresh groups list
        router.push(`/chat/${data.group._id}`);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert('Failed to join group');
    } finally {
      setIsJoining(false);
      setInviteCode('');
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to leave "${groupName}"?`)) {
      return;
    }

    setLeavingGroupId(groupId);
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchGroups(); // Refresh groups list
      } else {
        alert('Failed to leave group');
      }
    } catch (error) {
      alert('Failed to leave group');
    } finally {
      setLeavingGroupId(null);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user.name}
          </h1>
          <p className="text-gray-600">Choose a chat group or join a new one</p>
        </div>
        {/* Join Group Card */}
        {/* <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Plus className="w-5 h-5" />
              Join a Group
            </CardTitle>
            <CardDescription>Enter an invite code to join a new group</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinGroup} className="flex gap-2">
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                disabled={isJoining || !inviteCode.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </Button>
            </form>
          </CardContent>
        </Card> */}

        {/* My Groups Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <CardTitle>My Groups</CardTitle>
              </div>

              {groups.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
              )}
            </div>
            <CardDescription>Your active chat groups</CardDescription>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-1">No groups yet</p>
                <p className="text-sm text-gray-400">Join a group to start chatting</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No groups match your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGroups.map((group: any) => (
                  <div
                    key={group._id}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-500 truncate">{group.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 self-end sm:self-auto">
                        {/* Open Chat Button */}
                        <Link href={`/chat/${group._id}`} className="flex-1 sm:flex-none">
                          <Button
                            size="sm"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                          >
                            Open Chat
                          </Button>
                        </Link>

                        {/* Leave Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveGroup(group._id, group.name)}
                          disabled={leavingGroupId === group._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
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
          <div className="mt-6">
            <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Admin Panel</h3>
                    <p className="text-gray-600">Manage users and groups</p>
                  </div>
                  <Link href="/admin" className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}