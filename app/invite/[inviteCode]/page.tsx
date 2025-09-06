/* eslint-disable react/no-unescaped-entities */
'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function GroupInvite() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const inviteCode = params?.inviteCode as string;
  const { toast } = useToast(); // Initialize the toast hook

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
  }, [status, inviteCode, router]);

  const fetchGroupInfo = async () => {
    try {
      const response = await fetch(`/api/groups/info/${inviteCode}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);

        if (data.alreadyMember) {
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

        // Show success toast
        toast({
          title: "Joined Successfully!",
          description: `You've joined "${group?.name}"`,
          variant: "default",
          duration: 3000, // Show for 3 seconds
        });

        // Redirect after a brief delay to show the toast
        setTimeout(() => {
          router.push(`/chat/${data.group._id}`);
        }, 1000);

      } else {
        const error = await response.json();

        // Show error toast
        toast({
          title: "Failed to Join",
          description: error.message || "Something went wrong",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to Join",
        description: "Network error. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 lg:py-12 bg-gray-100 min-h-screen">

      {/* Toaster */}
      <Toaster />
      <Card className="w-full max-w-[90%] sm:max-w-md border-0 shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            You've Been Invited!
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            Join the conversation and start chatting
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {group && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {group.members?.length || 0} members
                </div>
              </div>
              <Button
                onClick={() => setShowJoinDialog(true)}
                className="w-full h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="w-[90%] sm:max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Join "{group?.name}"?</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              You're about to join this group chat. You'll be able to send and receive messages with other members.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={handleJoinGroup}
              disabled={isJoining}
              className="w-full max-w-[200px] mx-auto h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
            >
              {isJoining ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                'Join Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}