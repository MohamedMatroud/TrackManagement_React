# Trackline - Track Management Frontend

React single-page application for managing a music catalog from draft through DSP distribution. It implements the focused frontend scope from the supplied full-stack assignment and connects to the companion .NET 8 Track Management API.

## Included workflows

- JWT login with expiry-aware local session restoration.
- Paginated track catalog with search, artist, genre, and status filters stored in the URL.
- Responsive desktop table and mobile track cards.
- Track creation with backend-aligned ISRC and release validation.
- Track detail, localized metadata, and DSP distribution status tags.
- Guided `Draft -> Submitted -> Distributed` status progression.
- Multi-DSP assignment after a track reaches Distributed.
- English and Arabic UI, API messages, localized lookup names, and full RTL/LTR switching.
- Persisted light and dark themes.

Artist administration, DSP administration, distribution administration, and track deletion are intentionally out of scope.

## Technology

- React, TypeScript, and Vite
- Ant Design and Tailwind CSS
- Axios with inherited per-domain API clients
- React Router
- i18next/react-i18next with JSON dictionaries
- Vitest, Testing Library, and MSW

No TanStack Query or other server-state library is used. Cancellable React hooks own loading, error, refresh, and mutation state.

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- The companion API running at `https://localhost:7049`
- The API database initialized and seeded according to its README

## Local setup

1. Start the .NET API with its HTTPS profile and confirm Swagger opens at `https://localhost:7049/swagger/index.html`.
2. From this frontend directory, install packages:

   ```powershell
   npm install
   ```

3. Optionally copy `.env.example` to `.env.local` if the API target differs from the default.
4. Start the frontend:

   ```powershell
   npm run dev
   ```

5. Open `http://127.0.0.1:5173`.

If the HTTP Swagger URL opens but `/api` requests redirect to an unavailable HTTPS port, install/trust the ASP.NET development certificate and restart the API HTTPS profile:

```powershell
dotnet dev-certs https --trust
```

Vite skips certificate verification when proxying, but Kestrel must still have a valid certificate in order to listen on `https://localhost:7049`.

The API's checked-in local development credentials are:

```text
Username: admin
Password: admin123
```

Do not use those defaults outside local evaluation. Override the API's JWT settings as documented in the API repository.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Browser-facing Axios base path. |
| `API_PROXY_TARGET` | `https://localhost:7049` | Server-only Vite development proxy target. |

The development proxy accepts the local ASP.NET development certificate and avoids cross-origin browser requests. A production deployment must provide same-origin `/api` routing or configure an appropriate API CORS policy.

## Scripts

```powershell
npm run dev          # Local Vite server
npm run build        # Type-check and production build
npm run preview      # Preview the production build
npm run lint         # Oxc lint checks
npm run test:run     # Run the test suite once
npm run test         # Vitest watch mode
```

## Architecture

```text
src/
  app/                 Providers, router shell, theme, and i18n initialization
  core/api/            Shared Axios instance, HttpClient, envelopes, and errors
  features/
    auth/              Token client, session store, guard state, and login
    tracks/            Catalog/detail pages, create flow, types, and TrackClient
    artists/           Artist types and ArtistClient
    dsps/              DSP types and DspClient
    distributions/     Global assignment count and DistributionClient
    lookups/           Status lookup types and LookupClient
  locales/             en.json and ar.json UI resources
  shared/              Reusable components, routing, hooks, and formatters
  test/                MSW server and browser-test setup
```

`AuthClient`, `TrackClient`, `ArtistClient`, `DspClient`, and `LookupClient` each inherit `HttpClient`. The base client attaches the current JWT and `Accept-Language`, unwraps the API's `ApiResponse<T>` envelope, and emits normalized errors. A 401 from a protected endpoint clears the session; the login endpoint is excluded so incorrect credentials can be displayed normally.

The token store intentionally contains only `accessToken` and `expiresAtUtc`. See [DECISIONS.md](./DECISIONS.md) for the security tradeoff and AI review notes.

## Verification

The automated suite covers:

- Protected routing and login redirection.
- Catalog loading with mocked API responses.
- English/Arabic switching and document direction.
- Persisted theme selection.
- JWT and locale request headers.
- API envelope errors and session expiry.
- Localized names and duration formatting.

Run all quality gates with:

```powershell
npm run lint
npm run test:run
npm run build
```
