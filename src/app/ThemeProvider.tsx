import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { preferenceKeys } from '../shared/lib/preferences'
import { ThemeContext, type ThemeMode } from './themeContext'

function resolveInitialTheme(): ThemeMode {
  const saved = localStorage.getItem(preferenceKeys.theme)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(resolveInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#080b18' : '#f3f5fb')
    localStorage.setItem(preferenceKeys.theme, mode)
  }, [mode])

  const value = useMemo(
    () => ({ mode, toggleTheme: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')) }),
    [mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
