import type { Metadata } from 'next';
import { fontSans, fontMono } from '@/lib/fonts';
import './globals.css';
import { cn } from '@/lib/utils';

import { Providers } from './providers';
import { KillSwitchOverlay } from '@/components/shared/KillSwitchOverlay';

export const metadata: Metadata = {
  title: 'BOUCLIER | Advanced Cyber Defense Platform',
  description: 'Next-gen SOC platform for enterprise security operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-bg-0 font-sans antialiased text-text-1 selection:bg-sky-500/30 selection:text-white",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers>
          <KillSwitchOverlay />
          {children}
        </Providers>
      </body>
    </html>
  );
}
