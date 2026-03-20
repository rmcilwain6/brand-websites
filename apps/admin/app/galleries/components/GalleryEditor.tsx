'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

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

type UploadItem = {
  localId: string;
  file: File;
  previewUrl: string;
  alt: string;
  status: 'queued' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
};

const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, '');

const GalleryEditor = ({ gallery }: { gallery: Gallery }) => {
  const [galleryState, setGalleryState] = useState(gallery);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Gallery details ──────────────────────────────────────────────────────────

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

  // ── Status ───────────────────────────────────────────────────────────────────

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

  // ── Upload queue ─────────────────────────────────────────────────────────────

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const items: UploadItem[] = files.map((file) => ({
      localId: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      alt: stripExtension(file.name),
      status: 'queued'
    }));

    setQueue((prev) => [...prev, ...items]);
    // Reset input so same files can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateAlt = (localId: string, alt: string) => {
    setQueue((prev) => prev.map((item) => (item.localId === localId ? { ...item, alt } : item)));
  };

  const removeQueued = (localId: string) => {
    setQueue((prev) => prev.filter((item) => item.localId !== localId));
  };

  const uploadAll = async () => {
    const pending = queue.filter((item) => item.status === 'queued');
    if (pending.length === 0) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.localId === item.localId ? { ...q, status: 'uploading' } : q))
      );

      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('alt', item.alt);

      const response = await fetch(`/api/galleries/${gallery.id}/images/upload`, {
        method: 'POST',
        body: formData
      });

      const payload = await response.json();

      if (!payload.ok) {
        setQueue((prev) =>
          prev.map((q) =>
            q.localId === item.localId
              ? { ...q, status: 'error', errorMsg: payload.error?.message ?? 'Upload failed.' }
              : q
          )
        );
      } else {
        setQueue((prev) =>
          prev.map((q) => (q.localId === item.localId ? { ...q, status: 'done' } : q))
        );
        setGalleryState((prev) => ({
          ...prev,
          images: [...prev.images, payload.data].sort((a, b) => a.order - b.order)
        }));
      }
    }

    setUploading(false);
    setMessage('Upload complete.');
  };

  // ── Remove image ─────────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  const queuedCount = queue.filter((i) => i.status === 'queued').length;

  return (
    <div className="space-y-8">
      {/* Gallery details */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Gallery details</h2>
        <form onSubmit={updateGallery} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Title
            <input
              value={galleryState.title}
              onChange={(e) => setGalleryState((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Slug
            <input
              value={galleryState.slug}
              onChange={(e) => setGalleryState((prev) => ({ ...prev, slug: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={galleryState.description ?? ''}
              onChange={(e) =>
                setGalleryState((prev) => ({ ...prev, description: e.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Location
            <input
              value={galleryState.location ?? ''}
              onChange={(e) => setGalleryState((prev) => ({ ...prev, location: e.target.value }))}
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

      {/* Status */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={galleryState.status}
            onChange={(e) =>
              setGalleryState((prev) => ({ ...prev, status: e.target.value as GalleryStatus }))
            }
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
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

      {/* Images */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Images</h2>
          <span className="text-sm text-slate-500">{galleryState.images.length} attached</span>
        </div>

        {/* Upload area */}
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFilesSelected}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-dashed border-slate-300 px-6 py-4 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Select photos
          </button>
        </div>

        {/* Upload queue */}
        {queue.length > 0 && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                {queuedCount > 0 ? `${queuedCount} ready to upload` : 'All done'}
              </p>
              {queuedCount > 0 && (
                <button
                  type="button"
                  onClick={uploadAll}
                  disabled={uploading}
                  className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {uploading
                    ? 'Uploading…'
                    : `Upload ${queuedCount} photo${queuedCount === 1 ? '' : 's'}`}
                </button>
              )}
            </div>

            {queue.map((item) => (
              <div
                key={item.localId}
                className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2"
              >
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-md object-cover"
                />

                {/* Alt text + status */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {item.status === 'queued' ? (
                    <input
                      value={item.alt}
                      onChange={(e) => updateAlt(item.localId, e.target.value)}
                      placeholder="Alt text"
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    />
                  ) : (
                    <p className="truncate text-sm font-medium text-slate-700">{item.alt}</p>
                  )}
                  {item.status === 'uploading' && (
                    <p className="text-xs text-indigo-600">Uploading…</p>
                  )}
                  {item.status === 'done' && <p className="text-xs text-emerald-600">Uploaded</p>}
                  {item.status === 'error' && (
                    <p className="text-xs text-rose-600">{item.errorMsg}</p>
                  )}
                </div>

                {/* Remove (queued only) */}
                {item.status === 'queued' && (
                  <button
                    type="button"
                    onClick={() => removeQueued(item.localId)}
                    className="shrink-0 text-xs text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Attached images */}
        <div className="mt-6 space-y-2">
          {galleryState.images.length === 0 ? (
            <p className="text-sm text-slate-500">No images attached yet.</p>
          ) : (
            galleryState.images.map((image) => (
              <div
                key={image.id}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
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
                    <p className="text-sm font-semibold text-slate-800">{image.imageAsset.alt}</p>
                    <p className="text-xs text-slate-500">
                      #{image.order}
                      {image.isCover && <span className="ml-1.5 text-amber-600">Cover</span>}
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
