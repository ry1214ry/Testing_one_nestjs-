# NestJS Security Authentication System

A production-grade authentication & authorization system built with **NestJS**, **PostgreSQL + TypeORM**, **Passport.js (JWT)**, **bcrypt** and **@nestjs/config**.

## Features

- **Registration & Login** (`POST /auth/register`, `POST /auth/login`) with bcrypt password hashing (10–12 salt rounds)
- **JWT access + refresh tokens** with **refresh token rotation** stored hashed (SHA-256) in the database
  - Access token: 15 minutes (`JWT_AT_EXPIRES_IN=900`)
  - Refresh token: 7 days (`JWT_RT_EXPIRES_IN=604800`)
- **Global `JwtAuthGuard`** with a `@Public()` decorator that bypasses authentication via `Reflector`
- **RBAC** — `Role` enum (`USER`, `ADMIN`), `@Roles()` decorator and a `RolesGuard`
- **Security hardening**
  - `helmet()` HTTP headers
  - CORS restricted to origins from `.env`
  - Rate limiting on all `/auth` endpoints via `@nestjs/throttler`
  - Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`
  - `class-validator` DTOs
  - All secrets in `.env` validated by a config schema (no plaintext anywhere in code)
  - Generic login errors — never reveal whether an email exists
- **Error handling & logging** — custom global `HttpExceptionFilter` returning structured errors + NestJS `Logger` for auth events
- **Swagger** documentation at `http://localhost:3000/api/docs`
- **Testing** — unit tests for `AuthService`, both JWT strategies and both guards; e2e flow test (register → login → protected route → refresh/rotation)

## Tech stack

| Area      | Choice                               |
| --------- | ------------------------------------ |
| Framework | NestJS 12                            |
| Language  | TypeScript (strict, ESM)             |
| Database  | PostgreSQL                           |
| ORM       | TypeORM                              |
| Auth      | Passport.js + `passport-jwt`         |
| Hashing   | bcrypt                               |
| Config    | `@nestjs/config` (validated)         |
| Rate limit| `@nestjs/throttler`                  |
| Docs      | `@nestjs/swagger`                    |

## Project structure

```
src/
├── main.ts                        # bootstrap: helmet, CORS, pipes, filter, Swagger
├── app.module.ts                  # ConfigModule, TypeOrmModule, ThrottlerModule wiring
├── common/
│   ├── config/env.validation.ts   # environment schema validation
│   ├── decorators/                # @Public, @Roles, @CurrentUser
│   ├── enums/role.enum.ts         # USER | ADMIN
│   ├── filters/                   # HttpExceptionFilter (structured errors)
│   ├── guards/                    # JwtAuthGuard (global), RolesGuard, ApiKeyGuard
│   ├── interfaces/                # JwtPayload, RequestUser, AuthResponse
│   ├── middleware/logger.middleware.ts
│   └── common.module.ts           # registers global guards
├── auth/
│   ├── auth.service.ts            # register / login / refresh / logout + rotation
│   ├── auth.controller.ts         # endpoints, throttled, Swagger-annotated
│   ├── strategies/                # AtStrategy (Bearer), RtStrategy (body)
│   ├── guards/refresh-token.guard.ts
│   └── dto/                       # Register, Login, Refresh, response DTOs
└── users/
    ├── entities/user.entity.ts          # users table
    ├── entities/refresh-token.entity.ts # hashed refresh tokens table
    ├── users.service.ts
    ├── users.controller.ts              # /users/me + admin-only routes
    └── dto/update-role.dto.ts
test/
├── auth.e2e-spec.ts               # full auth flow e2e test
└── app.e2e-spec.ts
```

## Setup

### 1. Prerequisites

- Node.js ≥ 20
- PostgreSQL running locally with a database created:
  ```sql
  CREATE DATABASE "Testing_one";
  ```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# then edit .env with your DB credentials and secrets
