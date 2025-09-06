'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, MailSearch, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import logo from '@/public/logo.svg';
import zoom from '@/public/zoom.png';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';


export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast(); // Initialize the toast hook

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Show loading toast
      toast({
        title: "Logging out...",
        description: "Please wait",
        variant: "default",
        duration: 1000,
      });

      // Add a small delay to show the loading toast
      await new Promise(resolve => setTimeout(resolve, 500));

      // Perform logout
      await signOut({ callbackUrl: '/login' });

      // Show success toast (this will show after redirect to login page)
      // We'll also show a toast on the login page to confirm logout
      localStorage.setItem('showLogoutToast', 'true');

    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Unable to logout. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleMobileLogout = () => {
    setIsMobileMenuOpen(false);
    handleLogout();
  };

  return (
    <nav className={`sticky top-0 z-50 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-md py-1' : 'shadow-sm py-2'}`}>
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={session ? '/chat' : '/'}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative">
                <Image
                  src={zoom}
                  alt="Zoom Icon"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="w-24 sm:w-32 relative">
                <Image
                  src={logo}
                  alt="Logo"
                  width={130}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <p className="text-[#262c33] font-semibold text-lg">
              Ready to start live chat?
            </p>

            {session ? (
              <div className="flex items-center gap-2">
                <Link href="/chat">
                  <Button className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-[#262c33] font-medium border border-gray-300 hover:from-[#94b9ff] hover:to-[#cdffd8] transition-all duration-300 shadow-sm hover:shadow-md" size="sm">
                    <MailSearch className="w-4 h-4 mr-2" />
                    My Chats
                  </Button>
                </Link>

                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-[#262c33] font-medium border border-gray-300 hover:from-[#94b9ff] hover:to-[#cdffd8] transition-all duration-300 shadow-sm hover:shadow-md" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-gray-300 hover:bg-white/80 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 border border-gray-200 shadow-lg rounded-md bg-white/95 backdrop-blur-sm"
                    align="end"
                    forceMount
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-[#262c33]">{session.user.name}</p>
                        <p className="text-xs text-gray-500">@{session.user.username}</p>
                        <p className="w-[200px] truncate text-sm text-gray-500">
                          {session.user.phone}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      className="cursor-pointer text-[#262c33] focus:bg-gray-100 focus:text-[#262c33]"
                      onSelect={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium border border-gray-300 hover:from-[#cdffd8] hover:to-[#94b9ff] transition-all duration-300 shadow-sm hover:shadow-md">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {session && (
              <div className="flex items-center mr-3">
                <Link href="/chat" className="mr-2">
                  <Button size="sm" className="h-9 w-9 p-0 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] border border-gray-300">
                    <MailSearch className="h-4 w-4" />
                  </Button>
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/admin" className="mr-2">
                    <Button size="sm" className="h-9 w-9 p-0 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] border border-gray-300">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#262c33] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <p className="text-[#262c33] font-semibold text-center py-2">
              Ready to start live chat?
            </p>

            {session ? (
              <div className="pt-2 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4 py-3">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-medium text-[#262c33]">{session.user.name}</p>
                    <p className="text-sm text-gray-500">@{session.user.username}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={handleMobileLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-[#262c33] hover:bg-gray-100 rounded-md"
                  >
                    <LogOut className="inline-block h-5 w-5 mr-2 align-middle" />
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 pb-3 border-t border-gray-200">
                <Link
                  href="/login"
                  className="flex justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium border border-gray-300">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}