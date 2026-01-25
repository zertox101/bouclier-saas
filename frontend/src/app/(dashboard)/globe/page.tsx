'use client';

import dynamic from 'next/dynamic';
const NetworkGPSMap = dynamic(() => import('@/components/NetworkGPSMap'), { ssr: false });

// 2D Network GPS Threat Visualization Page

export default function Globe3DPage() {
    return (
        <div className="h-[calc(100vh-6rem)] w-full">
            <NetworkGPSMap />
        </div>
    );
}
