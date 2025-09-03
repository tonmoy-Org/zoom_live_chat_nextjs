// components/Footer.tsx
import {
    FaLinkedin,
    FaXTwitter,
    FaYoutube,
    FaFacebook,
    FaInstagram,
} from "react-icons/fa6";
import { FaBloggerB } from "react-icons/fa";

export default function CustomFooter() {
    return (
        <footer className="bg-[#010526] text-white py-10 px-6 md:px-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-7xl mx-auto">

                {/* About */}
                <div>
                    <h3 className="font-bold mb-4">About</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#">Zoom Blog</a></li>
                        <li><a href="#">Customers</a></li>
                        <li><a href="#">Our Team</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Integrations</a></li>
                        <li><a href="#">Partners</a></li>
                        <li><a href="#">Investors</a></li>
                        <li><a href="#">Press</a></li>
                        <li><a href="#">Sustainability & ESG</a></li>
                        <li><a href="#">Zoom Cares</a></li>
                        <li><a href="#">Media Kit</a></li>
                        <li><a href="#">How to Videos</a></li>
                        <li><a href="#">Developer Platform</a></li>
                        <li><a href="#">Zoom Ventures</a></li>
                        <li><a href="#">Zoom Merchandise Store</a></li>
                    </ul>
                </div>

                {/* Download */}
                <div>
                    <h3 className="font-bold mb-4">Download</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#">Zoom Workplace App</a></li>
                        <li><a href="#">Zoom Rooms Client</a></li>
                        <li><a href="#">Browser Extension</a></li>
                        <li><a href="#">Outlook Plug-in</a></li>
                        <li><a href="#">Zoom Plugin for HCL Notes</a></li>
                        <li><a href="#">Zoom Plugin Admin Tool for HCL</a></li>
                        <li><a href="#">Notes</a></li>
                        <li><a href="#">Android App</a></li>
                        <li><a href="#">Zoom Virtual Backgrounds</a></li>
                    </ul>
                </div>

                {/* Sales */}
                <div>
                    <h3 className="font-bold mb-4">Sales</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#">1.888.799.9666</a></li>
                        <li><a href="#">Contact Sales</a></li>
                        <li><a href="#">Plans & Pricing</a></li>
                        <li><a href="#">Request a Demo</a></li>
                        <li><a href="#">Webinars and Events</a></li>
                        <li><a href="#">Zoom Experience Center</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="font-bold mb-4">Support</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><a href="#">Test Zoom</a></li>
                        <li><a href="#">Account</a></li>
                        <li><a href="#">Support Center</a></li>
                        <li><a href="#">Learning Center</a></li>
                        <li><a href="#">Zoom Community</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Accessibility</a></li>
                        <li><a href="#">Developer Support</a></li>
                        <li><a href="#">Privacy, Security, Legal Policies</a></li>
                        <li><a href="#">Transparency Statement</a></li>
                    </ul>
                </div>

                {/* Language & Currency & Social */}
                <div>
                    <h3 className="font-bold mb-4">Language</h3>
                    <select className="bg-transparent border border-gray-500 rounded px-2 py-1 text-sm w-full mb-6">
                        <option>English</option>
                        <option>Español</option>
                        <option>Deutsch</option>
                        <option>Français</option>
                        <option>日本語</option>
                    </select>

                    <h3 className="font-bold mb-4">Currency</h3>
                    <select className="bg-transparent border border-gray-500 rounded px-2 py-1 text-sm w-full mb-6">
                        <option>US Dollars $</option>
                        <option>Euro €</option>
                        <option>British Pound £</option>
                    </select>

                    {/* Social Icons */}
                    <div className="flex space-x-3">
                        {[FaBloggerB, FaLinkedin, FaXTwitter, FaYoutube, FaFacebook, FaInstagram].map((Icon, idx) => (
                            <a key={idx} href="#" className="bg-[#1E1F33] p-2 rounded-full hover:bg-gray-600 transition">
                                <Icon />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
