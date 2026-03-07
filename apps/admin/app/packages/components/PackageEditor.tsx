'use client';

import { useState } from 'react';

const statusOptions = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;
type PackageStatus = (typeof statusOptions)[number];

type PackageModifier = {
  id: string;
  name: string;
  description: string | null;
  priceDeltaCents: number | null;
  isRequired: boolean;
};

type PackageData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePriceCents: number | null;
  status: PackageStatus;
  modifiers: PackageModifier[];
};

type PackageEditorProps = {
  pkg: PackageData;
};

const centsToDisplayDollars = (cents: number | null): string => {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
};

const PackageEditor = ({ pkg: initialPkg }: PackageEditorProps) => {
  const [pkg, setPkg] = useState(initialPkg);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detailsForm, setDetailsForm] = useState({
    name: initialPkg.name,
    slug: initialPkg.slug,
    description: initialPkg.description ?? '',
    basePriceDollars: centsToDisplayDollars(initialPkg.basePriceCents)
  });

  const [modifierForm, setModifierForm] = useState({
    name: '',
    description: '',
    priceDeltaDollars: '',
    isRequired: false
  });

  const setFeedback = (msg: string | null, err: string | null = null) => {
    setMessage(msg);
    setError(err);
  };

  const updateDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const basePriceCents = detailsForm.basePriceDollars
      ? Math.round(parseFloat(detailsForm.basePriceDollars) * 100)
      : undefined;

    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: detailsForm.name,
        slug: detailsForm.slug,
        description: detailsForm.description || undefined,
        basePriceCents
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to update package.');
      return;
    }

    setPkg((prev) => ({ ...prev, ...payload.data }));
    setFeedback('Package details updated.');
  };

  const updateStatus = async () => {
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: pkg.status })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to update status.');
      return;
    }

    setPkg((prev) => ({ ...prev, status: payload.data.status }));
    setFeedback('Status updated.');
  };

  const addModifier = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const priceDeltaCents = modifierForm.priceDeltaDollars
      ? Math.round(parseFloat(modifierForm.priceDeltaDollars) * 100)
      : undefined;

    const response = await fetch(`/api/packages/${pkg.id}/modifiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageId: pkg.id,
        name: modifierForm.name,
        description: modifierForm.description || undefined,
        priceDeltaCents,
        isRequired: modifierForm.isRequired
      })
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to add modifier.');
      return;
    }

    setPkg((prev) => ({ ...prev, modifiers: [...prev.modifiers, payload.data] }));
    setModifierForm({ name: '', description: '', priceDeltaDollars: '', isRequired: false });
    setFeedback('Modifier added.');
  };

  const removeModifier = async (modifierId: string) => {
    setFeedback(null);

    const response = await fetch(`/api/packages/${pkg.id}/modifiers/${modifierId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();

    if (!payload.ok) {
      setFeedback(null, payload.error?.message ?? 'Unable to remove modifier.');
      return;
    }

    setPkg((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((m) => m.id !== modifierId)
    }));
    setFeedback('Modifier removed.');
  };

  return (
    <div className="space-y-8">
      {/* Package details */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Package details</h2>
        <form onSubmit={updateDetails} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Name
            <input
              value={detailsForm.name}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Slug
            <input
              value={detailsForm.slug}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, slug: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Description
            <textarea
              value={detailsForm.description}
              onChange={(e) => setDetailsForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Base price ($)
            <input
              value={detailsForm.basePriceDollars}
              onChange={(e) =>
                setDetailsForm((prev) => ({ ...prev, basePriceDollars: e.target.value }))
              }
              placeholder="e.g. 350"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              inputMode="decimal"
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
            value={pkg.status}
            onChange={(e) =>
              setPkg((prev) => ({ ...prev, status: e.target.value as PackageStatus }))
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
          <span className="text-sm text-slate-500">Current: {pkg.status}</span>
        </div>
      </section>

      {/* Modifiers */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Modifiers</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add-ons or options that modify this package. Price delta can be negative for discounts.
        </p>
        <form onSubmit={addModifier} className="mt-4 space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Name
            <input
              value={modifierForm.name}
              onChange={(e) => setModifierForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Description
            <input
              value={modifierForm.description}
              onChange={(e) =>
                setModifierForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Price delta ($)
              <input
                value={modifierForm.priceDeltaDollars}
                onChange={(e) =>
                  setModifierForm((prev) => ({ ...prev, priceDeltaDollars: e.target.value }))
                }
                placeholder="e.g. 50 or -25"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                inputMode="decimal"
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={modifierForm.isRequired}
                onChange={(e) =>
                  setModifierForm((prev) => ({ ...prev, isRequired: e.target.checked }))
                }
              />
              Required
            </label>
          </div>
          <button
            type="submit"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add modifier
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {pkg.modifiers.length === 0 ? (
            <p className="text-sm text-slate-500">No modifiers yet.</p>
          ) : (
            pkg.modifiers.map((modifier) => (
              <div
                key={modifier.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {modifier.name}
                    {modifier.isRequired && (
                      <span className="ml-2 text-xs font-normal text-slate-400">Required</span>
                    )}
                  </p>
                  {modifier.description && (
                    <p className="text-xs text-slate-500">{modifier.description}</p>
                  )}
                  {modifier.priceDeltaCents != null && (
                    <p className="text-xs text-slate-500">
                      {modifier.priceDeltaCents >= 0 ? '+' : ''}$
                      {(modifier.priceDeltaCents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeModifier(modifier.id)}
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

export default PackageEditor;
