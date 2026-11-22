# MiracleShine Cleaning Service Backend

NestJS REST API for the MiracleShine website.

## Runtime

- Base URL: `http://localhost:3000/api/v1`
- Health: `GET /api/v1`
- Database: PostgreSQL through Prisma
- Authentication: HS256 bearer JWT plus bcrypt password hashing
- Validation: global Nest `ValidationPipe` with DTO whitelisting and transformation
- HTTP middleware: CORS, Helmet, and gzip compression

## Modules

- `auth`: registration, login, current-user lookup, optional authentication, and role guards
- `users`: customer profile operations and protected administrator provisioning
- `services`: public catalog and administrator catalog management
- `quote-requests`: quote submission, ownership, cancellation, and lifecycle status
- `contact-messages`: website submissions and administrator handling
- `reviews`: completed-quote reviews and administrator moderation
- `prisma`: PostgreSQL connection lifecycle

## Quote workflow

Quote requests use the existing statuses:

`PENDING` -> `SENT` -> `REJECTED`

Scheduling and walk-through arrangements are intentionally handled outside the application. The application stores quote requests and statuses only.

## Reviews

Each review is an independent record owned optionally by an authenticated customer. New reviews begin in `PENDING`, customers may submit multiple reviews, and only approved reviews are visible publicly.

## Setup

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`
- `JWT_SECRET`

`JWT_SECRET` must be at least 32 bytes and must not use the placeholder value.

For local Docker development:

```bash
docker compose up --build
```

For migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```
