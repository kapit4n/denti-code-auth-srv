# Architecture

## Overview

**denti-code-auth-srv** is the authentication and authorization microservice for the denti-code platform. It manages user registration, login, JWT tokens, RBAC roles, and permissions.

```
┌─────────────────────────────────────────────┐
│            denti-code-auth-srv               │
│            NestJS 11 · Prisma · SQLite       │
│            (port 3004)                       │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Auth Module                          │   │
│  │  POST /auth/register                  │   │
│  │  POST /auth/login                     │   │
│  │  GET  /auth/profile                   │   │
│  │  POST /auth/introspect ◄── Gateway    │   │
│  │  POST /auth/refresh                   │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Users Module (ADMIN)                │   │
│  │  CRUD /users + role assignment       │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Roles Module (ADMIN)                │   │
│  │  CRUD /roles + permission assignment │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  Permissions Module (ADMIN)          │   │
│  │  CRUD /permissions                   │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  App Settings Module                  │   │
│  │  Locale / default settings           │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
        │
        ▼  user.registered events
  ┌──────────────┐
  │  Broker Svc  │
  │  (port 5000) │
  └──────────────┘
```

## Project Structure

```
src/
  main.ts                        # Entry point — bootstrap NestJS
  app.module.ts                  # Root module
  config/
    index.ts                     # Environment variable loader
  prisma/
    prisma.module.ts             # Global Prisma module
    prisma.service.ts            # PrismaClient lifecycle
  locale/
    supported-locales.ts         # en, es locale definitions
  app-settings/
    app-settings.service.ts      # Default locale management
  middleware/
    authMiddleware.ts            # Express middleware for service-to-service auth
  auth/
    auth.module.ts
    auth.controller.ts           # Public auth endpoints
    auth.service.ts              # Registration, login, token issue, introspection
    jwt.strategy.ts              # Passport JWT strategy
    guards/
      jwt-auth.guard.ts          # JWT authentication guard
      roles.guard.ts             # Role-based authorization guard
      downstream-roles.guard.ts  # Header-based auth for inter-service calls
    decorators/
      roles.decorator.ts         # @Roles() decorator
    dto/
      register-user.dto.ts
      login-user.dto.ts
      update-my-profile.dto.ts
      update-default-locale.dto.ts
  users/
    users.module.ts
    users.controller.ts          # ADMIN-only user CRUD
    users.service.ts             # User business logic
    dto/
      update-user.dto.ts
      assign-role.dto.ts
  roles/
    roles.module.ts
    roles.controller.ts          # ADMIN-only role CRUD
    roles.service.ts             # Role + permission assignment
    dto/
      create-role.dto.ts
      update-role.dto.ts
      assign-permission.dto.ts
  permissions/
    permissions.module.ts
    permissions.controller.ts    # ADMIN-only permission CRUD
    permissions.service.ts
    dto/
      create-permission.dto.ts
      update-permission.dto.ts
prisma/
  schema.prisma                  # User, Role, Permission, RefreshToken models
  seed.ts                        # Seed data (admin, doctors, patients)
  migrations/
```

## Database Model

```
User ──╼ UserRole ──╼ Role ──╼ RolePermission ──╼ Permission

User (cuid PK, email, passwordHash, firstName, lastName, isActive)
  │
  └── RefreshToken (hashedToken, expiresAt, revoked)

AppSettings (singleton row: defaultLocale)
```

## Auth Flow

```
Client                    Gateway                  Auth Service
  │                         │                         │
  │  POST /auth/login       │                         │
  │────────────────────────►│                         │
  │                         │ POST /auth/login        │
  │                         │────────────────────────►│
  │                         │                         ├─ verify credentials
  │                         │                         ├─ sign JWT (10m expiry)
  │                         │                         └─ return { access_token }
  │                         │◄────────────────────────│
  │◄────────────────────────│                         │
  │                         │                         │
  │  GET /api/gateway/...   │                         │
  │  Authorization: Bearer..│                         │
  │────────────────────────►│                         │
  │                         │ POST /auth/introspect   │
  │                         │────────────────────────►│
  │                         │◄── { active, userId,    │
  │                         │      email, roles }     │
  │                         │                         │
  │                         ├── add x-user-* headers  │
  │                         ├── proxy to target       │
  │                         │                         │
```

## API Routes

### Public
| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| POST   | `/auth/register`      | Register new user               |
| POST   | `/auth/login`         | Login, get JWT                  |
| GET    | `/auth/locale`        | Get supported locales           |
| POST   | `/auth/introspect`    | Validate token (service-to-service) |

### Authenticated
| Method | Endpoint              | Auth   | Description              |
|--------|-----------------------|--------|--------------------------|
| GET    | `/auth/profile`       | JWT    | Get own profile          |
| PATCH  | `/auth/me`            | JWT    | Update own profile       |
| POST   | `/auth/refresh`       | JWT    | Refresh access token     |

### Admin Only
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| CRUD   | `/users/*`                        | User management          |
| CRUD   | `/roles/*`                        | Role management          |
| CRUD   | `/permissions/*`                  | Permission management    |
| PATCH  | `/auth/locale/default`            | Update org default locale|
