# AGENTS.md

## Project overview

Build a production-ready e-commerce application that lets customers:

- Register and sign in with email and password.
- Register and sign in through Google OAuth.
- Browse, search, filter, and sort products.
- View product details and manage a persistent shopping cart.
- Complete purchases through Stripe Checkout.
- View their profile, order history, and order details.

The application will be developed locally, versioned with Git, and deployed to
Render.

## Current repository state

This repository starts as an empty, greenfield project. Unless the user later
provides an existing API repository or API contract, build both the REST API and
the interactive client here.

Do not assume an endpoint, schema, package, or deployment service already exists.
Inspect the repository before each substantial change and preserve unrelated user
work.

## Intended architecture

Use a JavaScript/TypeScript monorepo with these primary applications:

- `client`: React application, preferably using Vite and TypeScript.
- `server`: Node.js REST API, preferably using Express and TypeScript.
- PostgreSQL as the source of truth for application data.
- Stripe Checkout for card payments.
- Google OAuth for third-party authentication.
- Render for the PostgreSQL database, API, and static client deployment.

Keep shared contracts or validation schemas in a small shared workspace only when
both applications genuinely use them. Avoid premature abstraction.

## Delivery plan

Implement the project in this order:

1. Initialize Git and the client/server workspace, tooling, and environment
   templates.
2. Define the database schema, migrations, and development seed data.
3. Add the API foundation: configuration validation, database access, security
   middleware, logging, validation, errors, health checks, and versioned routes.
4. Implement email/password authentication, Google OAuth, logout, current-user
   lookup, and authorization.
5. Build catalog APIs and responsive product listing/detail pages.
6. Build persistent cart APIs and UI with stock and pricing validation.
7. Integrate Stripe Checkout and verified webhooks with idempotent order updates.
8. Build profile, order-history, and order-detail pages.
9. Add automated tests, accessibility checks, and production build verification.
10. Configure and deploy the database, API, and client on Render.
11. Complete setup, API, testing, and deployment documentation.

Prefer small, reviewable increments. Each increment should leave the repository in
a runnable state when practical.

## Domain model

Plan for at least these entities:

- User
- OAuth identity/account
- Product
- Category
- Cart and cart item
- Address
- Order and order item
- Payment

Store immutable order-item snapshots, including product name and unit price, so
historical orders do not change when catalog records change. Use integer minor
currency units (for example, pence or cents), never floating-point values, for
prices and totals.

## API conventions

- Place application endpoints under a versioned prefix such as `/api/v1`.
- Use resource-oriented routes and appropriate HTTP status codes.
- Validate all request params, query strings, and bodies at the API boundary.
- Return a consistent JSON error shape without exposing stack traces or secrets.
- Paginate endpoints that can return an unbounded collection.
- Enforce authentication and resource ownership on the server, not only in the UI.
- Calculate cart and order prices on the server from trusted database records.
- Treat client-submitted prices, totals, roles, ownership IDs, and payment states as
  untrusted input.
- Keep controllers thin; put reusable business rules in services and data access in
  dedicated modules.
- Provide health/readiness endpoints suitable for Render monitoring.

## Authentication and security

- Hash passwords with a modern adaptive password hasher. Never store or log plain
  passwords.
- Prefer secure, HTTP-only, same-site cookies for browser authentication. Document
  any cross-origin cookie configuration required by the deployed client and API.
- Rotate or expire authentication sessions/tokens appropriately.
- Protect authentication endpoints with reasonable rate limiting.
- Validate OAuth `state`, redirect URIs, and account-linking behavior.
- Keep secrets in environment variables and provide placeholders only in
  `.env.example`.
- Never commit API keys, OAuth secrets, database credentials, webhook secrets, or
  real customer data.
- Configure CORS to allow only known client origins outside local development.
- Apply secure HTTP headers and size limits to incoming requests.

## Stripe and order rules

- Create Stripe Checkout Sessions on the server.
- Use database product data to build Checkout line items.
- Verify every Stripe webhook signature using the raw request body.
- Make webhook processing idempotent; duplicate events must not create duplicate
  orders or transitions.
- Record the Stripe session/payment identifiers needed for reconciliation.
- Do not mark an order paid based only on a browser redirect. The verified webhook
  is authoritative.
- Define explicit order and payment state transitions and reject invalid ones.
- Revalidate product availability before starting checkout.

## Client conventions

- Use functional React components and TypeScript.
- Organize code by feature where practical, with reusable primitives kept small.
- Keep remote server state separate from ephemeral UI state.
- Centralize API access, authentication behavior, and error normalization.
- Provide accessible labels, keyboard navigation, visible focus states, and semantic
  HTML.
- Every data-driven view must handle loading, empty, error, and success states.
- Design mobile-first and verify common mobile and desktop widths.
- Do not rely on hidden UI controls for authorization; the API remains the source of
  truth.

## Database and migration rules

- Change the database through checked-in migrations; do not rely on manual schema
  edits.
- Add indexes for foreign keys and frequently queried catalog/order fields.
- Use database constraints for uniqueness, required relationships, and valid data
  where possible.
- Keep seed data deterministic and safe to rerun in development.
- Do not run destructive production migrations or delete production data without
  explicit user approval and a recovery plan.

## Environment configuration

Validate required configuration at server startup. Expect variables covering at
least:

- Application environment and ports
- PostgreSQL connection URL
- Client and API public origins
- Session or token secrets
- Google OAuth client ID, client secret, and callback URL
- Stripe secret key, publishable key, and webhook secret

Keep environment-specific values out of source code. Update `.env.example` and the
README whenever configuration changes.

## Testing and verification

Every substantive change should include or update relevant tests. Prioritize:

- Registration, login, logout, OAuth callback, and protected routes
- Authorization and cross-user access prevention
- Catalog filtering, sorting, pagination, and product detail behavior
- Cart calculations, stock validation, and guest-to-user cart behavior
- Checkout creation, webhook verification, idempotency, and order transitions
- Order history and order ownership
- Critical client flows and accessible interactions

Before handing off a change, run the narrowest relevant tests first, then the
project-wide checks available in `package.json`. Once scripts exist, the standard
verification target should cover:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

If a command cannot run, report exactly what was skipped and why. Do not claim a
check passed unless it was executed successfully.

## Git workflow

- Use Git for all project work once the repository is initialized.
- Keep commits focused on one coherent milestone or fix.
- Use clear imperative commit messages.
- Do not rewrite user history, force-push, reset, or discard unrelated changes.
- Inspect `git status` before and after editing.
- Do not commit generated build output, dependency directories, secrets, or local
  environment files.

## Documentation requirements

Maintain a root README that explains:

- Architecture and repository layout
- Prerequisites and local setup
- Environment variables
- Database migration and seed commands
- Development, lint, test, typecheck, and build commands
- Stripe CLI webhook testing
- Google OAuth setup
- Render deployment and production migration steps
- Demo or seed credentials that contain no real secrets

Document meaningful API behavior either in the README or an OpenAPI specification.

## Definition of done

A feature is complete only when:

- Its happy path and important failure paths work.
- Boundary input is validated.
- Authentication and authorization implications are handled.
- Relevant automated tests pass.
- Lint, typecheck, and build checks pass when applicable.
- Environment templates and documentation are current.
- No credentials, sensitive data, debug logging, or known payment shortcuts remain.

