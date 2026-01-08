'use client';

import Image from 'next/image';
import { useState } from 'react';

const statusOptions = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

type GalleryStatus = (typeof statusOptions)[number];

type ImageAsset = {
  id: string;
  src: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

type GalleryImage = {
  id: string;
  order: number;
  isCover: boolean;
  imageAsset: ImageAsset;
};

type Gallery = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  status: GalleryStatus;
  images: GalleryImage[];
};

type GalleryEditorProps = {
  gallery: Gallery;
  imageAssets: ImageAsset[];
};

const GalleryEditor = ({ gallery, imageAssets }: GalleryEditorProps) => {
  const [galleryState, setGalleryState] = useState(gallery);
  const [assetList, setAssetList] = useState(imageAssets);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [assetForm, setAssetForm] = useState({
    src: '',
    alt: '',
    caption: '',
    width: '',
    height: ''
  });
  const [attachForm, setAttachForm] = useState({
    imageAssetId: assetList[0]?.id ?? '',
    order: '0',
    isCover: false
  });
  const hasAssets = assetList.length > 0;

  const updateGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/galleries/${gallery.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: galleryState.title,
        slug: galleryState.slug,
        description: galleryState.description || undefined,
        location: galleryState.location || undefined
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to update gallery.');
      return;
    }

    setGalleryState((prev) => ({ ...prev, ...payload.data }));
    setMessage('Gallery details updated.');
  };

  const updateStatus = async () => {
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/galleries/${gallery.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: galleryState.status })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to update status.');
      return;
    }

    setGalleryState((prev) => ({ ...prev, status: payload.data.status }));
    setMessage('Status updated.');
  };

  const createImageAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const response = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        src: assetForm.src,
        alt: assetForm.alt,
        caption: assetForm.caption || undefined,
        width: assetForm.width ? Number(assetForm.width) : undefined,
        height: assetForm.height ? Number(assetForm.height) : undefined
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to create image asset.');
      return;
    }

    setAssetList((prev) => [payload.data, ...prev]);
    setAttachForm((prev) => ({ ...prev, imageAssetId: payload.data.id }));
    setAssetForm({ src: '', alt: '', caption: '', width: '', height: '' });
    setMessage('Image asset created.');
  };

  const attachImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!attachForm.imageAssetId) {
      setError('Select an image asset to attach.');
      return;
    }

    const response = await fetch(`/api/galleries/${gallery.id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageAssetId: attachForm.imageAssetId,
        order: Number(attachForm.order),
        isCover: attachForm.isCover
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to attach image.');
      return;
    }

    setGalleryState((prev) => ({
      ...prev,
      images: [...prev.images, payload.data].sort((a, b) => a.order - b.order)
    }));
    setMessage('Image attached.');
  };

  const removeGalleryImage = async (galleryImageId: string) => {
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/galleries/${gallery.id}/images/${galleryImageId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to remove image.');
      return;
    }

    setGalleryState((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== galleryImageId)
    }));
    setMessage('Image removed.');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Gallery details</h2>
        <form onSubmit={updateGallery} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Title
            <input
              value={galleryState.title}
              onChange={(event) =>
                setGalleryState((prev) => ({ ...prev, title: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Slug
            <input
              value={galleryState.slug}
              onChange={(event) =>
                setGalleryState((prev) => ({ ...prev, slug: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={galleryState.description ?? ''}
              onChange={(event) =>
                setGalleryState((prev) => ({ ...prev, description: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Location
            <input
              value={galleryState.location ?? ''}
              onChange={(event) =>
                setGalleryState((prev) => ({ ...prev, location: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={galleryState.status}
            onChange={(event) =>
              setGalleryState((prev) => ({
                ...prev,
                status: event.target.value as GalleryStatus
              }))
            }
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={updateStatus}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Update status
          </button>
          <span className="text-sm text-slate-500">Current: {galleryState.status}</span>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Add image asset</h2>
        <form onSubmit={createImageAsset} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Image URL
            <input
              value={assetForm.src}
              onChange={(event) =>
                setAssetForm((prev) => ({ ...prev, src: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Alt text
            <input
              value={assetForm.alt}
              onChange={(event) =>
                setAssetForm((prev) => ({ ...prev, alt: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Caption
            <input
              value={assetForm.caption}
              onChange={(event) =>
                setAssetForm((prev) => ({ ...prev, caption: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Width
              <input
                value={assetForm.width}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, width: event.target.value }))
                }
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Height
              <input
                value={assetForm.height}
                onChange={(event) =>
                  setAssetForm((prev) => ({ ...prev, height: event.target.value }))
                }
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Save image asset
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Attach images</h2>
        <form onSubmit={attachImage} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Image asset
            <select
              value={attachForm.imageAssetId}
              onChange={(event) =>
                setAttachForm((prev) => ({ ...prev, imageAssetId: event.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              disabled={!hasAssets}
            >
              {assetList.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.alt}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Order
              <input
                value={attachForm.order}
                onChange={(event) =>
                  setAttachForm((prev) => ({ ...prev, order: event.target.value }))
                }
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="numeric"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={attachForm.isCover}
                onChange={(event) =>
                  setAttachForm((prev) => ({ ...prev, isCover: event.target.checked }))
                }
              />
              Cover image
            </label>
          </div>
          <button
            type="submit"
            disabled={!hasAssets}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Attach to gallery
          </button>
        </form>
        <div className="mt-6 space-y-3">
          {galleryState.images.length === 0 ? (
            <p className="text-sm text-slate-500">No images attached yet.</p>
          ) : (
            galleryState.images.map((image) => (
              <div
                key={image.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={image.imageAsset.src}
                    alt={image.imageAsset.alt}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {image.imageAsset.alt}
                    </p>
                    <p className="text-xs text-slate-500">
                      Order {image.order} {image.isCover ? '• Cover' : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(image.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-500"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {(message || error) && (
        <div
          className={`rounded-md border px-4 py-2 text-sm ${
            error
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error ?? message}
        </div>
      )}
    </div>
  );
};

export default GalleryEditor;
