import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tivoads.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'TivoAds — The Premium Ad Discovery & Research Library',
    template: '%s | TivoAds',
  },
  description:
    'TivoAds is the premier searchable archive of TV and video advertisements. Search thousands of ads by brand, category, campaign, slogan, and keyword. Discover inspiring ads for research, strategy, and creative inspiration.',
  keywords: [
    'ad archive', 'advertising library', 'TV ads', 'video ads', 'commercial database',
    'ad research', 'brand advertising', 'marketing inspiration', 'ad discovery',
    'creative advertising', 'Super Bowl ads', 'ad campaigns', 'TivoAds',
  ],
  authors: [{ name: 'TivoAds' }],
  creator: 'TivoAds',
  publisher: 'TivoAds',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'TivoAds',
    title: 'TivoAds — The Premium Ad Discovery & Research Library',
    description:
      'Search thousands of TV and video ads by brand, category, campaign, and keyword. The premier ad archive for marketers, agencies, and creative professionals.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'TivoAds - Ad Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TivoAds — Ad Discovery & Research Library',
    description: 'Search thousands of TV and video ads by brand, category, campaign, and keyword.',
    images: ['/images/og-default.jpg'],
    creator: '@tivoads',
  },
  alternates: {
    canonical: APP_URL,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <Toaster>
              {children} 
            </Toaster>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}