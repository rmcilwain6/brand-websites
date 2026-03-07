'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initialState = {
  name: '',
  slug: '',
  description: '',
  basePriceDollars: ''
};

const NewPackageForm = () => {
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

    const basePriceCents = formState.basePriceDollars
      ? Math.round(parseFloat(formState.basePriceDollars) * 100)
      : undefined;

    const response = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formState.name,
        slug: formState.slug,
        description: formState.description || undefined,
        basePriceCents
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setError(payload.error?.message ?? 'Unable to create package.');
      setIsSubmitting(false);
      return;
    }

    router.push(`/packages/${payload.data.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Name
        <input
          value={formState.name}
          onChange={handleChange('name')}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Slug
        <input
          value={formState.slug}
          onChange={handleChange('slug')}
          placeholder="e.g. family-session"
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
        Base price ($)
        <input
          value={formState.basePriceDollars}
          onChange={handleChange('basePriceDollars')}
          placeholder="e.g. 350"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm"
          inputMode="decimal"
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
        {isSubmitting ? 'Creating...' : 'Create package'}
      </button>
    </form>
  );
};

export default NewPackageForm;
