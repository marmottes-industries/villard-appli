# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo v54

This app targets **Expo SDK 54** (React Native 0.81, React 19, New Architecture enabled, React Compiler experiment on). The Expo API surface has changed significantly in recent versions — before writing any Expo code, consult the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/.

## Common commands

```bash
npm run start         # expo start (Metro)
npm run ios           # expo start --ios
npm run android       # expo start --android
npm run web           # expo start --web
npm run lint          # expo lint (eslint-config-expo flat config)
```

There is no test runner configured. There is no typecheck script — run `npx tsc --noEmit` if you need one.

Environment is read from `.env`: `EXPO_PUBLIC_API_URL` must point at the `villard-api` backend (default in `.env.example` is a LAN IP on port 8000). When changing the API URL, restart Metro — Expo only reads `EXPO_PUBLIC_*` vars at bundler start.

## Backend contract

The app is a thin client for `villard-api` (Symfony + API Platform 4). The full API reference lives in `API.md` at the repo root — read it before adding any new API call. Key points that shape the client:

- **API Platform 4 collections** are returned as `{ "@type": "Collection", member: [...] }`. The axios response interceptor in `src/api/client.ts` unwraps `.member` so call sites can treat list responses as plain arrays.
- **JSON-LD** is used: resources carry `@id` (an IRI like `/api/users/3`) and `@type`. Relations are sent as IRI strings, not nested objects (see `OccupationCreatePayload.occupant`).
- **PATCH** requires `Content-Type: application/merge-patch+json` (the API Platform default). Compare `occupationsApi.update` if you add new PATCH endpoints.
- **Auth** is JWT + refresh token. Access TTL is 1h; the client transparently refreshes on 401 (see below).

## Architecture

### Routing — Expo Router v6 (file-based)

`app/` is the route tree. `app/_layout.tsx` is the root, which mounts `AuthProvider` and renders a `Stack` once auth has hydrated. `app/(tabs)/` is the authenticated tab group; `app/login.tsx` is the unauthenticated entry. Typed routes are enabled in `app.json` (`experiments.typedRoutes: true`), so route strings are type-checked.

`app/index.tsx` is the gate: it should redirect to `(tabs)` or `login` based on `useAuth().isAuthenticated`.

### Auth flow (`src/stores/auth.tsx` + `src/api/client.ts`)

1. `AuthProvider` rehydrates tokens from `storage` on mount and sets `hydrating: false` when done — `_layout.tsx` shows a spinner until then to avoid flashing the wrong screen.
2. Tokens live under `TOKEN_KEY` / `REFRESH_TOKEN_KEY` in `storage` (see below).
3. `apiClient` request interceptor injects `Authorization: Bearer …` on every call.
4. On `401`, the response interceptor calls `/api/token/refresh` once (deduped via `refreshPromise`), retries the original request, and on failure calls `hardLogout()` which clears tokens and fires the `onUnauthorized` callback registered by `AuthProvider`. `/api/login` and `/api/token/refresh` themselves are excluded from the retry to avoid loops.
5. Never bypass `apiClient` — calling axios directly would skip auth and the collection-unwrap interceptor.

### Storage adapter (`src/lib/storage.ts`)

Platform-split: `expo-secure-store` on native, `localStorage` on web (with try/catch for SSR / private mode). Use this adapter for any persisted secret — don't import `SecureStore` directly from feature code.

### State

No Redux/Zustand/React Query. Two patterns:
- **AuthProvider** is a React Context (`src/stores/auth.tsx`) because auth is global.
- **Per-resource hooks** like `useOccupations()` (`src/stores/occupations.ts`) own their own `useState` + an `AsyncState` machine (`'idle' | 'loading' | 'error' | 'success'`) and surface a French-language `errorMessage`. Follow this shape when adding new resources; don't introduce a global cache unless the requirement demands it.

### Path aliases

`@/*` maps to the repo root (`tsconfig.json`). Imports look like `@/src/api/client`, `@/src/stores/auth`. Keep using this — relative `../../` chains are discouraged.

### Theme (`src/theme/`)

A static object exported as `theme` (and individually as `colors`, `spacing`, `radii`, `shadows`, `fontFamily`, etc.). There's no ThemeProvider — components import directly. Use the named exports rather than hardcoding colors/spacing.

### Android edge-to-edge

`_layout.tsx` calls `NavigationBar.setVisibilityAsync('hidden')` + `setBehaviorAsync('overlay-swipe')` on Android only. `app.json` has `edgeToEdgeEnabled: true` and `predictiveBackGestureEnabled: false`. If you add screens with bottom bars, account for the hidden nav bar and use `react-native-safe-area-context` insets.

### `design/` directory

HTML/JSX/CSS mockups used as a visual reference for the app's look. They are **not** part of the runtime bundle — do not import from `design/` in `app/` or `src/`.

## Conventions

- UI strings and user-facing error messages are in **French**.
- Resource IDs from the API come in two flavors: numeric `id` for client lookups, IRI `@id` for relation payloads. Don't conflate them.
- Dates round-trip as `YYYY-MM-DD` strings (see `Occupation.startDate`); use `src/lib/dates.ts` helpers rather than ad-hoc `Date` math.
