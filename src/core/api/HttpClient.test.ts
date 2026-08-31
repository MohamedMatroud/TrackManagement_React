import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { saveSession } from '../../features/auth/state/sessionStore'
import { persistLanguage } from '../../shared/lib/preferences'
import { server } from '../../test/server'
import { HttpClient } from './HttpClient'

class ProbeClient extends HttpClient {
  probe() {
    return this.get<{ ok: boolean }>('/probe')
  }

  failedEnvelope() {
    return this.get<{ ok: boolean }>('/failed-envelope')
  }
}

describe('HttpClient', () => {
  it('attaches the JWT and selected locale and unwraps data', async () => {
    saveSession({ accessToken: 'test-token', expiresAtUtc: new Date(Date.now() + 60_000).toISOString() })
    persistLanguage('ar')
    let authorization = ''
    let language = ''
    server.use(
      http.get('*/api/probe', ({ request }) => {
        authorization = request.headers.get('authorization') ?? ''
        language = request.headers.get('accept-language') ?? ''
        return HttpResponse.json({ success: true, error: null, message: 'ok', data: { ok: true }, statusCode: 200 })
      }),
    )

    await expect(new ProbeClient().probe()).resolves.toEqual({ ok: true })
    expect(authorization).toBe('Bearer test-token')
    expect(language).toBe('ar-EG')
  })

  it('turns a failed API envelope into a typed error', async () => {
    server.use(
      http.get('*/api/failed-envelope', () =>
        HttpResponse.json({
          success: false,
          error: { code: 409, message: 'Conflict' },
          message: null,
          data: null,
          statusCode: 409,
        }),
      ),
    )

    await expect(new ProbeClient().failedEnvelope()).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Conflict',
      statusCode: 409,
    })
  })
})
