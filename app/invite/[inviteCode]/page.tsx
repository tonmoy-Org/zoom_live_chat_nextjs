/* eslint-disable react/no-unescaped-entities */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Users, UserPlus } from 'lucide-react';

export default function GroupInvite() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const inviteCode = params?.inviteCode as string;

  const [group, setGroup] = useState<any>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (status === 'authenticated') {
      fetchGroupInfo();
    }
  }, [status, inviteCode]);


  const fetchGroupInfo = async () => {
    try {
      const response = await fetch(`/api/groups/info/${inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);

        if (data.alreadyMember) {
          // User is already a member, redirect to chat
          router.push(data.redirectTo);
        } else {
          setShowJoinDialog(true);
        }
      } else {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error fetching group info:', error);
      router.push('/chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
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
        router.push(`/chat/${data.group._id}`);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      alert('Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 128px)' }}>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You've been invited!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join the conversation and start chatting
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {group && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="text-gray-600 text-sm">{group.description}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {group.members?.length || 0} members
                </div>
              </div>
              <Button
                onClick={() => setShowJoinDialog(true)}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join "{group?.name}"?</DialogTitle>
            <DialogDescription>
              You're about to join this group chat. You'll be able to send and receive messages with other members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={handleJoinGroup}
              disabled={isJoining}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isJoining ? 'Joining...' : 'Join Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}