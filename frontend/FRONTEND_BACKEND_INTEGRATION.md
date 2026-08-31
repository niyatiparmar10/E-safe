# E-Safe frontend ↔ FastAPI integration contract

This document is the implementation contract for connecting the existing React frontend to FastAPI and PostgreSQL. It describes the interfaces already used by the frontend; it does **not** describe a backend that already exists.

## 1. Architecture overview

The browser UI is split into pages, contexts, and service modules.

- Pages render UI and call service functions only. No page uses `fetch()`.
- `src/services/apiClient.js` owns the future base URL, JSON/form-data handling, bearer header, and standard `ApiError` shape.
- Service modules have two paths: an in-memory mock path when `VITE_USE_MOCK_API` is not `false`, and a future HTTP path when it is `false`.
- `AuthContext` owns the current user; `LanguageContext` owns selected language; `ScanFlowContext` holds only the active photo/file, consent, answers, and result during one scan.
- Browser object URLs are not stored in localStorage. A saved mock history record gets its own temporary object URL and `scanService.deleteScan()` revokes it.

## 2. Important folders

```text
src/components/   Reusable cards, dialogs, route guards, scan controls
src/config/       env.js and messages.js
src/contexts/     AuthContext, LanguageContext, ScanFlowContext
src/hooks/        useAuth, useLanguage, useScanFlow, useSpeechSynthesis
src/layouts/      PublicLayout, AppLayout, AdminLayout
src/mocks/        Mock workers, scans, recyclers, and admin metadata
src/pages/        Public, worker, recycler, history, scan and admin screens
src/services/     apiClient and service interfaces for the future backend
src/styles/       Global design tokens and responsive CSS
```

## 3. Application routes

| Route | Screen | Authentication | Admin role |
| --- | --- | --- | --- |
| `/` | Landing page | No | No |
| `/login`, `/sign-in` | Login | No | No |
| `/sign-up` | Signup | No | No |
| `/dashboard`, `/dashboard/home` | Worker dashboard | Yes | No |
| `/dashboard/scan` | Capture/upload | Yes | No |
| `/scan/context` | Context questions | Yes | No |
| `/scan/result` | Result | Yes | No |
| `/dashboard/history` | Saved scan history | Yes | No |
| `/dashboard/recyclers`, `/recyclers` | Recycler list | Yes | No |
| `/admin` | Admin dashboard | Yes | Yes |
| `/admin/data` | Admin data management | Yes | Yes |

`ProtectedRoute` is frontend navigation protection. `AdminRoute` additionally checks `user.role === "admin"`. Neither is security: FastAPI must authenticate every protected endpoint and authorise every admin endpoint.

## 4. User and authentication contract

### User response shape

```json
{
  "id": "worker-001",
  "name": "Rahim",
  "email": "rahim@example.com",
  "role": "worker",
  "location": "Pune",
  "preferredLanguage": "en"
}
```

`role` must be `worker` or `admin`.

### `authService.signup()` → `POST /auth/signup`

Request JSON:

```json
{
  "fullName": "Rahim Khan",
  "email": "rahim@example.com",
  "password": "user-entered-password",
  "preferredLanguage": "en"
}
```

Response JSON:

```json
{
  "user": {
    "id": "worker-001",
    "name": "Rahim Khan",
    "email": "rahim@example.com",
    "role": "worker",
    "location": "Pune",
    "preferredLanguage": "en"
  },
  "accessToken": "short-lived-access-token"
}
```

### `authService.login()` → `POST /auth/login`

Request JSON:

```json
{ "email": "rahim@example.com", "password": "user-entered-password" }
```

Response is the same shape as signup. In mock mode, `admin@e-safe.dev` yields `{ "role": "admin" }`; this is not a production account.

### `authService.getCurrentUser()` → `GET /auth/me` (required addition)

The UI needs a session restoration endpoint after refresh. It expects the user object above. Although this endpoint was not in the initial endpoint list, it is required for production route protection. It may use a secure, httpOnly refresh cookie or a valid bearer token.

### Token assumptions

