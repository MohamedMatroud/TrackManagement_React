export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  expiresAtUtc: string
}

export type AuthSession = TokenResponse
