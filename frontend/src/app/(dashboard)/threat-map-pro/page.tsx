import dynamic from 'next/dynamic';
const ThreatMapPro = dynamic(() => import('@/components/ThreatMapPro'), { ssr: false });

export default function ThreatMapProPage() {
    return <ThreatMapPro />;
}
