import './globals.css'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import dynamic from 'next/dynamic'

// Dynamically import ChatWidget with no SSR to avoid hydration issues
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A beautiful and productive todo application',
  applicationName: 'Todo App',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todo App',
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

// Add to homescreen for iOS
const appleMobileWebAppCapable = 'apple-mobile-web-app-capable'
const appleMobileWebAppStatusBarStyle = 'apple-mobile-web-app-status-bar-style'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className="h-full"
    >
      <head>
        <meta name={appleMobileWebAppCapable} content="yes" />
        <meta name={appleMobileWebAppStatusBarStyle} content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Todo App" />
      </head>
      <body className="min-h-screen bg-[rgb(var(--bg))] transition-colors touch-manipulation">
        <ThemeProvider>
          {/* Background */}
          <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
            <div className="spotlight" />
            <div className="aurora">
              <span className="a1" />
              <span className="a2" />
              <span className="a3" />
            </div>
            <div className="grain" />
          </div>

          {/* Top bar */}
          <div className="container mx-auto px-4 pt-4 pb-2 flex justify-end max-w-4xl">
            <ThemeToggle />
          </div>

          <main className="container mx-auto px-4 pb-20 max-w-4xl">
            {children}
          </main>
          
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
