import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authClient } from '../api/AuthClient'
import type { AuthSession, LoginRequest } from '../types'
import { AuthContext } from './authContext'
import { AUTH_SESSION_CHANGED, clearSession, readSession, saveSession } from './sessionStore'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession)

  useEffect(() => {
    const syncSession = () => setSession(readSession())
    window.addEventListener(AUTH_SESSION_CHANGED, syncSession)
    window.addEventListener('storage', syncSession)
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED, syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    const remaining = Date.parse(session.expiresAtUtc) - Date.now()
    if (remaining <= 0) {
      clearSession()
      return
    }
    const timer = window.setTimeout(clearSession, Math.min(remaining, 2_147_483_647))
    return () => window.clearTimeout(timer)
  }, [session])

  const login = useCallback(async (request: LoginRequest) => {
    const token = await authClient.login(request)
    saveSession(token)
    setSession(token)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session), login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
