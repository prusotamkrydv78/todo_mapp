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
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 to-transparent dark:from-slate-900/60" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-700/20" />
            <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27 viewBox=%270 0 120 120%27%3E%3Cdefs%3E%3ClinearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27%3E%3Cstop stop-color=%27%23fff%27 stop-opacity=%270.6%27/%3E%3Cstop offset=%271%27 stop-color=%27%23000%27 stop-opacity=%270.6%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%27120%27 height=%27120%27 fill=%27url(%23g)%27 opacity=%270.02%27/%3E%3C/svg%3E")'}} />
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
