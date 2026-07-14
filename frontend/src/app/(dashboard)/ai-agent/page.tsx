import OffensiveAgent from '@/components/OffensiveAgent';

export const metadata = {
    title: 'AI Offensive Agent — Bouclier SOC',
    description: 'Autonomous AI-driven offensive analysis agent. Enter a target and the agent runs WHOIS, DNS, port scan, web fingerprint, vuln scan, and exploit matching — generating a full intelligence report.',
};

export default function OffensiveAgentPage() {
    return <OffensiveAgent />;
}
