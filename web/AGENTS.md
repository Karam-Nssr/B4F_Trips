<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Web frontend architecture

The target architecture and library decisions are documented in
[`docs/technical/FRONTEND-ARCHITECTURE.md`](./docs/technical/FRONTEND-ARCHITECTURE.md).
Treat that document as the source of truth for folder ownership and client/server
boundaries. Keep changes in the `web/` project.

### Project conventions

- Use the App Router and filesystem routing. Route groups such as `(auth)` and
  `(dashboard)` organize layouts without adding URL segments. Keep route pages
  focused on request inputs, calling feature queries, selecting states, and
  composing components.
- Next.js 16 request APIs such as `params`, `searchParams`, `cookies()`, and
  `headers()` are asynchronous; await them. Read the installed Next.js docs
  before using an API whose behavior may be version-sensitive.
- In Next.js 16, `proxy.ts` is the current convention; do not introduce
  `middleware.ts`. Proxy may perform a cheap optimistic redirect based on cookie
  presence, but it is not the authorization boundary and must not call the
  backend for session validation.
- Use Server Components by default. Add `"use client"` only to the smallest
  feature component that needs browser state, event handlers, or browser APIs.
  Keep backend calls, secrets, cookies, session checks, and authorization in
  server-only modules.
- Server Actions are public mutation entry points: validate submitted data and
  re-check both session and role inside every action. Keep backend authorization
  authoritative. Do not expose the backend JWT to browser code.
- Use URL search parameters for shareable list filters, sorting, and
  pagination. Keep that state in the server-rendered route; do not mirror it in
  a global client store.

### UI and data libraries

- Use shadcn/ui as the component source: compose its accessible primitives,
  keep project variants in `components/ui`, and avoid adding a second UI kit.
- Use React Hook Form with Zod for forms that need client-side state or
  field-level validation. Reuse schemas in server actions for authoritative
  validation. For genuinely small forms, prefer native HTML forms and Server
  Actions rather than adding client state.
- Use TanStack Table for tables requiring sorting, column visibility, selection,
  or server-driven pagination. Keep its rendering and interaction adapter in a
  shared table component; use shadcn/ui table primitives for markup. Do not add
  a client data-fetching library for data already fetched by Server Components.
- Do not add Redux/Zustand, React Query/SWR, or another UI framework without a
  specific requirement and an architecture decision.

### Data and cache boundaries

- All authenticated REST calls go through the server-only API client. Use
  `cache: "no-store"` for user/session-specific data, trips, reservations,
  booking availability, and mutations.
- The frontend specification prohibits SSG, ISR, and shared static route/data
  caches for this management portal. Do not add `use cache`, time-based
  revalidation, `force-static`, or a static export unless that requirement is
  explicitly changed.
- Use `revalidatePath` after successful mutations to refresh affected route
  output and navigation. This is invalidation, not permission to cache
  authenticated responses across users.
- Do not cache authenticated API responses by default, even for reference data:
  the backend response can depend on the bearer token. Revisit only with an
  explicit cache-key and authorization review.

### Documentation and scope

- Update the architecture document when changing ownership boundaries,
  libraries, or caching policy. Keep business/API uncertainties in
  `docs/technical/ASSUMPTIONS.md`; do not silently invent backend behavior.
- Keep design tokens in `docs/design-system/design-system.md`.
