import { describe, expect, it } from 'vitest'
import { readSession, saveSession } from './sessionStore'

describe('sessionStore', () => {
  it('restores a valid token session', () => {
    const session = { accessToken: 'token', expiresAtUtc: new Date(Date.now() + 60_000).toISOString() }
    saveSession(session)
    expect(readSession()).toEqual(session)
  })

  it('rejects and removes an expired session', () => {
    localStorage.setItem(
      'trackline.session',
      JSON.stringify({ accessToken: 'expired', expiresAtUtc: new Date(Date.now() - 1_000).toISOString() }),
    )
    expect(readSession()).toBeNull()
    expect(localStorage.getItem('trackline.session')).toBeNull()
  })
})
