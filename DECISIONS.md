# Frontend Engineering Decisions and AI Usage

## What AI generated and what I reviewed

AI assistance was used to scaffold the React and TypeScript application, propose the feature-module boundaries, build the Axios clients, generate the first versions of the Ant Design screens, prepare localization resources, and draft automated tests and documentation.

I reviewed the assignment and the live Swagger contract, narrowed the UI to the workflows that are valuable for the evaluation, verified every request and response type against the running API, and adjusted the interaction model, validation, responsive behavior, theme tokens, English/Arabic copy, and test scenarios. The final UI deliberately avoids building CRUD screens for every backend entity.

## Security issues found and handled

- The API returns a bearer token rather than a secure cookie, so the browser client must store it somewhere accessible to JavaScript. The chosen local-storage session improves evaluator convenience but carries an XSS risk. The client stores only the token and its expiry, never credentials or profile data, never logs the token, clears it when expired or rejected with a 401, and renders user/API strings through React rather than injecting HTML.
- Protected navigation alone is not authorization. Every mutation still relies on the API's JWT enforcement; UI guards only improve the user experience.
- API base URLs are configured through environment variables. No production URL or secret is hard-coded into the application bundle.
- Axios applies a finite timeout and normalizes API errors without exposing request configuration or token values to the UI.
- Form validation mirrors the backend but is not treated as a security boundary. The API remains responsible for authoritative validation, uniqueness, and state-transition rules.

## One AI-generated assumption that required correction

The first workflow assumption was that a track would be assigned to DSPs and then marked Distributed. Inspection of the backend service showed the opposite rule: DSP assignment is rejected until the track already has `DISTRIBUTED` status. The detail screen was corrected to guide users through `Draft -> Submitted -> Distributed` first and only then reveal the DSP assignment action.

## Other decisions

- Each API domain has its own client class inheriting the shared `HttpClient`; the track client owns the required `/api/tracks/{id}/distribute` route.
- Server state uses small cancellable React hooks rather than a server-state library, keeping the requested stack focused and making refresh behavior explicit.
- English and Arabic resources live in separate JSON files. The language selection drives Ant Design locale, LTR/RTL direction, API `Accept-Language`, lookup names, Day.js, and `Intl` formatting together.
- The Vite development proxy avoids requiring a backend CORS change for this separate frontend repository.
