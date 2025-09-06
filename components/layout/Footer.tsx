'use client';

import p_logo from '@/public/p_logo.png';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#000C3B] py-4 sm:py-6 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center text-[10px] text-gray-300 gap-4 sm:gap-3">
          {/* Copyright */}
          <span className="lg:text-center sm:text-left order-2 sm:order-1">
            Copyright ©2025 Zoom Communications, Inc. All rights reserved.
          </span>

          {/* Links */}
          <div className="flex flex-wrap lg:justify-center  items-center gap-2 sm:gap-3 order-1 sm:order-2">
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Terms</a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Privacy</a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Trust Center</a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Acceptable Use Guidelines</a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Legal & Compliance</a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a
              href="#"
              className="hover:text-blue-400 transition-colors duration-200 flex items-center"
            >
              <Image
                src={p_logo}
                alt="Privacy Choices"
                className="mr-1.5"
                width={28}
                height={8}
              />
              Your Privacy Choices
            </a>
            <span className="hidden sm:inline text-gray-500">|</span>

            <a href="#" className="hover:text-blue-400 transition-colors duration-200">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}