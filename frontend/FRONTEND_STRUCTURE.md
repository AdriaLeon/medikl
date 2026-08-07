# Frontend Structure

How `frontend/src` is organized after the [front-end-refactor](../../pull/new/front-end-refactor) pass. Read this before adding new files so they land in the right place.

## Layout

```
src/
├── App.tsx              # Route table (react-router) + top-level providers
├── main.tsx              # Vite/React entry point, mounts <App />
├── api/                   # One file per backend resource — all HTTP calls live here
├── auth/                  # Auth state (context) + token helpers, independent of any one page
├── components/            # Reusable UI pieces, grouped by feature/domain
│   ├── auth/
│   ├── layout/
│   ├── patients/
│   ├── users/
│   └── visits/
├── hooks/                 # Reusable, generic React hooks
├── pages/                 # One component per route, composed from components/
└── types/                 # Shared TypeScript types/interfaces
```

## Where things go

### `api/`
Thin wrappers around `fetch`, one file per backend resource (`auth.ts`, `patients.ts`, `users.ts`), plus a shared `client.ts`.

- `client.ts` exports `apiFetch<T>()` — prefixes `/api`, JSON-serializes the body, attaches the bearer token from `localStorage` automatically, and throws `ApiError` on non-2xx responses.
- **Rule:** components and hooks never call `fetch` directly. New backend calls get a function in the matching `api/*.ts` file (create a new file per resource if one doesn't exist), built on `apiFetch`.

### `auth/`
Cross-cutting authentication state, not tied to a specific route.

- `AuthContext.tsx` — `AuthProvider` + `useAuth()`. Hydrates the session from `localStorage` on mount, exposes `user`, `token`, `isAuthenticated`, `loading`, `login`, `register`, `logout`.
- `token.ts` — token helpers (e.g. `isTokenExpired`).
- **Rule:** any component that needs to know who's logged in calls `useAuth()`; it never reads `localStorage` directly.

### `components/`
Presentational/reusable pieces, **grouped by domain subfolder** — nothing goes directly in `components/` itself.

| Subfolder | Contents |
|---|---|
| `auth/` | `AuthForm`, `ProtectedRoute` (route guard using `useAuth()`) |
| `layout/` | `AppLayout` (route shell), `Navbar`, `Footer` |
| `patients/` | `PatientForm`, `PatientList` |
| `users/` | `UserList` |
| `visits/` | `VisitList` |

**Rule:** when adding a component, put it in the subfolder matching the domain it belongs to. If it's a new domain, create a new subfolder — don't add loose files at the `components/` root.

### `hooks/`
Generic, reusable hooks with no domain knowledge baked in.

- `useFetch.ts` — runs an async fetcher on mount/dep-change, tracks `data`/`loading`/`error`, exposes `refetch()`.
- **Rule:** hooks here should work for any data shape. Domain-specific data-fetching logic belongs in `api/`, called from a page or component via `useFetch`.

### `pages/`
One component per route, wired up in `App.tsx`. Pages compose `components/*` and call `api/*` (typically via `hooks/useFetch`) — they hold page-level state and layout, not reusable UI.

Current pages: `DashboardPage`, `LoginPage`, `RegisterPage`, `DoctorsPage`, `PatientVisitsPage`, `UserProfilePage`, `NotFoundPage`.

**Rule:** adding a route means adding a file here and registering it in `App.tsx`'s `<Routes>`.

### `types/`
Shared TypeScript types (`patient.ts`, `user.ts`, `visit.ts`) used by `api/`, `components/`, and `pages/` alike.

**Rule:** if a shape is used in more than one file, it belongs here, not redeclared locally.

## Adding a new feature — quick checklist

1. **Type** — define/extend the shape in `types/`.
2. **API** — add the request function(s) in `api/<resource>.ts` (new file if it's a new resource), built on `apiFetch`.
3. **Component(s)** — build the UI in `components/<domain>/`, using `useFetch` (or `useAuth`) for data.
4. **Page** — if it's a new route, add a file in `pages/` and register it in `App.tsx`.

## Known cleanup

`components/` still has legacy flat files left over from before the refactor (`AuthForm.tsx`, `Footer.tsx`, `Navbar.tsx`, `PatientForm.tsx`, `PatientList.tsx`, `PatientVisits.tsx`, `UserList.tsx`, `UserProfile.tsx`, `VisitList.tsx`). Nothing imports them anymore — `App.tsx` and every page use the nested `components/<domain>/` versions exclusively. They're dead code and should be deleted in a follow-up commit rather than edited.
