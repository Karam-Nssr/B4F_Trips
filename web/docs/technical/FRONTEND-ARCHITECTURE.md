# Web frontend architecture

## Ownership

```text
app/
  (auth)/, (dashboard)/  URL structure, layouts, route input, page composition
  actions/               Server Action entry points and mutation validation
components/
  ui/                    Shared shadcn/ui source components and project variants
  layout/                Portal shell and navigation
  shared/                Reusable compositions that cross feature boundaries
features/
  <domain>/              Feature queries, schemas, forms, and domain-specific UI
lib/
  api/                   Server-only HTTP transport, endpoint map, pagination
  auth/                  Session cookie, identity, and authorization helpers
  domain/                Types and utilities genuinely shared across features
```

Keep route files small: await route parameters, authenticate or authorize,
load data through the owning feature, select the appropriate route state, and
compose shared and feature components. Feature rules and form schemas belong
with their feature. Promote code to `lib/` or `components/shared/` only when it
is genuinely shared; avoid parallel top-level component directories.

## Request and mutation flow

Authenticated reads follow:

```text
App Router page -> feature *.api.ts -> lib/api/endpoints.ts
                -> server-only lib/api/client.ts -> backend REST API
```

`lib/api/client.ts` owns transport concerns (base URL, session token, response
envelope, errors, timeout, and `no-store`). Feature API modules own typed
queries. `lib/api/endpoints.ts` is the single map of the current backend's
resource paths. Its small resource-path factory is limited to the repeated
collection/item URL convention; irregular operations remain explicit.

Mutations enter through Server Actions in `app/actions/`. Each action validates
input and checks authorization before calling the shared server-only client.
Backend role checks remain authoritative. Revalidate affected routes after a
successful mutation; this invalidation does not enable cross-user response
caching.

The endpoint map and feature query modules are seams for a future vendor
integration, not an adapter implementation. Endpoint names are centralized,
but request payloads, response envelopes, pagination, and domain types still
reflect the current backend. An incompatible provider will need explicit
request/response mapping behind a provider interface before it can be swapped
without changing feature behavior.

## Components and libraries

`components/ui/` is the one shared primitive library and is configured for the
shadcn/ui CLI through `components.json`. Components are source code in this
repository, not a second runtime UI framework. Keep common accessible
primitives there; keep feature-specific pieces beside their feature. Existing
button and badge variants use `class-variance-authority`; `cn` is the shared
Tailwind class-merging helper.

Visual tokens and the documented Figma/API boundary are maintained in
[`docs/design-system/design-system.md`](../design-system/design-system.md).

Use Server Components by default. Keep browser state in small Client
Components. Use native forms and Server Actions for simple forms; use React
Hook Form with Zod when field-level client validation is useful. Use TanStack
Table only for tables that need its sorting, visibility, selection, or
server-pagination behavior.

## Routing, errors, and caching

The App Router filesystem remains the route source of truth. Route Handlers
(`app/**/route.ts`) should be added only when the web app needs to expose an
HTTP endpoint (for example, a webhook receiver or a browser-facing API). They
use the Web `Request`/`Response` APIs and are not required to consume the
existing external REST API from a Server Component or Server Action.

Expected failures such as invalid input and backend request errors should be
handled where they occur. Unexpected rendering failures bubble to the nearest
`error.tsx` boundary. The root route boundary is shared; the dashboard keeps
its existing dashboard-specific boundary.

Authenticated API calls and user-specific portal data use `cache: "no-store"`.
Do not introduce shared caching, static generation, ISR, or `use cache` for
staff data without an explicit authorization-aware cache design.

Next.js deployment adapters (the `next` adapter APIs) integrate a deployment
platform with the Next.js runtime/build output. They are distinct from a
future adapter between this frontend and multiple vendor APIs.
