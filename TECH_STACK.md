# Tech Stack

| Layer              | Technology                              |
|--------------------|-----------------------------------------|
| Runtime            | Node.js                                 |
| Language           | TypeScript (SWC-compiled)               |
| Framework          | NestJS v11                              |
| ORM                | Prisma v6                               |
| Database           | SQLite (dev) / PostgreSQL (production)  |
| Auth               | Passport + passport-jwt + bcrypt        |
| JWT                | @nestjs/jwt + jsonwebtoken              |
| Validation         | class-validator + class-transformer     |
| HTTP Client        | axios v1.10                             |
| Testing            | Jest + supertest                        |
| Linting            | ESLint 9 + Prettier                     |

## Key Dependencies

| Package                    | Purpose                                 |
|----------------------------|-----------------------------------------|
| @nestjs/core v11           | NestJS framework                        |
| @nestjs/jwt                | JWT token generation & validation       |
| @nestjs/passport           | Passport integration                    |
| @prisma/client v6          | Type-safe database client               |
| prisma v6                  | Schema management, migrations           |
| bcrypt                     | Password hashing                        |
| passport-jwt               | JWT authentication strategy             |
| class-validator            | DTO validation decorators               |
| class-transformer          | Payload transformation                  |
| axios v1.10                | HTTP client for event publishing        |

## Scripts

| Command               | Description                     |
|-----------------------|---------------------------------|
| `npm run start:dev`   | Start with hot-reload           |
| `npm run build`       | Compile via nest build          |
| `npm start`           | Run compiled server             |
| `npm test`            | Run unit tests                  |
| `npm run test:e2e`    | Run end-to-end tests            |
| `npm run lint`        | ESLint with --fix               |
| `npm run prisma.seed` | Seed database                   |

## Environment Variables

| Variable                     | Default                    | Description                           |
|------------------------------|----------------------------|---------------------------------------|
| `PORT`                       | `3004`                     | HTTP server port                      |
| `DATABASE_URL_AUTH`          | `file:./prisma/auth.db`    | Prisma database connection string     |
| `JWT_SECRET`                 | —                          | JWT signing secret                    |
| `JWT_REFRESH_SECRET`         | —                          | Refresh token secret                  |
| `BROKER_PUBLISH_URL`         | `http://localhost:5000/api/publish` | Event broker URL            |
| `PATIENT_SERVICE_URL`        | `http://localhost:3001`    | Patient Service base URL              |
| `CLINIC_PROVIDER_SERVICE_URL`| `http://localhost:3002`    | Clinic & Provider Service URL         |
| `APPOINTMENTS_RECORDS_SERVICE_URL` | `http://localhost:3003` | Appointments Service URL      |

## Seed Data

Default users (password: `Password123!`):

| Email                          | Role      |
|--------------------------------|-----------|
| admin@denti-code.com           | ADMIN     |
| susan.storm@denti-code.com     | DOCTOR    |
| peter.parker@denti-code.com    | DOCTOR    |
| patient1-5@denti-code.com      | PATIENT   |
