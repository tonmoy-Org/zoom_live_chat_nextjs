import p_logo from '@/public/p_logo.png'
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#010526] py-4 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center text-xs text-white gap-3 sm:gap-2">

          {/* Copyright */}
          <span className="text-center sm:text-left">
            Copyright ©2025 Zoom Communications, Inc. All rights reserved.
          </span>

          {/* Links */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
            <a href="#" className="hover:underline">Terms</a>
            <span className="hidden sm:inline">|</span>

            <a href="#" className="hover:underline">Privacy</a>
            <span className="hidden sm:inline">|</span>

            <a href="#" className="hover:underline">Trust Center</a>
            <span className="hidden sm:inline">|</span>

            <a href="#" className="hover:underline">Acceptable Use Guidelines</a>
            <span className="hidden sm:inline">|</span>

            <a href="#" className="hover:underline">Legal & Compliance</a>
            <span className="hidden sm:inline">|</span>

            <a
              href="#"
              className="hover:underline flex items-center"
            >
              <Image
                src={p_logo}
                alt="Privacy Choices"
                className="mr-2"
                width={36}
                height={10}
              />
              Your Privacy Choices
            </a>
            <span className="hidden sm:inline">|</span>

            <a href="#" className="hover:underline">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
