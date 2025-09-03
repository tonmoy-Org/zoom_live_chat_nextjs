// components/AiWorkPlatform.tsx
import Image from "next/image";
import Zoom_Platform from '@/public/Zoom-Platform.webp';

export default function AiWorkPlatform() {
    return (
        <section className="bg-[#000C3B] text-white py-16 px-6 md:px-16">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

                {/* Left - Image */}
                <div className="flex justify-center">
                    <Image
                        src={Zoom_Platform}
                        alt="Zoom AI Workplace"
                        width={700}
                        height={400}
                        priority
                    />
                </div>

                {/* Right - Text Content */}
                <div>
                    <h2 className="text-4xl font-bold leading-snug">
                        The AI-first work platform for human connection
                    </h2>

                    <p className="text-lg text-gray-300 mt-6 leading-relaxed">
                        Work happy with AI Companion, reimagine teamwork, enhance customer
                        relationships, and enable seamless experiences with a choice of
                        third-party apps and integrations for best-in-class collaboration.
                    </p>

                    <button className="mt-8 px-6 py-3 bg-[#2E68FF] rounded-full font-medium text-white hover:bg-[#1c4fd4] transition">
                        <a href="#"> Discover the possibilities</a>
                    </button>

                    <p className="text-sm text-gray-400 mt-4">
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
