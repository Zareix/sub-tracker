# Copilot instructions for Sub Tracker

Purpose: Help GitHub Copilot (and contributors using Copilot Chat) make correct, minimal, type-safe changes to this codebase.

## Tech stack (what to assume)

- Runtime : Bun, use `bun` for scripts, DO NOT use `npm` or `npx` but use `bun` and `bunx`.
- Framework: Next.js 15 (React 19) with Pages dir, TypeScript (strict)
- Styling: Tailwind CSS v4, shadcn/ui components in `src/components/ui`
- Data: Drizzle ORM + SQLite (`db.sqlite`), migrations in `drizzle/`
- API: tRPC v11 (`src/server/api`), TanStack Query v5
- Auth: better-auth (`src/server/auth.ts`, `src/lib/auth-client.ts`)
- Lint/format: Biome (`biome.json`)

## How to run

- Install dependencies: `bun install`
- Dev: `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Lint (check/fix): `bun run lint` / `bun run check`
- Emails preview server: `bun run email:dev` (templates in `src/server/email/templates`)

## Database workflow (Drizzle + SQLite)

- Edit schema in `src/server/db/schema.ts`.
- Generate SQL from schema: `bun run db:generate` (writes to `drizzle/*`).
- Migration auto applied on next app start.
- Browse data: `bun run db:studio`.
- Dev DB file: `db.sqlite` in repo root.

Copilot: when adding/removing columns, update schema, regenerate, and push. If a change affects runtime code, update tRPC routers, zod validators, and UI forms accordingly.

## Project structure (high level)

- `src/app` — API routes under `api/*`.
- `src/pages` — Pages structure (e.g., `_app.tsx`).
- `src/server` — tRPC routers (`api/routers`), DB (`db`), email, services.
- `src/components` — feature components and `ui/*` primitives.
- `src/lib` — utilities, constants, hooks; tRPC client in `src/utils/api.ts`.
- `drizzle/` — generated migrations (+ `meta/`).

Important aliases: `~/*` maps to `src/*`.

## Coding conventions

- Keep TypeScript strict. Prefer precise types, avoid `any`.
- Validate inputs with zod in server routers; mirror types in client forms via `@hookform/resolvers`.
- Use `cn` from `src/lib/utils.ts` for class merging; Tailwind for styling.
- Use `src/components/ui/*` primitives before adding new dependencies.
- For data fetching/mutations, use tRPC hooks from `src/utils/api.ts` (TanStack Query v5). SSR for tRPC is disabled by design.
- Dates: use `date-fns`.
- Images: only remote hosts allowed in `next.config.js`.

## Auth

- Server auth config: `src/server/auth.ts`.
- Client helpers: `src/lib/auth-client.ts`.
- Don’t log secrets; use environment variables validated via `src/env.js` which use [t3env](https://github.com/t3-oss/t3-env).

## Making common changes with Copilot

1. Add a DB field

- Update `src/server/db/schema.ts`.
- Generate migration: `bun run db:generate`.
- Update affected tRPC router(s) in `src/server/api/routers/*` (input/output zod schemas, queries, mutations).
- Update UI forms/components and types used.

2. Add a tRPC endpoint

- Create/extend router in `src/server/api/routers/*` and export via `src/server/api/root.ts`.
- Add zod validation; return plain serializable data (superjson handles Dates).
- Consume via `api.<router>.<proc>.useQuery|useMutation` in components.

3. Add a page/route

- Prefer the Pages Router under `src/pages` when possible.
- Use existing UI primitives and patterns for consistency.

4. Email template

- Add template in `src/server/email/templates` (React Email).
- Preview with `bun run email:dev`.

## Quality checklist (pre-PR)

- Types okay: `tsc` runs during build; ensure no new errors.
- Lint/style: `bun run check` to autofix; `bun run lint` to verify.
- Build passes: `bun run build`.
- DB migrations generated and applied locally.
- Screens and forms behave (basic manual test).

## Copilot Chat prompt tips

- Ask: “Search for the router that handles X” then update only the minimal code.
- When edits affect multiple layers, enumerate all files to touch before changing anything.
- Prefer incremental diffs and keep public APIs backward compatible unless stated.
- Confirm scripts and paths from `package.json`, not assumptions.

Example prompts

- “Add field `isArchived` (boolean, default false) to subscriptions; update schema, migrations, tRPC outputs, and hide archived in lists with a toggle in the filters.”
- “Create a mutation to upload an image via `src/server/services/files` and consume it in `src/components/image-uploader.tsx`.”

## Notes and constraints

- React 19: avoid legacy patterns; no deprecated lifecycle APIs.
- Tailwind v4: use class utilities; avoid inline styles unless necessary.
- i18n: English only for now (`next.config.js`).
- Dockerfile exists for deployment; `next.config.js` sets `output: 'standalone'`.
- Renovate is enabled; prefer minimal dependency additions.

That’s it. Use Bun for scripts, keep changes small, uphold strict types, and mirror server/client types via zod + tRPC.
