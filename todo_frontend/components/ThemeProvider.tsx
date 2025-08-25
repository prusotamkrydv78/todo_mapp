"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'next-todo-theme'

type Theme = 'light' | 'dark'

type Ctx = {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

const ThemeCtx = createContext<Ctx | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Hydrate from localStorage or system preference
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null
      if (saved === 'light' || saved === 'dark') setTheme(saved)
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(THEME_KEY, theme)
    const root = document.documentElement
    root.classList.remove(theme === 'dark' ? 'light' : 'dark')
    root.classList.add(theme)
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme, hydrated])

  const value = useMemo<Ctx>(() => ({
    theme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    set: (t) => setTheme(t),
  }), [theme])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
