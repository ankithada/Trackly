# Trackly Server Refactor Architecture

This repository now uses a modular server layout while preserving existing behavior.

## Directory Structure

- `server.js`
  - Thin entrypoint that only bootstraps the server runtime.
- `src/app/appServer.js`
  - Application runtime composition:
  - HTTP server creation
  - static file serving
  - API route orchestration
  - feature/business logic (current phase)
- `src/core/env.js`
  - Environment file loader (`.env`) utility.
- `src/core/logging.js`
  - Shared logging, error serialization, JSON-safe parsing, and retry helpers.
- `src/features/`
  - Reserved feature modules for the next extraction phase.
  - Suggested sub-features already provisioned:
    - `auth`
    - `owners`
    - `entries`
    - `users`
    - `fleet`
    - `finance`

## Domain and Cross-Cutting Boundaries

Current domain boundaries identified in the monolith:

- Auth and Session
- Users
- Owners
- Fleet
- Entries and Review
- Finance (Debit, Consolidated Credit, Owner Advances)
- Reporting/Analytics

Cross-cutting concerns extracted in this phase:

- Config and env loading
- Logging and structured error serialization
- Retry utility logic for Google API token operations

## Containerization and Cloud Run

This structure remains Cloud Run friendly:

- Startup command remains `node server.js`.
- Entry point stays stable for Docker and Cloud Run revisions.
- Runtime paths now resolve from project root, so `public/` and `.env` behavior remain consistent.

## Next Extraction Phase (Feature Modules)

Planned module extraction from `src/app/appServer.js`:

- `src/features/auth/`
- `src/features/owners/`
- `src/features/fleet/`
- `src/features/entries/`
- `src/features/finance/`
- `src/features/users/`

Each feature should include:

- route handlers
- service layer logic
- validation utilities
- DTO/response mappers
