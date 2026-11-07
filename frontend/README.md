# frontend

## Miracle Shine frontend integration

The public site remains accessible without an account. Service cards, quote-form options, and published reviews are loaded from the NestJS API; if those requests fail, the UI shows an explicit error instead of presenting local sample content.

### Routes and access

| Route | Audience | Purpose |
|---|---|---|
| `/`, `/services`, `/about`, `/reviews`, `/get-quote` | Public | Branded website, catalog, approved reviews, quote and contact forms |
| `/login`, `/register` | Customers | Customer sign-in and registration |
| `/admin/login` | Administrators | Shared API sign-in with administrator role verification |
| `/account` | Customers | Live quote and appointment overview |
| `/account/quotes`, `/account/quotes/:id` | Customers | Own requests, details, cancellation, and appointment requests |
| `/account/appointments`, `/account/settings` | Customers | Appointments, completed-appointment reviews, and profile updates |
| `/admin` | Administrators | Live counts derived from backend lists |
| `/admin/quotes`, `/admin/quotes/:id` | Administrators | Search, details, and supported quote status transitions |
| `/admin/services` | Administrators | Service catalog CRUD and availability |
| `/admin/appointments`, `/admin/messages`, `/admin/reviews` | Administrators | Scheduling status, contact inbox, and review moderation |
| `/admin/settings` | Administrators | Authenticated profile updates |

Protected routes verify the current user through `GET /auth/me` after refresh and check the returned role before rendering. The API client sends the backend JWT as a bearer token from `sessionStorage`; `401` responses clear it. Authorization and customer ownership remain enforced by the backend.

### Backend endpoint coverage

All requests use the configured `VITE_API_BASE_URL` (defaults to `http://localhost:3000`) with the `/api/v1` prefix.

| Backend module / endpoint | Frontend integration |
|---|---|
| `GET /` (API health check) | Not exposed as a page feature; infrastructure and deployment health monitoring should call it directly |
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Customer registration, both role-specific sign-in pages, session restoration |
| `GET/PATCH /users/me` | Customer and administrator account settings |
| `GET /users/:id` | Not exposed: self-profile uses `/users/me`; the API only permits arbitrary profile lookup for admins and the UI has no supported customer directory |
| `POST /users/admin` | Not exposed: administrator provisioning is an administrative setup operation, not a public account workflow |
| `GET /services`, `GET /services/slug/:slug`, `GET /services/:id` | Public catalog and quote selection use `GET /services`; detail routes are not needed by the current page design |
| `GET /admin/services`, `POST/PATCH/DELETE /services` | Administrator catalog management; deletion deactivates entries referenced by quotes, per backend behavior |
| `POST /admin/services/reset-defaults` | Not exposed: this operation resets catalog data and is not required for normal catalog management |
| `POST /quote-requests`, `GET /quote-requests/me`, `GET /quote-requests/:id`, `POST /quote-requests/:id/cancel` | Guest/account quote form, customer dashboard and details, cancellation |
| `GET /admin/quote-requests`, `GET /admin/quote-requests/:id`, `PATCH /admin/quote-requests/:id/status` | Admin filters, details, dashboard metrics, and lifecycle updates |
| `POST /appointments`, `GET /appointments/me`, `GET /appointments/:id`, `POST /appointments/:id/cancel` | Customer scheduling requests, appointment list, cancellation; standalone appointment detail is not needed because the quote detail includes its appointment |
| `GET /admin/appointments`, `PATCH /admin/appointments/:id/status` | Administrator schedule and supported appointment state changes |
| `POST /contact-messages`, `GET /admin/contact-messages`, `GET /contact-messages/:id`, `PATCH /admin/contact-messages/:id/status` | Contact form, admin inbox, status tracking; the admin list already includes the message contents, so its standalone detail endpoint is not needed |
| `GET /reviews`, `POST /reviews`, `GET /admin/reviews`, `PATCH /admin/reviews/:id/status` | Public approved reviews, customer submission after completed appointments, and admin moderation |

The backend has no customer-list/statistics endpoint, password-change endpoint, or email-reply endpoint. The administrator portal therefore does not display a fabricated customer directory; contact replies open a prefilled `mailto:` draft and do not claim to send mail. Password changes are not presented as a working feature. Dashboard totals are calculated from the authenticated backend list responses.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
