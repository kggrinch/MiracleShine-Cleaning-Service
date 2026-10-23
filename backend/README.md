<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# MiracleShine Cleaning Service Backend Architecture

This backend powers the MiracleShine cleaning service website and handles the core workflows for customers and administrators: registration, service catalog management, quote requests, appointments, contact submissions, and review moderation.

It is built with NestJS, Prisma, and PostgreSQL, and it follows a module-based architecture aligned to the existing database schema.

## 1. Overview

The application exposes all routes under a global prefix:

- Base URL: `http://localhost:3000/api/v1`
- Health check: `GET /api/v1`

Example response:

```json
{
  "status": "ok"
}
```

The backend is organized around feature modules in `src/modules/`:

- `auth` — customer registration, login, and current-user access
- `users` — self-service profile lookup and updates
- `services` — service catalog browsing and admin catalog management
- `quote-requests` — quote submission and lifecycle management
- `appointments` — appointment scheduling and admin status updates
- `contact-messages` — contact form submissions and admin handling
- `reviews` — review submission, visibility, and moderation

## 2. Technology stack

- NestJS 11
- TypeScript
- Prisma ORM with PostgreSQL
- PostgreSQL database via Prisma adapter
- class-validator / class-transformer for DTO validation
- bcrypt for password hashing
- Helmet and compression middleware for HTTP hardening
- Jest for unit and e2e testing

## 3. Project structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── services/
│   │   ├── quote-requests/
│   │   ├── appointments/
│   │   ├── contact-messages/
│   │   └── reviews/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── ...
├── test/
│   ├── e2e/
│   └── unit/
├── .env.example
├── package.json
├── README.md
└── tsconfig.json
```

## 4. Bootstrap and runtime configuration

`src/main.ts` configures the app with:

- `app.setGlobalPrefix('api/v1')`
- CORS enabled via `CORS_ORIGIN`
- Helmet security headers
- gzip/compression middleware
- global `ValidationPipe({ whitelist: true, transform: true })`

Example `.env` values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/miracle_shine?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
JWT_SECRET="replace-me-in-production"
```

Set `JWT_SECRET` to a randomly generated value of at least 32 bytes. The application refuses to start when it is missing or too short. Do not use the placeholder shown here as a real secret.

## 5. Database model summary

The main schema is defined in `prisma/schema.prisma` and includes these principal models:

| Model | Purpose |
|---|---|
| `User` | Account holders, customer/admin identities, contact data |
| `Service` | Cleaning catalog items including category, pricing, and active state |
| `QuoteRequest` | Quote requests submitted by customers |
| `Appointment` | Confirmed or scheduled cleaning jobs |
| `ContactMessage` | Website contact submissions |
| `Review` | Customer review records after appointments |

### Enums

The backend uses the following enums:

- `UserRole`: `CUSTOMER`, `ADMIN`
- `ServiceCategory`: `RESIDENTIAL`, `COMMERCIAL`, `SPECIALTY`
- `PropertyType`: `HOUSE`, `APARTMENT`, `OFFICE`, `OTHER`
- `QuoteStatus`: `PENDING`, `CONTACTED`, `QUOTED`, `ACCEPTED`, `DECLINED`, `COMPLETED`
- `AppointmentStatus`: `REQUESTED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
- `ContactMessageStatus`: `NEW`, `READ`, `RESPONDED`, `CLOSED`
- `ReviewStatus`: `PENDING`, `APPROVED`, `REJECTED`

### Relationship logic

- A `User` can have many `QuoteRequest`s and `ContactMessage`s.
- A `Service` can be referenced by many quote requests.
- Each `QuoteRequest` can optionally connect to a `User` and must connect to a `Service`.
- Each `QuoteRequest` can have at most one `Appointment`.
- Each `Appointment` can have at most one `Review`.
- `Service` records are deactivated instead of hard-deleted when historical records depend on them.

## 6. Authentication and authorization

### Current auth model

The API accepts only signed HS256 JWTs in the `Authorization: Bearer <token>` header. Tokens expire after one hour, and each request reloads the user from the database so inactive accounts are rejected. Caller-controlled identity headers do not establish identity or authorization.

Legacy examples such as demo tokens, `x-user-token`, `x-user-id`, and `x-user-role` are obsolete and not accepted.

- `Authorization: Bearer demo-<user-id>`
- `x-user-token: demo-<user-id>`
- `x-user-id: <user-id>`
- `x-user-role: ADMIN` (used in compatibility checks)

The flow is handled by:

- `AuthGuard` — verifies a token and attaches the current user to `req.user`
- `RolesGuard` — checks admin permissions based on metadata
- `@RequireRoles('ADMIN')` — declarative admin restriction
- `CurrentUser` pattern — helper for accessing the current user in the request

### Registration

`POST /api/v1/auth/register`

Creates a new customer account using password hashing.

Required payload:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "StrongPass123!",
  "phone": "+1-555-0123"
}
```

