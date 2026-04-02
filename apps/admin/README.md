# admin

Internal CMS for Evryday Archive Co. Manages galleries, packages, reviews, and (eventually) bookings and availability. Built with Next.js 14 (App Router). Planned deployment at `admin.evrydayarchive.co`.

---

## Running locally

```bash
cp .env.example .env   # then fill in values
pnpm --filter admin dev   # runs on port 3001
```

Visit `http://localhost:3001/login` and enter the password from `ADMIN_PASSWORD`.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ADMIN_PASSWORD` | Login password for the admin UI |
| `AUTH_SECRET` | Session signing secret — any random string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Resend API key — for future email notifications |

---

## Authentication

Single-password session auth. Login at `/login`, logout via the sidebar. Session is signed with `AUTH_SECRET` and stored as a cookie. There are no user accounts — anyone with the password has full access.

---

## Features

| Section | Route | Status |
|---|---|---|
| Galleries | `/galleries` | Live — full CRUD, Cloudinary image upload, cover image selection, publish/unpublish |
| Packages | `/packages` | Live — CRUD with per-package modifiers |
| Reviews | `/reviews` | Live — CRUD, linked to galleries, displayed on public site |
| Availability slots | — | Not built — needed before `/book` can show available dates |
| Booking requests | — | Not built — needed to view and respond to incoming booking requests |
| Inquiries | — | Not built — needed to view and respond to inquiry form submissions |

---

## Public API endpoints

The public site reads data from these unauthenticated endpoints:

| Endpoint | Returns |
|---|---|
| `GET /api/public/galleries` | All published galleries (list) |
| `GET /api/public/galleries/[slug]` | Single gallery detail with images |
| `GET /api/public/galleries/[slug]/reviews` | Reviews for a gallery |
| `GET /api/public/packages` | All published packages with modifiers |

Response format is raw JSON (no envelope). The public site's `ADMIN_API_BASE_URL` must point to the deployed admin URL in production.

---

## Cloudinary

Images are uploaded from the admin UI directly to Cloudinary. The public site then serves them via a custom Next.js image loader that generates optimized Cloudinary URLs. All three Cloudinary env vars must be set for uploads to work.
