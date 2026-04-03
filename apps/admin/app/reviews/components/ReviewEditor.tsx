'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '../../components/Toaster';

type Gallery = {
  id: string;
  title: string;
  slug: string;
};

type ImageAsset = {
  id: string;
  src: string;
  alt: string;
};

type GalleryImage = {
  id: string;
  imageAsset: ImageAsset;
};

type GalleryWithImages = Gallery & {
  images: GalleryImage[];
};

type Review = {
  id: string;
  clientName: string;
  quote: string;
  sessionType: string | null;
  sessionDate: string | null;
  galleryId: string | null;
  imageAssetId: string | null;
  isPublished: boolean;
  featuredOnHome: boolean;
};

type ReviewEditorProps = {
  review: Review;
  galleries: GalleryWithImages[];
  allImageAssets: ImageAsset[];
};

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return '';
  return iso.slice(0, 10);
};

const ReviewEditor = ({ review, galleries, allImageAssets }: ReviewEditorProps) => {
  const router = useRouter();
  const [state, setState] = useState(review);
  const { addToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  // Images available for picking: if a gallery is selected, prefer its images;
  // otherwise fall back to the full asset library.
  const selectedGallery = galleries.find((g) => g.id === state.galleryId);
  const galleryImages = selectedGallery?.images.map((gi) => gi.imageAsset) ?? [];
  const imagePool = galleryImages.length > 0 ? galleryImages : allImageAssets;

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body: Record<string, unknown> = {
      clientName: state.clientName,
      quote: state.quote,
      sessionType: state.sessionType || undefined,
      galleryId: state.galleryId || '',
      imageAssetId: state.imageAssetId || '',
      isPublished: state.isPublished,
      featuredOnHome: state.featuredOnHome
    };

    if (state.sessionDate) {
      body.sessionDate = new Date(state.sessionDate).toISOString();
    }

    const response = await fetch(`/api/reviews/${review.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to save review.', 'error');
      return;
    }

    setState((prev) => ({
      ...prev,
      ...payload.data,
      sessionDate: payload.data.sessionDate
        ? new Date(payload.data.sessionDate).toISOString().slice(0, 10)
        : null
    }));
    addToast('Review saved.', 'success');
  };

  const deleteReview = async () => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeleting(true);

    const response = await fetch(`/api/reviews/${review.id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to delete review.', 'error');
      setDeleting(false);
      return;
    }

    router.push('/reviews');
  };

  // When the gallery selection changes, clear the image selection if the
  // chosen image isn't in the new gallery's pool.
  const handleGalleryChange = (newGalleryId: string) => {
    const gallery = galleries.find((g) => g.id === newGalleryId);
    const galleryImageIds = new Set(gallery?.images.map((gi) => gi.imageAsset.id) ?? []);
    setState((prev) => ({
      ...prev,
      galleryId: newGalleryId || null,
      imageAssetId:
        newGalleryId && prev.imageAssetId && !galleryImageIds.has(prev.imageAssetId)
          ? null
          : prev.imageAssetId
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-8">
        {/* Core details */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Review details</h2>
          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Client name
              <input
                value={state.clientName}
                onChange={(e) => setState((prev) => ({ ...prev, clientName: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Quote
              <textarea
                value={state.quote}
                onChange={(e) => setState((prev) => ({ ...prev, quote: e.target.value }))}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                required
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Session type
                <input
                  value={state.sessionType ?? ''}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, sessionType: e.target.value || null }))
                  }
                  placeholder="e.g. Family session"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Session date
                <input
                  type="date"
                  value={toDateInputValue(state.sessionDate)}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, sessionDate: e.target.value || null }))
                  }
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Gallery link */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Linked gallery</h2>
          <p className="mt-1 text-sm text-slate-500">
            Optional. Linking a gallery unlocks its images for the review photo.
          </p>
          <div className="mt-4">
            <select
              value={state.galleryId ?? ''}
              onChange={(e) => handleGalleryChange(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">No gallery linked</option>
              {galleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} (/{g.slug})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Image selection */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Review photo</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedGallery
              ? `Showing images from "${selectedGallery.title}". Switch gallery or clear it to browse all assets.`
              : 'No gallery linked — showing all image assets.'}
          </p>

          {imagePool.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No images available.</p>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              <button
                type="button"
                onClick={() => setState((prev) => ({ ...prev, imageAssetId: null }))}
                className={`flex aspect-square items-center justify-center rounded-md border text-xs text-slate-500 transition ${
                  !state.imageAssetId
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                None
              </button>
              {imagePool.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, imageAssetId: asset.id }))}
                  className={`relative aspect-square overflow-hidden rounded-md border transition ${
                    state.imageAssetId === asset.id
                      ? 'border-indigo-500 ring-2 ring-indigo-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  title={asset.alt}
                >
                  <Image src={asset.src} alt={asset.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Visibility */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Visibility</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={state.isPublished}
                onChange={(e) => setState((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Published — visible on the site
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={state.featuredOnHome}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, featuredOnHome: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              Featured on home page
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save review
          </button>
          <button
            type="button"
            onClick={deleteReview}
            disabled={deleting}
            className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewEditor;