Response:

```json
{
  "token": "<signed JWT>",
  "user": {
    "id": "8c2b11cb-131d-4d53-9e35-2d43d8b5d7f0",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0123",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Login

`POST /api/v1/auth/login`

Required payload:

```json
{
  "email": "jane@example.com",
  "password": "StrongPass123!"
}
```

Returns the same token + safe user payload as registration.

### Current user profile

`GET /api/v1/auth/me`

Requires the auth guard. Returns the currently authenticated user profile with password excluded.

## 7. API reference

### 7.1 Global endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1` | System health check | No |

### 7.2 Auth endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new customer account | No |
| `POST` | `/api/v1/auth/login` | Sign in with email and password | No |
| `GET` | `/api/v1/auth/me` | Fetch the current authenticated user | Yes |

### 7.3 Users endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Fetch current user profile | Yes |
| `PATCH` | `/api/v1/users/me` | Update current user profile | Yes |
| `GET` | `/api/v1/users/:id` | Fetch a specific user if the caller is that user or an admin | Yes |
| `POST` | `/api/v1/users/admin` | Create another administrator | Admin |

User update payload example:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-9999",
  "email": "jane.smith@example.com"
}
```

### 7.4 Service catalog endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/services` | List public services | No |
| `GET` | `/api/v1/services/slug/:slug` | Lookup a service by slug | No |
| `GET` | `/api/v1/services/:id` | Fetch one service by ID | No |
| `POST` | `/api/v1/services` | Create a service | Admin |
| `PATCH` | `/api/v1/services/:id` | Update a service | Admin |
| `DELETE` | `/api/v1/services/:id` | Soft delete or deactivate a service | Admin |
| `GET` | `/api/v1/admin/services` | List services for admin users | Admin |
| `POST` | `/api/v1/admin/services/reset-defaults` | Reset the default catalog entries | Admin |

Query parameters for `GET /api/v1/services`:

- `category`: `RESIDENTIAL`, `COMMERCIAL`, `SPECIALTY`
- `search`: free-text search across name and description

Example:

```bash
GET /api/v1/services?category=RESIDENTIAL&search=deep
```

The public catalog only returns active services; the admin catalog endpoint can list inactive entries.

### 7.5 Quote request endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/quote-requests` | Create a new quote request | Optional |
| `GET` | `/api/v1/quote-requests/me` | Fetch current customer's quote requests | Yes |
| `GET` | `/api/v1/quote-requests/:id` | Fetch one quote request | Yes |
| `POST` | `/api/v1/quote-requests/:id/cancel` | Cancel a quote request | Yes |
| `GET` | `/api/v1/admin/quote-requests` | List all quote requests as admin | Admin |
| `GET` | `/api/v1/admin/quote-requests/:id` | Fetch one quote request as admin | Admin |
| `PATCH` | `/api/v1/admin/quote-requests/:id/status` | Update quote status | Admin |

Create quote example:

```json
{
  "serviceId": "4f5d7cb2-3a58-4648-bf34-0ad9ddcd2e10",
  "customerFirstName": "Jane",
  "customerLastName": "Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+1-555-1111",
  "propertyType": "HOUSE",
  "squareFootage": 1800,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "streetAddress": "123 Main St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "preferredDate": "2026-10-25",
  "preferredTime": "09:30",
  "notes": "Need a deep clean before move-in."
}
```

Allowed admin transitions:

- `PENDING` -> `CONTACTED`, `QUOTED`, `DECLINED`, `ACCEPTED`, `COMPLETED`
- `CONTACTED` -> `QUOTED`, `DECLINED`, `ACCEPTED`, `COMPLETED`
- `QUOTED` -> `ACCEPTED`, `DECLINED`, `COMPLETED`
- `ACCEPTED` -> `COMPLETED`

### 7.6 Appointment endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/appointments` | Create an appointment for a quote request | Yes |
| `GET` | `/api/v1/appointments/me` | List appointments for the current customer | Yes |
| `GET` | `/api/v1/appointments/:id` | Fetch one appointment | Yes |
| `POST` | `/api/v1/appointments/:id/cancel` | Cancel an appointment | Yes |
| `GET` | `/api/v1/admin/appointments` | List all appointments | Admin |
| `PATCH` | `/api/v1/admin/appointments/:id/status` | Update appointment status | Admin |

Appointment creation example:

```json
{
  "quoteRequestId": "ba29feca-d88f-46d0-a0b4-9b15ddc150f6",
  "scheduledDate": "2026-10-28",
  "startTime": "09:00",
  "endTime": "11:30",
  "notes": "Please focus on kitchen and bath areas."
}
```

