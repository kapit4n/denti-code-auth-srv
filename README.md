# denti-code-auth-srv

Authentication and authorization service for the denti-code platform. Manages users, roles, permissions, and JWT tokens.

## System Diagram

```
┌─────────────┐     POST /auth/login      ┌──────────────────┐
│   Client    │───────────────────────────►│  Auth Service    │
│  (Frontend) │                            │  (port 3004)     │
│             │◄──── { access_token }──────│                  │
└──────┬──────┘                            │                  │
       │                                   │  JWT (10m)       │
       │  Bearer token in header           │  bcrypt hashing  │
       ▼                                   │  RBAC (roles +   │
┌─────────────┐                            │   permissions)   │
│  API Gateway│── POST /auth/introspect ──►│  User CRUD       │
│  (port 3000)│◄── { active, roles } ──────│  Locale settings │
└─────────────┘                            └────────┬─────────┘
                                                    │
                                           user.registered event
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Broker Service  │
                                          │  (port 5000)     │
                                          └──────────────────┘
```

## Key Features

- **Registration & Login** — bcrypt-hashed passwords, JWT access tokens (10m expiry)
- **Token Introspection** — validate tokens and return user identity + roles for gateway
- **RBAC** — role-based access control with fine-grained permissions
- **Locale System** — two-tier: org default + user preference (en/es)
- **Event Publishing** — emits `user.registered` events to the message broker

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run prisma.seed
npm run start:dev
```

Server starts on `http://0.0.0.0:3004`.

## Docs

- [Architecture](./ARCHITECTURE.md)
- [Tech Stack](./TECH_STACK.md)
