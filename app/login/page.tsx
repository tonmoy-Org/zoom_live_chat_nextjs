'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Phone, User } from 'lucide-react';
import AiWorkPlatform from '@/components/layout/AiWorkPlatform';
import CustomFooter from '@/components/layout/CustomFooter';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';


export default function Login() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/chat';
  const { toast } = useToast(); // Initialize the toast hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Validation
    if (!name.trim() || !username.trim() || !phone.trim()) {
      setError('All fields are required');
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      toast({
        title: "Invalid Username",
        description: "Use 3-20 characters with letters, numbers, and underscores only",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        name,
        username,
        phone,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
          duration: 3000,
        });
      } else {
        // Show success toast
        toast({
          title: "Welcome!",
          description: `Hello ${name}, you're now logged in`,
          variant: "default",
          duration: 2000,
        });

        // Get session and redirect after a brief delay to show the toast
        setTimeout(async () => {
          const session = await getSession();
          if (session?.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push(callbackUrl);
          }
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Toaster />
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
        <Card className="w-full max-w-md border-0 shadow-md">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome to <br />
              <span className="text-[#0b5cff]">Zoom Live Chat</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Enter your details to access the chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-10 rounded-full"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    className="pl-10 h-10 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-10 h-10 rounded-full"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-10 rounded-full bg-[#0b5cff] hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="mt-auto">
        <AiWorkPlatform />
        <CustomFooter />
      </div>
    </div>
  );
}