### 7.7 Contact message endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/contact-messages` | Submit a website contact form | No |
| `GET` | `/api/v1/contact-messages/:id` | Fetch one message | Admin |
| `GET` | `/api/v1/admin/contact-messages` | List all contact messages | Admin |
| `PATCH` | `/api/v1/admin/contact-messages/:id/status` | Update a contact message status | Admin |

Example payload:

```json
{
  "customerName": "Jordan Lee",
  "email": "jordan@example.com",
  "phone": "+1-555-3333",
  "subject": "Request a quote",
  "message": "Hi, we need a recurring cleaning plan for our office."
}
```

### 7.8 Review endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/reviews` | Public approved reviews only | No |
| `POST` | `/api/v1/reviews` | Submit a review for your completed appointment | Yes |
| `GET` | `/api/v1/admin/reviews` | View all reviews | Admin |
| `PATCH` | `/api/v1/admin/reviews/:id/status` | Approve or reject review | Admin |

Example review payload:

```json
{
  "appointmentId": "b5b9492e-9b2b-4d79-bf2a-c0dd1d8a8cce",
  "rating": 5,
  "comment": "Excellent cleaning service and very professional team."
}
```

## 8. Business rules and validation patterns

The backend is intentionally strict about data quality and workflow integrity:

- Email uniqueness is enforced for user accounts.
- User-facing fields are validated using DTOs and `ValidationPipe`.
- Services cannot be deleted when they are referenced by historical quote requests; they are deactivated instead.
- Duplicate appointments for the same quote request are rejected.
- Duplicate reviews for the same appointment are rejected.
- Status transitions are restricted to valid lifecycle sequences.
- Public reviews are filtered to only `APPROVED` records.
- Unauthenticated requests to protected routes are blocked.

## 9. Error handling conventions

The API uses standard NestJS exceptions:

- `400 Bad Request` — invalid payloads or invalid workflow transitions
- `401 Unauthorized` — missing or invalid authentication
- `403 Forbidden` — authenticated user lacks required admin access
- `404 Not Found` — resource not found
- `409 Conflict` — unique-value conflicts such as duplicate email

## 10. Testing and validation

Run the project checks from the `backend` directory:

```bash
npm install
npx prisma generate
npm run test
npm run test:e2e
npm run build
```

Current tests cover:

- authentication, authorization, and customer ownership checks
- quote, appointment, contact-message, service, user, and review business rules
- DTO validation and database error handling
- admin creation and first-admin bootstrap locking

## 11. Local development workflow

```bash
cp .env.example .env
npm install
npx prisma generate
npm run start:dev
```

Then open the app at:

- API base: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/api/v1`

## 12. Notes and caveats

This implementation is a solid backend foundation for local development and product validation, but it is not yet a full production-grade identity system.

Current limitations include:

- token revocation is not immediate; tokens remain usable for up to one hour unless the account is deactivated
- no outbound messaging/email integration yet
- no production secret rotation or refresh-token/session management

These are intentional choices for the current stage of the project, and the API is structured so it can be upgraded cleanly as the product matures.

## 13. Administrator account creation

Public `POST /api/v1/auth/register` always creates a `CUSTOMER`; the service assigns that role regardless of submitted input. An existing administrator can create another admin with `POST /api/v1/users/admin`, using the same name, email, and password fields as registration. The endpoint requires a signed admin token, rejects duplicate email addresses, hashes the password, and returns a safe user object.

### Create the first administrator

There is no unauthenticated HTTP bootstrap endpoint. Create the initial admin by running the explicit one-time CLI command from the `backend` directory after the database has been migrated:

```powershell
$env:ADMIN_FIRST_NAME = Read-Host "Administrator first name"
$env:ADMIN_LAST_NAME = Read-Host "Administrator last name"
$env:ADMIN_EMAIL = Read-Host "Administrator email"
$securePassword = Read-Host "Administrator password (12+ characters)" -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
npm run admin:bootstrap
Remove-Item Env:ADMIN_FIRST_NAME, Env:ADMIN_LAST_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

Provide `DATABASE_URL` through the backend `.env` file or process environment. The bootstrap command only creates an account; it does not reset or seed data. It obtains a PostgreSQL transaction-scoped advisory lock before checking for an existing admin, so simultaneous attempts serialize and only the first can succeed. If an administrator already exists, use the protected API endpoint instead.

For API startup, configure `JWT_SECRET` in the backend environment with at least 32 random bytes. Generate one in PowerShell without printing it:

```powershell
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 48
$random.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$random.Dispose()
```

Persist the generated value in your local secret store or untracked environment file for subsequent application starts. Docker Compose also requires `JWT_SECRET`. Seed code, seed data, and automatic seed commands are unchanged.
