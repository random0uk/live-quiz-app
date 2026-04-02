import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Footer from '@/components/Footer'
import OrganizerLogo from '@/components/OrganizerLogo'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Awanies — Live Multiplayer Quizzes',
  description: 'Host and play live multiplayer quiz games',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Awanies',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'Awanies — Live Multiplayer Quizzes',
    description: 'Host and play live multiplayer quiz games',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.jpg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Awanies" />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <ServiceWorkerRegistration />
        <OrganizerLogo />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
