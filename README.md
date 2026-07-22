# Paupahan — Next.js Frontend

Landlord/tenant management platform for boarding house and apartment owners.
This is the **Next.js frontend** (landing page scaffolded, dashboard/portal routes to be added).
Talks to a separate **Node.js/Express + PostgreSQL** backend via `NEXT_PUBLIC_API_URL`.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-based theme in `app/globals.css`)
- Prisma (schema in `prisma/schema.prisma`, mirrors the backend's Postgres schema —
  use this from the Node backend, or point Prisma directly at the same DB from here if you
  prefer Next.js API routes instead of a separate Express service)

## Getting started

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the env file and fill in real values:
   ```
   cp .env.example .env
   ```

3. (If using Prisma from this project) generate the client and run migrations:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run the dev server:
   ```
   npm run dev
   ```
   Open http://localhost:3000

## Project structure
```
app/
  layout.tsx        — root layout, loads Baloo 2 / Inter / IBM Plex Mono via next/font
  page.tsx           — assembles the landing page from components/landing/*
  globals.css        — Tailwind v4 theme tokens (brand colors) + custom keyframes
components/
  landing/
    Navbar.tsx        — sticky nav with mobile hamburger menu (client component)
    Hero.tsx           — hero section with the "resibo" receipt visual
    PainPoints.tsx
    Features.tsx
    HowItWorks.tsx
    Pricing.tsx         — Monthly / Quarterly / Annually tiers
    Faq.tsx              — accordion (client component)
    CtaBand.tsx
    Footer.tsx
    Button.tsx           — shared button component
lib/
  api.ts              — fetch wrapper for calling the Node/Express backend
prisma/
  schema.prisma         — full data model (users, properties, units, tenants,
                           leases, bills, payments, notifications, bookings,
                           maintenance, analytics, audit log)
.env.example
```

## Next steps to build out the full platform
1. Add `(dashboard)` route group for the landlord admin (protected by auth middleware)
2. Add `(portal)` route group for the tenant-facing app
3. Add `middleware.ts` to guard `/dashboard/*` and `/portal/*` based on JWT/session
4. Wire `lib/api.ts` calls into real pages (properties, units, tenants, bills)
5. Connect the pricing CTA buttons to your actual signup/checkout flow
6. Deploy: Vercel for this frontend, any Node host (Railway/Render/Fly) for the backend + Postgres

## Notes
- Google Fonts are fetched at build time by `next/font`; this requires normal internet
  access (this repo was built in a network-restricted sandbox where font fetching was
  blocked — it will work normally on your machine or in CI).
- The mobile nav menu had an earlier bug where `w-full` + horizontal margin caused
  buttons to overflow off-screen on narrow phones — fixed in `Navbar.tsx` by letting
  the flex column's `stretch` behavior size the buttons instead of forcing `width:100%`.
  Keep that in mind if you add more buttons inside flex containers with margins.