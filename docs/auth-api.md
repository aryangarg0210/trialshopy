# Auth API — Signup & Signin (Frontend Integration)

All authentication is handled by the backend at **`/api/auth/*`**. The frontend
only calls these HTTP endpoints — there is no auth SDK to install.

- **Base URL (dev):** `http://localhost:3001/api`
- **Content-Type:** `application/json` on every request
- **Session:** on successful signup/signin the server sets an **HttpOnly cookie**
  `better-auth.session_token` (valid 7 days). The browser stores and sends it
  automatically — **but only if you send requests with credentials** (see
  [Frontend integration](#frontend-integration)).

---

## 1. Sign Up — Email + Password

Creates a new account. This is the **only** signup method.

**`POST /api/auth/sign-up/email`**

Request body:
```json
{
  "name": "Asha Rao",
  "email": "asha@example.com",
  "password": "Password123!"
}
```
> `Confirm Password` and the Terms checkbox are validated on the frontend only —
> don't send them.

**200** response (user is signed in immediately; cookie is set):
```json
{
  "token": "pFGLLS5sVDiJqgkf3CIdDTdGJJNSGFsp",
  "user": {
    "id": "6a4d564507ba0a597bdc6264",
    "name": "Asha Rao",
    "email": "asha@example.com",
    "emailVerified": false,
    "image": null,
    "phoneNumber": null,
    "phoneNumberVerified": false,
    "role": "customer",
    "banned": false,
    "createdAt": "2026-07-07T19:40:53.508Z",
    "updatedAt": "2026-07-07T19:40:53.508Z"
  }
}
```

Common errors:
| Status | Body | Meaning |
|---|---|---|
| 422 | `{ "message": "User already exists. Use another email.", "code": "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" }` | Email already registered |
| 400 | `{ "message": "Password too short", "code": "PASSWORD_TOO_SHORT" }` | Password below the minimum length |

---

## 2. Sign In — Email + Password (primary)

**`POST /api/auth/sign-in/email`**

Request body:
```json
{
  "email": "asha@example.com",
  "password": "Password123!",
  "rememberMe": true
}
```
> `rememberMe` is optional (defaults `true`). `false` = session ends when the
> browser closes.

**200** response (cookie is set):
```json
{
  "redirect": false,
  "token": "RGIfYJvKFS8TaglKowtKsUse1Mjq2del",
  "user": { "id": "6a4d564507ba0a597bdc6264", "name": "Asha Rao", "email": "asha@example.com", "role": "customer", "phoneNumber": null, "...": "..." }
}
```

Error:
| Status | Body |
|---|---|
| 401 | `{ "message": "Invalid email or password", "code": "INVALID_EMAIL_OR_PASSWORD" }` |

---

## 3. Sign In — Phone OTP (secondary)

Two steps. **Only works for accounts that already have a linked phone number.**
An unknown phone returns 404 — it does **not** create a new account.

### Step 1 — request the OTP
**`POST /api/auth/phone-number/send-otp`**
```json
{ "phoneNumber": "+919876543210" }
```
Response **200**: `{ "message": "code sent" }`
> Phone must be full international format: `+91` + the 10-digit number, joined
> into one string (e.g. `"+919876543210"`).

### Step 2 — verify the OTP (signs the user in)
**`POST /api/auth/phone-number/verify`**
```json
{ "phoneNumber": "+919876543210", "code": "123456" }
```
**200** response (cookie is set):
```json
{
  "status": true,
  "token": "ed5xLwVPc0ijqUPonnnXW3advgKLhb5f",
  "user": { "id": "6a4d51f1d234f18cedf86045", "phoneNumber": "+919876543210", "phoneNumberVerified": true, "role": "customer", "...": "..." }
}
```

Errors:
| Status | Body | Meaning |
|---|---|---|
| 404 | `{ "code": "USER_NOT_FOUND", "message": "No account found with this phone number." }` | No account has this phone → show "please sign up with email first" |
| 400 | `{ "code": "INVALID_OTP", ... }` | Wrong/expired code |

> **Note:** a user who signed up with email has no phone yet, so phone-OTP login
> won't work for them until they add & verify a phone from inside their account
> (a separate "add phone" flow — not part of signup/signin).

---

## 4. Session helpers

| Action | Endpoint | Returns |
|---|---|---|
| Who am I / is there a session | `GET /api/auth/get-session` | `{ session, user }` or `null` if not logged in |
| Sign out | `POST /api/auth/sign-out` | `{ "success": true }` (clears the cookie) |

`GET /api/auth/get-session` response when logged in:
```json
{
  "session": { "id": "...", "userId": "...", "expiresAt": "2026-07-14T19:40:53.804Z", "token": "..." },
  "user": { "id": "...", "name": "Asha Rao", "email": "asha@example.com", "role": "customer", "...": "..." }
}
```

---

## Frontend integration

### The one rule that matters: send credentials

The session lives in an HttpOnly cookie. The browser only sends it cross-origin if
you explicitly opt in. Do this on **every** request — the login calls *and* every
API call afterwards (e.g. `/api/users/me`):

```js
// fetch
fetch("http://localhost:3001/api/auth/sign-in/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",              // ← required
  body: JSON.stringify({ email, password }),
});
```

```js
// axios — set it once, applies everywhere
import axios from "axios";
export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,               // ← required
});
```

Miss this and the user appears to log in, but every following request is a 401.

### After login
- **Don't store the token** in localStorage. The cookie is automatic and HttpOnly
  (safer). Just call `GET /api/auth/get-session` on app load to know if the user is
  signed in and to read `user` (id, name, email, role).
- Use `user.role` (`customer` / `seller` / `admin`) to gate UI.

### Error handling
All errors return JSON `{ message, code }` with a matching HTTP status. Show
`message` to the user, branch on `code` when you need specific handling
(e.g. `INVALID_EMAIL_OR_PASSWORD`, `USER_NOT_FOUND`).

### Mobile app (not web)
Mobile can't use cookies easily. Every signin/signup response also returns the
token in a **`set-auth-token`** response header. Store it securely and send
`Authorization: Bearer <token>` on each request instead of relying on the cookie.

### Production note
Locally, frontend (`:3000`) and API (`:3001`) share `localhost`, so cookies work
out of the box. If in production they sit on **different domains**, the session
cookie needs `SameSite=None; Secure` (a small backend config change) — flag it
when deploying.
