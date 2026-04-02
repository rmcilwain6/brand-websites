# evrydayarchive-web

Public photography site for Evryday Archive Co. Built with Next.js 14 (App Router), Tailwind, and Cloudinary for image delivery. Deployed to Vercel at `evrydayarchive.co`.

---

## Running locally

```bash
cp .env.example .env   # then fill in values
pnpm --filter evrydayarchive-web dev   # runs on port 3000
```

The admin app must also be running for portfolio and package data to appear — the public site fetches from its API.

```bash
pnpm --filter admin dev   # runs on port 3001
```

### Environment variables

| Variable | Purpose |
|---|---|
| `ADMIN_API_BASE_URL` | Base URL of the admin app — galleries and packages are fetched from here |
| `DATABASE_URL` | Neon PostgreSQL connection string — used for waitlist writes only |
| `NEXT_PUBLIC_COMING_SOON` | Set `"true"` to redirect all routes to `/coming-soon` |
| `RESEND_API_KEY` | Resend API key — required when email notifications are wired up |
| `NOTIFICATION_EMAIL` | Address to receive booking/inquiry notifications |

---

## Coming-soon mode

Set `NEXT_PUBLIC_COMING_SOON=true` in the app's environment. Middleware will redirect every route to `/coming-soon` except `/api/*`. The coming-soon page includes a waitlist email capture form that writes directly to the DB.

To turn it off, remove the var (or set it to anything other than `"true"`). Requests to `/coming-soon` will then redirect back to `/`.

---

## Route map

| Route | Status | Notes |
|---|---|---|
| `/` | Live | Hero, brand intro, testimonials, location, CTA |
| `/portfolio` | Live | Gallery index — fetches live from admin API |
| `/portfolio/[slug]` | Live | Gallery detail — image grid, reviews |
| `/packages` | Live | Package list — fetches live from admin API |
| `/package-builder` | Partial | Modifier toggle UI exists; pricing calculation not wired |
| `/inquire` | Partial | Questionnaire UI complete; recommendation logic is a stub — see `app/inquire/recommendation.ts` and `requirements/guided-questionaire.md` |
| `/book` | Partial | Date/time picker UI styled; backend (`BookingRequest` submission) not wired |
| `/process` | Live | Process steps page |
| `/faq` | Live | FAQ accordion |
| `/contact` | Live | Contact form |
| `/about` | Live | About page with archive carousel |
| `/coming-soon` | Live | Waitlist capture — only active when `NEXT_PUBLIC_COMING_SOON=true` |

---

## Design system

Design tokens are defined in `app/globals.css` as CSS custom properties and consumed via Tailwind.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `canvas` | `#f7f4ef` | `#1b1a19` | Page background |
| `surface` | `#ffffff` | `#262423` | Cards, panels |
| `sun` | `#f3ede2` | `#252321` | Warm accent surfaces |
| `ink` | `#000000` | `#ffffff` | Primary text |
| `ink-muted` | `#2b2b2b` | `#faf6ef` | Secondary text |
| `accent` | `#f06f42` | same | Orange — CTAs, highlights |

Dark mode is applied via the `.dark` class on `<html>`, toggled by `ThemeProvider`. A FOUC-prevention script in the root layout reads `localStorage` and applies the class before first paint.

Key shared components: `Frame`, `Placard`, `SiteHeader`, `SiteFooter`, `Logo`, `MobileMenu`.

---

## Architecture notes

- All gallery and package data is fetched server-side from the admin API via `@repo/core` helpers (`fetchPublicGalleries`, `fetchPublicGalleryDetail`, `fetchPublicPackages`).
- Pages that fetch external data use `export const dynamic = 'force-dynamic'` with `{ next: { revalidate: 60 } }` on individual fetch calls.
- Images are served via Cloudinary using a custom Next.js image loader in `next.config.mjs`.
- Waitlist entries write directly to the Neon DB via `@repo/db` (the only place the public app touches the DB directly).
