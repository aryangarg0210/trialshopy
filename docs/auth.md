# Authentication

Auth is handled entirely by **Better Auth**, mounted at `/api/auth/*`. There are
no hand-written auth controllers — configuration lives in one place:
`apps/server/src/common/auth.ts`.

This replaces the legacy setup, which was fragmented across two backends with two
different JWT payload shapes and two secrets (customer login in the main backend,
seller login in the seller-admin backend, plus a separate Twilio OTP flow).

## Login methods

| Method | Plugin | Notes |
|---|---|---|
| Email + password | core `emailAndPassword` | replaces legacy customer + seller password login |
| Phone OTP (SMS) | `phoneNumber` | replaces the legacy Twilio flow; auto-creates a user on first verify |
| Email OTP | `emailOTP` | 6-digit, 5-min expiry |
| Google | social provider | unchanged from template |
| Bearer token / JWT | `bearer` + `jwt` | for the mobile app (EdDSA-signed JWT) |
| Roles / ban / impersonation | `admin` | `defaultRole: "customer"`, `adminRoles: ["admin"]` |

**Biometric (passkey)** is intentionally deferred — there was no legacy contract to
match and it needs WebAuthn integration on the mobile client. The `Passkey` model
already exists in the schema (dormant), so enabling it later is a config-only
change in `auth.ts`, not a migration.

## Key endpoints (verified working)

```
POST /api/auth/sign-up/email          { name, email, password }
POST /api/auth/sign-in/email          { email, password }
GET  /api/auth/get-session
POST /api/auth/phone-number/send-otp  { phoneNumber }
POST /api/auth/phone-number/verify    { phoneNumber, code }   -> logs in, auto-creates user
GET  /api/auth/token                  -> issues a JWT for the mobile app
```

## Route protection (NestJS)

Applied via decorators from `@thallesp/nestjs-better-auth`:

- No decorator → auth required (default)
- `@AllowAnonymous()` → fully public
- `@OptionalAuth()` → works with or without a session
- `@Session()` → inject the current user/session

## SMS delivery

`apps/server/src/common/utils/sms.utils.ts` logs the OTP to the console in
development. A real provider must be wired for production — **the legacy Twilio
credentials were committed to the old repo and must be rotated**, not reused.

## Identity model

Better Auth owns the `User` (identity: email, phone, password, name, `role`).
Domain data lives in `CustomerProfile` / `SellerProfile` (see
`packages/db/prisma/schema/02-identity.prisma`), each 1:1 with `User`.

## Schema requirements

The auth plugins require these models/fields (in `01-auth.prisma`), some of which
only surface at runtime — confirmed by booting the server against MongoDB:

- `User`: `phoneNumber`, `phoneNumberVerified`, `role`, `banned`, `banReason`, `banExpires`
- `Session`: `impersonatedBy` (admin plugin)
- `Jwks` collection (jwt plugin)
- `Passkey` (dormant, biometric follow-up)

## Local development

MongoDB must run as a **replica set** (Prisma requirement). Quick start:

```bash
docker run -d --name trialshopy-mongo -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec trialshopy-mongo mongosh --quiet --eval 'rs.initiate()'
# reconfigure the member host to localhost so the host machine can connect:
docker exec trialshopy-mongo mongosh --quiet --eval \
  'cfg=rs.conf(); cfg.members[0].host="localhost:27017"; rs.reconfig(cfg,{force:true})'

docker run -d --name trialshopy-redis -p 6379:6379 redis:7

pnpm --filter @repo/db db:push   # sync collections + indexes
```
