import type { AuthSession } from '../types'

const SESSION_KEY = 'trackline.session'
export const AUTH_SESSION_CHANGED = 'trackline:session-changed'

function emitSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED))
}

export function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as AuthSession
    const expiresAt = Date.parse(session.expiresAtUtc)
    if (!session.accessToken || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  emitSessionChanged()
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  emitSessionChanged()
}
