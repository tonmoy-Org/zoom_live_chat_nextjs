'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Mail, Menu, X } from 'lucide-react';
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
  const { toast } = useToast();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout with toast notifications
  const handleLogout = async () => {
    try {
      toast({
        title: 'Signing out...',
        description: 'Please wait while we sign you out.',
        variant: 'default',
        duration: 1500,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      await signOut({ callbackUrl: '/login' });

      localStorage.setItem('showLogoutToast', 'true');
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: 'An error occurred while signing out. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleMobileLogout = () => {
    setIsMobileMenuOpen(false);
    handleLogout();
  };

  // Toggle mobile menu with accessibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'shadow-md py-2' : 'shadow-sm py-3'
        }`}
      aria-label="Main navigation"
    >
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4">
        <div className="flex justify-between items-center h-16 lg:h-12">
          {/* Logo */}
          <Link href={session ? '/chat' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 relative">
              <Image
                src={zoom}
                alt="Zoom Icon"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="w-24 sm:w-28 relative">
              <Image
                src={logo}
                alt="Logo"
                width={112}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <p className="text-gray-900 font-medium text-base tracking-tight">
              Start a live chat
            </p>

            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/chat">
                  <Button
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 font-semibold border border-gray-300/60 hover:from-blue-100 hover:to-indigo-100 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    size="sm"
                    aria-label="Go to My Chats"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    My Chats
                  </Button>
                </Link>

                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 font-semibold border border-gray-300/60 hover:from-blue-100 hover:to-indigo-100 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      size="sm"
                      aria-label="Go to Admin Dashboard"
                    >
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
                      className="relative h-9 w-9 rounded-full border border-gray-300 hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      aria-label="User profile menu"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-white text-gray-900 font-medium border border-gray-200">
                          {session.user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-72 border border-gray-200 shadow-lg rounded-lg bg-white p-2"
                    align="end"
                    forceMount
                  >
                    <div className="flex items-center gap-3 p-3 w-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff]  text-gray-900 font-medium border border-gray-200">
                          {session.user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium text-gray-900">{session.user.name}</p>
                        <p className="text-xs text-gray-500">@{session.user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.phone}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem
                      className="cursor-pointer text-gray-900 font-medium hover:bg-gray-100 rounded-md focus:bg-gray-100 focus:text-gray-900 transition-colors"
                      onSelect={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  className="bg-[#0b5cff] text-white font-medium  hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"
                  aria-label="Sign in"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {session && (
              <div className="flex items-center">
                <Link href="/chat">
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    aria-label="Go to My Chats"
                  >
                    <Mail className="h-4 w-4 text-gray-900" />
                  </Button>
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/admin" className="ml-2">
                    <Button
                      size="icon"
                      className="h-9 w-9 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      aria-label="Go to Admin Dashboard"
                    >
                      <Settings className="h-4 w-4 text-gray-900" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
            <button
              onClick={toggleMobileMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-slide-down">
          <div className="px-4 pt-3 pb-4 space-y-3">
            <p className="text-gray-900 font-medium text-center text-base tracking-tight">
              Start a live chat
            </p>

            {session ? (
              <div className="pt-3 pb-2 border-t border-gray-200">
                <div className="flex items-center px-3 py-2">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-white text-gray-900 font-medium border border-gray-200">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900 truncate">{session.user.name}</p>
                    <p className="text-sm text-gray-500">@{session.user.username}</p>
                    <p className="text-sm text-gray-500 truncate">{session.user.phone}</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={handleMobileLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <LogOut className="inline-block h-5 w-5 mr-2 align-middle" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-3 pb-2 border-t border-gray-200">
                <Link
                  href="/login"
                  className="flex justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    className="w-full bg-[#0b5cff] text-white font-medium border border-blue-700 hover:bg-blue-700 hover:border-blue-800"
                    aria-label="Sign in"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
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