import { HttpClient } from '../../../core/api/HttpClient'
import type { LoginRequest, TokenResponse } from '../types'

export class AuthClient extends HttpClient {
  login(request: LoginRequest) {
    return this.post<TokenResponse, LoginRequest>('/auth/token', request)
  }
}

export const authClient = new AuthClient()
