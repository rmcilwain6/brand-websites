import Link from 'next/link';

import { fetchPublicPackages, type PublicPackage } from '@repo/core';

import { getServerEnv } from '../lib/env';
import { BuilderCard } from './builder-card';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ package?: string }>;
};

const PackageBuilderPage = async ({ searchParams }: Props) => {
  const { package: packageSlug } = await searchParams;
  const { ADMIN_API_BASE_URL } = getServerEnv();

  let packages: PublicPackage[] = [];
  try {
    packages = await fetchPublicPackages(ADMIN_API_BASE_URL, { next: { revalidate: 60 } });
  } catch {
    // Graceful degradation
  }

  const pkg =
    (packageSlug ? packages.find((p) => p.slug === packageSlug) : undefined) ?? packages[0];

  if (!pkg) {
    return (
      <main className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Package builder
          </p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">No packages available yet.</h1>
          <p className="mb-8 text-base leading-relaxed text-ink-muted">
            Packages are still being finalized. In the meantime, reach out directly.
          </p>
          <Link
            href="/contact"
            className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Get in touch
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      {/* Package selector (shown when multiple packages exist) */}
      {packages.length > 1 && (
        <nav className="mx-auto mb-8 flex max-w-xl flex-wrap gap-2" aria-label="Switch package">
          {packages.map((p) => (
            <Link
              key={p.id}
              href={`/package-builder?package=${p.slug}`}
              className={[
                'rounded-card border px-4 py-2 text-sm font-medium transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                p.slug === pkg.slug
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-border text-ink-muted hover:border-ink-muted hover:text-ink'
              ].join(' ')}
            >
              {p.name}
            </Link>
          ))}
        </nav>
      )}

      <BuilderCard key={pkg.id} pkg={pkg} />
    </main>
  );
};

export default PackageBuilderPage;
