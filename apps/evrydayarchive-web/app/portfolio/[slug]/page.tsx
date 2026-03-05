import { notFound } from 'next/navigation';

import { PublicApiError, fetchPublicGalleryDetail, type GalleryDetail } from '@repo/core';

import { getServerEnv } from '../../lib/env';
import { GalleryViewer } from '../../components/gallery-viewer';

export const dynamic = 'force-dynamic';

type Props = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

const GalleryDetailPage = async ({ params, searchParams }: Props) => {
  const { ADMIN_API_BASE_URL } = getServerEnv();
  let gallery: GalleryDetail | null = null;

  try {
    gallery = await fetchPublicGalleryDetail(ADMIN_API_BASE_URL, params.slug, {
      next: { revalidate: 60 }
    });
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }

    if (error instanceof Error) {
      console.warn('[portfolio] Failed to load gallery detail.', error.message);
    }
  }

  if (!gallery) {
    notFound();
  }

  // Derive initial panel from ?p= query param.
  // Panel 0 is the exhibit intro; 1…N are photo panels; N+1 is the closing panel.
  const pParam = searchParams.p;
  const rawPanel = typeof pParam === 'string' ? parseInt(pParam, 10) : 0;
  const totalPanels = gallery.images.length + 2;
  const initialPanel = Number.isFinite(rawPanel)
    ? Math.max(0, Math.min(totalPanels - 1, rawPanel))
    : 0;

  return <GalleryViewer gallery={gallery} initialPanel={initialPanel} />;
};

export default GalleryDetailPage;
