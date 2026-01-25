'use client';

import Image from 'next/image';

const LOGOS = [
    'SIEMENS', 'AIRBUS', 'PWC', 'ADEO', 'THALES', 'SAFRAN', 'CAPGEMINI', 'ATOS', 'ORACLE', 'DATADOG'
];

export function TrustedByLogos() {
    return (
        <section className="py-24 bg-bg-0 overflow-hidden relative border-y border-white/5">
            <div className="container mx-auto px-4 mb-12 text-center">
                <span className="text-[10px] font-black text-text-3 uppercase tracking-[0.5em] opacity-50">
                    Trusted by enterprise security units
                </span>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="flex animate-marquee whitespace-nowrap gap-16 items-center px-8">
                    {[...LOGOS, ...LOGOS].map((logo, i) => (
                        <div
                            key={i}
                            className="text-2xl md:text-5xl font-black text-white/10 hover:text-p-400 transition-all duration-300 cursor-default tracking-tighter"
                        >
                            {logo}
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap gap-16 items-center px-8">
                    {[...LOGOS, ...LOGOS].map((logo, i) => (
                        <div
                            key={i}
                            className="text-2xl md:text-5xl font-black text-white/10 hover:text-p-400 transition-all duration-300 cursor-default tracking-tighter"
                        >
                            {logo}
                        </div>
                    ))}
                </div>

                {/* Side Fades */}
                <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-bg-0 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-bg-0 to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
