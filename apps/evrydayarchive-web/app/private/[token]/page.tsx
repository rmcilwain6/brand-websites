import { cookies } from 'next/headers';
import type { Metadata } from 'next';

import { PublicApiError, fetchPrivateGallery, type PrivateGalleryDetail } from '@repo/core';

import { getServerEnv } from '../../lib/env';
import { Frame } from '../../components/frame';
import { Placard } from '../../components/placard';
import Image from '../../components/img';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

const cookieName = (token: string) => `private_access_${token}`;

const PrivateGalleryPage = async ({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams?: { error?: string };
}) => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  const accessToken = cookies().get(cookieName(params.token))?.value;

  let gallery: PrivateGalleryDetail | null = null;

  if (accessToken) {
    try {
      gallery = await fetchPrivateGallery(ADMIN_API_BASE_URL, params.token, accessToken, {
        cache: 'no-store'
      });
    } catch (error) {
      if (!(error instanceof PublicApiError && error.status === 401)) {
        console.warn('[private-gallery] Failed to load gallery.', error);
      }
    }
  }

  if (!gallery) {
    const showError = searchParams?.error === '1';

    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-card border border-border bg-surface p-8">
          <h1 className="mb-2 text-xl font-semibold text-ink">Private gallery</h1>
          <p className="mb-6 text-sm text-ink-muted">
            This gallery is password-protected. Enter the password you were given to view it.
          </p>
          <form
            method="post"
            action={`/api/private-galleries/${params.token}`}
            className="space-y-4"
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-ink">
              Password
              <input
                name="password"
                type="password"
                autoComplete="off"
                required
                className="rounded-md border border-border px-3 py-2 text-sm"
              />
            </label>
            {showError && (
              <p className="text-sm text-red-600" role="alert">
                Incorrect password. Please try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90"
            >
              View gallery
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16 max-w-2xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-faint">
            {gallery.location ?? 'Private gallery'}
          </p>
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {gallery.title}
          </h1>
          {gallery.description && (
            <p className="text-base leading-relaxed text-ink-muted">{gallery.description}</p>
          )}
        </header>

        {gallery.images.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-ink-faint">No images have been added yet.</p>
          </div>
        ) : (
          <div className="columns-1 gap-8 sm:columns-2">
            {gallery.images.map((image, index) => (
              <figure key={image.id} className="mb-8 break-inside-avoid">
                <Frame>
                  <div
                    className="relative w-full overflow-hidden rounded-sm bg-sun"
                    style={{
                      aspectRatio:
                        image.width && image.height ? `${image.width} / ${image.height}` : '3 / 2'
                    }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Frame>

                {image.caption && (
                  <figcaption className="mt-3 pl-1">
                    <Placard title={image.caption} size="sm" />
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PrivateGalleryPage;