`apiClient` currently retains an access token in memory after login/signup and sends `Authorization: Bearer <token>`. It intentionally does not persist real tokens in localStorage. Backend integration should use short-lived access tokens plus a secure refresh strategy, or httpOnly session cookies. Logout currently clears in-memory access state; add a backend logout/refresh design as appropriate.

## 5. Scan APIs and data structures

### `scanService.createScan()` → `POST /scan/upload`

Use `multipart/form-data`, not JSON:

```text
Content-Type: multipart/form-data
image: <JPEG | PNG | WebP file>
```

Response JSON:

```json
{
  "scanId": "scan_01J...",
  "photoUrl": "https://signed-or-private-reference",
  "status": "draft"
}
```

The frontend's current capture page validates MIME type, file size, browser decode and minimum dimensions before upload. It must not convert a large image to localStorage base64.

### `scanService.submitScanContext()` → `POST /scan/context`

Request JSON:

```json
{
  "scanId": "scan_01J...",
  "answers": {
    "warm": "No",
    "smell": "Not sure",
    "residue": "No",
    "connectedToPower": "No",
    "physicalDamage": "Yes",
    "basicPpe": "Yes",
    "trainedSupervision": "No"
  }
}
```

Allowed answer values are exactly `Yes`, `No`, and `Not sure`; backend must preserve `Not sure` and never coerce it to `No`.

Response JSON:

```json
{ "scanId": "scan_01J...", "accepted": true }
```

### `scanService.analyseScan()` → `POST /scan/analyse`

Request JSON:

```json
{
  "scanId": "scan_01J...",
  "answers": {
    "warm": "No",
    "smell": "Not sure",
    "residue": "No",
    "connectedToPower": "No",
    "physicalDamage": "Yes",
    "basicPpe": "Yes",
    "trainedSupervision": "No"
  },
  "saveToHistory": true
}
```

`saveToHistory` is required in production even though the current service's mock-only save operation runs after analysis. In production, persist the record only when it is `true`.

Response JSON / result contract:

```json
{
  "scanId": "scan_01J...",
  "detectedItem": "Swollen lithium-ion battery",
  "itemConfidence": 0.86,
  "visibleHazards": ["Possible battery swelling", "Damaged outer casing"],
  "hazardConfidences": {
    "Possible battery swelling": 0.91,
    "Damaged outer casing": 0.84
  },
  "riskLevel": "RED",
  "riskConfidence": 0.87,
  "reasonCodes": ["POSSIBLE_BATTERY_SWELLING", "DAMAGED_CASING"],
  "reasonText": "Visible supported signs require escalation.",
  "guidanceText": "Stop manual opening or handling. Isolate the item and route it through trained personnel or an authorised facility.",
  "guidanceSources": ["guide-battery-escalation-v1"],
  "recyclerRecommended": true,
  "timestamp": "2026-08-30T15:16:00.000Z"
}
```

Allowed `riskLevel` values: `GREEN`, `AMBER`, `RED`, `UNCERTAIN`. Backend errors and low confidence must **never** be represented as `GREEN`; return `UNCERTAIN` or the standard error shape.

### History

`scanService.getScanHistory()` → `GET /scan/history` returns:

```json
{
  "scans": [
    {
      "scanId": "scan_01J...",
      "photoUrl": "https://private-image-reference",
      "detectedItem": "Desktop battery backup unit",
      "itemConfidence": 0.81,
      "visibleHazards": ["Visible casing damage"],
      "hazardConfidences": { "Visible casing damage": 0.83 },
      "riskLevel": "AMBER",
      "riskConfidence": 0.78,
      "reasonCodes": ["VISIBLE_CASING_DAMAGE"],
      "reasonText": "Visible damage requires extra precautions.",
      "guidanceText": "Isolate the item and ask for trained supervision.",
      "guidanceSources": ["guide-handling-v1"],
      "recyclerRecommended": true,
      "contextAnswers": { "warm": "No", "smell": "No" },
      "timestamp": "2026-08-30T15:16:00.000Z"
    }
  ]
}
```

