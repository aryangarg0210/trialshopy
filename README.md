# TrialShopy

A full-stack monorepo — **NestJS 11** + **Next.js 16** — with passwordless auth, async email queue, a shared UI kit, and Prisma on MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces + Turborepo v2 |
| **Backend** | NestJS 11, TypeScript 5.9 |
| **Frontend** | Next.js 16 (App Router), React 19, React Compiler |
| **Auth** | Better Auth v1.6 — email OTP + Google OAuth |
| **Database** | MongoDB + Prisma ORM |
| **Job Queue** | BullMQ (Redis) + Bull Board dashboard |
| **Email** | Nodemailer (SMTP) with HTML templates |
| **Styling** | Tailwind CSS 4 + `@repo/ui` (shadcn-derived) |
| **State / Data** | TanStack Query v5 |
| **Forms** | react-hook-form + Zod |
| **Logging** | nestjs-pino (pino-pretty in dev) |
| **Rate limiting** | `@nestjs/throttler` (global guard) |
| **Linting / Formatting** | Biome v2 |

---

## Monorepo Structure

```
.
├── apps/
│   ├── server/              # NestJS backend
│   └── web/                 # Next.js frontend
├── packages/
│   ├── db/                  # @repo/db — Prisma schema & generated client
│   ├── shared/              # @repo/shared — shared types, enums, utils
│   ├── ui/                  # @repo/ui — React component library
│   └── typescript-config/   # Shared tsconfig presets
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Setup

### Prerequisites

- Node.js ≥ 20, pnpm ≥ 11.5
- Redis running locally
- MongoDB running locally **as a replica set** (Prisma requires it). For local dev, start `mongod --replSet rs0` and initiate it once, or use Atlas (a replica set by default).

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in the values:

```bash
cp apps/server/.env.example apps/server/.env
```

All configuration is read from local `.env` files (loaded via `dotenv`). At minimum set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and the Redis connection. See `apps/server/.env.example` for the full list. The database scripts in `packages/db` read `DATABASE_URL` from `apps/server/.env`.

### 3. Run the app

```bash
pnpm db:push    # sync the Prisma schema to MongoDB
pnpm dev
```

Backend: `http://localhost:3001` · Swagger: `http://localhost:3001/docs`

---

## Authentication (Better Auth)

