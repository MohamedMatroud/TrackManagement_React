import { createContext } from 'react'
import type { AuthSession, LoginRequest } from '../types'

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