Order results newest-first. `scanService.deleteScan(id)` maps to `DELETE /scan/{id}` and expects:

```json
{ "deleted": true, "scanId": "scan_01J..." }
```

The browser shows a destructive confirmation before calling this endpoint. Backend must ensure the scan belongs to the authenticated user and delete/expire the associated private image safely.

### Worker summary

`getWorkerSummary()` is a mock dashboard convenience. In non-mock mode it derives counts from `GET /scan/history`; an optional future `/scan/history/summary` endpoint may replace this without changing pages.

## 6. Recycler APIs

### Recycler record

```json
{
  "id": "pune-ecycle-001",
  "facilityName": "Pune E-Cycle Centre",
  "address": "Bhosari MIDC, Pune, Maharashtra",
  "latitude": 18.6298,
  "longitude": 73.8486,
  "contact": "+91 20 4000 1001",
  "acceptedItemTypes": ["Batteries", "Small electronics"],
  "authorisationReference": "MPCB authorisation: PUN-EW-001",
  "sourceUrl": "https://source.example/record",
  "lastVerifiedDate": "2026-08-21",
  "distanceKm": 4.2,
  "verified": true
}
```

`verified` must be supplied explicitly. Do not infer authorisation/verified status from a non-empty name or URL.

### `recyclerService.getNearbyRecyclers()` → `GET /recyclers/nearby`

Query parameters used by the frontend:

```text
?search=cycle&area=Pune&itemType=Batteries&item=Swollen%20lithium-ion%20battery&sort=distance
```

Response JSON:

```json
{ "recyclers": [/* recycler records */] }
```

Version 1 UI is scoped to Pune/Pimpri-Chinchwad. Do not return a fictitious national directory. Browser geolocation is optional and must be permission-gated; it currently only arranges prepared mock results, it does not perform a business search or routing call.

## 7. Language messages

`languageService.getSupportedLanguages()` maps to `GET /languages/messages`.

Expected response:

```json
{
  "languages": [
    { "code": "en", "label": "English" },
    { "code": "hi", "label": "Hindi" },
    { "code": "mr", "label": "Marathi" }
  ],
  "messages": {
    "en": {
      "risk.red.guidance": "Stop manual opening or handling."
    }
  }
}
```

Current UI uses `src/config/messages.js` as the English fallback; Hindi and Marathi intentionally use that fallback until a server message pack is applied.

## 8. Admin APIs and structures

All routes below require backend admin authorisation, not merely the frontend `AdminRoute`.

### Dashboard

`adminService.getAdminDashboardData()` → `GET /admin/dashboard`

```json
{
  "totalScans": 148,
  "riskCounts": { "GREEN": 71, "AMBER": 39, "RED": 18, "UNCERTAIN": 20 },
  "uncertainOrEscalated": 38,
  "analysisFailures": 4,
  "supportedItemClasses": [{ "label": "Mobile phones", "count": 52 }],
  "recentIssues": [{ "id": "issue-104", "type": "Uncertain result", "detail": "Limited visible context", "timestamp": "2026-08-30T15:16:00.000Z" }]
}
```

### Recycler management

| Service function | HTTP mapping |
| --- | --- |
| `getAdminRecyclerRecords()` | `GET /admin/recyclers` |
| `saveAdminRecyclerRecord(record)` | `POST /admin/recyclers` or `PATCH /admin/recyclers/{id}` |
| `deleteAdminRecyclerRecord(id)` | `DELETE /admin/recyclers/{id}` |

Use the recycler record shape above, omitting `id` on create. List response: `{ "records": [/* records */] }`.

### Approved safety document metadata

```json
{
  "id": "doc-battery-001",
  "title": "Battery handling escalation guide",
  "organisation": "E-Safe programme",
  "sourceUrl": "https://source.example/guide",
  "publicationDate": "2026-07-12",
  "documentType": "Safety guidance",
  "tags": ["Batteries", "Swelling", "RED"],
  "active": true
}
```

| Service function | HTTP mapping |
| --- | --- |
| `getApprovedSafetyDocuments()` | `GET /admin/safety-documents` → `{ "documents": [] }` |
| `saveApprovedSafetyDocument(document)` | `POST /admin/safety-documents` or `PATCH /admin/safety-documents/{id}` |

