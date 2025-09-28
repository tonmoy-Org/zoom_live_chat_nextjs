'use client';

import Image from "next/image";
import Zoom_Platform from '@/public/Zoom-Platform.webp';
import { Button } from "../ui/button";

export default function AiWorkPlatform() {
    return (
        <section className="bg-[#000C3B] text-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-center">
                {/* Left - Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image
                        src={Zoom_Platform}
                        alt="Zoom AI Workplace"
                        width={500}
                        height={300}
                        priority
                        className="w-full max-w-[400px] sm:max-w-[500px] h-auto object-cover rounded-lg"
                    />
                </div>

                {/* Right - Text Content */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
                        The AI-first work platform for human connection
                    </h2>
                    <p className="text-sm sm:text-base text-gray-300 mt-4 sm:mt-6 leading-relaxed">
                        Work happy with AI Companion, reimagine teamwork, enhance customer
                        relationships, and enable seamless experiences with a choice of
                        third-party apps and integrations for best-in-class collaboration.
                    </p>
                    <Button
                        asChild
                        className="mt-6 sm:mt-8 px-6 py-2.5 bg-[#0b5cff] hover:bg-blue-700 rounded-full font-medium text-white transition-colors duration-200"
                    >
                        <a href="#">Discover the possibilities</a>
                    </Button>
                    <p className="text-xs sm:text-sm text-gray-400 mt-4 max-w-md">
                        *AI Companion is included at no additional cost with the paid
                        services in your Zoom user account and may not be available for all
                        regions and industry verticals. Some features not currently
                        available across all regions or plans and are subject to change.
                    </p>
                </div>
            </div>
        </section>
    );
}