import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Next Todo',
  description: 'A beautiful Next.js + Tailwind CSS Todo App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[rgb(var(--bg))] transition-colors">
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
          <div className="container pt-4 flex justify-end">
            <ThemeToggle />
          </div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
