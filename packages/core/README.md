# @repo/core

Shared types, Zod schemas, API helpers, and utilities used by both `apps/evrydayarchive-web` and `apps/admin`. No framework dependencies — plain TypeScript.

---

## Schemas (`@repo/core`)

Zod schemas for all domain entities. Import the schema and its inferred type together:

```ts
import { GalleryDetailSchema, type GalleryDetail } from '@repo/core';
```

| Schema | Entity |
|---|---|
| `GalleryListResponseSchema`, `GalleryListItem` | Gallery index list |
| `GalleryDetailSchema`, `GalleryDetail` | Single gallery with images and reviews |
| `PublicPackageSchema`, `PublicPackage` | Package with modifiers |
| `InquirySchema` | Inquiry form submission |
| `BookingRequestSchema` | Booking request submission |
| `WaitlistEntrySchema` | Waitlist email capture |
| `ReviewSchema` | Client review/testimonial |

---

## API helpers

Typed fetch wrappers for the admin's public API endpoints. Used server-side in the public app.

```ts
import { fetchPublicGalleries, fetchPublicGalleryDetail, fetchPublicPackages } from '@repo/core';

const galleries = await fetchPublicGalleries(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
const gallery  = await fetchPublicGalleryDetail(ADMIN_API_BASE_URL, slug);
const packages = await fetchPublicPackages(ADMIN_API_BASE_URL);
```

All three throw `PublicApiError` (with a `.status` property) on non-OK responses.

---

## Response utilities

Standard envelope helpers used in API route handlers:

```ts
import { jsonOk, jsonError, parseJson } from '@repo/core';

export const POST = async (req: Request) => {
  const result = await parseJson(req, MySchema);
  if (!result.ok) return jsonError(result.error);
  return jsonOk({ received: true });
};
```

Success envelope: `{ ok: true, data }`. Error envelope: `{ ok: false, error: { code, message, details } }`.

---

## Env loading

`loadEnv` validates environment variables against a Zod schema and throws clearly if anything is missing. Apps define their own typed wrappers around it:

```ts
import { loadEnv } from '@repo/core';
const env = loadEnv(z.object({ DATABASE_URL: z.string().min(1) }));
```

---

## Testing helpers

`@repo/core/testing` exports factory functions for building test fixtures:

```ts
import { makeGallery, makePackage } from '@repo/core/testing';
```
