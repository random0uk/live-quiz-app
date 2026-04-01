import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Footer from '@/components/Footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Awaneies — Live Multiplayer Quizzes',
  description: 'Host and play live multiplayer quiz games',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