This is metadata only. Do not add embeddings, RAG, parsing, or document upload behaviour to this screen.

### Standard messages

```json
{
  "id": "risk-red-en-001",
  "language": "en",
  "riskLevel": "RED",
  "text": "Stop manual opening or handling.",
  "verified": true
}
```

| Service function | HTTP mapping |
| --- | --- |
| `getStandardMessages()` | `GET /admin/messages` → `{ "messages": [] }` |
| `saveStandardMessage(message)` | `POST /admin/messages` or `PATCH /admin/messages/{id}` |

## 9. Standard error response

Every JSON endpoint should return this shape for non-2xx outcomes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": {
      "email": "Already registered"
    }
  }
}
```

`apiClient` turns this into `ApiError` with `status`, `code`, `message`, and `details`. Pages already show loading, retry and error states; field-level handling can be added using `details` without moving HTTP logic into pages.

## 10. Environment variables

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=true
```

- `VITE_USE_MOCK_API` defaults to `true` unless exactly `false`.
- `VITE_API_BASE_URL` defaults to `http://localhost:8000`.

## 11. Mock-mode behaviour and placeholders

- Mock auth stores a password-free session object in localStorage. It does not store a real password or token.
- `admin@e-safe.dev` is a development-only admin role shortcut.
- Scan result state selection is development-only and does not analyse an image.
- Scan history, admin records, documents and standard messages are in-memory mock data; they reset after a browser reload. Mock saved photos use temporary object URLs.
- Recycler facilities, authorisation references, dates and source links are representative mock records only. They are not a real registry.
- Speech uses browser `SpeechSynthesis` when available; it is not a recorded or verified audio service.
- Frontend route/role guards are UX only. They are not production security.

## 12. Privacy and deletion requirements

1. Send and persist a scan only when `saveToHistory` is true. The UI must make this consent clear before analysis.
2. Keep original images private; return short-lived signed URLs or authenticated image URLs for history thumbnails/details.
3. Do not log raw photos, context answers, access tokens, or unnecessary personal data.
4. On `DELETE /scan/{id}`, verify ownership, remove/expire image access and return the deletion response above.
5. Preserve the exact guidance, sources, reason codes, answers and result that were shown at assessment time for saved history records.

## 13. Loading and error expectations

The frontend has loading, empty and retry/error states for auth startup, dashboards, history, recycler list, scan analysis and admin lists. Backend should use predictable status codes:

- `400` / `422`: invalid payload or image constraints
- `401`: no valid session/token
- `403`: authenticated but insufficient role (especially admin)
- `404`: missing scan/recycler/admin record
- `409`: conflicting update/version conflict
- `413`: uploaded image too large
- `429`: rate limited
- `500` / `503`: transient server/model dependency failure

For model/upload failures, return an error or an `UNCERTAIN` result; never silently substitute a green result.

## 14. Exact mock-to-FastAPI replacement checklist

1. Set `VITE_API_BASE_URL` to the FastAPI origin and `VITE_USE_MOCK_API=false`.
2. Implement the public auth endpoints and the required `GET /auth/me` session restoration endpoint.
3. Implement multipart `POST /scan/upload`, then persist photo ownership and consent safely.
4. Implement `POST /scan/context` preserving all three answer values.
5. Implement `POST /scan/analyse` returning the exact result contract, including `UNCERTAIN`.
6. Implement newest-first `GET /scan/history` and ownership-checked `DELETE /scan/{id}`.
7. Implement scoped `GET /recyclers/nearby`; do not claim national coverage from the V1 data.
8. Implement `GET /languages/messages` with languages and message packs.
9. Implement all protected `/admin/*` endpoints and enforce an admin claim/server-side role check.
10. Use the standard error shape on every JSON endpoint and test all frontend retry/error paths.
11. Replace only service internals as needed; keep page components free of direct HTTP calls.
12. Run `npm run lint` and `npm run build`, then verify worker and admin flows with real responses.