```

Generate JWT secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `.env` is gitignored — never commit real secrets.

### 4. Run

```bash
npm run start:dev     # watch mode
npm run build && npm run start:prod
```

Tables are auto-created via TypeORM `synchronize` (dev only; disabled when `NODE_ENV=production`).

## Environment variables

| Variable             | Description                      | Default                     |
| -------------------- | -------------------------------- | --------------------------- |
| `NODE_ENV`           | `development` / `production`     | `development`               |
| `PORT`               | HTTP port                        | `3000`                      |
| `DATABASE_HOST`      | PostgreSQL host                  | `localhost`                 |
| `DATABASE_PORT`      | PostgreSQL port                  | `5432`                      |
| `DATABASE_USER`      | DB user                          | `postgres`                  |
| `DATABASE_PASSWORD`  | DB password                      | —                           |
| `DATABASE_NAME`      | DB name                          | —                           |
| `JWT_AT_SECRET`      | Access token signing secret (≥32 chars) | —                    |
| `JWT_RT_SECRET`      | Refresh token signing secret (≥32 chars) | —                   |
| `JWT_AT_EXPIRES_IN`  | Access token TTL (seconds)       | `900` (15 min)              |
| `JWT_RT_EXPIRES_IN`  | Refresh token TTL (seconds)      | `604800` (7 days)           |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost (10–12)              | `12`                        |
| `CORS_ORIGINS`       | Comma-separated allowed origins  | `http://localhost:3000,...` |
| `THROTTLE_TTL`       | Rate limit window (seconds)      | `60`                        |
| `THROTTLE_LIMIT`     | Max requests per window          | `10`                        |

## API endpoints

Base path: `/api`

### Auth (`/api/auth`) — rate limited

| Method | Endpoint  | Auth        | Description                                                       |
| ------ | --------- | ----------- | ----------------------------------------------------------------- |
| POST   | `/auth/register` | Public      | Register a user, returns `{ accessToken, refreshToken, user }` |
| POST   | `/auth/login`    | Public      | Login, returns `{ accessToken, refreshToken, user }`           |
| POST   | `/auth/refresh`  | Refresh token in body | Rotates the refresh token, returns a new pair               |
| POST   | `/auth/logout`   | Refresh token in body | Revokes the presented refresh token                            |
| GET    | `/auth/me`       | Bearer token | Returns the current user parsed from the access token            |

**Request example — register:**
```json
{
  "email": "user@example.com",
  "password": "Str0ngPass123"
}
```

**Response 201:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "a4c0...", "email": "user@example.com", "role": "USER" }
}
```

**Refresh** — send the refresh token in the JSON body:
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIs..." }
```

### Users (`/api/users`) — protected

| Method | Endpoint          | Auth                  | Description                   |
| ------ | ----------------- | --------------------- | ----------------------------- |
| GET    | `/users/me`       | Any authenticated user| Current user profile          |
| GET    | `/users`          | `ADMIN` only          | List all users (admin-only route example) |
| GET    | `/users/:id`      | `ADMIN` only          | Get a single user             |
| PATCH  | `/users/:id/role` | `ADMIN` only          | Change a user's role          |

**Authentication:** set the access token as a Bearer header:
```
Authorization: Bearer <accessToken>
```

## Security details

- **Password hashing** — bcrypt with 12 salt rounds; plaintext passwords are never stored.
- **Refresh token rotation** — on every `/auth/refresh` the old token is revoked in DB and a new hash is stored. Reusing a rotated/expired token revokes **all** of the user's refresh tokens (reuse detection).
- **No plaintext tokens in DB** — only `SHA-256` hashes of refresh tokens are persisted.
- **Generic login errors** — both wrong-password and unknown-email return the identical `401 Invalid email or password`.
- **Config validation** — the app refuses to start if a required env var is missing/invalid (`validateEnvironment`).
- **Rate limiting** — all `/auth` endpoints are capped at `THROTTLE_LIMIT` requests per `THROTTLE_TTL`.

## Swagger

Interactive docs with bearer-auth support:

```
http://localhost:3000/api/docs
```

## Testing

```bash
npm test          # unit tests (AuthService, AtStrategy, RtStrategy, JwtAuthGuard, RolesGuard, ...)
npm run test:e2e  # e2e: register → login → protected route → refresh/rotation → logout
npm run test:cov  # coverage
```

The e2e suite verifies the full security flow against the real database:

1. `register` returns an access + refresh token
2. duplicate registration → `409`
3. `login` returns a fresh pair
4. wrong password / unknown email → identical generic `401`
5. access a protected route with the access token → `200`
6. admin-only route with a `USER` role → `403`
7. `refresh` rotates the token; the old token can no longer be used (`401`)
8. `logout` revokes the presented refresh token