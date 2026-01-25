'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { TrustedByLogos } from '@/components/landing/TrustedByLogos';
import { StartWithUs } from '@/components/landing/StartWithUs';
import { IntegrationGrid } from '@/components/landing/IntegrationGrid';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { WelcomeModal } from '@/components/landing/WelcomeModal';

export default function LandingPage() {
    return (
        <main className="bg-bg-0 text-text-1 selection:bg-p-500/30">
            <HeroSection />
            <TrustedByLogos />
            <StartWithUs />
            <IntegrationGrid />
            <FinalCTA />
            <WelcomeModal />
        </main>
    );
}
