'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Gallery = {
  id: string;
  title: string;
  slug: string;
};

type NewReviewFormProps = {
  galleries: Gallery[];
};

const NewReviewForm = ({ galleries }: NewReviewFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: '',
    quote: '',
    sessionType: '',
    galleryId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: form.clientName,
        quote: form.quote,
        sessionType: form.sessionType || undefined,
        galleryId: form.galleryId || undefined
      })
    });

    const payload = await response.json();
    setSubmitting(false);

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to create review.');
      return;
    }

    router.push(`/reviews/${payload.data.id}`);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Client name
            <input
              value={form.clientName}
              onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Quote
            <textarea
              value={form.quote}
              onChange={(e) => setForm((prev) => ({ ...prev, quote: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={4}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Session type
            <input
              value={form.sessionType}
              onChange={(e) => setForm((prev) => ({ ...prev, sessionType: e.target.value }))}
              placeholder="e.g. Family session"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Linked gallery (optional)
            <select
              value={form.galleryId}
              onChange={(e) => setForm((prev) => ({ ...prev, galleryId: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">No gallery</option>
              {galleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create review'}
      </button>
    </form>
  );
};

export default NewReviewForm;
