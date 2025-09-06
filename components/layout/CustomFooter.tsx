'use client';

import {
    FaLinkedin,
    FaXTwitter,
    FaYoutube,
    FaFacebook,
    FaInstagram,
} from "react-icons/fa6";
import { FaBloggerB } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomFooter() {
    return (
        <footer className="bg-[#000C3B] text-white py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
                {/* About */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">About</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Blog</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Customers</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Our Team</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Partners</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Investors</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Press</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Sustainability & ESG</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Cares</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Media Kit</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">How to Videos</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Developer Platform</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Ventures</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Merchandise Store</a></li>
                    </ul>
                </div>

                {/* Download */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">Download</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Workplace App</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Rooms Client</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Browser Extension</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Outlook Plug-in</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Plugin for HCL Notes</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Plugin Admin Tool for HCL</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Notes</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Android App</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Virtual Backgrounds</a></li>
                    </ul>
                </div>

                {/* Sales */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">Sales</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">1.888.799.9666</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Sales</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Plans & Pricing</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Request a Demo</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Webinars and Events</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Experience Center</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">Support</h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Test Zoom</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Account</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Support Center</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Learning Center</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Zoom Community</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Accessibility</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Developer Support</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy, Security, Legal Policies</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Transparency Statement</a></li>
                    </ul>
                </div>

                {/* Language & Currency & Social */}
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">Language</h3>
                    <Select defaultValue="English">
                        <SelectTrigger className="bg-transparent border-gray-500 rounded-full text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 w-full mb-4">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#000C3B] text-gray-300 border-gray-500">
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Español">Español</SelectItem>
                            <SelectItem value="Deutsch">Deutsch</SelectItem>
                            <SelectItem value="Français">Français</SelectItem>
                            <SelectItem value="日本語">日本語</SelectItem>
                        </SelectContent>
                    </Select>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-3">Currency</h3>
                    <Select defaultValue="US Dollars $">
                        <SelectTrigger className="bg-transparent border-gray-500 rounded-full text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 w-full mb-4">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#000C3B] text-gray-300 border-gray-500">
                            <SelectItem value="US Dollars $">US Dollars $</SelectItem>
                            <SelectItem value="Euro €">Euro €</SelectItem>
                            <SelectItem value="British Pound £">British Pound £</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Social Icons */}
                    <div className="flex space-x-1">
                        {[FaBloggerB, FaLinkedin, FaXTwitter, FaYoutube, FaFacebook, FaInstagram].map((Icon, idx) => (
                            <a
                                key={idx}
                                href="#"
                                className="bg-[#1E1F33] p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                            >
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 hover:text-white" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}