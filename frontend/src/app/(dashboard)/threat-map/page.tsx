'use client';

import dynamic from 'next/dynamic';
const NetworkGPSMap = dynamic(() => import('@/components/NetworkGPSMap'), { ssr: false });

export default function ThreatMapPage() {
    return (
        <div className="h-[calc(100vh-6rem)] w-full">
            <NetworkGPSMap />
        </div>
    );
}
