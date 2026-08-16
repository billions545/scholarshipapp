# Edu Bridge Point

A scholarship and international education application platform: students discover opportunities,
check eligibility, apply, pay, upload documents, and track their application through to enrolment —
while an internal admin/CRM side handles document review, status workflow, payments, agent
referrals, and partner commissions.

Built as a single Next.js app (App Router, TypeScript) on top of Prisma/SQLite and NextAuth.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Server Actions)
- **Database:** Prisma ORM, SQLite for local dev (swap the datasource for Postgres in production)
- **Auth:** NextAuth (credentials + JWT sessions), role-based access control
- **Payments:** provider-agnostic adapter (`src/lib/payments`) — a mock gateway for local dev, a
  real Paystack integration behind an env flag
- **Styling:** Tailwind CSS

## Getting started

```bash
npm install
cp .env.example .env   # fill in NEXTAUTH_SECRET at minimum
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seeded logins (all `password123`):
`admin@edubridgepoint.com`, `adviser@`, `reviewer@`, `finance@`, `agent@edubridgepoint.com`,
and a demo student at `student@example.com`.

## Payments

`PAYMENT_PROVIDER` in `.env` controls which gateway is active:

- `MOCK` (default) — a simulated hosted checkout, no external calls, safe for local dev.
- `PAYSTACK` — real Paystack integration. Requires `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY`
  and a webhook pointed at `/api/payments/webhooks/paystack`.

## Project structure

- `src/app` — routes, split into `(public)`, `/app` (student), `/admin`, `/agent`
- `src/lib/services` — domain logic (applications, documents, payments, commissions, agents)
- `src/lib/actions` — server actions calling into services, with auth/permission checks
- `prisma/schema.prisma` — data model; `prisma/seed.ts` — demo data
