# E-Safe frontend

Mobile-first React prototype for E-Safe, a cautious e-waste triage workflow. It contains no backend, database, ML model, real authentication security, or production recycler directory.

## Stack

- React 19, Vite 8, React Router 8
- Motion for restrained transitions
- Lucide icons and custom CSS design system
- Mock service layer with a central future HTTP client

## Install and run

```cmd
cd /d Z:\EDI\E-safe\frontend
npm install
npm run dev
```

Useful commands:

```cmd
npm run lint
npm run build
npm run preview
```

## Mock mode and environment

The frontend runs mock mode by default.

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:8000
```

Set `VITE_USE_MOCK_API=false` only when the FastAPI service implements the contracts in [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md). HTTP behaviour lives in `src/services/apiClient.js`; pages do not call `fetch()` directly.

Development-only mock admin login:

```text
Email: admin@e-safe.dev
Password: any non-empty value accepted by the mock form
```

This is UX-only. Backend role authorization is mandatory in production.

## Folder overview

```text
src/
  components/  Shared UI, route guards and dialogs
  config/      Vite environment and central messages
  contexts/    Auth, language and current scan state
  hooks/       Context and speech helpers
  layouts/     Public, worker and admin shells
  mocks/       Temporary in-memory fixture data
  pages/       Route screens
  services/    Mock implementations and future API boundary
  styles/      Design tokens and responsive CSS
```

## Important integration reference

See [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) for routes, payloads, response shapes, privacy requirements, mock behaviour, and the exact FastAPI integration checklist.
