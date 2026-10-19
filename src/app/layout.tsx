import type { Metadata } from 'next';
import { plexSans, plexSerif, plexMono } from '@/lib/fonts';
import '@/app/globals.css';
import HudTopBar from '@/components/layout/HudTopBar';
import HudBottomBar from '@/components/layout/HudBottomBar';
import CanvasDeckContainer from '@/components/scene/CanvasDeckContainer';
import ModularDataDeck from '@/components/layout/ModularDataDeck';

export const metadata: Metadata = {
  metadataBase: new URL('https://ambul.dev'),
  title: {
    default: 'Ambul Jaiswal — Machine Learning & Security Systems',
    template: '%s · Ambul Jaiswal',
  },
  description:
    'Security-focused machine learning systems, verifiable architectures, and privacy-preserving inference.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Ambul Jaiswal — Machine Learning & Security Systems',
    description:
      'Security-focused machine learning systems, verifiable architectures, and privacy-preserving inference.',
    url: 'https://ambul.dev',
    siteName: 'Ambul Jaiswal',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Ambul Jaiswal — Security ML Systems',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}
    >
      <body className="bg-oled text-ink-primary font-sans antialiased min-h-screen relative flex flex-col">
        {/* Accessible Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-cyan focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:shadow-hud-cyan focus:outline-none rounded"
        >
          Skip to main content
        </a>

        {/* HUD Scanline Effect */}
        <div className="fixed inset-0 hud-scanlines pointer-events-none z-40 opacity-70" />

        {/* HUD Top Bar Navigation */}
        <HudTopBar />

        {/* Split Command Deck Body */}
        <div className="flex-1 flex flex-row w-full relative">
          <CanvasDeckContainer />
          <ModularDataDeck>{children}</ModularDataDeck>
        </div>

        {/* HUD Bottom Telemetry Bar */}
        <HudBottomBar />
      </body>
    </html>
  );
}
