# Frontend Runtime Refactor

## Goal

Turn `public/app.js` into a bootstrap-only entrypoint and move implementation logic into a dedicated runtime module.

## Current Structure

- `public/app.js`
  - Thin module entrypoint.
  - Imports and starts the app runtime.
- `public/app/appRuntime.js`
  - Full client runtime logic (state, API calls, rendering, events, workflows).
- `public/index.html`
  - Loads `public/app.js` with `type="module"`.

## Why this split helps

- Clear separation between bootstrapping and implementation.
- Safer future refactors (can split runtime by feature without touching entrypoint).
- Better alignment with backend modular pattern.

## Suggested next phase

Split `appRuntime.js` into feature modules under `public/app/features/`:

- auth
- review
- entries
- owners
- finance
- dashboard

And shared modules under `public/app/core/`:

- state
- api client
- formatting utils
- dom helpers
