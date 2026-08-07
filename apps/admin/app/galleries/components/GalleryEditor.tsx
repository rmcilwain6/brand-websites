'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '../../components/Toaster';

const statusOptions = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PRIVATE'] as const;
type GalleryStatus = (typeof statusOptions)[number];

const PUBLIC_SITE_URL = 'https://www.evrydayarchive.co';

type AccessLogEntry = {
  id: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

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
  order: number;
  featured: boolean;
  images: GalleryImage[];
  accessToken: string | null;
  hasPassword: boolean;
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

// ── Sortable image row ────────────────────────────────────────────────────────

const SortableImageRow = ({
  image,
  onSetCover,
  onRemove
}: {
  image: GalleryImage;
  onSetCover: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-4 rounded-md border border-slate-100 bg-white px-3 py-2"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
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
            {image.isCover && <span className="text-amber-600">Cover</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!image.isCover && (
          <button
            type="button"
            onClick={() => onSetCover(image.id)}
            className="text-xs font-semibold text-slate-500 hover:text-amber-600"
          >
            Set cover
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="text-xs font-semibold text-rose-600 hover:text-rose-500"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

const GalleryEditor = ({ gallery }: { gallery: Gallery }) => {
  const [galleryState, setGalleryState] = useState(gallery);
  const { addToast } = useToast();
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[] | null>(null);
  const [loadingAccessLog, setLoadingAccessLog] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Gallery details ──────────────────────────────────────────────────────────

  const updateGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`/api/galleries/${gallery.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: galleryState.title,
        slug: galleryState.slug,
        description: galleryState.description || undefined,
        location: galleryState.location || undefined,
        order: galleryState.order,
        featured: galleryState.featured
      })
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update gallery.', 'error');
      return;
    }

    setGalleryState((prev) => ({ ...prev, ...payload.data }));
    addToast('Gallery details updated.', 'success');
  };

  // ── Status ───────────────────────────────────────────────────────────────────

  const updateStatus = async () => {
    const response = await fetch(`/api/galleries/${gallery.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: galleryState.status })
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to update status.', 'error');
      return;
    }

    setGalleryState((prev) => ({
      ...prev,
      status: payload.data.status,
      accessToken: payload.data.accessToken ?? prev.accessToken
    }));
    addToast('Status updated.', 'success');
  };

  // ── Private gallery: password + access log ──────────────────────────────────

  const savePassword = async () => {
    if (!passwordInput) return;

    setSavingPassword(true);
    const response = await fetch(`/api/galleries/${gallery.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    });

    const payload = await response.json();
    setSavingPassword(false);
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to set password.', 'error');
      return;
    }

    setGalleryState((prev) => ({ ...prev, hasPassword: true }));
    setPasswordInput('');
    addToast('Password updated.', 'success');
  };

  const generatePassword = () => {
    const bytes = new Uint8Array(9);
    crypto.getRandomValues(bytes);
    const generated = btoa(String.fromCharCode(...bytes))
      .replace(/[+/=]/g, '')
      .slice(0, 12);
    setPasswordInput(generated);
  };

  const copyShareUrl = async (accessToken: string) => {
    await navigator.clipboard.writeText(`${PUBLIC_SITE_URL}/private/${accessToken}`);
    addToast('Share URL copied.', 'success');
  };

  const loadAccessLog = async () => {
    setLoadingAccessLog(true);
    const response = await fetch(`/api/galleries/${gallery.id}/access-log`);
    const payload = await response.json();
    setLoadingAccessLog(false);
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to load access log.', 'error');
      return;
    }
    setAccessLog(payload.data);
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

    // Fetch a signed upload signature from the server once for the batch.
    let sigData: {
      signature: string;
      timestamp: number;
      folder: string;
      apiKey: string;
      cloudName: string;
    };
    try {
      const sigRes = await fetch(`/api/galleries/${gallery.id}/images/signature`);
      const sigPayload = await sigRes.json();
      if (!sigPayload.ok)
        throw new Error(sigPayload.error?.message ?? 'Failed to get upload signature.');
      sigData = sigPayload.data;
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to get upload signature.', 'error');
      setUploading(false);
      return;
    }

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((q) => (q.localId === item.localId ? { ...q, status: 'uploading' } : q))
      );

      try {
        // Step 1: Upload directly from the browser to Cloudinary (bypasses Vercel payload limit).
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', item.file);
        cloudinaryForm.append('api_key', sigData.apiKey);
        cloudinaryForm.append('timestamp', String(sigData.timestamp));
        cloudinaryForm.append('signature', sigData.signature);
        cloudinaryForm.append('folder', sigData.folder);

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
          { method: 'POST', body: cloudinaryForm }
        );

        if (!cloudinaryRes.ok) {
          const errData = await cloudinaryRes.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: { message?: string } }).error?.message ??
              'Cloudinary upload failed.'
          );
        }

        const cloudinaryData = (await cloudinaryRes.json()) as {
          secure_url: string;
          width: number;
          height: number;
        };

        // Step 2: Save the Cloudinary result to the database.
        const confirmRes = await fetch(`/api/galleries/${gallery.id}/images/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secureUrl: cloudinaryData.secure_url,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            alt: item.alt
          })
        });

        const confirmPayload = await confirmRes.json();
        if (!confirmPayload.ok) {
          throw new Error(confirmPayload.error?.message ?? 'Failed to save image.');
        }

        setQueue((prev) =>
          prev.map((q) => (q.localId === item.localId ? { ...q, status: 'done' } : q))
        );
        setGalleryState((prev) => ({
          ...prev,
          images: [...prev.images, confirmPayload.data].sort((a, b) => a.order - b.order)
        }));
      } catch (err) {
        setQueue((prev) =>
          prev.map((q) =>
            q.localId === item.localId
              ? {
                  ...q,
                  status: 'error',
                  errorMsg: err instanceof Error ? err.message : 'Upload failed.'
                }
              : q
          )
        );
      }
    }

    setUploading(false);
    addToast('Upload complete.', 'success');
  };

  // ── Cover image ───────────────────────────────────────────────────────────────

  const setCoverImage = async (galleryImageId: string) => {
    const response = await fetch(`/api/galleries/${gallery.id}/images/${galleryImageId}`, {
      method: 'PATCH'
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to set cover image.', 'error');
      return;
    }

    setGalleryState((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({ ...img, isCover: img.id === galleryImageId }))
    }));
    addToast('Cover image updated.', 'success');
  };

  // ── Remove image ─────────────────────────────────────────────────────────────

  const removeGalleryImage = async (galleryImageId: string) => {
    const response = await fetch(`/api/galleries/${gallery.id}/images/${galleryImageId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to remove image.', 'error');
      return;
    }

    setGalleryState((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== galleryImageId)
    }));
    addToast('Image removed.', 'success');
  };

  // ── Reorder ──────────────────────────────────────────────────────────────────

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGalleryState((prev) => {
      const oldIndex = prev.images.findIndex((img) => img.id === active.id);
      const newIndex = prev.images.findIndex((img) => img.id === over.id);
      return { ...prev, images: arrayMove(prev.images, oldIndex, newIndex) };
    });
    setOrderDirty(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    const ids = galleryState.images.map((img) => img.id);
    const response = await fetch(`/api/galleries/${gallery.id}/images/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    const payload = await response.json();
    setSavingOrder(false);
    if (!payload.ok) {
      addToast(payload.error?.message ?? 'Unable to save order.', 'error');
      return;
    }
    setOrderDirty(false);
    addToast('Image order saved.', 'success');
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
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Display order
            <input
              type="number"
              min={0}
              value={galleryState.order}
              onChange={(e) =>
                setGalleryState((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 0 }))
              }
              className="w-24 rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={galleryState.featured}
              onChange={(e) => setGalleryState((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            Featured on home page
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

      {/* Private gallery sharing */}
      {galleryState.status === 'PRIVATE' && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Private sharing</h2>
          <p className="mt-1 text-sm text-slate-500">
            This gallery is only reachable at the link below, and only after the password is
            entered. It is excluded from the public site, sitemap, and search engines.
          </p>

          {galleryState.accessToken && (
            <div className="mt-4 flex items-center gap-2">
              <input
                readOnly
                value={`${PUBLIC_SITE_URL}/private/${galleryState.accessToken}`}
                className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <button
                type="button"
                onClick={() => copyShareUrl(galleryState.accessToken as string)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Copy
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={galleryState.hasPassword ? 'Set a new password' : 'Set a password'}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Generate
            </button>
            <button
              type="button"
              onClick={savePassword}
              disabled={!passwordInput || savingPassword}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {savingPassword ? 'Saving…' : 'Save password'}
            </button>
            <span className="text-sm text-slate-500">
              {galleryState.hasPassword ? 'Password is set.' : 'No password set yet.'}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent access attempts</h3>
              <button
                type="button"
                onClick={loadAccessLog}
                disabled={loadingAccessLog}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600"
              >
                {loadingAccessLog ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {accessLog === null ? (
              <p className="mt-2 text-sm text-slate-500">Click refresh to load access attempts.</p>
            ) : accessLog.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No attempts logged yet.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {accessLog.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 text-slate-600">
                    <span className={entry.success ? 'text-emerald-600' : 'text-rose-600'}>
                      {entry.success ? 'Success' : 'Failed'}
                    </span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    <span className="text-slate-400">{entry.ipAddress ?? 'unknown IP'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

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
        <div className="mt-6">
          {galleryState.images.length === 0 ? (
            <p className="text-sm text-slate-500">No images attached yet.</p>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={galleryState.images.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {galleryState.images.map((image) => (
                      <SortableImageRow
                        key={image.id}
                        image={image}
                        onSetCover={setCoverImage}
                        onRemove={removeGalleryImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {orderDirty && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={saveOrder}
                    disabled={savingOrder}
                    className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {savingOrder ? 'Saving…' : 'Save order'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryEditor;
