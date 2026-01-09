'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialState = {
  title: '',
  slug: '',
  description: '',
  location: ''
};

const NewGalleryForm = () => {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof typeof initialState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch('/api/galleries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formState.title,
        slug: formState.slug,
        description: formState.description || undefined,
        location: formState.location || undefined
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to create gallery.');
      setIsSubmitting(false);
      return;
    }

    router.push(`/galleries/${payload.data.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Title
        <input
          value={formState.title}
          onChange={handleChange('title')}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Slug
        <input
          value={formState.slug}
          onChange={handleChange('slug')}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Description
        <textarea
          value={formState.description}
          onChange={handleChange('description')}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          rows={3}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Location
        <input
          value={formState.location}
          onChange={handleChange('location')}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </label>
      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {isSubmitting ? 'Creating...' : 'Create gallery'}
      </button>
    </form>
  );
};

export default NewGalleryForm;