Auth is handled entirely by **[Better Auth](https://www.better-auth.com/)**. The config lives in `apps/server/src/common/auth.ts`. All auth routes are mounted automatically at `/api/auth/*` — you do not write controllers for sign-in/sign-out/OAuth.

### How it works

- Users sign in via **email OTP** (6-digit code, 5 min expiry) or **Google OAuth**
- Sessions are stored in the database (`Session` model in Prisma)
- The frontend sends the session cookie (`better-auth.session_token`) automatically on every request

### Changing the auth config

All auth behavior is configured in `apps/server/src/common/auth.ts`. To add or change something:

- **Add a new social provider** — add it alongside the existing Google provider in the `socialProviders` block. Refer to the [Better Auth docs](https://www.better-auth.com/docs/authentication/social-sign-on) for the provider options.
- **Change OTP settings** (expiry, length, attempt limit) — edit the `emailOTP` plugin options in the same file.
- **Add a Better Auth plugin** — import the plugin and add it to the `plugins` array.

After changing the auth config, if the plugin requires new database tables, run:

```bash
pnpm db:migrate
```

Better Auth will generate the required schema diff automatically via `npx better-auth migrate`.

### Protecting backend routes

All NestJS routes are auth-protected by default. Use decorators to adjust:

```typescript
@AllowAnonymous()   // fully public
@OptionalAuth()     // works for both authenticated and anonymous
@Session()          // injects the current user session
```

### Reading the session on the frontend

```typescript
import { authClient } from '@/lib/auth-client';

const { data: session } = authClient.useSession();
// session.user → { id, name, email, image }
```

To add a frontend Better Auth plugin (e.g. organization), add it to `authClient` in `apps/web/src/lib/auth-client.ts` alongside the existing `emailOTPClient()`.

---

## Rate Limiting

All API routes are rate-limited globally via [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting). `ThrottlerGuard` is registered as an `APP_GUARD` in `apps/server/src/app.module.ts`, so every controller inherits the limit unless you opt out.

### Default limits

| Throttler | TTL | Limit |
|---|---|---|
| `default` | 60 seconds | 300 requests |

When a client exceeds the limit, the server responds with **429 Too Many Requests**.

### Exempting a route

Use `@SkipThrottle()` on a handler or controller to bypass rate limiting. The health check at `GET /api/health` is exempt so load balancers and uptime monitors are not throttled:

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@Get('health')
@AllowAnonymous()
@SkipThrottle()
healthCheck() { /* ... */ }
```

### Per-route limits

To override the default on a specific route, use `@Throttle()`:

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Post('sensitive-action')
sensitiveAction() { /* ... */ }
```

To change the global defaults, edit `ThrottlerModule.forRoot()` in `app.module.ts`.

---

## Email Queue (BullMQ)

Emails are never sent inline. Every email goes through a BullMQ queue backed by Redis, which decouples delivery from the request lifecycle and gives you retries, scheduling, and monitoring out of the box.

### How it works

```
EventEmitter.emit(SCHEDULER_EVENTS.EMAIL_SEND, payload)
  → SchedulerListener  (picks up the event)
  → SchedulerService   (enqueues a BullMQ job)
  → EmailProcessor     (worker: concurrency 8, rate limit 8/s, 3 retries)
  → MailService        (SMTP delivery)
```

### Sending an email from your code

Inject `EventEmitter2` in any service and emit:

```typescript
this.eventEmitter.emit(SCHEDULER_EVENTS.EMAIL_SEND, {
  to: 'user@example.com',
  subject: 'Hello',
  html: yourTemplate(),
  // optional:
  sendAt: new Date(Date.now() + 3600_000), // schedule 1h from now
  jobId: `welcome-${userId}`,              // idempotency — safe to emit multiple times
});
```

### Adding a new email template

1. Create a file in `apps/server/src/mail/templates/` and wrap your HTML with `emailTemplateWrapper` for consistent branding:

```typescript
// mail/templates/order-confirmed.ts
import { emailTemplateWrapper } from './wrapper';

export function orderConfirmedTemplate(orderName: string) {
  return emailTemplateWrapper(`
    <h2>Order Confirmed</h2>
    <p>Your order <strong>${orderName}</strong> is on its way.</p>
  `);
}
```

2. Export it from `mail/templates/index.ts`.
3. Import and use in your service when emitting the event.

> In development, OTP emails are logged to the console instead of being sent via SMTP. Other templates always go through SMTP regardless of environment.

### Adding a new queue and processor

The email queue is one example. To add a separate queue (e.g. for background data processing):

1. **Add the queue name** to `scheduler.types.ts`:

```typescript
export const DATA_SYNC_QUEUE = 'data-sync';
export const QUEUES = [
  { name: EMAIL_QUEUE },
  { name: DATA_SYNC_QUEUE }, // add here
];
```

Adding it to `QUEUES` automatically registers it with Bull Board for monitoring.

2. **Create a processor** at `scheduler/processors/data-sync.processor.ts`:

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DATA_SYNC_QUEUE } from '../scheduler.types';

@Processor(DATA_SYNC_QUEUE, { concurrency: 4 })
export class DataSyncProcessor extends WorkerHost {
  async process(job: Job) {
    // handle job.data
  }
}
```

3. **Register the processor** in `scheduler.module.ts`:

```typescript
providers: [SchedulerService, SchedulerListener, EmailProcessor, DataSyncProcessor],
```

4. **Enqueue jobs** from any service by injecting the BullMQ queue directly:

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DATA_SYNC_QUEUE } from 'src/scheduler/scheduler.types';

constructor(@InjectQueue(DATA_SYNC_QUEUE) private readonly queue: Queue) {}

await this.queue.add('sync', { userId });
```

### Bull Board (queue monitoring)

`http://localhost:3001/api/queues` — protected by HTTP Basic Auth (`BULL_BOARD_USER` / `BULL_BOARD_PASSWORD` in `.env`). Shows live job status, retries, and failed job details for all registered queues.

---

## Database & Prisma

The schema is split across multiple files under `packages/db/prisma/schema/` (merged by Prisma via `prisma.config.ts`) and is shared across the monorepo. The Prisma client is generated into `packages/db/generated/prisma/` and used only on the backend via `PrismaService`.

### Schema conventions

- Use `@id @default(auto()) @map("_id") @db.ObjectId` for primary keys
- Add `@@index` for any field you filter by frequently
- Use `onDelete: Cascade` on relations where deleting the parent should remove children
- Always include `createdAt` and `updatedAt` on application models

### After changing the schema

```bash
pnpm db:push       # syncs the schema to MongoDB (no migration files on Mongo)
pnpm db:generate   # regenerates the Prisma client
```

---

## Frontend — Key Conventions

### Route groups

- `(auth)/` — public pages (sign-in). No session check.
- `(main)/` — protected pages. The layout performs a server-side session check and redirects unauthenticated users to `/sign-in` automatically. Any new page added here is protected without extra work.

### HTTP calls

Never call `fetch` or `axios` directly in components. The pattern is:

```
Component → TanStack Query hook → Service → ApiClient
```

- **Services** (`src/services/`) — static classes that call `ApiClient`
- **Queries** (`src/queries/`) — TanStack Query hooks that call services
- **Components** — consume hooks only

`ApiClient` sends the session cookie automatically (`withCredentials: true`) and throws `Error(message)` using the server's error message, which you can catch and display directly.

### Breadcrumbs

Breadcrumbs are auto-generated from the URL path. You get this for free on every `(main)` page without any configuration.

**For dynamic segments** (e.g. `/orders/[orderId]`), the breadcrumb will show a skeleton until you register the human-readable label. Do this inside the page component once the data is loaded:

```typescript
import { useBreadcrumbLabel } from '@/hooks/use-breadcrumb-label';

// registers the label for the current dynamic segment ID
useBreadcrumbLabel(order.id, order.name);
```

The label propagates through the `BreadcrumbProvider` context and the skeleton resolves automatically. Don't register a label for static segments — they are resolved directly from the path.

### Theme

Light/dark/system theme is available globally via `next-themes`. Use the `ThemeToggle` component from `@repo/ui` anywhere in the UI. Do not manage theme state yourself.

---

## Shared Packages

### `@repo/ui`

55+ shadcn/Radix-based components plus composite components like `CustomTable` (TanStack Table wrapper), `CustomAlertDialog`, `LoadingButton`, `UserAvatar`, and `PageContainer`.

Import from the package paths directly:

```typescript
import { Button } from '@repo/ui/components/button';
import { CustomTable } from '@repo/ui/general/CustomTable';
```

### `@repo/shared`

Shared utilities usable in both apps: `getInitials`, `formatCurrency`, `deepTrim`, `enumToTitleText`, `exportAsCSV`, `downloadFile`, `getConsistentColors`, and more.

Put any type, enum, or utility that needs to cross the app boundary (e.g. a shared validation schema) here.

### `@repo/db`

Prisma client — **backend only**. Do not import this in the frontend.

---

## Development Scripts

```bash
pnpm dev          # start all apps
pnpm build        # build all apps and packages
pnpm typecheck    # TypeScript check across all packages
pnpm lint:fix     # Biome lint + auto-fix
pnpm db:push      # sync the Prisma schema to MongoDB
pnpm db:generate  # regenerate the Prisma client
pnpm db:studio    # Prisma Studio GUI
```

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every PR to `main`: lint, typecheck, and Prisma client generation.

---

## Environment & Secrets

Configuration is loaded from local `.env` files via [`dotenv`](https://www.npmjs.com/package/dotenv) — there is no external secrets service.

- **Backend** reads `apps/server/.env` (loaded by `import "dotenv/config"` in `apps/server/src/common/config.ts`).
- **Database scripts** (`packages/db`) read the same `apps/server/.env` — `prisma.config.ts` loads it so `DATABASE_URL` is available to `prisma generate`, `db push`, and `studio`.

Copy `apps/server/.env.example` to `apps/server/.env` and fill in the values. `.env` files are gitignored and must never be committed.
