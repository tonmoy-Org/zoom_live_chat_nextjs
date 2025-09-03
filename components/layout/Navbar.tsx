'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, MailSearch } from 'lucide-react';
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

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto lg:px-0 px-4">
        <div className="flex flex-wrap justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={session ? '/chat' : '/'}
            className="flex items-center gap-3"
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

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* This text will hide on mobile */}
            <p className="text-[#262c33] font-semibold text-lg hidden md:block">
              Ready to start live chat?
            </p>

            {session ? (
              <div className="flex items-center gap-2 sm:gap-2">
                <Link href="/chat">
                  <Button className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-[#262c33] font-medium border border-gray-300 hover:from-[#94b9ff] hover:to-[#cdffd8] transition-all duration-300 shadow-sm " size="sm">
                    <MailSearch className="w-4 h-4 mr-2" />
                    My Chats
                  </Button>
                </Link>

                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-[#262c33] font-medium border border-gray-300 hover:from-[#94b9ff] hover:to-[#cdffd8] transition-all duration-300 shadow-sm" size="sm">
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
                      className="relative h-10 w-10 rounded-full border border-gray-300 hover:bg-white/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 border border-gray-200 shadow-lg rounded-md bg-white"
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
                      onSelect={() => signOut({ callbackUrl: '/login' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#94b9ff] to-[#cdffd8] text-[#262c33] font-medium border border-gray-300 hover:from-[#cdffd8] hover:to-[#94b9ff] transition-all duration-300 shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}