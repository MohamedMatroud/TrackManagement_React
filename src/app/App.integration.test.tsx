import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import i18n from './i18n'
import { AppProviders } from './AppProviders'
import { server } from '../test/server'

function apiResponse<T>(data: T) {
  return { success: true, error: null, message: 'ok', data, statusCode: 200 }
}

function authenticate() {
  localStorage.setItem(
    'trackline.session',
    JSON.stringify({ accessToken: 'test-token', expiresAtUtc: new Date(Date.now() + 60_000).toISOString() }),
  )
}

function mockCatalog() {
  server.use(
    http.get('*/api/tracks', () =>
      HttpResponse.json(
        apiResponse({
          items: [
            {
              id: 5,
              title: 'Desert Lights',
              isrc: 'EGAAA2600001',
              artistId: 2,
              artistName: 'Lina Noor',
              trackStatusId: 'draft-id',
              trackStatusCode: 'DRAFT',
              trackStatusNameEn: 'Draft',
              trackStatusNameAr: 'مسودة',
              album: null,
              genre: 'Electronic',
              durationSeconds: 180,
              releaseDate: '2026-07-31T00:00:00Z',
              isActive: true,
              createdAt: '2026-08-30T00:00:00Z',
              updatedAt: null,
              dspAssignmentsCount: 1,
              distributions: [],
            },
          ],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        }),
      ),
    ),
    http.get('*/api/artists', () =>
      HttpResponse.json(apiResponse([{ id: 2, name: 'Lina Noor', email: 'lina@example.com', country: 'Egypt' }])),
    ),
    http.get('*/api/track-distributions/count', () =>
      HttpResponse.json(apiResponse({ count: 13 })),
    ),
  )
}

describe('application flows', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    localStorage.setItem('trackline.language', 'en')
    localStorage.setItem('trackline.theme', 'light')
  })

  it('protects the catalog and preserves the login experience', async () => {
    window.history.pushState({}, '', '/tracks?status=DRAFT')
    render(<AppProviders><App /></AppProviders>)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })

  it('loads the catalog and switches language and direction', async () => {
    authenticate()
    mockCatalog()
    window.history.pushState({}, '', '/tracks')
    const user = userEvent.setup()
    render(<AppProviders><App /></AppProviders>)

    expect(await screen.findByRole('heading', { name: 'Track catalog' })).toBeInTheDocument()
    expect(screen.getAllByText('Desert Lights').length).toBeGreaterThan(0)
    const assignmentsCard = (await screen.findByText('DSP assignments')).closest('.ant-card')
    await waitFor(() => expect(assignmentsCard).toHaveTextContent('13'))

    await user.click(screen.getByRole('button', { name: /global ع/ }))
    expect(await screen.findByRole('heading', { name: 'كتالوج المقاطع' })).toBeInTheDocument()
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'))
  })

  it('persists an explicit dark theme', async () => {
    authenticate()
    mockCatalog()
    window.history.pushState({}, '', '/tracks')
    const user = userEvent.setup()
    render(<AppProviders><App /></AppProviders>)
    await screen.findByRole('heading', { name: 'Track catalog' })

    await user.click(screen.getByRole('button', { name: 'Use dark theme' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('trackline.theme')).toBe('dark')
  })
})
